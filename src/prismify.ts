import fs from "fs";
import path from "path";
import kleur from "kleur";

export interface PrismifyConfig {
  schemaFolderPath: string;
  outputFilePath: string;
  watchMode: boolean;
}

export class Prismify {
  private config: PrismifyConfig;
  private previousSchemaContent: string;

  public constructor(config: PrismifyConfig) {
    this.config = config;
    this.previousSchemaContent = "";
  }

  private formatElapsedTime(startTime: number, endTime: number): string {
    const elapsedTime = endTime - startTime;
    return `${elapsedTime} ms`;
  }

  private searchForSchemaFiles = (dir: string, schemaFiles: string[]): void => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const isDirectory = fs.lstatSync(filePath).isDirectory();

      if (isDirectory) {
        this.searchForSchemaFiles(filePath, schemaFiles);
      } else if (file.endsWith(".prisma")) {
        schemaFiles.push(filePath);
      }
    });
  };

  private mergeSchemas(): void {
    const schemaFiles: string[] = [];
    const startTime = new Date().getTime();

    this.searchForSchemaFiles(this.config.schemaFolderPath, schemaFiles);

    const baseSchemaPath = path.join(
      this.config.schemaFolderPath,
      "Base.prisma".toLowerCase(),
    );
    if (!fs.existsSync(baseSchemaPath)) {
      console.error(kleur.red("❌ Required file 'Base.prisma' not found."));
      process.exit(1);
    }

    const baseSchema = fs.readFileSync(baseSchemaPath, "utf-8");
    const schemaContents = schemaFiles
      .map((filePath) => {
        const content = fs.readFileSync(filePath, "utf-8");
        return filePath === baseSchemaPath ? "" : content;
      })
      .join("\n");

    const generatedSchema = `${baseSchema}\n\n${schemaContents}`;

    if (generatedSchema !== this.previousSchemaContent) {
      fs.writeFileSync(this.config.outputFilePath, generatedSchema, "utf-8");
      this.previousSchemaContent = generatedSchema;

      const endTime = new Date().getTime();
      const elapsedTime = this.formatElapsedTime(startTime, endTime);

      console.log(
        kleur.green().bold("✨ Unified schema file generated:") +
          ` ${kleur.yellow(this.config.outputFilePath)} ${kleur.dim(
            "(" + elapsedTime + ")"
          )}`
      );
    } else {
      return;
    }
  }

  public run(): void {
    this.mergeSchemas();

    if (this.config.watchMode) {
      console.log(
        kleur.yellow().bold("👀 Watching for changes in:") +
          ` ${kleur.cyan(this.config.schemaFolderPath)}`
      );

      fs.watch(this.config.schemaFolderPath, { recursive: true }, () => {
        this.mergeSchemas();
      });
    }
  }
}
