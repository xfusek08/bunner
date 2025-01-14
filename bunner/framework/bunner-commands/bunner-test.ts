import { $ } from "bun";
import defineCommand from "../defineCommand";

export default defineCommand({
    command: 'bunner-test',
    description: 'Test the bunner project',
    action: async () => {
        console.log("process.stdout.columns", process.stdout.columns);
        console.log("process.env.COLUMNS", process.env.COLUMNS);
        await $`echo $COLUMNS`;
    }
});
