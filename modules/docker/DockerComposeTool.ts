import { $, spawn } from 'bun';
import { existsSync } from 'fs';
import { log } from '../../framework';
import { DockerError } from './errors';

export class DockerComposeTool {
  private constructor() {}

  /**
   * Creates a new instance of DockerComposeTool after validating the environment
   */
  public static async create(): Promise<DockerComposeTool> {
    const tool = new DockerComposeTool();
    
    // Check if Docker Compose file exists
    if (!(await tool.checkComposeFile())) {
      throw new DockerError('No docker-compose file found', 1);
    }
    
    // Validate config
    const config = await tool.getConfig();
    if (!config) {
      throw new DockerError('Invalid Docker Compose configuration', 1);
    }
    
    return tool;
  }

  /**
   * Checks if Docker Compose file exists in current directory
   */
  private async checkComposeFile(): Promise<boolean> {
    const files = ['docker-compose.yml', 'docker-compose.yaml'];
    return files.some((file) => existsSync(file));
  }

  /**
   * Gets Docker Compose configuration
   */
  public async getConfig(): Promise<any> {
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
      throw new DockerError(`Failed to bring down containers: ${error}`, 1);
    }

    // Stop and remove containers for all detected profiles
    if (profiles.length > 0) {
      logInfo('Cleaning up containers from all profiles...');

      for (const profile of profiles) {
        logInfo(`Cleaning up profile: ${profile}`);
        try {
          await $`docker compose --profile ${profile} down --remove-orphans`.quiet();
        } catch (error) {
          throw new DockerError(`Failed to bring down profile ${profile}: ${error}`, 1);
        }
      }
    }
  }

  /**
   * Brings up Docker Compose services with optional profile
   */
  public async up(profile?: string): Promise<void> {
    // Prepare command arguments
    const cmd = [
      'docker',
      'compose',
      ...(profile ? ['--profile', profile] : []),
      'up',
      '--build',
    ];

    // Log appropriate message
    log.info(
      profile
        ? `Starting Docker Compose with profile: ${profile}`
        : 'Starting Docker Compose'
    );

    return new Promise((resolve, reject) => {
      // Spawn the process with common options
      const proc = spawn(cmd, {
        stdio: ['inherit', 'inherit', 'inherit'],
      });

      // Set up SIGINT handler once
      const sigintHandler = async () => {
        log.info('Gracefully shutting down Docker Compose...');
        proc.kill('SIGINT');

        try {
          await proc.exited;
          log.success('Docker Compose shut down successfully');
          process.off('SIGINT', sigintHandler);
        } catch (e) {
          log.error(`Error during shutdown: ${e}`);
          process.off('SIGINT', sigintHandler);
          reject(new DockerError(`Error during shutdown: ${e}`, 1));
        }
      };

      process.on('SIGINT', sigintHandler);

      // Wait for process to complete or error
      proc.exited.then(() => {
        process.off('SIGINT', sigintHandler);
        resolve();
      }).catch(err => {
        process.off('SIGINT', sigintHandler);
        reject(new DockerError(`Docker Compose up failed: ${err}`, 1));
      });
    });
  }
}
