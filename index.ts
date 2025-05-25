import cp from 'node:child_process';
import path from 'node:path';
import util from 'node:util';

const execAsync = util.promisify(cp.exec);

interface FileDialogOptions {
  multiple?: boolean;
  title?: string;
  fileTypes?: string[]; // e.g., ['*.txt', '*.md']
}

interface DialogTool {
  name: string;
  check: () => Promise<boolean>;
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => string[];
  parseOutput?: (output: string) => string[];
}

class FileDialogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileDialogError';
  }
}

const escapeShellArg = (arg: string): string => {
  // Escape single quotes and wrap in single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
};

const checkCommand = async (command: string): Promise<boolean> => {
  try {
    const { stdout } = await execAsync(`command -v ${command}`);
    return Boolean(stdout.trim());
  } catch {
    return false;
  }
};

const zenityTool: DialogTool = {
  name: 'zenity',
  check: () => checkCommand('zenity'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    const args = ['zenity', '--file-selection'];

    if (options.multiple) {
      args.push('--multiple', '--separator=\\n');
    }

    if (options.title) {
      args.push('--title', escapeShellArg(options.title));
    }

    if (options.fileTypes && options.fileTypes.length > 0) {
      for (const type of options.fileTypes) {
        args.push('--file-filter', escapeShellArg(type));
      }
    }

    args.push('--filename', escapeShellArg(`${initialDirectory}${path.sep}`));
    return args;
  }
};

const kdialogTool: DialogTool = {
  name: 'kdialog',
  check: () => checkCommand('kdialog'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    const args = ['kdialog'];

    if (options.multiple) {
      args.push('--getopenfilenames');
    } else {
      args.push('--getopenfilename');
    }

    args.push(escapeShellArg(initialDirectory));

    if (options.fileTypes && options.fileTypes.length > 0) {
      args.push(escapeShellArg(options.fileTypes.join(' ')));
    }

    if (options.title) {
      args.push('--title', escapeShellArg(options.title));
    }

    return args;
  }
};

const yad: DialogTool = {
  name: 'yad',
  check: () => checkCommand('yad'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    const args = ['yad', '--file-selection'];

    if (options.multiple) {
      args.push('--multiple', '--separator=\\n');
    }

    if (options.title) {
      args.push('--title', escapeShellArg(options.title));
    }

    if (options.fileTypes && options.fileTypes.length > 0) {
      for (const type of options.fileTypes) {
        args.push('--file-filter', escapeShellArg(type));
      }
    }

    args.push('--filename', escapeShellArg(`${initialDirectory}${path.sep}`));
    return args;
  }
};

const qarma: DialogTool = {
  name: 'qarma',
  check: () => checkCommand('qarma'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    const args = ['qarma', '--file-selection'];

    if (options.multiple) {
      args.push('--multiple', '--separator=\\n');
    }

    if (options.title) {
      args.push('--title', escapeShellArg(options.title));
    }

    if (options.fileTypes && options.fileTypes.length > 0) {
      for (const type of options.fileTypes) {
        args.push('--file-filter', escapeShellArg(type));
      }
    }

    args.push('--filename', escapeShellArg(`${initialDirectory}${path.sep}`));
    return args;
  }
};

const matedialog: DialogTool = {
  name: 'matedialog',
  check: () => checkCommand('matedialog'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    const args = ['matedialog', '--file-selection'];

    if (options.multiple) {
      args.push('--multiple', '--separator=\\n');
    }

    if (options.title) {
      args.push('--title', escapeShellArg(options.title));
    }

    args.push('--filename', escapeShellArg(`${initialDirectory}${path.sep}`));
    return args;
  }
};

const osascript: DialogTool = {
  name: 'osascript',
  check: async () => {
    // Only available on macOS
    try {
      const { stdout } = await execAsync('uname -s');
      return stdout.trim() === 'Darwin' && await checkCommand('osascript');
    } catch {
      return false;
    }
  },
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    let script = 'tell application "System Events" to activate\n';

    if (options.multiple) {
      script += `set theFiles to choose file with prompt "${options.title || 'Select files'}" `;
      script += `default location POSIX file "${initialDirectory}" `;
      script += 'with multiple selections allowed\n';
      script += 'set output to ""\n';
      script += 'repeat with aFile in theFiles\n';
      script += 'set output to output & POSIX path of aFile & "\n"\n';
      script += 'end repeat\n';
      script += 'return output';
    } else {
      script += `set theFile to choose file with prompt "${options.title || 'Select a file'}" `;
      script += `default location POSIX file "${initialDirectory}"\n`;
      script += 'return POSIX path of theFile';
    }

    return ['osascript', '-e', escapeShellArg(script)];
  },
  parseOutput: (output: string) => {
    // osascript adds trailing newline, remove it
    return output.trim().split('\n').filter(Boolean);
  }
};

