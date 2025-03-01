import { $ } from 'bun';

import { defineCommand } from '../../framework';

export default defineCommand({
    command: 'pwd',
    description: 'Prints current directory using bun shell',
    action: async () => {
        const dir = await $`pwd`.text();
        console.log(dir);
    },
});
