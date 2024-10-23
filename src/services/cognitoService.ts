// src/services/cognitoService.ts
import AWS from 'aws-sdk';

const region: string = process.env.AWS_REGION || '';
const userPoolId: string = process.env.USER_POOL_ID || '';
const clientId: string = process.env.CLIENT_ID || '';
const dynamoDbTable: string = process.env.USERS_TABLE_NAME || '';

// Configuring the AWS SDK with region
AWS.config.update({ region: region });

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDb = new AWS.DynamoDB.DocumentClient(); // DynamoDB Client

// Registering User in Cognito and Store in DynamoDB
export const registerUser = async (
  username: string,
  password: string,
  email: string
) => {
  if (!region || !clientId) {
    throw new Error('Failed to connect to AWS User Pool');
  }
  if (!dynamoDbTable) {
    throw new Error('Users Table not found on AWS DynamoDB');
  }
  const params = {
    ClientId: clientId,
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
    ],
  };

  try {
    console.log('params:', params);
    // Sign up user in Cognito
    const response = await cognito.signUp(params).promise();
    console.log('Cognito signUp response:', response);

    // Automatically confirm the user
    await cognito
      .adminConfirmSignUp({
        UserPoolId: userPoolId,
        Username: username,
      })
      .promise();

    console.log('User automatically confirmed successfully');

    // Adding user to DynamoDB if Cognito sign-up is successful
    const userId = response.UserSub; // Cognito user sub (unique user ID)
    const dynamoParams = {
      TableName: dynamoDbTable,
      Item: {
        userId,
        username,
        email,
        createdAt: new Date().toISOString(),
      },
    };
    await dynamoDb.put(dynamoParams).promise();
    console.log('User added to DynamoDB:', dynamoParams);

    return response;
  } catch (error: any) {
    console.error('Error during sign up:', error);
    throw new Error(`Signup failed`);
  }
};

// Log in user using Cognito
export const loginUser = async (username: string, password: string) => {
  if (!userPoolId || !clientId) {
    throw new Error('Failed to connect to AWS User Pool');
  }

  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    ClientId: clientId,
    UserPoolId: userPoolId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const response = await cognito.adminInitiateAuth(params).promise();
    console.log('Cognito login response:', response);
    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    throw new Error(`Login failed`);
  }
};
