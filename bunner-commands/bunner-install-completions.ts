import * as fs from 'fs';
import * as path from 'path';

import { TextBuilder } from '../framework';
import defineCommand from '../framework/defineCommand';
import Formatter from '../framework/Formatter';
import log from '../framework/log';

export default defineCommand({
    command: 'bunner-install-completions',
    description: 'Installs ZSH completions for a specific run file',
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
