import readline from 'node:readline';
import { openLinuxFileDialog } from './index';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Press Ctrl+O to open a file.');

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

const selected = [];

process.stdin.on('keypress', async (str, key) => {
  if (key.ctrl && key.name === 'o') {
    const { canceled, files } = await openLinuxFileDialog({ multiple: false });

    if (canceled) {
      rl.close();
      return;
    }

    console.log({ files });
    selected.push(...files);
    return;
  }

  if (key.ctrl && key.name === 'p') {
    console.log({ selected });
    return;
  }

  if (key.name === 'return') {
    console.log({ selected });
    rl.close();
    return;
  }

  if (key.ctrl && key.name === 'c') {
    console.log('Exiting...');
    process.exit();
  }
});

rl.on('close', () => {
  process.exit(0);
});
