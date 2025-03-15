import { defineCommand } from 'bunner/framework';
import DockerComposeTool from 'bunner/modules/docker/DockerComposeTool';

export default defineCommand({
    command: 'down',
    description: 'Stops and removes all Docker Compose containers',
    action: async () => {
        const dc = await DockerComposeTool.create();
        await dc.downAll();
    },
});
