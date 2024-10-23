// src/services/cognitoService.test.ts
import { registerUser, loginUser } from '../src/services/cognitoService';
import AWS from 'aws-sdk';

// Mocking AWS SDK CognitoIdentityServiceProvider and DynamoDB DocumentClient
jest.mock('aws-sdk', () => {
  const mockSignUp = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({ UserSub: '12345' }),
  });

  const mockAdminConfirmSignUp = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
  });

  const mockAdminInitiateAuth = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      AuthenticationResult: { AccessToken: 'access-token' },
    }),
  });

  return {
    CognitoIdentityServiceProvider: jest.fn().mockImplementation(() => ({
      signUp: mockSignUp,
      adminConfirmSignUp: mockAdminConfirmSignUp,
      adminInitiateAuth: mockAdminInitiateAuth,
    })),
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => ({
        put: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue({}),
        }),
      })),
    },
    config: {
      update: jest.fn(),
    },
  };
});

describe('Cognito Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should register a user successfully', async () => {
    const username = 'testuser';
    const password = 'password123';
    const email = 'test@example.com';

    // Expected parameters passed to DynamoDB put
    const putParams = {
      TableName: 'users',
      Item: {
        userId: '12345',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: expect.any(String),
      },
    };

    // Creating an instance of DocumentClient
    const documentClient = new AWS.DynamoDB.DocumentClient();

    // Calling the registerUser function
    const result = await registerUser(username, password, email);

    // Verifying that DynamoDB put was called with the correct params
    expect(documentClient.put).toHaveBeenCalled(); // Check if put was called
    expect(documentClient.put).toHaveBeenCalledWith(putParams); // Verify the parameters

    // Ensuring the result returned matches the mocked signUp response
    expect(result).toEqual({
      UserSub: '12345',
    });
  });

  test('should log in a user successfully', async () => {
    const result = await loginUser('testuser', 'password123');

    // Expectations on Cognito login
    expect(
      new AWS.CognitoIdentityServiceProvider().adminInitiateAuth
    ).toHaveBeenCalledWith({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: expect.any(String),
      UserPoolId: expect.any(String),
      AuthParameters: {
        USERNAME: 'testuser',
        PASSWORD: 'password123',
      },
    });

    expect(result).toEqual({
      AuthenticationResult: { AccessToken: 'access-token' },
    });
  });
});
