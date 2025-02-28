import defineCommand from '../defineCommand';
import TextBuilder from '../text-rendering/TextBuilder';

export default defineCommand({
    command: 'test',
    description: 'Custom workbench command',
    options: [
        {
            short: 'w',
            long: 'width',
            type: 'number',
            description: 'Width',
            required: false,
            defaultValue: process.stdout.columns,
        },
    ] as const,
    action: async ({ options }) => {
        const tb = new TextBuilder({ width: options.width });
        tb.line('Hello, world!');
        tb.line('='.repeat(options.width));
        tb.aligned([
            'asdasd',
            '-',
            'qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe'.repeat(3),
        ]);
        // tb.aligned(["qwe", "-", "qve xvsvd asveev".repeat(20)]);

        console.time('render');
        const result = tb.render();
        console.timeEnd('render');

        // result = result.replace(/ /g, '_');
        console.log(result);
    },
});
