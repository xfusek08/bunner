import Command from "./types/Command";
import CategoryDescription from "./types/CategoryDescription";

type CommandCategoryCatalog = Record<string, {
    categoryDescription?: CategoryDescription,
    commands: Record<string, Command>,
}>;

export default class CommandCollection {
    
    private constructor(
        private readonly commandsByCategory: CommandCategoryCatalog,
    ) {}
    
    public static create(commands: Command[]): CommandCollection {
        return new CommandCollection(
            this.sortToCategories(commands)
        );
    }
    
    public static merge(...collections: CommandCollection[]): CommandCollection {
        return new CommandCollection(
            this.sortToCategories(
                collections.flatMap(collection => collection.allCommands)
            )
        );
    }
    
    public get(command: string): Command|null {
        for (const category of Object.values(this.commandsByCategory)) {
            if (command in category.commands) {
                return category.commands[command];
            }
        }
        return null;
    }
    
    public hasCommand(command: string): boolean {
        return this.get(command) !== null;
    }
    
    public get allCommands(): Command[] {
        return Object.values(this.commandsByCategory).flatMap(category => Object.values(category.commands));
    }
        
    
    private static sortToCategories(commands: Command[]): CommandCategoryCatalog {
        const categories: CommandCategoryCatalog = {
            // default category
            '': {
                commands: {},
            },
        };
        for (const command of commands) {
            const commandCategory = command.category;
            
            // if no category is specified, add to default category
            if (commandCategory === null) {
                categories[''].commands[command.command] = command;
                continue;
            }
            
            const [id, description]: [string, CategoryDescription|undefined] =
                typeof commandCategory === 'string'
                    ? [commandCategory, categories[commandCategory]?.categoryDescription]
                    : [commandCategory.id, commandCategory];
                
            categories[id] = {
                categoryDescription: description,
                commands: {
                    ...(categories[id].commands ?? {}),
                    [command.command]: command,
                },
            };
        }
        return categories;
    }
}