const rofi: DialogTool = {
  name: 'rofi',
  check: () => checkCommand('rofi'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    // Rofi with file browser mode
    const args = [
      'bash',
      '-c',
      escapeShellArg(
        `cd ${escapeShellArg(initialDirectory)} && find . -type f | rofi -dmenu -p "${options.title || 'Select file'}" -multi-select`
      )
    ];

    return args;
  },
  parseOutput: (output: string) => {
    // Convert relative paths to absolute
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(p => {
        if (p.startsWith('./')) {
          return path.resolve(p);
        }
        return p;
      });
  }
};

const dmenu: DialogTool = {
  name: 'dmenu',
  check: () => checkCommand('dmenu'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    // dmenu with file listing
    const args = [
      'bash',
      '-c',
      escapeShellArg(
        `cd ${escapeShellArg(initialDirectory)} && find . -type f | dmenu -p "${options.title || 'Select file'}"`
      )
    ];

    return args;
  },
  parseOutput: (output: string) => {
    // Convert relative paths to absolute and handle single selection
    const selected = output.trim();
    if (!selected) return [];

    if (selected.startsWith('./')) {
      return [path.resolve(selected)];
    }
    return [selected];
  }
};

// Terminal-based fallback using fzf
const fzf: DialogTool = {
  name: 'fzf',
  check: () => checkCommand('fzf'),
  buildCommand: (initialDirectory: string, options: FileDialogOptions) => {
    const fzfOpts = ['--prompt', `"${options.title || 'Select file'}> "`];

    if (options.multiple) {
      fzfOpts.push('-m'); // multi-select mode
    }

    const args = [
      'bash',
      '-c',
      escapeShellArg(`cd ${escapeShellArg(initialDirectory)} && find . -type f | fzf ${fzfOpts.join(' ')}`)
    ];

    return args;
  },
  parseOutput: (output: string) => {
    // Convert relative paths to absolute
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(p => {
        if (p.startsWith('./')) {
          return path.resolve(p);
        }
        return p;
      });
  }
};

// Order matters - more feature-rich tools first
const tools: DialogTool[] = [zenityTool, kdialogTool, yad, qarma, matedialog, osascript, rofi, fzf, dmenu];

export const openLinuxFileDialog = async (
  initialDirectory: string = process.cwd(),
  options: FileDialogOptions = {}
): Promise<string[]> => {
  if (typeof initialDirectory !== 'string') {
    throw new FileDialogError('Filepath must be a string');
  }

  const normalizedPath = path.resolve(initialDirectory);
  let availableTool: DialogTool | null = null;

  for (const tool of tools) {
    if (await tool.check()) {
      availableTool = tool;
      break;
    }
  }

  if (!availableTool) {
    throw new FileDialogError(
      'No suitable file dialog tool found. Please install one of: zenity, kdialog, yad, qarma, matedialog, rofi, fzf, or dmenu.'
    );
  }

  const commandArgs = availableTool.buildCommand(normalizedPath, options);
  const command = commandArgs.join(' ');

  try {
    const { stdout, stderr } = await execAsync(command, {
      shell: '/bin/bash',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large file selections
    });

    if (stderr && !stderr.includes('Gtk-WARNING')) {
      console.warn(`File dialog warning: ${stderr}`);
    }

    const output = stdout.trim();
    if (!output) {
      // User cancelled the dialog
      return [];
    }

    // Parse the output using custom parser if available
    let filePaths: string[];
    if (availableTool.parseOutput) {
      filePaths = availableTool.parseOutput(output);
    } else {
      filePaths = output.split('\n').filter(Boolean);
    }

    // Validate that all paths are absolute
    const validPaths = filePaths.filter(p => path.isAbsolute(p));
    if (validPaths.length !== filePaths.length) {
      console.warn('Some file paths were not absolute and were filtered out');
    }

    return validPaths;
  } catch (error) {
    // Check if user cancelled (exit code 1)
    if (error instanceof Error && 'code' in error && error.code === 1) {
      return [];
    }

    throw new FileDialogError(
      `Failed to open file dialog with ${availableTool.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const getAvailableDialogTools = async (): Promise<string[]> => {
  const available: string[] = [];

  for (const tool of tools) {
    if (await tool.check()) {
      available.push(tool.name);
    }
  }

  return available;
};

export default openLinuxFileDialog;
