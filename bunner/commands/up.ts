import { $ } from "bun";
import defineCommand from "../framework/defineCommand";

export default defineCommand({
    command: 'up',
    description: 'Runs the docker compose up',
    action: async () => {
        return await $`docker-compose up -d`;
    }
});
