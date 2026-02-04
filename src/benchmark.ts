import autocannon from 'autocannon';
import ora from 'ora';

export interface BenchmarkOptions {
  url: string;
  method: string;
  duration: number;
  connections: number;
  pipelining: number;
  body?: any;
  headers?: Record<string, string>;
  contentType?: string;
}

export interface BenchmarkResults {
  url: string;
  method: string;
  duration: number;
  connections: number;
  timestamp: string;
  requests: {
    total: number;
    average: number;
    mean: number;
    stddev: number;
    min: number;
    max: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    p999: number;
  };
  latency: {
    mean: number;
    stddev: number;
    min: number;
    max: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    p999: number;
  };
  throughput: {
    mean: number;
    stddev: number;
    min: number;
    max: number;
  };
  errors: number;
  timeouts: number;
  non2xx: number;
  statusCodeStats: Record<string, { count: number }>;
}

export async function runBenchmark(options: BenchmarkOptions): Promise<BenchmarkResults> {
  const spinner = ora('Running benchmark...').start();

  const autocannonOptions: autocannon.Options = {
    url: options.url,
    method: options.method,
    duration: options.duration,
    connections: options.connections,
    pipelining: options.pipelining,
    headers: {
      ...options.headers,
    },
  };

  if (options.body) {
    autocannonOptions.body = JSON.stringify(options.body);
    if (options.contentType) {
      autocannonOptions.headers = {
        ...autocannonOptions.headers,
        'Content-Type': options.contentType,
      };
    }
  }

  return new Promise((resolve, reject) => {
    const instance = autocannon(autocannonOptions, (err, result) => {
      spinner.stop();

      if (err) {
        reject(err);
        return;
      }

      const results: BenchmarkResults = {
        url: options.url,
        method: options.method,
        duration: options.duration,
        connections: options.connections,
        timestamp: new Date().toISOString(),
        requests: {
          total: result.requests.total,
          average: result.requests.average,
          mean: result.requests.mean,
          stddev: result.requests.stddev,
          min: result.requests.min,
          max: result.requests.max,
          p50: result.requests.p50,
          p75: result.requests.p75,
          p90: result.requests.p90,
          p95: result.requests.p95,
          p99: result.requests.p99,
          p999: result.requests.p999,
        },
        latency: {
          mean: result.latency.mean,
          stddev: result.latency.stddev,
          min: result.latency.min,
          max: result.latency.max,
          p50: result.latency.p50,
          p75: result.latency.p75,
          p90: result.latency.p90,
          p95: result.latency.p95,
          p99: result.latency.p99,
          p999: result.latency.p999,
        },
        throughput: {
          mean: result.throughput.mean,
          stddev: result.throughput.stddev,
          min: result.throughput.min,
          max: result.throughput.max,
        },
        errors: result.errors,
        timeouts: result.timeouts,
        non2xx: result.non2xx,
        statusCodeStats: result.statusCodeStats || {},
      };

      resolve(results);
    });

    // Show progress
    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: false,
    });
  });
}
