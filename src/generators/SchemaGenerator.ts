import fs from "fs";
import kleur from "kleur";
import path from "path";
import { SchemaFile } from "../types/SchemaFile";

export class SchemaGenerator {
  public static generateUnifiedSchema(schemaFolderPath: string): string {
    const schemaFiles = SchemaGenerator.searchForSchemaFiles(schemaFolderPath);

    const baseSchemaPath = path.join(
      schemaFolderPath,
      "Base.prisma".toLowerCase()
    );
    if (!fs.existsSync(baseSchemaPath)) {
      console.error(kleur.red("❌ Required file 'Base.prisma' not found."));
      process.exit(1);
    }

    const baseSchema = fs.readFileSync(baseSchemaPath, "utf-8");
    const schemaContents = schemaFiles
      .map((file) => {
        const content = fs.readFileSync(file.filePath, "utf-8");
        const contentWithoutAlias = content.replace(/\/\/Alias([\s\S]*?)\}/g, "");
        return file.isBaseSchema ? "" : contentWithoutAlias;
      })
      .join("\n");

    const warningComment =
      "// WARNING: This file is generated by Prismify. Do not edit this file.";
    const generatedSchema = `${warningComment}\n\n${baseSchema}\n\n${schemaContents}`;

    return generatedSchema;
  }

  private static searchForSchemaFiles(dir: string): SchemaFile[] {
    const schemaFiles: SchemaFile[] = [];
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const isDirectory = fs.lstatSync(filePath).isDirectory();
      const isBaseSchema = file.toLowerCase() === "base.prisma";

      if (isDirectory) {
        schemaFiles.push(...SchemaGenerator.searchForSchemaFiles(filePath));
      } else if (file.endsWith(".prisma")) {
        schemaFiles.push({ filePath, isBaseSchema });
      }
    });

    return schemaFiles;
  }
}
