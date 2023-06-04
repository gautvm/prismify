import fs from 'fs';
import path from 'path';

export class Prismify {
  private schemaFolderPath: string;
  private outputFilePath: string;
  private watchMode: boolean;
  private previousSchemaContent: string;

  public constructor(schemaFolderPath: string, outputFilePath: string, watchMode: boolean) {
    this.schemaFolderPath = schemaFolderPath;
    this.outputFilePath = outputFilePath;
    this.watchMode = watchMode;
    this.previousSchemaContent = '';
  }

  private formatElapsedTime(startTime: number, endTime: number): string {
    const elapsedTime = (endTime - startTime);
    return `${elapsedTime} ms`;
  }

  private mergeSchemas(): void {
    const files = fs.readdirSync(this.schemaFolderPath);

    const startTime = new Date().getTime();

    const schemaContents = files
      .filter((file) => file.endsWith('.prisma'))
      .map((file) => fs.readFileSync(path.join(this.schemaFolderPath, file), 'utf-8'))
      .join('\n');

    if (schemaContents !== this.previousSchemaContent) {
      fs.writeFileSync(this.outputFilePath, schemaContents, 'utf-8');
      this.previousSchemaContent = schemaContents;

      const endTime = new Date().getTime();
      const elapsedTime = this.formatElapsedTime(startTime, endTime);

      console.log(`Unified schema file '${this.outputFilePath}' generated in ${elapsedTime}`);
    } else {
        return;
    }
  }

  public run(): void {
    this.mergeSchemas();

    if (this.watchMode) {
      console.log(`Watching for changes in '${this.schemaFolderPath}'.`);

      fs.watch(this.schemaFolderPath, { recursive: true }, () => {
        this.mergeSchemas();
      });
    }
  }
}
