import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Remote Goldstack repository used when no local checkout is supplied.
 */
const GOLDSTACK_REPO_URL = 'https://github.com/goldstack/goldstack.git';

/**
 * Branch of the Goldstack repository to synchronise from.
 */
const GOLDSTACK_REF = 'master';

/**
 * Cache directory for the sparse Goldstack checkout. It is inside `.agent-tmp`,
 * which is gitignored, so the checkout can never be committed by accident.
 */
const SOURCE_CACHE_DIR = path.join('.agent-tmp', 'goldstack-source');

/**
 * Maximum number of differing files printed per section of the report.
 */
const REPORT_FILE_LIMIT = 40;

/**
 * Generated directories that are never template-managed and can be large.
 */
const SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.agent-tmp',
  '.terraform',
  '.next',
  '.yarn',
  'dist',
  'coverage',
  'goldstackLocal',
]);

/**
 * Where the Goldstack source files come from.
 */
interface SourceLocation {
  /** Absolute path to the root of a Goldstack checkout. */
  directory: string;
  /** True when the project itself is the Goldstack source repository. */
  isCurrentRepository: boolean;
}

/**
 * How a single file differs between the project and upstream Goldstack.
 */
interface FileDifference {
  /** Path of the file relative to the compared directory. */
  filePath: string;
  /** Direction of the difference. */
  status: 'upstream-only' | 'changed' | 'project-only';
}

/**
 * Comparison result for one package and the Goldstack template it derives from.
 */
interface TemplateComparison {
  /** Package directory relative to the project root. */
  packagePath: string;
  /** Template name recorded in the package's goldstack.json. */
  template: string;
  /** Template version recorded in the package's goldstack.json. */
  templateVersion?: string;
  /** Path to the template's build.json relative to the Goldstack checkout. */
  buildConfigPath?: string;
  /** Differences in files that build.json marks as template-managed. */
  differences: FileDifference[];
  /** False when the template could not be found in the Goldstack checkout. */
  found: boolean;
}

/**
 * Template build configuration read from a template's build.json.
 */
interface TemplateBuildConfiguration {
  /** Glob patterns copied from the template into the generated package. */
  include: string[];
  /** Glob patterns removed after copying. */
  exclude?: string[];
  /** Files whose fields are overwritten for the generated package. */
  overwriteFiles?: {
    /** File whose fields are overwritten. */
    file: string;
    /** Fields that are intentionally owned by the generated package. */
    fields: { path: string; value: unknown }[];
  }[];
}

/**
 * Package configuration read from a generated package's goldstack.json.
 */
interface PackageConfiguration {
  /** Template the package was generated from. */
  template?: string;
  /** Version of the template that was last applied. */
  templateVersion?: string;
}

/**
 * Print an informational line.
 *
 * @param message message to print
 */
function info(message: string): void {
  console.log(message);
}

/**
 * Print a warning line.
 *
 * @param message message to print
 */
function warn(message: string): void {
  console.warn(`\n⚠ ${message}\n`);
}

/**
 * Run a command and throw when it exits with a non-zero status.
 *
 * @param command executable to run
 * @param args arguments passed to the executable
 * @param cwd optional working directory
 */
function run(command: string, args: string[], cwd?: string): void {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
  }
}

/**
 * Check whether a directory is a Goldstack source checkout.
 *
 * @param directory directory to inspect
 * @returns true when the directory contains the Goldstack templates and instructions
 */
function isGoldstackSource(directory: string): boolean {
  return (
    fs.existsSync(path.join(directory, 'instructions', 'goldstack')) &&
    fs.existsSync(path.join(directory, 'workspaces', 'templates', 'packages'))
  );
}

/**
 * Fetch or update the sparse Goldstack checkout in `.agent-tmp`.
 *
 * @returns absolute path to the checkout, or undefined when it cannot be fetched
 */
