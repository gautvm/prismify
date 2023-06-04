import { Command } from 'commander';
import {Prismify} from '../src/prismify';
import path from 'path';
import fs from 'fs';

const program = new Command();
program.option('-w, --watch', 'Watch for changes in schema files');

program.parse(process.argv);
const options = program.opts();

let configPath = path.join(process.cwd(), 'prismify.json');
if (options.config) {
  configPath = path.resolve(process.cwd(), options.config);
}

if (!fs.existsSync(configPath)) {
  console.error(`Configuration file not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const schemaFolderPath = config.schemaFolderPath;
const outputFilePath = config.outputFilePath;
const watchMode = options.watch || config.watchMode || false;

const prismify = new Prismify(schemaFolderPath, outputFilePath, watchMode);
prismify.run();
