import { $ } from 'bun';
import { existsSync } from 'fs';

import { log } from '../../framework';
import BunnerError from '../../framework/types/BunnerError';
import { ProcessRunner } from '../process/ProcessRunner';

export default class DockerComposeTool {
    private constructor() {}

    /**
     * Creates a new instance of DockerComposeTool after validating the environment
     */
    public static async create(): Promise<DockerComposeTool> {
        const tool = new DockerComposeTool();

        // Check if Docker Compose file exists
        if (!(await tool.checkComposeFile())) {
            throw new BunnerError('No docker-compose file found', 1);
        }

        // Validate config
        const config = await tool.getConfig();
        if (!config) {
            throw new BunnerError('Invalid Docker Compose configuration', 1);
        }

        return tool;
    }

    /**
     * Gets Docker Compose configuration
     */
    public async getConfig() {
        try {
            const configResult = await $`docker compose config --format json`.text();
            return JSON.parse(configResult);
        } catch (error) {
            log.error(`Error getting Docker Compose configuration: ${error}`);
            return null;
        }
    }

    /**
     * Gets available Docker Compose profiles
     */
    public async getProfiles(): Promise<string[]> {
        try {
            const profilesResult = await $`docker compose config --profiles`.text();
            return profilesResult.trim().split(/\s+/).filter(Boolean);
        } catch (error) {
            log.error(`Error getting Docker Compose profiles: ${error}`);
            return [];
        }
    }

    /**
     * Stops and removes all Docker Compose resources including those from all profiles
     */
    public async downAll(quiet = false): Promise<void> {
        const config = await this.getConfig();
        const projectName = config.name;
        const profiles = await this.getProfiles();

        // Create a logging function that respects the quiet flag
        const logInfo = (message: string) => {
            if (!quiet) {
                log.info(message);
            }
        };

        logInfo(`Project name: ${projectName || 'undefined'}`);
        logInfo(`Available profiles: ${profiles.join(' ') || 'none'}`);

        if (projectName) {
            logInfo(`Cleaning up docker resources for project: ${projectName}`);
        } else {
            logInfo('Cleaning up docker resources');
        }

        // Stop and remove containers for default profile
        try {
            await $`docker compose down --remove-orphans`.quiet();
        } catch (error) {
            throw new BunnerError(`Failed to bring down containers: ${error}`, 1);
        }

        // Stop and remove containers for all detected profiles
        if (profiles.length > 0) {
            logInfo('Cleaning up containers from all profiles...');

            for (const profile of profiles) {
                logInfo(`Cleaning up profile: ${profile}`);
                try {
                    await $`docker compose --profile ${profile} down --remove-orphans`.quiet();
                } catch (error) {
                    throw new BunnerError(`Failed to bring down profile ${profile}: ${error}`, 1);
                }
            }
        }
    }

    /**
     * Brings up Docker Compose services with optional profile
     */
    public async up({
        profile,
        detached = false,
    }: {
        profile?: string;
        detached?: boolean;
    }): Promise<void> {
        // Prepare command arguments
        const cmd = [
            'docker',
            'compose',
            ...(profile ? ['--profile', profile] : []),
            'up',
            '--build',
            ...(detached ? ['-d'] : []),
        ];

        // Log appropriate message
        log.info(
            profile
                ? `Starting Docker Compose with profile: ${profile}`
                : 'Starting Docker Compose',
        );

        await this.runAttachedCommand({
            cmd,
            errorMessage: 'Docker Compose up failed',
            successMessage: 'Docker Compose shut down successfully',
        });
    }

    /**
     * Gets a list of currently running Docker Compose services
     */
    public async getRunningServices(): Promise<string[]> {
        try {
            const result = await $`docker compose ps --services --filter status=running`.text();
            return result.trim().split('\n').filter(Boolean);
        } catch (error) {
            log.error(`Error getting running services: ${error}`);
            return [];
        }
    }

    /**
     * Checks if any services from the Docker Compose configuration are currently running
     */
    public async isAnyServiceRunning(): Promise<boolean> {
        const runningServices = await this.getRunningServices();
        return runningServices.length > 0;
    }

