# APIBench

A fast, developer-friendly CLI tool for benchmarking REST APIs. Get detailed performance metrics including latency percentiles, throughput, and error rates. Perfect for performance testing, optimization validation, and capacity planning.

## Why APIBench?

Most load testing tools are either too complex or don't give you the metrics that matter. APIBench focuses on what developers actually need:

- **Real percentile metrics** (P50, P95, P99) - not just averages
- **Easy comparisons** - see exactly how your optimizations performed
- **Clear output** - color-coded tables that are actually readable
- **Save and share** - export results as JSON for documentation or CI/CD

## Installation

```bash
npm install -g apibench
```

Or use without installing:

```bash
npx apibench run -u https://api.example.com/endpoint
```

## Quick Start

### Basic GET Request

```bash
apibench run -u https://api.example.com/users
```

This runs a 10-second benchmark with 10 concurrent connections and shows you:
- Requests per second
- Latency at P50, P95, P99 (what 50%, 95%, 99% of users experience)
- Throughput in MB/s
- Error rates and status codes

### POST Request with JSON Body

```bash
apibench run \
  -u https://api.example.com/users \
  -m POST \
  -b '{"name": "Test User", "email": "test@example.com"}' \
  --content-type application/json
```

### Custom Headers (Authentication)

```bash
apibench run \
  -u https://api.example.com/protected \
  -H "Authorization: Bearer your-token-here" \
  -H "X-API-Key: your-api-key"
```

### High Load Test

```bash
apibench run \
  -u https://api.example.com/endpoint \
  -c 100 \
  -d 30
```

This hammers your API with 100 concurrent connections for 30 seconds. Use this to find breaking points.

## Real-World Examples

### Example 1: Testing a Search API

```bash
apibench run \
  -u "https://api.example.com/search?q=performance" \
  -d 30 \
  -c 50 \
  -o baseline-search.json
```

Output:
```
=== Latency (ms) ===
┌────────────────────┬────────────────────────────────┐
│ Percentile         │ Latency (ms)                   │
├────────────────────┼────────────────────────────────┤
│ Mean               │ 45.23 ms                       │
│ P50 (Median)       │ 42.10 ms                       │
│ P75                │ 58.30 ms                       │
│ P90                │ 78.45 ms                       │
│ P95                │ 95.20 ms                       │
│ P99                │ 145.60 ms                      │
│ P99.9              │ 223.40 ms                      │
└────────────────────┴────────────────────────────────┘
```

**What this tells you:**
- 50% of users get responses in 42ms (P50)
- 95% of users get responses under 95ms (P95)
- The slowest 1% wait 145ms+ (P99)
- Some requests hit 223ms (P99.9) - likely database query spikes

### Example 2: Before/After Optimization

You added database indexes and want proof they helped:

```bash
# Before optimization
apibench run \
  -u https://api.example.com/products?category=electronics \
  -d 20 \
  -c 25 \
  -o before.json

# Deploy your optimization

# After optimization
apibench run \
  -u https://api.example.com/products?category=electronics \
  -d 20 \
  -c 25 \
  -o after.json

# Compare results
apibench compare -b before.json -a after.json
```

Output:
```
=== Overall Assessment ===

Improvements:
  ✓ Throughput improved by 34.2%
  ✓ P95 latency improved by 41.8%
  ✓ P99 latency improved by 52.3%
  ✓ Mean latency improved by 38.5%

Overall: Performance Improved
```

### Example 3: Testing Write Performance

```bash
apibench run \
  -u https://api.example.com/orders \
  -m POST \
  -b '{"product_id": 123, "quantity": 2, "user_id": 456}' \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -d 15 \
  -c 20 \
  -o write-performance.json
```

This simulates 20 concurrent users creating orders for 15 seconds.

### Example 4: Stress Testing GraphQL

```bash
apibench run \
  -u https://api.example.com/graphql \
  -m POST \
  -b '{"query": "{ users(limit: 10) { id name email } }"}' \
  --content-type application/json \
  -c 50 \
  -d 60
```

