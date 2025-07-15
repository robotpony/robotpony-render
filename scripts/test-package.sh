#!/bin/bash

# Package Distribution Testing Script
set -e

echo "🧪 Testing package distribution..."

# Clean up any existing test artifacts
rm -rf test-package-install
mkdir test-package-install
cd test-package-install

echo "📦 Creating test package..."
cd ..
npm pack

echo "🔄 Testing global installation..."
# Create a clean environment for testing
npm init -y > /dev/null 2>&1
npm install -g ./graphinate-*.tgz

echo "✅ Testing CLI availability..."
if ! command -v graphinate &> /dev/null; then
    echo "❌ ERROR: graphinate command not found after global install"
    exit 1
fi

echo "✅ Testing version command..."
graphinate --version

echo "✅ Testing help command..."
graphinate --help

echo "✅ Testing chart generation..."
# Create a test markdown file
cat > test-chart.md << EOF
---
type: venn
sets:
  - "Test A"
  - "Test B"
overlap: "Shared"
---

# Test Chart
EOF

# Test SVG generation
graphinate test-chart.md test-output.svg
if [ ! -f "test-output.svg" ]; then
    echo "❌ ERROR: SVG file not generated"
    exit 1
fi

# Test PNG generation
graphinate test-chart.md test-output.png
if [ ! -f "test-output.png" ]; then
    echo "❌ ERROR: PNG file not generated"
    exit 1
fi

echo "✅ Testing file sizes..."
svg_size=$(stat -f%z test-output.svg 2>/dev/null || stat -c%s test-output.svg)
png_size=$(stat -f%z test-output.png 2>/dev/null || stat -c%s test-output.png)

if [ "$svg_size" -lt 1000 ]; then
    echo "❌ ERROR: SVG file seems too small ($svg_size bytes)"
    exit 1
fi

if [ "$png_size" -lt 1000 ]; then
    echo "❌ ERROR: PNG file seems too small ($png_size bytes)"
    exit 1
fi

echo "✅ Testing different chart types..."
# Test plot chart
cat > test-plot.md << EOF
---
type: plot
x_axis: "X"
y_axis: "Y"
x_range: [0, 10]
y_range: [0, 10]
line:
  points: [[0, 0], [10, 10]]
captions: []
---

# Test Plot
EOF

graphinate test-plot.md test-plot.svg
if [ ! -f "test-plot.svg" ]; then
    echo "❌ ERROR: Plot SVG file not generated"
    exit 1
fi

echo "✅ Testing themes..."
graphinate test-chart.md test-theme.svg --theme robotpony
if [ ! -f "test-theme.svg" ]; then
    echo "❌ ERROR: Themed SVG file not generated"
    exit 1
fi

echo "🧹 Cleaning up..."
npm uninstall -g graphinate
cd ..
rm -rf test-package-install graphinate-*.tgz
rm -f test-chart.md test-output.svg test-output.png test-plot.md test-plot.svg test-theme.svg

echo "✅ Package distribution test completed successfully!"