function fetchCachedSource(): string | undefined {
  const cachePath = path.resolve(SOURCE_CACHE_DIR);
  const ref = process.env.GOLDSTACK_REF || GOLDSTACK_REF;

  try {
    if (fs.existsSync(path.join(cachePath, '.git'))) {
      info(`Updating cached Goldstack checkout in ${SOURCE_CACHE_DIR}...`);
      run('git', ['fetch', '--depth', '1', 'origin', ref], cachePath);
      run('git', ['reset', '--hard', `origin/${ref}`], cachePath);
      run(
        'git',
        ['sparse-checkout', 'set', 'instructions/goldstack', 'workspaces/templates'],
        cachePath,
      );
      return cachePath;
    }

    info(`Fetching Goldstack source into ${SOURCE_CACHE_DIR}...`);
    fs.rmSync(cachePath, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    run('git', [
      'clone',
      '--depth',
      '1',
      '--filter=blob:none',
      '--sparse',
      '--branch',
      ref,
      GOLDSTACK_REPO_URL,
      cachePath,
    ]);
    run(
      'git',
      ['sparse-checkout', 'set', 'instructions/goldstack', 'workspaces/templates'],
      cachePath,
    );
    return cachePath;
  } catch (error) {
    warn(
      'Could not fetch the Goldstack source. Existing instructions were left unchanged.\n' +
        `  Set GOLDSTACK_SOURCE_DIR to a local checkout to work offline.\n` +
        `  ${error instanceof Error ? error.message : String(error)}`,
    );
    return undefined;
  }
}

/**
 * Resolve the Goldstack source directory from arguments, environment or a
 * sparse checkout.
 *
 * @param useLocal true when `--local` was passed, which uses `../goldstack`
 * @returns the resolved source location, or undefined when none is available
 */
function resolveSource(useLocal: boolean): SourceLocation | undefined {
  if (isGoldstackSource(process.cwd())) {
    return { directory: process.cwd(), isCurrentRepository: true };
  }

  const explicit = useLocal ? path.resolve('..', 'goldstack') : process.env.GOLDSTACK_SOURCE_DIR;
  if (explicit) {
    if (!isGoldstackSource(explicit)) {
      warn(
        `The Goldstack source directory "${explicit}" does not contain instructions/goldstack ` +
          'and workspaces/templates.',
      );
      return undefined;
    }
    return { directory: path.resolve(explicit), isCurrentRepository: false };
  }

  const cached = fetchCachedSource();
  if (!cached) {
    return undefined;
  }
  return { directory: cached, isCurrentRepository: false };
}

/**
 * Copy the shared instructions from the Goldstack checkout into the project.
 *
 * @param source resolved Goldstack source
 * @returns true when instructions were replaced
 */
function syncInstructions(source: SourceLocation): boolean {
  const sourceDirectory = path.join(source.directory, 'instructions', 'goldstack');
  const targetDirectory = path.resolve('instructions', 'goldstack');

  if (!fs.existsSync(sourceDirectory)) {
    warn(`Cannot find shared instructions in ${sourceDirectory}.`);
    return false;
  }

  fs.rmSync(targetDirectory, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(targetDirectory), { recursive: true });
  fs.cpSync(sourceDirectory, targetDirectory, { recursive: true });
  info(`Synced instructions/goldstack from ${source.directory}.`);
  return true;
}

/**
 * Re-inline the instruction files into AGENTS.md.
 */
function runMarkdownMagic(): void {
  if (!fs.existsSync('AGENTS.md')) {
    return;
  }
  info('Running markdown-magic...');
  const result = spawnSync('md-magic', ['--file', 'AGENTS.md'], {
    stdio: 'inherit',
  });
  if (result.error || result.status !== 0) {
    warn('markdown-magic failed. Run `yarn sync-instructions` again after fixing the error.');
  }
}

/**
 * List every file below a directory, relative to that directory.
 *
 * @param root directory to walk
 * @returns sorted relative file paths
 */
function listFiles(root: string): string[] {
  const files: string[] = [];

  function walk(directory: string, prefix: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (SKIPPED_DIRECTORIES.has(entry.name)) {
          continue;
        }
        walk(path.join(directory, entry.name), relative);
      } else if (entry.isFile()) {
        files.push(relative);
      }
    }
  }

  walk(root, '');
  return files.sort();
}

/**
 * Escape a string so it can be embedded in a regular expression.
 *
 * @param value value to escape
 * @returns escaped value
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Match a build.json glob against a relative path.
 *
 * This deliberately supports only the simple patterns used in Goldstack
 * build.json files: exact files, directory prefixes and single `*` globs.
 *
 * @param pattern glob from build.json
 * @param relativePath path to test, relative to the package directory
 * @returns true when the path matches
 */
