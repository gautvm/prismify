import { Command } from "commander";
import { Prismify, PrismifyConfig } from "../src/prismify";
import path from "path";
import fs from "fs";

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
  .action((options) => {
    const configPath = options.config
      ? path.resolve(process.cwd(), options.config)
      : path.join(process.cwd(), "prismify.json");

    if (!fs.existsSync(configPath)) {
      console.error(`Configuration file not found: ${configPath}`);
      process.exit(1);
    }

    const configContent = fs.readFileSync(configPath, "utf-8");
    const settings = JSON.parse(configContent);

    const config: PrismifyConfig = {
      schemaFolderPath: options.schema || settings.schemaFolderPath,
      outputFilePath: options.output || settings.outputFilePath,
      watchMode: options.watch || settings.watchMode || false,
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
      console.error("Prismify configuration file already exists.");
      return;
    }

    const defaultConfig: PrismifyConfig = {
      schemaFolderPath: "schemas",
      outputFilePath: "schema.prisma",
      watchMode: false,
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(`Prismify configuration file created: ${configPath}`);
  });

program.parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
}
