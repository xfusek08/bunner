import CategoryDescription from './CategoryDescription';
import Command from './Command';

export interface CategoryIteratorItem {
    id: string;
    title: string;
    commands: Command[];
    hidden: boolean;
}

type CommandMap = Record<string, Command>;

type CommandCategoryCatalogRecord = {
    categoryDescription: CategoryDescription;
    commands: CommandMap;
};

class CommandCategoryCatalog {
    private _catalog: Record<string, CommandCategoryCatalogRecord> = {};

    public push({
        categoryId,
        categoryDescription,
        command,
    }: {
        categoryId: string;
        categoryDescription?: CategoryDescription | null;
        command: Command;
    }) {
        const finalCategoryDescription = categoryDescription ??
            this._catalog[categoryId]?.categoryDescription ?? {
                id: categoryId,
                title: categoryId,
            };

        this._catalog[categoryId] = {
            categoryDescription: finalCategoryDescription,
            commands: {
                ...(this._catalog[categoryId]?.commands ?? {}),
                [command.command]: command,
            },
        };
    }

    public records(): readonly CommandCategoryCatalogRecord[] {
        return Object.values(this._catalog);
    }

    public allCommands(): readonly Command[] {
        return this.records().flatMap((c) => Object.values(c.commands));
    }
}

export default class CommandCollection {
    private constructor(
        private readonly _unsortedCommands: CommandMap,
        private readonly _commandsByCategory: CommandCategoryCatalog,
    ) {}

    public static create(commands: Command[]): CommandCollection {
        const { unsortedCommands, commandsByCategory } = this.sortToCategories(commands);

        return new CommandCollection(unsortedCommands, commandsByCategory);
    }

    public static merge(...collections: CommandCollection[]): CommandCollection {
        const { unsortedCommands, commandsByCategory } = this.sortToCategories(
            collections.flatMap((collection) => collection.allCommands),
        );

        return new CommandCollection(unsortedCommands, commandsByCategory);
    }

    public get(command: string): Command | null {
        if (command in this._unsortedCommands) {
            return this._unsortedCommands[command];
        }

        for (const category of this._commandsByCategory.records()) {
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
        return [...this.unsortedCommands, ...this._commandsByCategory.allCommands()];
    }

    public get unsortedCommands(): readonly Command[] {
        return Object.values(this._unsortedCommands);
    }

    public get categories(): readonly CategoryIteratorItem[] {
        return this._commandsByCategory.records().map((c) => ({
            id: c.categoryDescription.id,
            title: c.categoryDescription.title,
            hidden: c.categoryDescription.hidden ?? false,
            commands: Object.values(c.commands),
        }));
    }

    private static sortToCategories(commands: Command[]) {
        const unsortedCommands: CommandMap = {};
        const commandCategoryCatalog = new CommandCategoryCatalog();

        for (const command of commands) {
            const { categoryId, categoryDescription } =
                this.extractCategoryInfoFromCommand(command);

            if (!categoryId) {
                unsortedCommands[command.command] = command;
            } else {
                commandCategoryCatalog.push({
                    categoryId,
                    categoryDescription,
                    command,
                });
            }
        }
        return {
            unsortedCommands,
            commandsByCategory: commandCategoryCatalog,
        };
    }

    private static extractCategoryInfoFromCommand(command: Command): {
        categoryId: string | null;
        categoryDescription: CategoryDescription | null;
    } {
        const commandCategoryValue = command.category;

        if (!commandCategoryValue) {
            return {
                categoryId: null,
                categoryDescription: null,
            };
        }

        if (typeof commandCategoryValue === 'string') {
            return {
                categoryId: commandCategoryValue,
                categoryDescription: null,
            };
        }

        return {
            categoryId: commandCategoryValue.id,
            categoryDescription: commandCategoryValue,
        };
    }
}
