#!/bin/bash

# Setup environment variables for LifeDash development
# This script ensures consistent versions across all builds

echo "Setting up LifeDash development environment..."

# Set Node.js to LTS version
echo "Setting Node.js to LTS version..."
if command -v nvm &> /dev/null; then
    nvm use --lts
else
    echo "nvm not found, using current Node.js version"
fi

# Set Java environment
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "Environment setup complete!"
echo "Node.js version: $(node --version)"
echo "Java version: $(java -version 2>&1 | head -n 1)"
echo "JAVA_HOME: $JAVA_HOME"

# Instructions for use
echo ""
echo "To use this environment in a new terminal session:"
echo "source scripts/setup-env.sh"
echo ""
echo "Or add these lines to your ~/.zshrc:"
echo "export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home"
echo "export PATH=\$JAVA_HOME/bin:\$PATH"
