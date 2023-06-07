#!/usr/bin/env node

import { Command } from "commander";
import { Prismify } from "./Prismify";
import { Config } from "./types/Config";
import path from "path";
import fs from "fs";
import kleur from "kleur";

const program = new Command();

program
  .name("prismify")
  .description("A tool for merging Prisma schema files")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate the merged schema")
  .option("-w, --watch", "Watch for changes in schema files")
  .option("-c, --config <path>", "Path to the configuration file")
  .option("-s, --schema <path>", "Path to the schema folder")
  .option("-o, --output <path>", "Path to the output file")
  .option("-d, --diffs", "Log the schema diffs")
  .action((options) => {
    const configPath = options.config
      ? path.resolve(process.cwd(), options.config)
      : path.join(process.cwd(), "prismify.json");

    if (!fs.existsSync(configPath)) {
      console.error(kleur.red(`Configuration file not found: ${configPath}`));
      process.exit(1);
    }

    const configContent = fs.readFileSync(configPath, "utf-8");
    const settings = JSON.parse(configContent);

    const config: Config = {
      schemaFolderPath: options.schema || settings.schemaFolderPath,
      outputFilePath: options.output || settings.outputFilePath,
      watchMode: options.watch || settings.watchMode || false,
      logDiffs: options.diffs || settings.logDiffs || false,
    };

    const prismify = new Prismify(config);
    prismify.run();
  });

program
  .command("init")
  .description("Initialize a new Prismify configuration file")
  .action(() => {
    const configPath = path.join(process.cwd(), "prismify.json");

    if (fs.existsSync(configPath)) {
      console.error(kleur.red("Prismify configuration file already exists."));
      return;
    }

    const defaultConfig: Config = {
      schemaFolderPath: "schemas",
      outputFilePath: "schema.prisma",
      watchMode: false,
      logDiffs: false,
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(
      kleur.green(`Prismify configuration file created: ${configPath}`)
    );
  });

program.parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
}
