import fs from 'fs';
import path from 'path';

export function mergeSchemas(schemaFolderPath: string, outputFilePath: string) {
  let initialMergeCompleted = false;

  const mergeAndWriteSchemas = () => {
    const files = fs.readdirSync(schemaFolderPath);

    const schemaContents = files
      .filter((file) => file.endsWith('.prisma'))
      .map((file) => fs.readFileSync(path.join(schemaFolderPath, file), 'utf-8'))
      .join('\n');

    fs.writeFileSync(outputFilePath, schemaContents, 'utf-8');
  };

  const handleSchemaChange = () => {
    if (initialMergeCompleted) {
      mergeAndWriteSchemas();
      console.log(`Unified schema file '${outputFilePath}' regenerated.`);
    } else {
      initialMergeCompleted = true;
    }
  };

  mergeAndWriteSchemas();
  initialMergeCompleted = true;

  fs.watch(schemaFolderPath, { recursive: true }, handleSchemaChange);

  console.log(`Watching for changes in '${schemaFolderPath}'.`);
}
