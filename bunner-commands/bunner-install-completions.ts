import * as fs from 'fs';
import * as path from 'path';

import { TextBuilder } from '../framework';
import defineCommand from '../framework/defineCommand';
import Formatter from '../framework/Formatter';
import log from '../framework/log';

export default defineCommand({
    command: 'bunner-install-completions',
    description: (tb, oneLine = false) => {
        if (oneLine) {
            tb.line('Installs ZSH completions for a specific run file');
            return;
        }

        tb.line('Generates and installs ZSH shell completions for your Bunner commands.');
        tb.line('');
        tb.line('This command creates a completion file that enables tab completion for all');
        tb.line("commands defined in your project's run file.");
        tb.line('');
        tb.line(Formatter.formatTitle('What it does:'));
        tb.line('');
        tb.indent();
        tb.line('• Creates a ' + Formatter.formatCMD('completions/_run') + ' file in your project');
        tb.line('• Generates dynamic completions for all available commands');
        tb.line('• Provides argument and option completions for each command');
        tb.line(
            '• Supports both short (' +
                Formatter.formatOptionName('-f') +
                ') and long (' +
                Formatter.formatOptionName('--file') +
                ') option names',
        );
        tb.unindent();
        tb.line('');
        tb.line(Formatter.formatTitle('Setup Instructions:'));
        tb.line('');
        tb.indent();
        tb.line(Formatter.white('1. Generate the completion file:'));
        tb.indent();
        tb.line(Formatter.formatCMD('./run bunner-install-completions'));
        tb.unindent();
        tb.line('');
        tb.line(Formatter.white('2. Install system-wide (requires sudo):'));
        tb.indent();
        tb.line(
            Formatter.formatCMD('sudo cp completions/_run /usr/local/share/zsh/site-functions/'),
        );
        tb.unindent();
        tb.line('');
        tb.line(Formatter.white('3. Reload completions:'));
        tb.indent();
        tb.line(Formatter.formatCMD('autoload -Uz compinit && compinit'));
        tb.unindent();
        tb.line('');
        tb.line(Formatter.white('Alternative: Local setup (no sudo required):'));
        tb.indent();
        tb.line('Add this to your ' + Formatter.formatCMD('~/.zshrc') + ':');
        tb.line('');
        tb.line(Formatter.formatCMD('fpath=(~/path/to/your/project/completions $fpath)'));
        tb.line(Formatter.formatCMD('autoload -Uz compinit && compinit'));
        tb.unindent();
        tb.unindent();
        tb.line('');
        tb.line(Formatter.formatTitle('Usage after setup:'));
        tb.line('');
        tb.indent();
        tb.line('Navigate to your project directory and type:');
        tb.line('');
        tb.line(
            Formatter.formatCMD('./run <TAB>') +
                ' ' +
                Formatter.original('- Lists all available commands'),
        );
        tb.line(
            Formatter.formatCMD('./run command-name <TAB>') +
                ' ' +
                Formatter.original('- Shows options for that command'),
        );
        tb.line(
            Formatter.formatCMD('./run command-name --<TAB>') +
                ' ' +
                Formatter.original('- Completes option names'),
        );
        tb.unindent();
    },
    action: async ({ args }) => {
        // Determine the completion file path
        const completionsDir = path.join(args.runDirectory, 'completions');
        const completionFilename = path.join(completionsDir, '_run');

        // Create the completions directory if it doesn't exist
        if (!fs.existsSync(completionsDir)) {
            fs.mkdirSync(completionsDir, { recursive: true });
        }

        // Generate the dynamic completion code using template string
        const completionCode = `#compdef run

# This function handles completions for any executable named 'run'
_run() {
    typeset -A opt_args
    local cwd="$(pwd)"

    # Find the nearest run file in the current or parent directories
    local run_script=""
    local current_dir="$cwd"
    while [[ "$current_dir" != "/" ]]; do
        if [[ -x "$current_dir/run" ]]; then
            run_script="$current_dir/run"
            break
        fi
        current_dir="$(dirname "$current_dir")"
    done

    local completion_data=$("$run_script" bunner-completions 2>>/tmp/bunner-completions.log)
    eval "$completion_data" 2>>/tmp/bunner-completions.log
    return 0
}

# Register for both the absolute command 'run' and the relative path pattern './run'
compdef _run run
compdef _run '*/run'
`;

        // Write the completion file
        fs.writeFileSync(completionFilename, completionCode);
        log.success(`Created completion file: ${completionFilename}`);

        const tb = new TextBuilder();

        tb.line('');
        tb.line('To activate completions:');
        tb.line('');
        tb.line(
            Formatter.formatCMD(`cp ${completionFilename} /usr/local/share/zsh/site-functions/`),
        );
        tb.line('');
        tb.line('Then restart your shell or run:');
        tb.line(Formatter.formatCMD('autoload -Uz compinit && compinit'));
        tb.line('');
        tb.line('For temporary activation in this session:');
        tb.line(
            Formatter.formatCMD(
                `fpath=(${completionsDir} $fpath); autoload -Uz compinit && compinit`,
            ),
        );
        tb.line('');

        console.log(tb.render());

        return 0;
    },
});
