#!/bin/bash

# Basic API benchmark test
# Tests a simple GET endpoint

echo "Running basic benchmark on JSONPlaceholder API..."

apibench run \
  -u https://jsonplaceholder.typicode.com/posts/1 \
  -d 10 \
  -c 10 \
  -o results/basic-test.json

echo ""
echo "Test complete! Results saved to results/basic-test.json"
