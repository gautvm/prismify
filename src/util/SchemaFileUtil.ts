import fs from "fs";
import path from "path";
import { SchemaFile } from "../types/SchemaFile";

export class SchemaFileUtil {
  public static searchForSchemaFiles(dir: string): SchemaFile[] {
    const schemaFiles: SchemaFile[] = [];
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const isDirectory = fs.lstatSync(filePath).isDirectory();
      const isBaseSchema = file.toLowerCase() === "base.prisma";

      if (isDirectory) {
        schemaFiles.push(...SchemaFileUtil.searchForSchemaFiles(filePath));
      } else if (file.endsWith(".prisma")) {
        schemaFiles.push({ filePath, isBaseSchema });
      }
    });

    return schemaFiles;
  }
}
