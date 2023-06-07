import fs from "fs";
import { exec } from "child_process";
import { SchemaFile } from "../types/SchemaFile";
import path from "path";

export class AliasGenerator {
  public static generateAliases(schemaFolderPath: string): void {
    const schemaFiles = AliasGenerator.searchForSchemaFiles(schemaFolderPath);

    schemaFiles.forEach((file) => {
      const content = fs.readFileSync(file.filePath, "utf-8");
      const matches = content.matchAll(/\b(\w+)\[\]/gi);
      for (const match of matches) {
        if (!content.includes(`model ${match[1]}`)) {
          const alias = `
  // Alias
  model ${match[1]} {
    id Int @id @default(autoincrement())
  }`;

          fs.appendFileSync(file.filePath, alias);
          exec("npx prisma format --schema=" + file.filePath, {});
        }
      }
    });
  }

  private static searchForSchemaFiles(dir: string): SchemaFile[] {
    const schemaFiles: SchemaFile[] = [];
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const isDirectory = fs.lstatSync(filePath).isDirectory();

      if (isDirectory) {
        schemaFiles.push(...AliasGenerator.searchForSchemaFiles(filePath));
      } else if (file.endsWith(".prisma")) {
        schemaFiles.push({ filePath });
      }
    });

    return schemaFiles;
  }
}
