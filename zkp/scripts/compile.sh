#!/usr/bin/env bash
# Compiles ownership.circom and runs the Groth16 trusted setup (Powers of Tau
# + circuit-specific phase 2), producing the wasm witness generator, the
# final proving key (.zkey), and the verification key (.json).
#
# Prerequisites: circom (>=2.1.6) and snarkjs installed globally, or use
# `npx circom` / `npx snarkjs` if you prefer not to install globally.
set -e

CIRCUIT_DIR="$(dirname "$0")/../circuits"
BUILD_DIR="$(dirname "$0")/../build"
mkdir -p "$BUILD_DIR"

echo "==> Compiling circuit..."
circom "$CIRCUIT_DIR/ownership.circom" \
  --r1cs --wasm --sym \
  -o "$BUILD_DIR" \
  -l node_modules

echo "==> Downloading Powers of Tau (if not present)..."
if [ ! -f "$BUILD_DIR/pot12_final.ptau" ]; then
  curl -L -o "$BUILD_DIR/pot12_final.ptau" \
    https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
fi

echo "==> Generating zkey (phase 2)..."
npx snarkjs groth16 setup \
  "$BUILD_DIR/ownership.r1cs" \
  "$BUILD_DIR/pot12_final.ptau" \
  "$BUILD_DIR/ownership_0000.zkey"

echo "==> Contributing to phase 2 ceremony (demo contribution — replace for production)..."
npx snarkjs zkey contribute \
  "$BUILD_DIR/ownership_0000.zkey" \
  "$BUILD_DIR/ownership_final.zkey" \
  --name="DFMS demo contribution" -v -e="$(head -c 64 /dev/urandom | base64)"

echo "==> Exporting verification key..."
npx snarkjs zkey export verificationkey \
  "$BUILD_DIR/ownership_final.zkey" \
  "$BUILD_DIR/verification_key.json"

echo "==> Exporting Solidity verifier contract..."
npx snarkjs zkey export solidityverifier \
  "$BUILD_DIR/ownership_final.zkey" \
  "../contracts/contracts/Verifier.sol"

echo "Done. Build artifacts are in $BUILD_DIR"
