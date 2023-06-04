import { Command } from 'commander';
import path from 'path';
import {Prismify} from '../src/prismify';

const program = new Command();
program.option('-w, --watch', 'Watch for changes in schema files');

program.parse(process.argv);
const options = program.opts();

const schemaFolderPath = path.join(__dirname, '../test/models');
const outputFilePath = path.join(__dirname, '../test/prisma', 'schema.prisma');
const watchMode = options.watch || false;

const prismify = new Prismify(schemaFolderPath, outputFilePath, watchMode);
prismify.run();