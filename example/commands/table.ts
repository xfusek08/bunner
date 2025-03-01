import { defineCommand, TextBuilder } from '../../framework';

export default defineCommand({
    command: 'table',
    description: 'formats given string into a table',
    options: [
        {
            short: 'l',
            long: 'line-separator',
            type: 'string',
            description: 'Line separator',
            required: false,
            defaultValue: ';',
        },
        {
            short: 'c',
            long: 'col-separator',
            type: 'string',
            description: 'Column separator',
            required: false,
            defaultValue: '|',
        },
        {
            short: 'w',
            long: 'width',
            type: 'number',
            description:
                'Width of the table, defaults to the width of the terminal',
            required: false,
        },
    ] as const,
    action: async ({ options, args }) => {
        const tb = new TextBuilder({
            indentSize: 4,
            width: options.width,
        });

        const text = args.getString(0);
        if (!text) {
            console.error('No text provided');
            return 1;
        }

        for (const line of text.split(options['line-separator'])) {
            const columns = line.split(options['col-separator']);
            tb.aligned(columns);
        }

        console.log(tb.render());
    },
});
