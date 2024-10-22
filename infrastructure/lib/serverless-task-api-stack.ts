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

    // Cognito Admin Policy for Lambda functions (handling user management)
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

    // Permissions to perform CRUD operations on tasks table
    const tasksDynamoPolicy = new iam.PolicyStatement({
      actions: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      resources: [tasksTable.tableArn],
    });

    // Lambda Layer for shared code (optional)
    const lambdaLayer = new lambda.LayerVersion(this, 'LambdaLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'A layer to hold common utilities',
    });

    // 5. Register Lambda function (public route, no authentication required)
    const registerFunction = new lambda.Function(this, 'RegisterFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'auth.register',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
      initialPolicy: [
        cognitoAdminPolicy,
        new iam.PolicyStatement({
          actions: ['dynamodb:PutItem'],
          resources: [usersTable.tableArn],
        }),
      ],
    });

    // 6. Login Lambda function (public route, no authentication required)
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

    // Public routes for register and login (no auth)
    const registerResource = api.root.addResource('register');
    registerResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(registerFunction)
    );

    const loginResource = api.root.addResource('login');
    loginResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(loginFunction)
    );

    // 8. Task CRUD Lambda Functions (protected routes with Cognito authentication)

    // Get all tasks
    const getTasksFunction = new lambda.Function(this, 'GetTasksFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.get',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
      initialPolicy: [tasksDynamoPolicy],
    });

    // Create a new task
    const createTaskFunction = new lambda.Function(this, 'CreateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.create',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
      initialPolicy: [tasksDynamoPolicy],
    });

    // Update an existing task
    const updateTaskFunction = new lambda.Function(this, 'UpdateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.update',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
      initialPolicy: [tasksDynamoPolicy],
    });

    // Delete a task
    const deleteTaskFunction = new lambda.Function(this, 'DeleteTaskFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.remove',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
      initialPolicy: [tasksDynamoPolicy],
    });

    // Cognito Authorizer (for securing API routes)
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [userPool],
      }
    );

    // Tasks Resource
    const tasks = api.root.addResource('tasks');

    // GET /tasks - Requires Cognito Authorization
    tasks.addMethod('GET', new apigateway.LambdaIntegration(getTasksFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // POST /tasks - Requires Cognito Authorization
    tasks.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createTaskFunction),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // Individual Task Resource by {taskId}
    const task = tasks.addResource('{taskId}');

    // PUT /tasks/{taskId} - Update a task (with Cognito)
    task.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(updateTaskFunction),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // DELETE /tasks/{taskId} - Delete a task (with Cognito)
    task.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(deleteTaskFunction),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // 9. Outputs (optional)
    new cdk.CfnOutput(this, 'UserPoolIdOutput', {
      value: userPool.userPoolId,
      description: 'The ID of the Cognito User Pool',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });

    // Listing all endpoints
    new cdk.CfnOutput(this, 'RegisterEndpoint', {
      value: `${api.url}register`,
      description: 'Endpoint for user registration (POST)',
    });

    new cdk.CfnOutput(this, 'LoginEndpoint', {
      value: `${api.url}login`,
      description: 'Endpoint for user login (POST)',
    });

    new cdk.CfnOutput(this, 'GetTasksEndpoint', {
      value: `${api.url}tasks`,
      description:
        'Endpoint for fetching all tasks (GET) - Requires Cognito Authentication',
    });

    new cdk.CfnOutput(this, 'CreateTaskEndpoint', {
      value: `${api.url}tasks`,
      description:
        'Endpoint for creating a task (POST) - Requires Cognito Authentication',
    });

    new cdk.CfnOutput(this, 'UpdateTaskEndpoint', {
      value: `${api.url}tasks/{taskId}`,
      description:
        'Endpoint for updating a task (PUT) - Requires Cognito Authentication',
    });

    new cdk.CfnOutput(this, 'DeleteTaskEndpoint', {
      value: `${api.url}tasks/{taskId}`,
      description:
        'Endpoint for deleting a task (DELETE) - Requires Cognito Authentication',
    });
  }
}
