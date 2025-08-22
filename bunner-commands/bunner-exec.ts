import { $, defineCommand } from '../framework';

export default defineCommand({
    command: 'bunner-exec',
    description: 'Runs a whatever shell command is passed in the bunner container environment.',
    passUnknownOptions: true,
    action: async ({ args }) => {
        await $`/bin/sh -lc ${args.asString()}`;
    },
});