function matchesPattern(pattern: string, relativePath: string): boolean {
  const normalized = pattern.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (normalized.includes('*')) {
    const expression = new RegExp(
      `^${normalized
        .split('*')
        .map((part) => escapeRegExp(part))
        .join('.*')}$`,
    );
    return expression.test(relativePath);
  }
  return relativePath === normalized || relativePath.startsWith(`${normalized}/`);
}

/**
 * Determine whether build.json copies a file into the generated package.
 *
 * @param configuration build configuration of the template
 * @param relativePath path relative to the package directory
 * @returns true when the file is template-managed
 */
function isManaged(configuration: TemplateBuildConfiguration, relativePath: string): boolean {
  const included = configuration.include.some((pattern) => matchesPattern(pattern, relativePath));
  if (!included) {
    return false;
  }
  return !(configuration.exclude ?? []).some((pattern) => matchesPattern(pattern, relativePath));
}

/**
 * Compare two files byte for byte.
 *
 * @param projectFile file in the project
 * @param upstreamFile file in the Goldstack checkout
 * @returns true when both files have identical contents
 */
function filesAreEqual(projectFile: string, upstreamFile: string): boolean {
  return fs.readFileSync(projectFile).equals(fs.readFileSync(upstreamFile));
}

/**
 * Compare all template-managed files of a generated package with its template.
 *
 * @param packageDirectory absolute path to the package in the project
 * @param templateDirectory absolute path to the template in the Goldstack checkout
 * @param configuration build configuration of the template
 * @returns differences in template-managed files
 */
function compareManagedFiles(
  packageDirectory: string,
  templateDirectory: string,
  configuration: TemplateBuildConfiguration,
): FileDifference[] {
  const differences: FileDifference[] = [];
  const upstreamFiles = listFiles(templateDirectory).filter((file) =>
    isManaged(configuration, file),
  );
  const projectFiles = listFiles(packageDirectory).filter((file) => isManaged(configuration, file));
  const projectFileSet = new Set(projectFiles);
  const upstreamFileSet = new Set(upstreamFiles);

  for (const file of upstreamFiles) {
    if (!projectFileSet.has(file)) {
      differences.push({ filePath: file, status: 'upstream-only' });
      continue;
    }
    const projectFile = path.join(packageDirectory, file);
    const upstreamFile = path.join(templateDirectory, file);
    if (!filesAreEqual(projectFile, upstreamFile)) {
      differences.push({ filePath: file, status: 'changed' });
    }
  }

  for (const file of projectFiles) {
    if (!upstreamFileSet.has(file)) {
      differences.push({ filePath: file, status: 'project-only' });
    }
  }

  return differences;
}

/**
 * Read a JSON file, returning undefined when it is missing or malformed.
 *
 * @param filePath path to the JSON file
 * @returns parsed JSON or undefined
 */
function readJson<T>(filePath: string): T | undefined {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return undefined;
  }
}

/**
 * Build the report line for a list of differences.
 *
 * @param label section label
 * @param differences differences to print
 * @returns report lines
 */
function formatDifferences(label: string, differences: FileDifference[]): string[] {
  const lines: string[] = [];
  if (differences.length === 0) {
    lines.push(`- ${label}: no differences in template-managed files.`);
    return lines;
  }
  const counts = {
    'upstream-only': 0,
    changed: 0,
    'project-only': 0,
  };
  for (const difference of differences) {
    counts[difference.status] += 1;
  }
  lines.push(
    `- ${label}: ${differences.length} difference(s) ` +
      `(${counts['upstream-only']} upstream-only, ${counts.changed} changed, ${counts['project-only']} project-only).`,
  );
  for (const difference of differences.slice(0, REPORT_FILE_LIMIT)) {
    lines.push(`  - ${difference.status.padEnd(14)} ${difference.filePath}`);
  }
  if (differences.length > REPORT_FILE_LIMIT) {
    lines.push(`  - ... and ${differences.length - REPORT_FILE_LIMIT} more.`);
  }
  return lines;
}

/**
 * Compare the project's Terraform and template files with the Goldstack source.
 *
 * @param source resolved Goldstack source
 * @returns report lines
 */
