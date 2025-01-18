import defineCommand from "../framework/defineCommand";

export default defineCommand({
    command: 'greet',
    description: 'Prints given text to the console a given number of times. If no text is given, it will print \"Hello World!\"',
    options: [
        {
            short: 'n',
            long: 'number',
            type: 'number',
            description: 'How many times to say \"Hello World!\"',
            required: true,
        },
        {
            short: 't',
            long: "text",
            type: 'string',
            description: "A text to be printed",
            required: false,
            defaultValue: "Hello World!",
        },
        {
            short: 'p',
            long: "polite",
            type: 'boolean',
            description: "Greets you more politely",
        },
        {
            short: 'r',
            long: "prefix",
            type: 'string',
            description: "A prefix to be printed before the text",
            required: false,
        }
    ] as const,
    action: async ({ options }) => {
        for (let i = 0; i < options.number; i++) {
            console.log(`${options.prefix ?? ""}${options.text}`);
        }
        
        
        if (options.polite) {
            console.log("Have a nice day!");
        }
    }
});
