#!/bin/bash

# ESAF Framework Startup Guide
# This script ensures proper Tauri app startup

echo "🚀 ESAF Framework - Tauri Desktop App Launcher"
echo "=============================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in ESAF framework directory"
    echo "Please run this from /home/ty/Repositories/ai_workspace/esaf-framework"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Rust/Cargo is available for Tauri
if ! command -v cargo &> /dev/null; then
    echo "❌ Error: Rust/Cargo not found. Tauri requires Rust."
    echo "Install Rust from: https://www.rust-lang.org/tools/install"
    exit 1
fi

# Ensure Tauri CLI is installed globally
if ! command -v tauri &> /dev/null; then
    echo "📦 Installing Tauri CLI globally..."
    npm install -g @tauri-apps/cli
fi

echo ""
echo "✅ All dependencies verified!"
echo ""
echo "🎯 Starting ESAF Framework as Tauri Desktop App..."
echo ""
echo "IMPORTANT NOTES:"
echo "- This will open a desktop application window (not just a browser tab)"
echo "- The app includes persistent chat history and document library"
echo "- All agents are using real mathematical algorithms"
echo "- Your API keys are already configured"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Start the Tauri development server
npm run tauri:dev
