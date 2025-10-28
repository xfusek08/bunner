import TextBuilder from '../text-rendering/TextBuilder';

export type CommandDescriptionCallback = (tb: TextBuilder, singleLine?: boolean) => void;

type CommandDescription = string | CommandDescriptionCallback;

export default CommandDescription;
