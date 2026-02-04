#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { runBenchmark, BenchmarkOptions } from './benchmark';
import { generateReport } from './reporter';
import { compareResults } from './compare';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('apibench')
  .description('Performance benchmarking tool for REST APIs')
  .version('1.0.0');

program
  .command('run')
  .description('Run a performance benchmark on an API endpoint')
  .requiredOption('-u, --url <url>', 'API endpoint URL to benchmark')
  .option('-m, --method <method>', 'HTTP method (GET, POST, PUT, DELETE)', 'GET')
  .option('-d, --duration <seconds>', 'Duration of the benchmark in seconds', '10')
  .option('-c, --connections <count>', 'Number of concurrent connections', '10')
  .option('-p, --pipelining <count>', 'Number of pipelined requests', '1')
  .option('-b, --body <json>', 'Request body as JSON string')
  .option('-H, --header <header>', 'Add header (format: "Key: Value")', collectHeaders, [])
  .option('-o, --output <file>', 'Save results to JSON file')
  .option('--content-type <type>', 'Content-Type header', 'application/json')
  .action(async (options) => {
    try {
      const benchmarkOptions: BenchmarkOptions = {
        url: options.url,
        method: options.method.toUpperCase(),
        duration: parseInt(options.duration),
        connections: parseInt(options.connections),
        pipelining: parseInt(options.pipelining),
        contentType: options.contentType,
        headers: parseHeaders(options.header),
      };

      if (options.body) {
        try {
          benchmarkOptions.body = JSON.parse(options.body);
        } catch (e) {
          console.error(chalk.red('Error: Invalid JSON in --body parameter'));
          process.exit(1);
        }
      }

      console.log(chalk.cyan.bold('\n🚀 APIBench - Starting Performance Test\n'));
      console.log(chalk.gray(`Target: ${options.url}`));
      console.log(chalk.gray(`Method: ${options.method.toUpperCase()}`));
      console.log(chalk.gray(`Duration: ${options.duration}s`));
      console.log(chalk.gray(`Connections: ${options.connections}\n`));

      const results = await runBenchmark(benchmarkOptions);

      generateReport(results);

      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(chalk.green(`\n✓ Results saved to ${outputPath}`));
      }
    } catch (error: any) {
      console.error(chalk.red(`\n✗ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('compare')
  .description('Compare two benchmark results')
  .requiredOption('-b, --before <file>', 'Path to baseline results JSON file')
  .requiredOption('-a, --after <file>', 'Path to optimized results JSON file')
  .action((options) => {
    try {
      const beforePath = path.resolve(options.before);
      const afterPath = path.resolve(options.after);

      if (!fs.existsSync(beforePath)) {
        console.error(chalk.red(`Error: File not found: ${beforePath}`));
        process.exit(1);
      }

      if (!fs.existsSync(afterPath)) {
        console.error(chalk.red(`Error: File not found: ${afterPath}`));
        process.exit(1);
      }

      const beforeResults = JSON.parse(fs.readFileSync(beforePath, 'utf-8'));
      const afterResults = JSON.parse(fs.readFileSync(afterPath, 'utf-8'));

      console.log(chalk.cyan.bold('\n📊 APIBench - Comparison Report\n'));
      compareResults(beforeResults, afterResults);
    } catch (error: any) {
      console.error(chalk.red(`\n✗ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate a report from saved benchmark results')
  .requiredOption('-f, --file <file>', 'Path to results JSON file')
  .action((options) => {
    try {
      const filePath = path.resolve(options.file);

      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found: ${filePath}`));
        process.exit(1);
      }

      const results = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(chalk.cyan.bold('\n📊 APIBench - Benchmark Report\n'));
      generateReport(results);
    } catch (error: any) {
      console.error(chalk.red(`\n✗ Error: ${error.message}`));
      process.exit(1);
    }
  });

function collectHeaders(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

function parseHeaders(headerArray: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const header of headerArray) {
    const separatorIndex = header.indexOf(':');
    if (separatorIndex === -1) {
      console.error(chalk.red(`Error: Invalid header format: ${header}`));
      console.error(chalk.gray('Expected format: "Key: Value"'));
      process.exit(1);
    }
    const key = header.substring(0, separatorIndex).trim();
    const value = header.substring(separatorIndex + 1).trim();
    headers[key] = value;
  }
  return headers;
}

program.parse();
