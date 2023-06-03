import path from 'path';
import { mergeSchemas } from '../src/prismify'

const schemaFolderPath = path.join(__dirname, '../test/models');
const outputFilePath = path.join(__dirname, '../test/prisma', 'schema.prisma');

mergeSchemas(schemaFolderPath, outputFilePath);