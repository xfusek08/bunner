import { $ } from 'bun';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';

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
    public async getConfig({ profile, override }: { profile?: string; override?: string } = {}) {
        try {
            const cmd = this.buildComposeCommand(['config', '--format', 'json'], {
                profile,
                override,
            });
            const configResult = await $`${cmd}`.text();
            return JSON.parse(configResult);
        } catch (error) {
            log.error(`Error getting Docker Compose configuration: ${error}`);
            return null;
        }
    }

    /**
     * Gets available Docker Compose profiles
     */
    public async getProfiles(override?: string): Promise<string[]> {
        try {
            const cmd = this.buildComposeCommand(['config', '--profiles'], { override });
            const profilesResult = await $`${cmd}`.text();
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
        const availableOverrides = await this.getAvailableOverrideFiles();

        // Create a logging function that respects the quiet flag
        const logInfo = (message: string) => {
            if (!quiet) {
                log.info(message);
            }
        };

        logInfo(`Project name: ${projectName || 'undefined'}`);
        logInfo(`Available profiles: ${profiles.join(' ') || 'none'}`);
        logInfo(`Available override files: ${availableOverrides.join(' ') || 'none'}`);

        if (projectName) {
            logInfo(`Cleaning up docker resources for project: ${projectName}`);
        } else {
            logInfo('Cleaning up docker resources');
        }

        // Stop and remove containers for default configuration
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
                    await $`docker compose --profile ${profile} down --remove-orphans`;
                } catch (error) {
                    throw new BunnerError(`Failed to bring down profile ${profile}: ${error}`, 1);
                }
            }
        }

        // Stop and remove containers for all detected override files
        if (availableOverrides.length > 0) {
            logInfo('Cleaning up containers from all override files...');

            for (const override of availableOverrides) {
                logInfo(`Cleaning up override: ${override}`);
                try {
                    const composeFiles = this.getComposeFiles(override);
                    await $`docker compose ${composeFiles} down --remove-orphans`.quiet();
                } catch (error) {
                    throw new BunnerError(`Failed to bring down override ${override}: ${error}`, 1);
                }
            }
        }
    }

    /**
     * Brings up Docker Compose services with optional profile and override
     */
    public async up({
        profile,
        override,
        detached = false,
    }: {
        profile?: string;
        override?: string;
        detached?: boolean;
    }): Promise<void> {
        const upArgs = ['up', '--build', ...(detached ? ['-d'] : [])];
        const cmd = this.buildComposeCommand(upArgs, { profile, override });

        const parts = this.buildLogParts({ profile, override });
        log.info(
            parts.length > 0
                ? `Starting Docker Compose with ${parts.join(', ')}`
                : 'Starting Docker Compose',
        );

        await ProcessRunner.runAttachedCommand({
            cmd,
            errorMessage: 'Docker Compose up failed',
            successMessage: 'Docker Compose shut down successfully',
        });
    }

    /**
     * Gets a list of currently running Docker Compose services
     */
    public async getRunningServices(profile?: string, override?: string): Promise<string[]> {
        try {
            const cmd = this.buildComposeCommand(
                ['ps', '--services', '--filter', 'status=running'],
                { profile, override },
            );
            const result = await $`${cmd}`.text();
            return result.trim().split('\n').filter(Boolean);
        } catch (error) {
            log.error(`Error getting running services: ${error}`);
            return [];
        }
    }

    /**
     * Checks if any services from the Docker Compose configuration are currently running
     */
    public async isAnyServiceRunning(profile?: string, override?: string): Promise<boolean> {
        const runningServices = await this.getRunningServices(profile, override);
        return runningServices.length > 0;
    }

    /**
     * Checks if a Docker Compose service container is running
     */
    public async isServiceRunning(
        serviceName: string,
        profile?: string,
        override?: string,
    ): Promise<boolean> {
        if (!(await this.isServiceAvailable(serviceName, profile, override))) {
            throw new BunnerError(
                `Service '${serviceName}' is not available in the Docker Compose configuration.`,
                1,
            );
        }

        const runningServices = await this.getRunningServices(profile, override);
        return runningServices.includes(serviceName);
    }

    /**
     * Checks if a service is available in the Docker Compose configuration
     */
    public async isServiceAvailable(
        serviceName: string,
        profile?: string,
        override?: string,
    ): Promise<boolean> {
        const config = await this.getConfig({ profile, override });
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
        override,
        interactive = false,
    }: {
        service: string;
        command: string;
        profile?: string;
        override?: string;
        interactive?: boolean;
    }): Promise<void> {
        // Check if container is running
        const isRunning = await this.isServiceRunning(service, profile, override);
        if (!isRunning) {
            throw new BunnerError(
                `Container ${service} is not running. Use composeRun() instead.`,
                1,
            );
        }

        const execArgs = ['exec', ...(interactive ? ['-it'] : []), service, 'sh', '-c', command];
        const cmd = this.buildComposeCommand(execArgs, { profile, override });

        log.info(`Executing command in running container ${service}: ${command}`);

        await ProcessRunner.runAttachedCommand({
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
        override,
        rm = true,
        interactive = false,
    }: {
        service: string;
        command: string;
        profile?: string;
        override?: string;
        rm?: boolean;
        interactive?: boolean;
    }): Promise<void> {
        let exposePorts = false;
        
        const config = await this.getConfig({ profile, override });
        exposePorts = (config?.services?.[service]?.ports?.length ?? 0) > 0;

        const cmd = this.buildComposeCommand(
            [
                'run',
                ...(interactive ? ['-it'] : []),
                ...(exposePorts ? ['--service-ports'] : []),
                ...(rm ? ['--rm'] : []),
                service,
                'sh',
                '-c',
                command,
            ],
            { profile, override },
        );

        await ProcessRunner.runAttachedCommand({
            cmd,
            errorMessage: `Failed to run command in container ${service}`,
        });
    }

    /**
     * Rebuilds a specific Docker Compose service
     */
    public async rebuild({
        service,
        profile,
        override,
    }: {
        service: string;
        profile?: string;
        override?: string;
    }): Promise<void> {
        try {
            log.info(`Stopping and removing container for service: ${service}`);

            await this.executeComposeCommand(['stop', service], { profile, override });
            await this.executeComposeCommand(['rm', '-f', service], { profile, override });

            log.info(`Rebuilding service: ${service}`);

            const cmd = this.buildComposeCommand(['build', service], { profile, override });
            await ProcessRunner.runAttachedCommand({
                cmd,
                errorMessage: `Failed to rebuild service ${service}`,
                successMessage: `Successfully rebuilt service: ${service}`,
            });
        } catch (error) {
            throw new BunnerError(`Failed to rebuild service ${service}: ${error}`, 1);
        }
    }

    /**
     * Builds a complete Docker Compose command with common arguments
     */
    public buildComposeCommand(
        args: string[],
        options: { profile?: string; override?: string } = {},
    ): string[] {
        const { profile, override } = options;
        return [
            'docker',
            'compose',
            ...this.getComposeFiles(override),
            ...(profile ? ['--profile', profile] : []),
            ...args,
        ];
    }

    /**
     * Executes a Docker Compose command using Bun's $ template
     */
    private async executeComposeCommand(
        args: string[],
        options: { profile?: string; override?: string } = {},
    ): Promise<void> {
        const cmd = this.buildComposeCommand(args, options);
        await $`${cmd}`.quiet();
    }

    /**
     * Builds log message parts for profile and override information
     */
    private buildLogParts(options: { profile?: string; override?: string }): string[] {
        const { profile, override } = options;
        const parts: string[] = [];
        if (profile) {
            parts.push(`profile: ${profile}`);
        }
        if (override) {
            parts.push(`override: ${override}`);
        }
        return parts;
    }

    /**
     * Gets the compose file arguments for docker-compose command based on override
     */
    private getComposeFiles(override?: string): string[] {
        const files: string[] = [];

        // Always include the default compose file
        if (existsSync('docker-compose.yml')) {
            files.push('-f', 'docker-compose.yml');
        } else if (existsSync('docker-compose.yaml')) {
            files.push('-f', 'docker-compose.yaml');
        }

        // Add override-specific file if override is specified
        if (override) {
            const overrideFileYml = `docker-compose.${override}.yml`;
            const overrideFileYaml = `docker-compose.${override}.yaml`;

            if (existsSync(overrideFileYml)) {
                files.push('-f', overrideFileYml);
            } else if (existsSync(overrideFileYaml)) {
                files.push('-f', overrideFileYaml);
            }
        }

        return files;
    }

    /**
     * Gets available override names from existing docker-compose.<override>.yaml files
     */
    private async getAvailableOverrideFiles(): Promise<string[]> {
        const overrides: string[] = [];

        try {
            const files = await readdir('.');
            for (const file of files) {
                const match = file.match(/^docker-compose\.(.+)\.ya?ml$/);
                if (match) {
                    overrides.push(match[1]);
                }
            }
        } catch (error) {
            log.error(`Error reading directory for override files: ${error}`);
        }

        return overrides;
    }

    /**
     * Checks if Docker Compose file exists in current directory
     */
    private async checkComposeFile(): Promise<boolean> {
        const files = ['docker-compose.yml', 'docker-compose.yaml'];
        return files.some((file) => existsSync(file));
    }
}
