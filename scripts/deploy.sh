#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

echo "Deploying the infrastructure..."
npm run deploy

echo "Deployment completed successfully."
