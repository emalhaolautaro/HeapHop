#!/bin/bash

# HeapHop Dev Runner
# This script handles the environment variable injection needed for eBPF 
# compilation and execution under sudo.

# Detect actual user path and cargo home
ACTUAL_PATH="$PATH"
CARGO_BIN="$HOME/.cargo/bin"
RUSTUP_HOME="$HOME/.rustup"
CARGO_HOME="$HOME/.cargo"

echo "🚀 Starting HeapHop with eBPF privileges..."

sudo -E env \
    "PATH=$ACTUAL_PATH:$CARGO_BIN" \
    "CARGO_HOME=$CARGO_HOME" \
    "RUSTUP_HOME=$RUSTUP_HOME" \
    "NO_AT_BRIDGE=1" \
    "GTK_A11Y=0" \
    "IBUS_DISABLE_REGISTRY=1" \
    npm run tauri dev
