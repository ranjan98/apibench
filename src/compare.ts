import chalk from 'chalk';
import Table from 'cli-table3';
import { BenchmarkResults } from './benchmark';

export function compareResults(before: BenchmarkResults, after: BenchmarkResults): void {
  console.log(chalk.gray(`Baseline: ${before.timestamp}`));
  console.log(chalk.gray(`Optimized: ${after.timestamp}\n`));

  console.log(chalk.bold.white('=== Requests Comparison ===\n'));

  const requestsTable = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Before'), chalk.cyan('After'), chalk.cyan('Change')],
    colWidths: [20, 20, 20, 25],
  });

  requestsTable.push(
    [
      'Total Requests',
      before.requests.total.toLocaleString(),
      after.requests.total.toLocaleString(),
      formatChange(before.requests.total, after.requests.total),
    ],
    [
      'Requests/sec',
      before.requests.mean.toFixed(2),
      after.requests.mean.toFixed(2),
      formatChange(before.requests.mean, after.requests.mean),
    ],
  );

  console.log(requestsTable.toString());

  console.log(chalk.bold.white('\n=== Latency Comparison (ms) ===\n'));

  const latencyTable = new Table({
    head: [chalk.cyan('Percentile'), chalk.cyan('Before'), chalk.cyan('After'), chalk.cyan('Change')],
    colWidths: [20, 20, 20, 25],
  });

  latencyTable.push(
    [
      'Mean',
      before.latency.mean.toFixed(2),
      after.latency.mean.toFixed(2),
      formatChange(before.latency.mean, after.latency.mean, true),
    ],
    [
      'P50 (Median)',
      before.latency.p50.toFixed(2),
      after.latency.p50.toFixed(2),
      formatChange(before.latency.p50, after.latency.p50, true),
    ],
    [
      'P95',
      before.latency.p95.toFixed(2),
      after.latency.p95.toFixed(2),
      formatChange(before.latency.p95, after.latency.p95, true),
    ],
    [
      'P99',
      before.latency.p99.toFixed(2),
      after.latency.p99.toFixed(2),
      formatChange(before.latency.p99, after.latency.p99, true),
    ],
  );

  console.log(latencyTable.toString());

  console.log(chalk.bold.white('\n=== Throughput Comparison ===\n'));

  const throughputTable = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Before'), chalk.cyan('After'), chalk.cyan('Change')],
    colWidths: [20, 20, 20, 25],
  });

  throughputTable.push([
    'Mean (bytes/sec)',
    formatBytes(before.throughput.mean),
    formatBytes(after.throughput.mean),
    formatChange(before.throughput.mean, after.throughput.mean),
  ]);

  console.log(throughputTable.toString());

  if (before.errors > 0 || after.errors > 0 || before.timeouts > 0 || after.timeouts > 0) {
    console.log(chalk.bold.white('\n=== Errors Comparison ===\n'));

    const errorsTable = new Table({
      head: [chalk.cyan('Type'), chalk.cyan('Before'), chalk.cyan('After'), chalk.cyan('Change')],
      colWidths: [20, 20, 20, 25],
    });

    errorsTable.push(
      ['Errors', before.errors.toString(), after.errors.toString(), formatChange(before.errors, after.errors, true)],
      [
        'Timeouts',
        before.timeouts.toString(),
        after.timeouts.toString(),
        formatChange(before.timeouts, after.timeouts, true),
      ],
    );

    console.log(errorsTable.toString());
  }

  console.log(chalk.bold.white('\n=== Overall Assessment ===\n'));
  printComparison(before, after);
}

function formatChange(before: number, after: number, lowerIsBetter: boolean = false): string {
  const change = after - before;
  const percentChange = ((after - before) / before) * 100;

  if (change === 0) {
    return chalk.gray('No change');
  }

  const isImprovement = lowerIsBetter ? change < 0 : change > 0;
  const color = isImprovement ? chalk.green : chalk.red;
  const arrow = change > 0 ? '↑' : '↓';

  return color(`${arrow} ${Math.abs(percentChange).toFixed(2)}%`);
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB/s`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB/s`;
}

function printComparison(before: BenchmarkResults, after: BenchmarkResults): void {
  const improvements: string[] = [];
  const regressions: string[] = [];

  // Requests per second
  const reqChange = ((after.requests.mean - before.requests.mean) / before.requests.mean) * 100;
  if (reqChange > 5) {
    improvements.push(`Throughput improved by ${reqChange.toFixed(1)}%`);
  } else if (reqChange < -5) {
    regressions.push(`Throughput decreased by ${Math.abs(reqChange).toFixed(1)}%`);
  }

  // P95 latency
  const p95Change = ((after.latency.p95 - before.latency.p95) / before.latency.p95) * 100;
  if (p95Change < -5) {
    improvements.push(`P95 latency improved by ${Math.abs(p95Change).toFixed(1)}%`);
  } else if (p95Change > 5) {
    regressions.push(`P95 latency increased by ${p95Change.toFixed(1)}%`);
  }

  // P99 latency
  const p99Change = ((after.latency.p99 - before.latency.p99) / before.latency.p99) * 100;
  if (p99Change < -5) {
    improvements.push(`P99 latency improved by ${Math.abs(p99Change).toFixed(1)}%`);
  } else if (p99Change > 5) {
    regressions.push(`P99 latency increased by ${p99Change.toFixed(1)}%`);
  }

  // Mean latency
  const meanChange = ((after.latency.mean - before.latency.mean) / before.latency.mean) * 100;
  if (meanChange < -5) {
    improvements.push(`Mean latency improved by ${Math.abs(meanChange).toFixed(1)}%`);
  } else if (meanChange > 5) {
    regressions.push(`Mean latency increased by ${meanChange.toFixed(1)}%`);
  }

  // Errors
  if (after.errors < before.errors) {
    improvements.push(`Errors reduced from ${before.errors} to ${after.errors}`);
  } else if (after.errors > before.errors) {
    regressions.push(`Errors increased from ${before.errors} to ${after.errors}`);
  }

  if (improvements.length > 0) {
    console.log(chalk.green.bold('Improvements:'));
    improvements.forEach(improvement => console.log(chalk.green(`  ✓ ${improvement}`)));
    console.log();
  }

  if (regressions.length > 0) {
    console.log(chalk.red.bold('Regressions:'));
    regressions.forEach(regression => console.log(chalk.red(`  ✗ ${regression}`)));
    console.log();
  }

  if (improvements.length === 0 && regressions.length === 0) {
    console.log(chalk.gray('No significant changes detected (< 5% threshold)'));
    console.log();
  }

  // Overall verdict
  if (improvements.length > regressions.length) {
    console.log(chalk.green.bold('Overall: Performance Improved'));
  } else if (regressions.length > improvements.length) {
    console.log(chalk.red.bold('Overall: Performance Regressed'));
  } else {
    console.log(chalk.yellow.bold('Overall: Mixed Results'));
  }
  console.log();
}
