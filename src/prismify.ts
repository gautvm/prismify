import fs from "fs";
import kleur from "kleur";
import { diffLines } from "diff";
import { exec } from "child_process";
import { SchemaGenerator } from "./generators/SchemaGenerator";
import { AliasGenerator } from "./generators/AliasGenerator";
import { Config } from "./types/Config";

export class Prismify {
  private config: Config;
  private previousSchemaContent: string;

  public constructor(config: Config) {
    this.config = config;
    this.previousSchemaContent = "";
  }

  private formatElapsedTime(startTime: number, endTime: number): string {
    const elapsedTime = endTime - startTime;
    return `${elapsedTime} ms`;
  }

  private logSchemaGeneration(outputFilePath: string, elapsedTime: string): void {
    console.log(
      kleur.green().bold("✨ Unified schema file generated:") +
        ` ${kleur.yellow(outputFilePath)} ${kleur.dim("(" + elapsedTime + ")")}`
    );
  }

  private logSchemaDiffs(diff: any): void {
    const addedLines: string[] = [];
    const removedLines: string[] = [];

    diff.forEach((part: any) => {
      const { added, removed, value } = part;
      if (added) {
        addedLines.push(value);
      } else if (removed) {
        removedLines.push(value);
      }
    });

    if (addedLines.length > 0) {
      console.log(kleur.green().bold("\n🟢 Changes Added:\n"));
      console.log(kleur.green(addedLines.join("")));
    }

    if (removedLines.length > 0) {
      console.log(kleur.red().bold("\n🔴 Changes Removed:\n"));
      console.log(kleur.red(removedLines.join("")));
    }
  }

  private generateAndSaveSchema = () => {
    AliasGenerator.generateAliases(this.config.schemaFolderPath);
    const startTime = new Date().getTime();
    const generatedSchema = SchemaGenerator.generateUnifiedSchema(
      this.config.schemaFolderPath,
    );

    if (generatedSchema !== this.previousSchemaContent) {
      const diff = diffLines(this.previousSchemaContent, generatedSchema);

      fs.writeFileSync(this.config.outputFilePath, generatedSchema, "utf-8");
      this.previousSchemaContent = generatedSchema;

      const endTime = new Date().getTime();
      const elapsedTime = this.formatElapsedTime(startTime, endTime);

      this.logSchemaGeneration(this.config.outputFilePath, elapsedTime);

      if (this.config.logDiffs) {
        this.logSchemaDiffs(diff);
      }
    }

    exec("npx prisma format --schema=" + this.config.outputFilePath, {});
  };

  public run(): void {
    this.generateAndSaveSchema();

    if (this.config.watchMode) {
      console.log(
        kleur.yellow().bold("👀 Watching for changes in:") +
          ` ${kleur.cyan(this.config.schemaFolderPath)}`
      );

      fs.watch(
        this.config.schemaFolderPath,
        { recursive: true },
        this.generateAndSaveSchema
      );
    }
  }
}
