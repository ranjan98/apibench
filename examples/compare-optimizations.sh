#!/bin/bash

# Before/After comparison example
# Simulates testing before and after optimization

echo "Comparison Example: Before/After Optimization"
echo "=============================================="
echo ""

API_URL="https://jsonplaceholder.typicode.com/posts"
DURATION=20
CONNECTIONS=30

# Create results directory
mkdir -p results/comparison

echo "Step 1: Running baseline benchmark (simulating 'before' optimization)..."
apibench run \
  -u "$API_URL" \
  -d "$DURATION" \
  -c "$CONNECTIONS" \
  -o results/comparison/before.json

echo ""
echo "Step 2: Simulating optimization deployment..."
echo "(In real scenario, you would deploy your optimized code here)"
sleep 2

echo ""
echo "Step 3: Running optimized benchmark (simulating 'after' optimization)..."
apibench run \
  -u "$API_URL" \
  -d "$DURATION" \
  -c "$CONNECTIONS" \
  -o results/comparison/after.json

echo ""
echo "Step 4: Comparing results..."
echo ""

apibench compare \
  -b results/comparison/before.json \
  -a results/comparison/after.json

echo ""
echo "Note: Since we're testing the same endpoint, results should be similar."
echo "In a real scenario, you would see improvements after actual optimizations."
