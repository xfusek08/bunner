/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn, type SpawnOptions } from 'bun';

import log from '../../framework/log';
import BunnerError from '../../framework/types/BunnerError';
import iterateEntries from '../../framework/utils/iterateEntries';

const SIGNAL_OPTION_MAP = {
    SIGINT: 'onSigInt',
    SIGTERM: 'onSigTerm',
    SIGHUP: 'onSigHup',
    SIGBREAK: 'onSigBreak',
    SIGUSR1: 'onSigUsr1',
    SIGUSR2: 'onSigUsr2',
} as const;

export type NodeJsSignal = keyof typeof SIGNAL_OPTION_MAP;

export type SignalHandler = () => Promise<void>;

export type SignalConfig = boolean | SignalHandler;

export type SignalOptionKey = (typeof SIGNAL_OPTION_MAP)[NodeJsSignal];

type SignalHandlerOptions = {
    [K in SignalOptionKey]?: SignalConfig;
};

export interface ProcessRunOptions<Opts extends SpawnOptions.OptionsObject<any, any, any>>
    extends SignalHandlerOptions {
    cmd: string[];
    spawnOptions?: Opts;
}

export class ProcessRunner {
    private static createSignalHandler(
        signal: NodeJsSignal,
        config: SignalConfig,
        proc: ReturnType<typeof spawn>,
    ): ((signal?: string) => Promise<void>) | undefined {
        if (config === false) {
            return undefined;
        }

        if (config === true) {
            return async () => {
                proc.kill(signal);
                try {
                    await proc.exited;
                    log.success(`Process shut down successfully by ${signal}`);
                } catch (e) {
                    log.error(`Error during shutdown (${signal}): ${e}`);
                    throw new BunnerError(`Error during shutdown (${signal}): ${e}`, 1);
                }
            };
        }

        const customHandler = config as SignalHandler;
        return async () => {
            try {
                await customHandler();
            } catch (e) {
                log.error(`Error in custom ${signal} handler: ${e}`);
                throw new BunnerError(`Error in custom ${signal} handler: ${e}`, 1);
            }
        };
    }

    /**
     * Registers signal handlers based on provided options
     */
    private static registerSignalHandlers(
        options: SignalHandlerOptions,
        proc: ReturnType<typeof spawn>,
    ): Map<string, (signal?: string) => Promise<void>> {
        const registeredHandlers = new Map<string, (signal?: string) => Promise<void>>();

        iterateEntries(SIGNAL_OPTION_MAP, ([signal, optionKey]) => {
            const config = options[optionKey];
            if (!config) {
                return;
            }

            const handler = ProcessRunner.createSignalHandler(signal, config, proc);

            if (handler) {
                process.on(signal, handler);
                registeredHandlers.set(signal, handler);
            }
        });

        return registeredHandlers;
    }

    private static cleanupSignalHandlers(
        handlers: Map<string, (signal?: string) => Promise<void>>,
    ): void {
        handlers.forEach((handler, signal) => {
            process.off(signal, handler);
        });
        handlers.clear();
    }

    public static async run<Opts extends SpawnOptions.OptionsObject<any, any, any>>(
        options: ProcessRunOptions<Opts>,
    ): Promise<void> {
        const proc = spawn(options.cmd, {
            stdio: ['inherit', 'inherit', 'inherit'],
            ...options.spawnOptions,
        });

        const registeredHandlers = ProcessRunner.registerSignalHandlers(options, proc);

        try {
            await proc.exited;
        } catch (err) {
            throw new BunnerError(`Process execution failed: ${err}`, 1);
        } finally {
            ProcessRunner.cleanupSignalHandlers(registeredHandlers);
        }
    }
}
