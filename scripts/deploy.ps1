# ---------------------------------------------------------------
# Serverless Task API Deployment Script
# ---------------------------------------------------------------
# This script will:
# 1. Install project dependencies
# 2. Clean previous builds
# 3. Build the project
# 4. Bootstrap CDK (needed for first-time deployment)
# 5. Deploy the CDK stack to AWS
# ---------------------------------------------------------------
# It will handle deployments on both Windows and Unix-like systems.
# Script is written in PowerShell to work on both Unix-like and non-Unix-like OS.

# Detect OS (Windows or Unix-like system)
$OS = $env:OS

# ---------------------------------------------------------------
# Step 1: Install dependencies
# ---------------------------------------------------------------
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "STEP 1: Installing project dependencies..." -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "This step will install all required npm dependencies for the project." -ForegroundColor Green

Write-Host "Running 'npm install'..."
if ($OS -eq "Windows_NT") {
    npm install
} else {
    bash -c "npm install"
}

# ---------------------------------------------------------------
# Step 2: Clean previous builds
# ---------------------------------------------------------------
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "STEP 2: Cleaning previous build artifacts..." -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "This step removes any previous build artifacts to ensure a clean deployment." -ForegroundColor Green

# Since 'rm' isn't available on Windows, we'll use 'Remove-Item' instead
Write-Host "Cleaning the dist directory..."
if ($OS -eq "Windows_NT") {
    Remove-Item -Recurse -Force dist
} else {
    bash -c "rm -rf dist"
}

# ---------------------------------------------------------------
# Step 3: Build the project
# ---------------------------------------------------------------
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "STEP 3: Building the project..." -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "This step compiles the TypeScript code into JavaScript and bundles the handlers for deployment." -ForegroundColor Green

Write-Host "Running 'npm run build'..."
if ($OS -eq "Windows_NT") {
    npm run build
} else {
    bash -c "npm run build"
}

# ---------------------------------------------------------------
# Step 4: CDK Bootstrap (only needed for first deployment)
# ---------------------------------------------------------------
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "STEP 4: Bootstrapping CDK (needed on first deployment)..." -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "Bootstrapping is required only for the first deployment or when deploying in a new AWS account or region." -ForegroundColor Green
Write-Host "It sets up necessary infrastructure (like S3 buckets) for AWS CDK to deploy the stack." -ForegroundColor Green

$bootstrapNeeded = $true  # Change this to `$false` after first deployment

Write-Host "Bootstrapping CDK..."
if ($bootstrapNeeded -eq $true) {
    if ($OS -eq "Windows_NT") {
        cdk bootstrap aws://{{aws-account-id}}/{{aws-region}}
    } else {
        bash -c "cdk bootstrap aws://{{aws-account-id}}/{{aws-region}}"
    }
} else {
    Write-Host "Skipping CDK Bootstrap - not needed for subsequent deployments."
}

# ---------------------------------------------------------------
# Step 5: Deploy the CDK Stack
# ---------------------------------------------------------------
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "STEP 5: Deploying the CDK stack to AWS..." -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "This step deploys your stack to AWS using the CDK. It will check for any changes and apply them to the AWS environment." -ForegroundColor Green
Write-Host "If changes are detected, they will be updated in the AWS environment." -ForegroundColor Green

Write-Host "Deploying..."
if ($OS -eq "Windows_NT") {
    cdk deploy --app "npx ts-node infrastructure/bin/serverless-task-api.ts"
} else {
    bash -c "cdk deploy --app 'npx ts-node infrastructure/bin/serverless-task-api.ts'"
}

Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "Application has been successfully deployed or updated on AWS." -ForegroundColor Green
