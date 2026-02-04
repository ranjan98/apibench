#!/bin/bash

# POST request benchmark
# Tests creating resources via POST

echo "Running POST request benchmark..."

apibench run \
  -u https://jsonplaceholder.typicode.com/posts \
  -m POST \
  -b '{
    "title": "Performance Test",
    "body": "This is a benchmark test of the POST endpoint",
    "userId": 1
  }' \
  --content-type application/json \
  -d 15 \
  -c 20 \
  -o results/post-benchmark.json

echo ""
echo "POST benchmark complete! Results saved to results/post-benchmark.json"
