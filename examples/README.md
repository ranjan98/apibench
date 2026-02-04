# APIBench Examples

This directory contains example scripts demonstrating common APIBench usage patterns.

## Prerequisites

1. Install APIBench:
   ```bash
   npm install -g apibench
   ```

2. Make scripts executable:
   ```bash
   chmod +x examples/*.sh
   ```

## Examples

### basic-test.sh

Simple GET request benchmark. Good for learning the basics.

```bash
./examples/basic-test.sh
```

Tests a single endpoint with moderate load (10 connections, 10 seconds).

### post-benchmark.sh

Benchmark POST requests with JSON body. Useful for testing write operations.

```bash
./examples/post-benchmark.sh
```

Simulates 20 concurrent users creating resources for 15 seconds.

### load-progression.sh

Progressive load test that gradually increases concurrency. Helps find your API's breaking point.

```bash
./examples/load-progression.sh
```

Tests with 10, 25, 50, 100, and 200 concurrent connections. Watch for when latency spikes or errors appear.

### compare-optimizations.sh

Demonstrates the before/after comparison workflow.

```bash
./examples/compare-optimizations.sh
```

Shows how to:
1. Run baseline benchmark
2. Deploy changes
3. Run new benchmark
4. Compare results

## Using with Your Own API

Modify the scripts to test your endpoints:

```bash
# Change the API_URL variable
API_URL="https://your-api.com/endpoint"

# For authenticated APIs, add headers
apibench run \
  -u "$API_URL" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d 20 \
  -c 50
```

## Results Directory

All examples save results to a `results/` directory. Create it first:

```bash
mkdir -p results
```

## Tips

1. **Start small**: Begin with low concurrency (10-20) and short duration (10-15s)
2. **Increase gradually**: Double concurrency each test until you see degradation
3. **Save everything**: Keep results for historical comparison
4. **Test realistic scenarios**: Use actual payloads and authentication

## Real-World Workflow

```bash
# 1. Create results directory
mkdir -p results/my-api

# 2. Run baseline
apibench run -u https://my-api.com/endpoint -o results/my-api/baseline.json

# 3. Make optimizations (add cache, indexes, etc.)

# 4. Run after optimization
apibench run -u https://my-api.com/endpoint -o results/my-api/optimized.json

# 5. Compare
apibench compare -b results/my-api/baseline.json -a results/my-api/optimized.json
```

## Common Modifications

### Change Duration
```bash
-d 30  # Run for 30 seconds instead of default 10
```

### Change Concurrency
```bash
-c 100  # Use 100 concurrent connections instead of default 10
```

### Add Authentication
```bash
-H "Authorization: Bearer $TOKEN"
```

### POST with Custom Body
```bash
-m POST -b '{"custom": "data"}'
```

## Next Steps

See the main [README.md](../README.md) for complete documentation, optimization tips, and advanced usage.
