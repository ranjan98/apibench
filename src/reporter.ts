import chalk from 'chalk';
import Table from 'cli-table3';
import { BenchmarkResults } from './benchmark';

export function generateReport(results: BenchmarkResults): void {
  console.log(chalk.bold.white('\n=== Request Statistics ===\n'));

  const requestsTable = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Value')],
    colWidths: [20, 30],
  });

  requestsTable.push(
    ['Total Requests', chalk.green(results.requests.total.toLocaleString())],
    ['Requests/sec', chalk.green(`${results.requests.mean.toFixed(2)} (avg)`)],
    ['Min/Max', `${results.requests.min} / ${results.requests.max}`],
    ['Std Deviation', results.requests.stddev.toFixed(2)],
  );

  console.log(requestsTable.toString());

  console.log(chalk.bold.white('\n=== Latency (ms) ===\n'));

  const latencyTable = new Table({
    head: [chalk.cyan('Percentile'), chalk.cyan('Latency (ms)')],
    colWidths: [20, 30],
  });

  latencyTable.push(
    ['Mean', formatLatency(results.latency.mean)],
    ['P50 (Median)', formatLatency(results.latency.p50)],
    ['P75', formatLatency(results.latency.p75)],
    ['P90', formatLatency(results.latency.p90)],
    ['P97.5', formatLatency(results.latency.p97_5)],
    ['P99', formatLatency(results.latency.p99)],
    ['P99.9', formatLatency(results.latency.p999)],
    ['Min/Max', `${results.latency.min} / ${results.latency.max}`],
  );

  console.log(latencyTable.toString());

  console.log(chalk.bold.white('\n=== Throughput ===\n'));

  const throughputTable = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Value')],
    colWidths: [20, 30],
  });

  throughputTable.push(
    ['Mean (bytes/sec)', chalk.green(formatBytes(results.throughput.mean))],
    ['Std Deviation', formatBytes(results.throughput.stddev)],
    ['Min/Max', `${formatBytes(results.throughput.min)} / ${formatBytes(results.throughput.max)}`],
  );

  console.log(throughputTable.toString());

  if (results.errors > 0 || results.timeouts > 0 || results.non2xx > 0) {
    console.log(chalk.bold.white('\n=== Errors ===\n'));

    const errorsTable = new Table({
      head: [chalk.cyan('Type'), chalk.cyan('Count')],
      colWidths: [20, 30],
    });

    if (results.errors > 0) {
      errorsTable.push(['Errors', chalk.red(results.errors.toString())]);
    }
    if (results.timeouts > 0) {
      errorsTable.push(['Timeouts', chalk.red(results.timeouts.toString())]);
    }
    if (results.non2xx > 0) {
      errorsTable.push(['Non-2xx Responses', chalk.yellow(results.non2xx.toString())]);
    }

    console.log(errorsTable.toString());
  }

  if (Object.keys(results.statusCodeStats).length > 0) {
    console.log(chalk.bold.white('\n=== Status Codes ===\n'));

    const statusTable = new Table({
      head: [chalk.cyan('Status Code'), chalk.cyan('Count')],
      colWidths: [20, 30],
    });

    Object.entries(results.statusCodeStats).forEach(([code, stats]) => {
      const color = code.startsWith('2') ? chalk.green : code.startsWith('4') || code.startsWith('5') ? chalk.red : chalk.yellow;
      statusTable.push([code, color(stats.count.toString())]);
    });

    console.log(statusTable.toString());
  }

  console.log(chalk.bold.white('\n=== Performance Assessment ===\n'));
  printAssessment(results);
}

function formatLatency(latency: number): string {
  if (latency < 50) {
    return chalk.green(`${latency.toFixed(2)} ms`);
  } else if (latency < 200) {
    return chalk.yellow(`${latency.toFixed(2)} ms`);
  } else {
    return chalk.red(`${latency.toFixed(2)} ms`);
  }
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB/s`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB/s`;
}

function printAssessment(results: BenchmarkResults): void {
  const assessments: string[] = [];

  // Latency assessment
  if (results.latency.p97_5 < 100) {
    assessments.push(chalk.green('✓ Excellent latency (P97.5 < 100ms)'));
  } else if (results.latency.p97_5 < 300) {
    assessments.push(chalk.yellow('◆ Acceptable latency (P97.5 < 300ms)'));
  } else {
    assessments.push(chalk.red('✗ High latency (P97.5 > 300ms) - optimization recommended'));
  }

  // Throughput assessment
  const reqPerSec = results.requests.mean;
  if (reqPerSec > 1000) {
    assessments.push(chalk.green(`✓ High throughput (${reqPerSec.toFixed(0)} req/s)`));
  } else if (reqPerSec > 100) {
    assessments.push(chalk.yellow(`◆ Moderate throughput (${reqPerSec.toFixed(0)} req/s)`));
  } else {
    assessments.push(chalk.red(`✗ Low throughput (${reqPerSec.toFixed(0)} req/s) - optimization needed`));
  }

  // Error rate assessment
  const errorRate = (results.errors + results.timeouts) / results.requests.total;
  if (errorRate === 0) {
    assessments.push(chalk.green('✓ No errors or timeouts'));
  } else if (errorRate < 0.01) {
    assessments.push(chalk.yellow(`◆ Low error rate (${(errorRate * 100).toFixed(2)}%)`));
  } else {
    assessments.push(chalk.red(`✗ High error rate (${(errorRate * 100).toFixed(2)}%) - investigation required`));
  }

  // Consistency assessment (based on std deviation)
  const latencyCV = results.latency.stddev / results.latency.mean;
  if (latencyCV < 0.3) {
    assessments.push(chalk.green('✓ Consistent response times'));
  } else if (latencyCV < 0.6) {
    assessments.push(chalk.yellow('◆ Moderate variance in response times'));
  } else {
    assessments.push(chalk.red('✗ High variance in response times - inconsistent performance'));
  }

  assessments.forEach(assessment => console.log(assessment));
  console.log();
}
