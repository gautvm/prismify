import fs from 'fs';
import path from 'path';

export function mergeSchemas(schemaFolderPath: string, outputFilePath: string) {
  const files = fs.readdirSync(schemaFolderPath);

  const schemaContents = files
    .filter((file) => file.endsWith('.prisma'))
    .map((file) => fs.readFileSync(path.join(schemaFolderPath, file), 'utf-8'))
    .join('\n');

  fs.writeFileSync(outputFilePath, schemaContents, 'utf-8');
}

