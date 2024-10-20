// infrastructure/lib/serverless-task-api-stack.ts

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ServerlessTaskApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'TaskApiUserPool', {
      userPoolName: 'TaskApiUserPool',
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: false },
      autoVerify: { email: false },
      standardAttributes: {
        email: { required: false, mutable: true },
      },
    });

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

    // Create new tables on DynamoDB
    // // DynamoDB Users Table
    // const usersTable = new dynamodb.Table(this, 'users', {
    //   tableName: 'users',
    //   partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // Retain for production
    // });

    // // DynamoDB Tasks Table
    // const tasksTable = new dynamodb.Table(this, 'tasks', {
    //   tableName: 'tasks',
    //   partitionKey: { name: 'TaskId', type: dynamodb.AttributeType.STRING },
    //   sortKey: { name: 'UserId', type: dynamodb.AttributeType.STRING }, // Reference to the users table
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // Retain for production
    // });

    // // Adding a Global Secondary Index on UserId for querying tasks by user
    // tasksTable.addGlobalSecondaryIndex({
    //   indexName: 'UserId-index',
    //   partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
    //   projectionType: dynamodb.ProjectionType.ALL,
    // });

    // Lambda Layer for shared code (optional)
    const lambdaLayer = new lambda.LayerVersion(this, 'LambdaLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'A layer to hold common utilities',
    });

    // Common Lambda Environment Variables
    const commonEnv = {
      TASKS_TABLE_NAME: tasksTable.tableName,
      USERS_TABLE_NAME: usersTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      CLIENT_ID: userPoolClient.userPoolClientId,
      NODE_OPTIONS: '--enable-source-maps',
    };

    const registerFunction = new lambda.Function(this, 'RegisterFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'auth.register', // Pointing to `register` in `auth.ts`
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
    });

    registerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'cognito-idp:AdminInitiateAuth',
          'cognito-idp:AdminConfirmSignUp',
        ],
        resources: [
          `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${userPool.userPoolId}`,
        ],
      })
    );

    const loginFunction = new lambda.Function(this, 'LoginFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'auth.login', // Pointing to `login` in `auth.ts`
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
    });

    // Grant Cognito permissions
    loginFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:AdminInitiateAuth'],
        resources: [
          `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${userPool.userPoolId}`,
        ],
      })
    );

    const getTasksFunction = new lambda.Function(this, 'GetTasksFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.get',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
    });

    // // Explicit permission for querying the Global Secondary Index (UserId-index) on tasksTable
    // getTasksFunction.addToRolePolicy(
    //   new iam.PolicyStatement({
    //     actions: ['dynamodb:Query'],
    //     resources: [
    //       `arn:aws:dynamodb:${this.region}:${this.account}:table/${tasksTable.tableName}/index/userId`,
    //       tasksTable.tableArn,
    //       `${tasksTable.tableArn}/index/userId`,
    //     ],
    //   })
    // );

    const createTaskFunction = new lambda.Function(this, 'CreateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.create',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
    });

    const updateTaskFunction = new lambda.Function(this, 'UpdateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.update',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
    });

    const deleteTaskFunction = new lambda.Function(this, 'DeleteTaskFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'tasks.remove',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/handlers')),
      environment: commonEnv,
      layers: [lambdaLayer],
    });

    // Grant Lambda Functions permissions to DynamoDB
    tasksTable.grantReadWriteData(getTasksFunction);
    tasksTable.grantReadWriteData(createTaskFunction);
    tasksTable.grantReadWriteData(updateTaskFunction);
    tasksTable.grantReadWriteData(deleteTaskFunction);

    usersTable.grantReadWriteData(registerFunction);
    usersTable.grantReadWriteData(loginFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'TaskApi', {
      restApiName: 'Task Management Service',
      description: 'This service manages tasks.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [userPool],
      }
    );

    // Register Resource
    const register = api.root.addResource('register');
    register.addMethod(
      'POST',
      new apigateway.LambdaIntegration(registerFunction)
    );

    // Login Resource
    const login = api.root.addResource('login');
    login.addMethod('POST', new apigateway.LambdaIntegration(loginFunction));

    // Tasks Resource
    const tasks = api.root.addResource('tasks');

    // GET /tasks
    tasks.addMethod('GET', new apigateway.LambdaIntegration(getTasksFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // POST /tasks
    tasks.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createTaskFunction),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // Task by ID Resource
    const task = tasks.addResource('{taskId}');

    // PUT /tasks/{taskId}
    task.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(updateTaskFunction),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // DELETE /tasks/{taskId}
    task.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(deleteTaskFunction),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // Output API URL
    new cdk.CfnOutput(this, 'APIUrl', {
      value: api.url ?? 'Something went wrong with the API deployment',
    });
  }
}
