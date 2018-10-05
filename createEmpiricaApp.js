/**
 * Copyright (c) 2018-present, Nicolas Paton, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const validateProjectName = require("validate-npm-package-name");
const chalk = require("chalk");
const commander = require("commander");
const fs = require("fs-extra");
const path = require("path");
const execSync = require("child_process").execSync;
const spawn = require("cross-spawn");
const semver = require("semver");
const dns = require("dns");
const tmp = require("tmp");
const unpack = require("tar-pack").unpack;
const url = require("url");
const hyperquest = require("hyperquest");
const envinfo = require("envinfo");
const os = require("os");

const commandExistsSync = require("command-exists").sync;
const metalsmith = require("metalsmith");
const inPlace = require("metalsmith-in-place");
const rename = require("metalsmith-rename");
const ignore = require("metalsmith-ignore");
const inflection = require("inflection");

const packageJson = require("./package.json");

const isWin = process.platform === "win32";
const TEMPLATES_FOLDER = path.join(__dirname, "templates");

// These files should be allowed to remain on a failed install,
// but then silently removed during the next create.
const errorLogFilePatterns = [
  "npm-debug.log",
  "yarn-error.log",
  "yarn-debug.log"
];

let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action(name => {
    projectName = name;
  })
  .option("--verbose", "print additional logs")
  .option("--info", "print environment debug info")
  .option("--use-npm")
  .allowUnknownOption()
  .on("--help", () => {
    console.log(`    Only ${chalk.green("<project-directory>")} is required.`);
    console.log();
  })
  .parse(process.argv);

if (program.info) {
  console.log(chalk.bold("\nEnvironment Info:"));
  return envinfo
    .run(
      {
        System: ["OS", "CPU"],
        Binaries: ["Node", "npm", "Yarn"],
        Browsers: ["Chrome", "Edge", "Internet Explorer", "Firefox", "Safari"],
        npmPackages: ["react", "react-dom", "empirica-scripts"],
        npmGlobalPackages: ["create-empirica-app"]
      },
      {
        clipboard: true,
        duplicates: true,
        showNotFound: true
      }
    )
    .then(console.log)
    .then(() => console.log(chalk.green("Copied To Clipboard!\n")));
}

if (typeof projectName === "undefined") {
  console.error("Please specify the project directory:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
  );
  console.log();
  console.log("For example:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("my-empirica-app")}`
  );
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

function printValidationResults(results) {
  if (typeof results !== "undefined") {
    results.forEach(error => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}

const hiddenProgram = new commander.Command()
  .option(
    "--internal-testing-template <path-to-template>",
    "(internal usage only, DO NOT RELY ON THIS) " +
      "use a non-standard application template"
  )
  .parse(process.argv);

createApp(
  projectName,
  program.verbose,
  program.useNpm,
  hiddenProgram.internalTestingTemplate
);

function createApp(name, verbose, useNpm, template = "basic") {
  installMeteor();

  const root = path.resolve(name);
  const appName = path.basename(root);

  checkAppName(appName);
  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }

  console.log(`Creating a new Empirica app in ${chalk.green(root)}.`);
  console.log();

  const templatePath = path.join(TEMPLATES_FOLDER, template);

  if (verbose) {
    console.log(`Using template ${chalk.cyan(templatePath)}.`);
  }

  const config = {
    name,
    appName: inflection.titleize(inflection.humanize(name.replace(/-/g, " "))),
    adminPassword: Math.random()
      .toString(36)
      .substring(2, 15)
  };

  copyTemplate(root, appName, verbose, templatePath, config)
    .then(() => {
      initNpm(root, verbose);
      finished(root, appName, verbose);
    })
    .catch(err => {
      console.log(err);
      console.log(chalk.red(`\n\Failed to setup meteor template!\n\n`));

      process.exit(1);
    });
}

function finished(root, appName, verbose) {
  console.log();
  console.log(`${chalk.green("Success!")} Created ${appName} at ${root}.`);
  console.log();
  console.log(
    `Inside that directory, you can run the ${chalk.cyan(
      "meteor"
    )} command to start the development server.`
  );
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), appName);
  console.log(`  ${chalk.cyan(`meteor`)}`);
  console.log();
  console.log("Happy experimenting!");
}

function initNpm(root, verbose) {
  try {
    console.log(`Pulling NPM dependencies.`);
    console.log();

    // process.chdir(root);
    // console.log("New directory: " + process.cwd());
    execSync(`meteor npm install`, {
      stdio: "inherit",
      cwd: root
    });
  } catch (e) {
    console.log(chalk.red(`\n\nCould not pull NPM dependencies\n\n`));
    process.exit(1);
  }
}

function copyTemplate(root, appName, verbose, templatePath, config) {
  console.log(`Setting up App template.`);
  console.log();

  return new Promise((resolve, reject) => {
    metalsmith(__dirname)
      .source(templatePath)
      .destination(root)
      .metadata(config)
      .use(ignore(["**.meteor/local/*", "node_modules/*"]))
      .use(
        // Add the `.hbs` extension to any templating files that need
        // their placeholders to get filled with `metalsmith-in-place`
        rename([
          // `npx` renames `.gitignore` files to `.npmignore`
          // See https://github.com/algolia/create-instantsearch-app/issues/48
          [".gitignore.template", ".gitignore"],
          [/\.md$/, ".md.hbs"],
          [/\.json$/, ".json.hbs"],
          // For the web
          [/\.webmanifest$/, ".webmanifest.hbs"],
          [/\.html$/, ".html.hbs"],
          [/\.css$/, ".css.hbs"],
          [/\.js$/, ".js.hbs"],
          [/\.jsx$/, ".jsx.hbs"],
          [/\.ts$/, ".ts.hbs"],
          // Use `.babelrc.template` as name to not trigger babel
          // when requiring the file `.template.js` in end-to-end tests
          // and rename it `.babelrc` afterwards
          [".babelrc.template", ".babelrc"],
          [".eslintrc.js.hbs", ".eslintrc.js"]
        ])
      )
      .use(inPlace())
      .build(err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
  });
}

function installMeteor() {
  if (commandExistsSync("meteor")) {
    return;
  }
  if (isWin) {
    console.log(
      chalk.red(
        `Meteor is missing and is a required dependency.\n` +
          `To install Meteor on Windows, download the installer from:\n\n` +
          `  https://install.meteor.com/windows.\n\n`
      )
    );

    process.exit(1);
  }

  try {
    console.log(`Installing the ${chalk.cyan("Meteor")} dependency.`);
    console.log();

    execSync("curl https://install.meteor.com/ | sh", {
      stdio: "inherit"
    });
  } catch (e) {
    console.log(chalk.red(`\n\nMeteor failed to install!\n\n`));

    process.exit(1);
  }
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ["react", "react-dom", "react-scripts"].sort();
  if (dependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        `We cannot create a project called ${chalk.green(
          appName
        )} because a dependency with the same name exists.\n` +
          `Due to the way npm works, the following names are not allowed:\n\n`
      ) +
        chalk.cyan(dependencies.map(depName => `  ${depName}`).join("\n")) +
        chalk.red("\n\nPlease choose a different project name.")
    );
    process.exit(1);
  }
}

function makeCaretRange(dependencies, name) {
  const version = dependencies[name];

  if (typeof version === "undefined") {
    console.error(chalk.red(`Missing ${name} dependency in package.json`));
    process.exit(1);
  }

  let patchedVersion = `^${version}`;

  if (!semver.validRange(patchedVersion)) {
    console.error(
      `Unable to patch ${name} dependency version because version ${chalk.red(
        version
      )} will become invalid ${chalk.red(patchedVersion)}`
    );
    patchedVersion = version;
  }

  dependencies[name] = patchedVersion;
}

function setCaretRangeForRuntimeDeps(packageName) {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = require(packagePath);

  if (typeof packageJson.dependencies === "undefined") {
    console.error(chalk.red("Missing dependencies in package.json"));
    process.exit(1);
  }

  const packageVersion = packageJson.dependencies[packageName];
  if (typeof packageVersion === "undefined") {
    console.error(chalk.red(`Unable to find ${packageName} in package.json`));
    process.exit(1);
  }

  makeCaretRange(packageJson.dependencies, "react");
  makeCaretRange(packageJson.dependencies, "react-dom");

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + os.EOL);
}

// If project only contains files generated by GH, it’s safe.
// Also, if project contains remnant error logs from a previous
// installation, lets remove them now.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebook/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    ".DS_Store",
    "Thumbs.db",
    ".git",
    ".gitignore",
    ".idea",
    "README.md",
    "LICENSE",
    "web.iml",
    ".hg",
    ".hgignore",
    ".hgcheck",
    ".npmignore",
    "mkdocs.yml",
    "docs",
    ".travis.yml",
    ".gitlab-ci.yml",
    ".gitattributes"
  ];
  console.log();

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    // Don't treat log files from previous installation as conflicts
    .filter(
      file => !errorLogFilePatterns.some(pattern => file.indexOf(pattern) === 0)
    );

  if (conflicts.length > 0) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    for (const file of conflicts) {
      console.log(`  ${file}`);
    }
    console.log();
    console.log(
      "Either try using a new directory name, or remove the files listed above."
    );

    return false;
  }

  // Remove any remnant files from a previous installation
  const currentFiles = fs.readdirSync(path.join(root));
  currentFiles.forEach(file => {
    errorLogFilePatterns.forEach(errorLogFilePattern => {
      // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
      if (file.indexOf(errorLogFilePattern) === 0) {
        fs.removeSync(path.join(root, file));
      }
    });
  });
  return true;
}

function getProxy() {
  if (process.env.https_proxy) {
    return process.env.https_proxy;
  } else {
    try {
      // Trying to read https-proxy from .npmrc
      let httpsProxy = execSync("npm config get https-proxy")
        .toString()
        .trim();
      return httpsProxy !== "null" ? httpsProxy : undefined;
    } catch (e) {
      return;
    }
  }
}
function checkThatNpmCanReadCwd() {
  const cwd = process.cwd();
  let childOutput = null;
  try {
    // Note: intentionally using spawn over exec since
    // the problem doesn't reproduce otherwise.
    // `npm config list` is the only reliable way I could find
    // to reproduce the wrong path. Just printing process.cwd()
    // in a Node process was not enough.
    childOutput = spawn.sync("npm", ["config", "list"]).output.join("");
  } catch (err) {
    // Something went wrong spawning node.
    // Not great, but it means we can't do this check.
    // We might fail later on, but let's continue.
    return true;
  }
  if (typeof childOutput !== "string") {
    return true;
  }
  const lines = childOutput.split("\n");
  // `npm config list` output includes the following line:
  // "; cwd = C:\path\to\current\dir" (unquoted)
  // I couldn't find an easier way to get it.
  const prefix = "; cwd = ";
  const line = lines.find(line => line.indexOf(prefix) === 0);
  if (typeof line !== "string") {
    // Fail gracefully. They could remove it.
    return true;
  }
  const npmCWD = line.substring(prefix.length);
  if (npmCWD === cwd) {
    return true;
  }
  console.error(
    chalk.red(
      `Could not start an npm process in the right directory.\n\n` +
        `The current directory is: ${chalk.bold(cwd)}\n` +
        `However, a newly started npm process runs in: ${chalk.bold(
          npmCWD
        )}\n\n` +
        `This is probably caused by a misconfigured system terminal shell.`
    )
  );
  if (isWin) {
    console.error(
      chalk.red(`On Windows, this can usually be fixed by running:\n\n`) +
        `  ${chalk.cyan(
          "reg"
        )} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
        `  ${chalk.cyan(
          "reg"
        )} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
        chalk.red(`Try to run the above two lines in the terminal.\n`) +
        chalk.red(
          `To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`
        )
    );
  }
  return false;
}

function checkIfOnline(useYarn) {
  if (!useYarn) {
    // Don't ping the Yarn registry.
    // We'll just assume the best case.
    return Promise.resolve(true);
  }

  return new Promise(resolve => {
    dns.lookup("registry.yarnpkg.com", err => {
      let proxy;
      if (err != null && (proxy = getProxy())) {
        // If a proxy is defined, we likely can't resolve external hostnames.
        // Try to resolve the proxy name as an indication of a connection.
        dns.lookup(url.parse(proxy).hostname, proxyErr => {
          resolve(proxyErr == null);
        });
      } else {
        resolve(err == null);
      }
    });
  });
}
