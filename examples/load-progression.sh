#!/bin/bash

# Progressive load test
# Gradually increases load to find API limits

echo "Running progressive load test..."
echo "This will test with 10, 25, 50, 100, and 200 concurrent connections"
echo ""

API_URL="https://jsonplaceholder.typicode.com/posts"
DURATION=15
RESULTS_DIR="results/load-progression"

mkdir -p "$RESULTS_DIR"

for CONNECTIONS in 10 25 50 100 200; do
  echo "Testing with $CONNECTIONS concurrent connections..."

  apibench run \
    -u "$API_URL" \
    -d "$DURATION" \
    -c "$CONNECTIONS" \
    -o "$RESULTS_DIR/connections-$CONNECTIONS.json"

  echo ""
  echo "Waiting 5 seconds before next test..."
  sleep 5
done

echo "Load progression test complete!"
echo "Results saved to $RESULTS_DIR/"
echo ""
echo "To compare results:"
echo "  apibench report -f $RESULTS_DIR/connections-10.json"
echo "  apibench report -f $RESULTS_DIR/connections-100.json"
