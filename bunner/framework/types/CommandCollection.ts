import Command from "./Command";
import CategoryDescription from "./CategoryDescription";

export interface CategoryIteratorItem {
    id: string;
    title: string;
    commands: Command[];
}

type CommandMap = Record<string, Command>;

type CommandCategoryCatalogRecord = {
    categoryDescription: CategoryDescription;
    commands: CommandMap;
};

type CommandCategoryCatalog = Record<string, CommandCategoryCatalogRecord>;

export default class CommandCollection {
    
    private constructor(
        private readonly _unsortedCommands: CommandMap,
        private readonly _commandsByCategory: CommandCategoryCatalog,
    ) {}
    
    public static create(commands: Command[]): CommandCollection {
        const {
            unsortedCommands,
            commandsByCategory,
        } = this.sortToCategories(commands);
        
        return new CommandCollection(unsortedCommands, commandsByCategory);
    }
    
    public static merge(...collections: CommandCollection[]): CommandCollection {
        const {
            unsortedCommands,
            commandsByCategory,
        } = this.sortToCategories(collections.flatMap(collection => collection.allCommands));
        
        return new CommandCollection(unsortedCommands, commandsByCategory);
    }
    
    public get(command: string): Command|null {
        if (command in this._unsortedCommands) {
            return this._unsortedCommands[command];
        }
        
        for (const category of Object.values(this._commandsByCategory)) {
            if (command in category.commands) {
                return category.commands[command];
            }
        }
        
        return null;
    }
    
    public hasCommand(command: string): boolean {
        return this.get(command) !== null;
    }
    
    public get allCommands(): readonly Command[] {
        return [
            ...this.unsortedCommands,
            ...Object.values(this._commandsByCategory).flatMap((c) => Object.values(c.commands)),
        ];
    }
    
    public get unsortedCommands(): readonly Command[] {
        return Object.values(this._unsortedCommands);
    }
    
    public get categories(): readonly CategoryIteratorItem[] {
        return Object.values(this._commandsByCategory)
            .map((r) => ({
                id: r.categoryDescription.id,
                title: r.categoryDescription.title,
                commands: Object.values(r.commands),
            }));
    }
    
    private static sortToCategories(commands: Command[]) {
        const unsortedCommands: CommandMap = {};
        const commandsByCategory: CommandCategoryCatalog = {};
        
        for (const command of commands) {
            const commandCategory = command.category;
            
            if (commandCategory === null) {
                unsortedCommands[command.command] = command;
                continue;
            }
            
            const [id, description]: [string, CategoryDescription|undefined] =
                typeof commandCategory === 'string'
                    ? [commandCategory, commandsByCategory[commandCategory]?.categoryDescription]
                    : [commandCategory.id, commandCategory];
                
            commandsByCategory[id] = {
                categoryDescription: description,
                commands: {
                    ...(commandsByCategory[id]?.commands ?? {}),
                    [command.command]: command,
                },
            };
        }
        return {
            unsortedCommands,
            commandsByCategory,
        };
    }
}