## Understanding the Metrics

### Latency Percentiles - What They Mean

- **P50 (Median)**: Half your users experience this or better. This is "typical" performance.
- **P95**: 95% of requests are this fast or faster. This is what most users experience.
- **P99**: Only 1% of requests are slower. These are your edge cases.
- **P99.9**: The worst 0.1%. Often caused by garbage collection, cold starts, or database locks.

**Why percentiles matter more than averages:**

If your average latency is 50ms but P99 is 2000ms, that means 1 in 100 users waits 2 full seconds. Averages hide these problems.

### Requests per Second

This is throughput - how many requests your API can handle. But context matters:

- **100 req/s** for a complex database query = good
- **100 req/s** for a simple GET request = concerning
- **1000+ req/s** = you're handling serious load

### Throughput (Bytes/sec)

This measures data transfer. Useful for:
- Detecting unnecessary payload bloat
- Comparing response compression (gzip vs brotli)
- Finding bandwidth bottlenecks

## Performance Optimization Tips

### If P95 latency is high (>300ms)

1. **Add database indexes** - most common cause
2. **Enable query result caching** (Redis, Memcached)
3. **Use connection pooling** - reduce connection overhead
4. **Profile your code** - find slow functions
5. **Consider read replicas** - distribute database load

### If P99 is way higher than P95

This indicates inconsistent performance:

1. **Check garbage collection** - GC pauses cause latency spikes
2. **Look for N+1 queries** - some requests hit the database dozens of times
3. **Monitor disk I/O** - SSD vs HDD makes a huge difference
4. **Review cold start times** - serverless functions need warmup

### If throughput is low (<100 req/s)

1. **Profile CPU usage** - is your code CPU-bound?
2. **Check database connection limits** - are you hitting max connections?
3. **Review synchronous operations** - use async/await properly
4. **Optimize JSON parsing** - large payloads slow everything down
5. **Consider horizontal scaling** - add more servers

### If error rate is high

1. **Check logs immediately** - what's actually failing?
2. **Review connection limits** - too many concurrent connections?
3. **Monitor database health** - connection timeouts? Query timeouts?
4. **Check rate limiting** - are you hitting API limits?

## Comparing Results

After making changes, always compare benchmarks:

```bash
# Run baseline
apibench run -u https://api.example.com/endpoint -o baseline.json

# Make your changes (add caching, optimize queries, etc.)

# Run new benchmark
apibench run -u https://api.example.com/endpoint -o optimized.json

# Compare
apibench compare -b baseline.json -a optimized.json
```

The comparison shows:
- Percentage improvements/regressions
- Side-by-side metrics
- Overall assessment

**Pro tip**: Save all benchmarks in a `benchmarks/` folder with timestamps:

```bash
apibench run -u $URL -o "benchmarks/$(date +%Y%m%d-%H%M%S).json"
```

## CLI Reference

### `apibench run`

Run a performance benchmark.

**Options:**
- `-u, --url <url>` - API endpoint to test (required)
- `-m, --method <method>` - HTTP method: GET, POST, PUT, DELETE (default: GET)
- `-d, --duration <seconds>` - Test duration in seconds (default: 10)
- `-c, --connections <count>` - Concurrent connections (default: 10)
- `-p, --pipelining <count>` - HTTP pipelining factor (default: 1)
- `-b, --body <json>` - Request body as JSON string
- `-H, --header <header>` - Add header (format: "Key: Value"), repeatable
- `-o, --output <file>` - Save results to JSON file
- `--content-type <type>` - Content-Type header (default: application/json)

**Examples:**

```bash
# Simple GET
apibench run -u https://api.example.com/health

# POST with auth
apibench run \
  -u https://api.example.com/data \
  -m POST \
  -b '{"key": "value"}' \
  -H "Authorization: Bearer token"

# High concurrency test
apibench run -u https://api.example.com/endpoint -c 100 -d 60
```

### `apibench compare`

Compare two benchmark results.