function buildReport(source: SourceLocation): string[] {
  const lines: string[] = [];
  const projectDirectory = process.cwd();

  lines.push('# Goldstack Sync Report');
  lines.push('');
  lines.push(`Source: ${source.directory}`);
  lines.push('');

  const rootInfraDirectory = path.join(projectDirectory, 'config', 'infra', 'aws');
  const upstreamRootInfraDirectory = path.join(
    source.directory,
    'workspaces',
    'templates',
    'config',
    'infra',
    'aws',
  );
  if (fs.existsSync(rootInfraDirectory) && fs.existsSync(upstreamRootInfraDirectory)) {
    const differences = compareManagedFiles(rootInfraDirectory, upstreamRootInfraDirectory, {
      include: ['*'],
    });
    lines.push('## Project root Terraform (config/infra/aws)');
    lines.push(...formatDifferences('config/infra/aws', differences));
    lines.push('');
  }

  const packagesDirectory = path.join(projectDirectory, 'packages');
  const comparisons: TemplateComparison[] = [];
  if (fs.existsSync(packagesDirectory)) {
    for (const entry of fs.readdirSync(packagesDirectory, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const packagePath = path.join('packages', entry.name);
      const packageDirectory = path.join(packagesDirectory, entry.name);
      const packageConfiguration = readJson<PackageConfiguration>(
        path.join(packageDirectory, 'goldstack.json'),
      );
      if (!packageConfiguration?.template) {
        continue;
      }
      const templateDirectory = path.join(
        source.directory,
        'workspaces',
        'templates',
        'packages',
        packageConfiguration.template,
      );
      const buildConfigPath = path.join(templateDirectory, 'build.json');
      const buildConfiguration = readJson<TemplateBuildConfiguration>(buildConfigPath);
      if (!buildConfiguration) {
        comparisons.push({
          packagePath,
          template: packageConfiguration.template,
          templateVersion: packageConfiguration.templateVersion,
          found: false,
          differences: [],
        });
        continue;
      }
      comparisons.push({
        packagePath,
        template: packageConfiguration.template,
        templateVersion: packageConfiguration.templateVersion,
        buildConfigPath: path.join(
          'workspaces',
          'templates',
          'packages',
          packageConfiguration.template,
          'build.json',
        ),
        found: true,
        differences: compareManagedFiles(packageDirectory, templateDirectory, buildConfiguration),
      });
    }
  }

  lines.push('## Template packages');
  if (comparisons.length === 0) {
    lines.push('- No packages with a goldstack.json template reference were found.');
  }
  for (const comparison of comparisons) {
    lines.push('');
    const version = comparison.templateVersion
      ? ` (template version ${comparison.templateVersion})`
      : '';
    lines.push(`### ${comparison.packagePath} → ${comparison.template}${version}`);
    if (!comparison.found) {
      lines.push(`- Template not found in the Goldstack checkout.`);
      continue;
    }
    if (comparison.buildConfigPath) {
      lines.push(`- Managed by \`${comparison.buildConfigPath}\`.`);
    }
    lines.push(...formatDifferences(comparison.packagePath, comparison.differences));
  }
  lines.push('');
  lines.push('Use `diff -u <project file> <upstream file>` for details.');
  lines.push(
    'This report is a comparison, not a copy list. In a mature project most differences are deliberate project customisations, so a no-op is a valid outcome.',
  );
  lines.push(
    '`upstream-only` is a candidate addition, `changed` needs a diff review before applying anything, and `project-only` is a likely customisation that must never be deleted.',
  );

  return lines;
}

/**
 * Compare the project with Goldstack and print/write the report.
 *
 * @param source resolved Goldstack source
 */
function reportProjectFiles(source: SourceLocation): void {
  if (source.isCurrentRepository) {
    info('Running inside the Goldstack source repository; nothing to compare.');
    return;
  }

  const lines = buildReport(source);
  const report = `${lines.join('\n')}\n`;
  console.log(report);

  const reportPath = path.resolve('.agent-tmp', 'goldstack-sync-report.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);
  info(`Report written to ${path.relative(process.cwd(), reportPath)}.`);
}

/**
 * Comparison of the project's Goldstack instructions with the upstream source.
 */
interface InstructionsComparison {
  /** False when the project does not contain an instructions/goldstack directory. */
  targetExists: boolean;
  /** Differences in instruction files. */
  differences: FileDifference[];
}

/**
 * Compare the project's shared instructions with the Goldstack source.
 *
 * @param source resolved Goldstack source
 * @returns comparison result, or undefined when the source has no instructions
 */
function compareInstructions(source: SourceLocation): InstructionsComparison | undefined {
  const sourceDirectory = path.join(source.directory, 'instructions', 'goldstack');
  const targetDirectory = path.resolve('instructions', 'goldstack');

  if (!fs.existsSync(sourceDirectory)) {
    warn(`Cannot find shared instructions in ${sourceDirectory}.`);
    return undefined;
  }
  if (!fs.existsSync(targetDirectory)) {
    return { targetExists: false, differences: [] };
  }
  return {
    targetExists: true,
    differences: compareManagedFiles(targetDirectory, sourceDirectory, { include: ['*'] }),
  };
}

/**
 * Print whether the project's shared instructions match the Goldstack source.
 *
 * This is read-only: it never writes instructions or the report file.
 *
 * @param source resolved Goldstack source
 */
function checkInstructions(source: SourceLocation): void {
  const comparison = compareInstructions(source);
  if (!comparison) {
    process.exitCode = 1;
    return;
  }

  if (!comparison.targetExists) {
    info('instructions/goldstack does not exist in this project.');
    process.exitCode = 1;
    return;
  }

  if (comparison.differences.length === 0) {
    info('instructions/goldstack is up to date with the Goldstack source.');
    return;
  }

  info(
    `instructions/goldstack differs from ${path.join(source.directory, 'instructions', 'goldstack')}:`,
  );
  for (const difference of comparison.differences.slice(0, REPORT_FILE_LIMIT)) {
    info(`  - ${difference.status.padEnd(14)} ${difference.filePath}`);
  }
  if (comparison.differences.length > REPORT_FILE_LIMIT) {
    info(`  - ... and ${comparison.differences.length - REPORT_FILE_LIMIT} more.`);
  }
  info('Run `yarn sync-goldstack` to update the instructions.');
  process.exitCode = 1;
}

/**
 * Make sure `.agent-tmp` is ignored in older derived projects whose .gitignore
 * predates the directory. The entry is written to the local exclude file, so it
 * is never committed itself and cannot conflict with the project's .gitignore.
 */
function ensureAgentTmpIgnored(): void {
  const result = spawnSync('git', ['rev-parse', '--git-path', 'info/exclude'], {
    encoding: 'utf8',
  });
  if (result.status !== 0 || !result.stdout.trim()) {
    return;
  }

  const excludeFile = path.resolve(result.stdout.trim());
  const entry = '.agent-tmp/';
  try {
    const existing = fs.existsSync(excludeFile) ? fs.readFileSync(excludeFile, 'utf8') : '';
    if (existing.split(/\r?\n/).includes(entry)) {
      return;
    }
    fs.mkdirSync(path.dirname(excludeFile), { recursive: true });
    fs.appendFileSync(excludeFile, `${existing && !existing.endsWith('\n') ? '\n' : ''}${entry}\n`);
  } catch (error) {
    warn(
      'Could not add .agent-tmp/ to the local git exclude file. Check that it is gitignored ' +
        `before committing.\n  ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Run the instruction sync and, optionally, the template/infra comparison.
 *
 * Pass `--check` (or `--status`) to only print whether the project is in sync.
 * Check mode never writes instructions, the report or markdown-magic output.
 */
function main(): void {
  const check = process.argv.includes('--check') || process.argv.includes('--status');
  const report = process.argv.includes('--report');
  const useLocal = process.argv.includes('--local');

  if (check) {
    const source = resolveSource(useLocal);
    if (!source) {
      process.exitCode = 1;
      return;
    }

    if (source.isCurrentRepository) {
      info(
        'Running inside the Goldstack source repository; instructions are already the source of truth.',
      );
      return;
    }

    checkInstructions(source);

    if (report) {
      console.log(`${buildReport(source).join('\n')}\n`);
    }
    return;
  }

  ensureAgentTmpIgnored();

  const source = resolveSource(useLocal);
  if (!source) {
    process.exitCode = 1;
    return;
  }

  if (source.isCurrentRepository) {
    info(
      'Running inside the Goldstack source repository; instructions are already the source of truth.',
    );
    runMarkdownMagic();
    return;
  }

  if (!syncInstructions(source)) {
    process.exitCode = 1;
    return;
  }
  runMarkdownMagic();

  if (report) {
    reportProjectFiles(source);
  }
}

main();
