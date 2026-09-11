#!/usr/bin/env node
import { readFile, mkdir, lstat, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { localRegistry } from '../../registry/index.js';
import { createConfig, validateConfig } from '../../core/config.js';
import { generateFiles, generateVueFiles } from '../../codegen/node.js';

const help = `Wobbi — local mascot registry
Usage: wobbi add <slug> [--dir <folder>] [--framework react|vue] [--force]
       wobbi add --config <mascot.json> [--dir <folder>] [--force]
       wobbi list
Presets are resolved from the local workspace registry.`;

async function main(args) {
  if (args.length === 0 || args[0] === '--help') {
    console.log(help);
    return;
  }
  if (args[0] === 'list') {
    console.log(localRegistry.list().join('\n'));
    return;
  }
  if (args.shift() !== 'add') throw new Error(`Unknown command.\n${help}`);
  let slug;
  const options = {};
  while (args.length) {
    const arg = args.shift();
    if (arg === '--force') options.force = true;
    else if (['--dir', '--config', '--framework'].includes(arg)) {
      const value = args.shift();
      if (!value || value.startsWith('--'))
        throw new Error(`${arg} requires a value.`);
      options[arg.slice(2)] = value;
    } else if (arg.startsWith('-')) throw new Error(`Unknown option ${arg}.`);
    else if (slug) throw new Error('Provide only one mascot slug.');
    else slug = arg;
  }
  if (options.config && slug) throw new Error('Use either a slug or --config.');
  if (!options.config && (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)))
    throw new Error('A valid lowercase mascot slug is required.');
  if (options.framework && !['react', 'vue'].includes(options.framework))
    throw new Error('Framework must be react or vue.');
  let config;
  if (options.config) {
    const input = JSON.parse(
      await readFile(path.resolve(options.config), 'utf8'),
    );
    const errors = validateConfig(input);
    if (errors.length) throw new Error(errors.join('\n'));
    config = createConfig(input);
  } else config = localRegistry.resolve(slug);
  if (options.framework) config.export.framework = options.framework;
  const target = path.resolve(options.dir || config.export.folder);
  const files =
    config.export.framework === 'vue'
      ? generateVueFiles(config)
      : generateFiles(config);
  const entries = Object.entries(files).map(([name, content]) => ({
    file: path.join(target, name),
    content,
  }));
  for (const { file } of entries) {
    const stat = await lstat(file).catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (stat && (!options.force || !stat.isFile() || stat.isSymbolicLink()))
      throw new Error(
        `Refusing to overwrite ${file}. Review existing files and use --force for regular files.`,
      );
  }
  await mkdir(target, { recursive: true });
  const created = [];
  try {
    for (const { file, content } of entries) {
      await writeFile(file, content, { flag: options.force ? 'w' : 'wx' });
      if (!options.force) created.push(file);
    }
  } catch (error) {
    await Promise.all(created.map((file) => unlink(file)));
    throw error;
  }
  console.log(
    `Wobbi: installed ${config.name} from ${options.config ? 'your configuration' : 'the local registry'}.\n${target}\n${Object.keys(
      files,
    )
      .map((name) => `  + ${name}`)
      .join('\n')}\nYour code, yours. Edit every shape, style and animation.`,
  );
}
main(process.argv.slice(2)).catch((error) => {
  console.error(`Wobbi: ${error.message}`);
  process.exitCode = 1;
});