**Options:**
- `-b, --before <file>` - Baseline results JSON (required)
- `-a, --after <file>` - Optimized results JSON (required)

**Example:**

```bash
apibench compare -b before.json -a after.json
```

### `apibench report`

Generate a report from saved results.

**Options:**
- `-f, --file <file>` - Results JSON file (required)

**Example:**

```bash
apibench report -f my-benchmark.json
```

## Use Cases

### Pre-deployment Testing

Add to your CI/CD pipeline:

```bash
# Run benchmark
apibench run -u $STAGING_URL -d 30 -c 50 -o staging-results.json

# Compare with production baseline
apibench compare -b production-baseline.json -a staging-results.json

# Fail build if performance regressed >10%
```

### Capacity Planning

Find your API's breaking point:

```bash
# Test with increasing load
apibench run -u $URL -c 10 -d 20 -o load-10.json
apibench run -u $URL -c 50 -d 20 -o load-50.json
apibench run -u $URL -c 100 -d 20 -o load-100.json
apibench run -u $URL -c 200 -d 20 -o load-200.json

# Find where errors spike or latency explodes
```

### Database Optimization Validation

```bash
# Before adding index
apibench run -u "$API/search?term=test" -o before-index.json

# Add database index

# After adding index
apibench run -u "$API/search?term=test" -o after-index.json

# Quantify improvement
apibench compare -b before-index.json -a after-index.json
```

### Caching Impact Analysis

```bash
# Cold cache
apibench run -u $URL -o cold-cache.json

# Warm cache (run twice, use second result)
apibench run -u $URL -o warm-cache-1.json
apibench run -u $URL -o warm-cache-2.json

apibench compare -b cold-cache.json -a warm-cache-2.json
```

## Tips and Tricks

### 1. Test from Multiple Locations

Network latency affects results. Run benchmarks from:
- Same datacenter (tests pure API performance)
- Different regions (tests real user experience)
- Your local machine (tests over public internet)

### 2. Warm Up First

The first request is often slower (cold start, cache miss, connection establishment):

```bash
# Run a short warmup first
apibench run -u $URL -d 5 -c 1

# Then run real benchmark
apibench run -u $URL -d 30 -c 50 -o results.json
```

### 3. Watch for Rate Limiting

If you see errors increasing over time, you might be hitting rate limits. Reduce concurrency:

```bash
# Instead of -c 100, try:
apibench run -u $URL -c 25 -d 60
```

### 4. Realistic Payloads

Use real data in your POST/PUT requests:

```bash
# Good - realistic user creation
apibench run -u $URL -m POST \
  -b '{"name": "John Doe", "email": "john@example.com", "role": "user", "preferences": {"theme": "dark", "notifications": true}}'

# Bad - minimal test data
apibench run -u $URL -m POST -b '{}'
```

### 5. Save Everything

Disk is cheap, data is valuable:

```bash
mkdir -p benchmarks
apibench run -u $URL -o "benchmarks/$(date +%Y%m%d-%H%M%S)-${COMMIT_SHA}.json"
```

Now you have a history of performance across all deployments.

## Troubleshooting

### "ECONNREFUSED" or Connection Errors

- Is your API actually running?
- Check the URL (http vs https, correct port)
- Test with curl first: `curl -v $URL`

### High Error Rate

- Your API might not handle the load
- Check server logs for actual errors
- Reduce concurrency: `-c 5` instead of `-c 100`
- Increase duration for more stable results: `-d 60`

### Results Vary Between Runs

This is normal. Network and server load fluctuate. Run multiple times and average:

```bash
apibench run -u $URL -o run1.json
apibench run -u $URL -o run2.json
apibench run -u $URL -o run3.json
```

If variance is >20%, your API performance is inconsistent.

## License

MIT - see LICENSE file

## Contributing

Found a bug or want a feature? Open an issue or submit a PR. This tool was built by developers, for developers.

---

Built with [autocannon](https://github.com/mcollina/autocannon) - the same benchmarking engine used by Fastify and other high-performance Node.js projects.
