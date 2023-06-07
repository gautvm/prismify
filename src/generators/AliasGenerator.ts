import fs from "fs";
import { exec } from "child_process";
import { SchemaFileUtil } from "../util/SchemaFileUtil";

export class AliasGenerator {
  public static generateAliases(schemaFolderPath: string): void {
    const schemaFiles = SchemaFileUtil.searchForSchemaFiles(schemaFolderPath);

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
}
