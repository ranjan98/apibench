# APIBench Quick Start

## Installation

```bash
npm install -g apibench
```

## Basic Usage

### Test a GET endpoint
```bash
apibench run -u https://api.example.com/users
```

### Test a POST endpoint
```bash
apibench run -u https://api.example.com/users -m POST -b '{"name": "John"}'
```

### Add authentication
```bash
apibench run -u https://api.example.com/protected -H "Authorization: Bearer TOKEN"
```

### High load test (100 concurrent connections, 30 seconds)
```bash
apibench run -u https://api.example.com/endpoint -c 100 -d 30
```

### Save results for comparison
```bash
apibench run -u https://api.example.com/endpoint -o baseline.json
```

## Compare Before/After

```bash
# Before optimization
apibench run -u https://api.example.com/endpoint -o before.json

# Deploy changes

# After optimization
apibench run -u https://api.example.com/endpoint -o after.json

# Compare
apibench compare -b before.json -a after.json
```

## Key Metrics Explained

- **P50 (Median)**: What 50% of users experience
- **P95**: What 95% of users experience (most important metric)
- **P99**: Edge cases, only 1% of users see this
- **Requests/sec**: API throughput

## When to Optimize

- P95 > 300ms: Consider optimization
- P99 >> P95: Inconsistent performance, investigate spikes
- Error rate > 1%: Server is struggling
- High variance: Unpredictable performance

## Common Commands

```bash
# Basic test
apibench run -u $URL

# Save results
apibench run -u $URL -o results.json

# View saved results
apibench report -f results.json

# Compare two results
apibench compare -b before.json -a after.json

# Custom duration and connections
apibench run -u $URL -d 60 -c 50

# POST with JSON body
apibench run -u $URL -m POST -b '{"key":"value"}'

# Multiple headers
apibench run -u $URL -H "Auth: Bearer token" -H "X-API-Key: key"
```

## Example Workflow

```bash
# 1. Create benchmarks directory
mkdir benchmarks

# 2. Run baseline test
apibench run -u https://api.example.com/users -d 30 -c 50 -o benchmarks/baseline.json

# 3. Make code changes (add cache, optimize query, etc.)

# 4. Run test again
apibench run -u https://api.example.com/users -d 30 -c 50 -o benchmarks/optimized.json

# 5. Compare results
apibench compare -b benchmarks/baseline.json -a benchmarks/optimized.json

# 6. If improved, commit and deploy
git add .
git commit -m "Optimize user endpoint - 40% latency improvement"
```

## Tips

1. **Warm up first**: Run a short test before the real benchmark
2. **Use realistic data**: Test with actual payloads, not empty objects
3. **Save everything**: Disk is cheap, historical data is valuable
4. **Test from different locations**: Network latency matters
5. **Run multiple times**: Results can vary, average 3-5 runs

## Troubleshooting

**Connection errors**: Check if API is running and URL is correct

**High errors**: Reduce concurrency (`-c 10` instead of `-c 100`)

**Inconsistent results**: Normal, run multiple times and compare

**Rate limiting**: Reduce connections or duration

## Full Documentation

See [README.md](./README.md) for complete documentation, examples, and optimization tips.
