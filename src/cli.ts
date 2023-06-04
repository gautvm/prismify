import { Command } from 'commander';
import { Prismify, PrismifyConfig } from '../src/prismify';
import path from 'path';
import fs from 'fs';

const program = new Command();
program.option('-w, --watch', 'Watch for changes in schema files');
program.option('-c, --config <path>', 'Path to the configuration file');
program.option('-s, --schema <path>', 'Path to the schema folder');
program.option('-o, --output <path>', 'Path to the output file');

program.parse(process.argv);
const options = program.opts();

let configPath = options.config
  ? path.resolve(process.cwd(), options.config)
  : path.join(process.cwd(), 'prismify.json');

if (!fs.existsSync(configPath)) {
  console.error(`Configuration file not found: ${configPath}`);
  process.exit(1);
}

const configContent = fs.readFileSync(configPath, 'utf-8');
const settings = JSON.parse(configContent);

const config: PrismifyConfig = {
  schemaFolderPath: options.schema || settings.schemaFolderPath,
  outputFilePath: options.output || settings.outputFilePath,
  watchMode: options.watch || settings.watchMode || false,
};

const prismify = new Prismify(config);
prismify.run();
