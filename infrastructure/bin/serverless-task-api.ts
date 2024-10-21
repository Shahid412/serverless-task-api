// infrastructure/bin/serverless-task-api.ts

import * as cdk from 'aws-cdk-lib';
import { ServerlessTaskApiStack2 } from '../lib/serverless-task-api-stack';

// Initializing the CDK App
const app = new cdk.App();

// Defining the stack with specific AWS account and region
new ServerlessTaskApiStack2(app, 'ServerlessTaskApiStack2', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '', // AWS Account ID
    region: process.env.CDK_DEFAULT_REGION || '', // AWS region
  },
});