    /**
     * Checks if a Docker Compose service container is running
     */
    public async isServiceRunning(serviceName: string): Promise<boolean> {
        if (!(await this.isServiceAvailable(serviceName))) {
            throw new BunnerError(
                `Service '${serviceName}' is not available in the Docker Compose configuration.`,
                1,
            );
        }

        const runningServices = await this.getRunningServices();
        return runningServices.includes(serviceName);
    }

    /**
     * Checks if a service is available in the Docker Compose configuration
     */
    public async isServiceAvailable(serviceName: string): Promise<boolean> {
        const config = await this.getConfig();
        const availableServices = Object.keys(config.services || {});
        return availableServices.includes(serviceName);
    }

    /**
     * Executes a command in a running Docker Compose service container
     */
    public async executeInRunningService({
        service,
        command,
        profile,
        interactive = false,
    }: {
        service: string;
        command: string;
        profile?: string;
        interactive?: boolean;
    }): Promise<void> {
        // Check if container is running
        const isRunning = await this.isServiceRunning(service);
        if (!isRunning) {
            throw new BunnerError(
                `Container ${service} is not running. Use composeRun() instead.`,
                1,
            );
        }

        // Prepare command arguments for exec
        const cmd = [
            'docker',
            'compose',
            ...(profile ? ['--profile', profile] : []),
            'exec',
            ...(interactive ? ['-it'] : []),
            service,
            'sh',
            '-c',
            command,
        ];

        // Log what we're doing
        log.info(`Executing command in running container ${service}: ${command}`);

        await this.runAttachedCommand({
            cmd,
            errorMessage: `Failed to execute command in container ${service}`,
        });
    }

    /**
     * Runs a one-off command in a specified Docker Compose service
     */
    public async composeRun({
        service,
        command,
        profile,
        rm = true,
        exposePorts = false,
        interactive = false,
    }: {
        service: string;
        command: string;
        profile?: string;
        rm?: boolean;
        exposePorts?: boolean;
        interactive?: boolean;
    }): Promise<void> {
        // Prepare command arguments for run
        const cmd = [
            'docker',
            'compose',
            ...(profile ? ['--profile', profile] : []),
            'run',
            ...(interactive ? ['-it'] : []),
            ...(exposePorts ? ['--service-ports'] : []),
            ...(rm ? ['--rm'] : []),
            service,
            'sh',
            '-c',
            command,
        ];

        // Log what we're doing
        log.info(`Running command in new container ${service}: ${command}`);

        await this.runAttachedCommand({
            cmd,
            errorMessage: `Failed to run command in container ${service}`,
        });
    }

    /**
     * Rebuilds a specific Docker Compose service
     */
    public async rebuild(serviceName: string): Promise<void> {
        try {
            log.info(`Stopping and removing container for service: ${serviceName}`);

            await $`docker compose stop ${serviceName}`;
            await $`docker compose rm -f ${serviceName}`;

            // ---

            log.info(`Rebuilding service: ${serviceName}`);

            const cmd = ['docker', 'compose', 'build', serviceName];

            await this.runAttachedCommand({
                cmd,
                errorMessage: `Failed to rebuild service ${serviceName}`,
                successMessage: `Successfully rebuilt service: ${serviceName}`,
            });
        } catch (error) {
            throw new BunnerError(`Failed to rebuild service ${serviceName}: ${error}`, 1);
        }
    }

    /**
     * Checks if Docker Compose file exists in current directory
     */
    private async checkComposeFile(): Promise<boolean> {
        const files = ['docker-compose.yml', 'docker-compose.yaml'];
        return files.some((file) => existsSync(file));
    }

    /**
     * Runs a command attached to the current terminal.
     */
    private async runAttachedCommand({
        cmd,
        errorMessage,
        successMessage = 'Exited container successfully',
    }: {
        cmd: string[];
        errorMessage: string;
        successMessage?: string;
    }): Promise<void> {
        try {
            await ProcessRunner.run({
                cmd,
                spawnOptions: {
                    stdio: ['inherit', 'inherit', 'inherit'],
                    onExit: () => {
                        log.success(successMessage);
                    },
                },
                onSigInt: async () => {
                    log.info('Exiting...');
                },
            });
        } catch (err) {
            throw new BunnerError(`${errorMessage}: ${err}`, 1);
        }
    }
}
