import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ServerlessTaskApiStack2 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    // 1. Create a Cognito User Pool for authentication
    const userPool = new cognito.UserPool(this, 'TaskApiUserPool', {
      userPoolName: 'TaskApiUserPool',
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: false },
      },
    });

    // Cognito User Pool Client for client-side integration
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
    });

    // // 2. Create a DynamoDB table for users
    // const usersTable = new dynamodb.Table(this, 'UsersTable', {
    //   partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    //   tableName: 'users',
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // Not recommended for production use
    // });

    // // 3. Create a DynamoDB table for tasks
    // const tasksTable = new dynamodb.Table(this, 'TasksTable', {
    //   partitionKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
    //   tableName: 'tasks',
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // Not recommended for production use
    // });

    // Referencing the existing DynamoDB Users Table
    const usersTable = dynamodb.Table.fromTableName(this, 'users', 'users');

    // Referencing the existing DynamoDB Tasks Table
    const tasksTable = dynamodb.Table.fromTableName(this, 'tasks', 'tasks');

    // 4. Common environment variables for the Lambda functions
    const commonEnv = {
      USERS_TABLE_NAME: usersTable.tableName,
      TASKS_TABLE_NAME: tasksTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      CLIENT_ID: userPoolClient.userPoolClientId,
      NODE_OPTIONS: '--enable-source-maps',
    };

    // Cognito Admin Policy for Lambda functions
    const cognitoAdminPolicy = new iam.PolicyStatement({
      actions: [
        'cognito-idp:AdminConfirmSignUp',
        'cognito-idp:AdminInitiateAuth',
        'cognito-idp:AdminRespondToAuthChallenge',
        'cognito-idp:AdminUpdateUserAttributes',
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminGetUser',
        'cognito-idp:ListUsers',
      ],
      resources: [
        `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${userPool.userPoolId}`,
      ],
    });

    // Lambda Layer for shared code (optional)
    const lambdaLayer = new lambda.LayerVersion(this, 'LambdaLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'A layer to hold common utilities',
    });

    // 5. Register Lambda function
    const registerFunction = new lambda.Function(this, 'RegisterFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'auth.register',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
      initialPolicy: [
        cognitoAdminPolicy,
        new iam.PolicyStatement({
          actions: ['dynamodb:*'],
          resources: [usersTable.tableArn, tasksTable.tableArn],
        }),
      ],
    });

    // 6. Login Lambda function
    const loginFunction = new lambda.Function(this, 'LoginFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'auth.login',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      initialPolicy: [
        cognitoAdminPolicy,
        new iam.PolicyStatement({
          actions: ['dynamodb:GetItem', 'dynamodb:Query'],
          resources: [usersTable.tableArn],
        }),
      ],
    });

    // 7. API Gateway to expose the endpoints
    const api = new apigateway.RestApi(this, 'TaskApi', {
      restApiName: 'Task Management API',
      description: 'API for managing tasks and users',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Register resource in the API Gateway
    const registerResource = api.root.addResource('register');
    registerResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(registerFunction)
    );

    // Login resource in the API Gateway
    const loginResource = api.root.addResource('login');
    loginResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(loginFunction)
    );

    // // Add other resources and methods as needed (e.g., tasks, users)
    // const tasksResource = api.root.addResource('tasks');
    // tasksResource.addMethod(
    //   'GET',
    //   new apigateway.LambdaIntegration(/* your tasks Lambda */)
    // );

    // const usersResource = api.root.addResource('users');
    // usersResource.addMethod(
    //   'GET',
    //   new apigateway.LambdaIntegration(/* your users Lambda */)
    // );

    // 8. Add Permissions to the Lambda Role (if any further are needed)
    // Example of adding a custom policy statement:
    const additionalPolicy = new iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem'],
      resources: [usersTable.tableArn, tasksTable.tableArn],
    });

    // Attach the policy to the register function
    registerFunction.addToRolePolicy(additionalPolicy);

    // 9. Outputs (optional)
    new cdk.CfnOutput(this, 'UserPoolIdOutput', {
      value: userPool.userPoolId,
      description: 'The ID of the Cognito User Pool',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}
