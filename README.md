# open-linux-file-dialog [![NPM version](https://img.shields.io/npm/v/open-linux-file-dialog.svg?style=flat)](https://www.npmjs.com/package/open-linux-file-dialog) [![NPM monthly downloads](https://img.shields.io/npm/dm/open-linux-file-dialog.svg?style=flat)](https://npmjs.org/package/open-linux-file-dialog) [![NPM total downloads](https://img.shields.io/npm/dt/open-linux-file-dialog.svg?style=flat)](https://npmjs.org/package/open-linux-file-dialog)

> Open a file dialog window programmatically to allow the user to select one or more files. Only works on Linux. No dependencies. Supports zenity (GNOME), kdialog (KDE), yad (Yet Another Dialog), qarma (Qt-based), matedialog (MATE), rofi (window switcher with file browser mode), fzf (terminal fuzzy finder), dmenu (dynamic menu).

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save open-linux-file-dialog
```

## Usage

**HEADS UP!**: On Linux, you need at least one of these file dialog tools installed:

* `zenity` (GNOME)
* `kdialog` (KDE)
* `yad` (Yet Another Dialog)
* `qarma` (Qt-based)
* `matedialog` (MATE)
* `rofi` (window switcher with file browser mode)
* `fzf` (terminal fuzzy finder)
* `dmenu` (dynamic menu)

On macOS, native dialogs are supported via `osascript`.

```typescript
import { openLinuxFileDialog, getAvailableDialogTools } from 'open-linux-file-dialog';
// or
import openLinuxFileDialog from 'open-linux-file-dialog';
```

## API

### openLinuxFileDialog

Opens a file dialog to select files and returns the paths of selected files.

```typescript
export const openLinuxFileDialog = async (
  initialDirectory?: string,
  options?: FileDialogOptions
): Promise<string[]>;

interface FileDialogOptions {
  multiple?: boolean;    // Allow multiple file selection
  title?: string;       // Dialog window title
  fileTypes?: string[]; // File type filters (e.g., ['*.txt', '*.md'])
}
```

**Basic usage:**

```ts
// Open the dialog in the current working directory
const selectedFiles = await openLinuxFileDialog();
console.log('Selected files:', selectedFiles);
```

**Parameters:**

**initialDirectory** (optional)

* Type: `string`
* Default: `process.cwd()`
* Sets the **initial directory** where the file dialog opens, allowing users to navigate from there.

```ts
const selectedFiles = await openLinuxFileDialog('/home/user/documents');
```

Other examples:

* `openLinuxFileDialog()` - Opens in current working directory
* `openLinuxFileDialog('/home/user/Documents')` - Opens in Documents folder, but user can navigate anywhere
* `openLinuxFileDialog('/tmp')` - Opens in /tmp directory

**options** (optional)

* Type: `FileDialogOptions`
* Configuration options for the file dialog

```ts
// Select multiple files with filters
const selectedFiles = await openLinuxFileDialog('/home/user', {
  multiple: true,
  title: 'Select configuration files',
  fileTypes: ['*.json', '*.yaml', '*.yml']
});

// Single file selection with custom title
const selectedFiles = await openLinuxFileDialog('/home/user', {
  title: 'Choose a document'
});
```

**Returns:**

* Type: `Promise<string[]>`
* An array of absolute file paths selected by the user
* Returns an empty array if the user cancels the dialog

**Error handling:**

```ts
try {
  const files = await openLinuxFileDialog();
  if (files.length === 0) {
    console.log('User cancelled the dialog');
  } else {
    console.log('Selected files:', files);
  }
} catch (error) {
  if (error instanceof FileDialogError) {
    console.error('File dialog error:', error.message);
  }
}
```

### getAvailableDialogTools

Check which dialog tools are available on the system.

```typescript
export const getAvailableDialogTools = async (): Promise<string[]>;
```

**Usage:**

```ts
const availableTools = await getAvailableDialogTools();
console.log('Available dialog tools:', availableTools);
// Output: ['zenity', 'kdialog', 'fzf']
```

## Examples

### Select multiple image files

```ts
const images = await openLinuxFileDialog('/home/user/Pictures', {
  multiple: true,
  title: 'Select images',
  fileTypes: ['*.jpg', '*.jpeg', '*.png', '*.gif']
});
```

### Select a single configuration file

```ts
const [configFile] = await openLinuxFileDialog('/etc', {
  title: 'Select configuration',
  fileTypes: ['*.conf', '*.cfg']
});

if (configFile) {
  console.log('Selected config:', configFile);
}
```

### Check for dialog tool availability

```ts
const tools = await getAvailableDialogTools();
if (tools.length === 0) {
  console.error('No file dialog tools found. Please install zenity, kdialog, or another supported tool.');
}
```

## Notes

* The library automatically detects and uses the first available dialog tool
* GUI-based tools (zenity, kdialog, etc.) are preferred over terminal-based tools
* All returned paths are absolute paths
* File type filters are supported by most GUI dialog tools but may not work with terminal-based tools (fzf, dmenu)
* On macOS, the native file dialog is used via `osascript`

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2025, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on May 25, 2025._