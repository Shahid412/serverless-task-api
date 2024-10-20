// src/tests/auth.test.ts
import { registerUser, loginUser } from '../../../src/services/cognitoService';
import AWS from 'aws-sdk';
import { mocked } from 'jest-mock';

// Mocking AWS SDK
jest.mock('aws-sdk');

const userPoolId: string = process.env.USER_POOL_ID || '';
const clientId: string = process.env.CLIENT_ID || '';
describe('Cognito Service', () => {
  const mockSignUp = jest.fn();
  const mockAdminInitiateAuth = jest.fn();
  const cognitoMock = {
    signUp: mockSignUp,
    adminInitiateAuth: mockAdminInitiateAuth,
  };

  beforeEach(() => {
    mocked(
      AWS.CognitoIdentityServiceProvider.prototype
      // @ts-ignore
    ).constructor.mockReturnValue(cognitoMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('registerUser should call signUp with correct parameters', async () => {
    const username = 'testuser';
    const password = 'Test@123';
    const email = 'test@example.com';

    mockSignUp.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({}),
    });

    await registerUser(username, password, email);

    expect(mockSignUp).toHaveBeenCalledWith({
      ClientId: 'YOUR_COGNITO_CLIENT_ID',
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    });
  });

  test('loginUser should call adminInitiateAuth with correct parameters', async () => {
    const username = 'testuser';
    const password = 'Test@123';

    mockAdminInitiateAuth.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({}),
    });

    await loginUser(username, password);

    expect(mockAdminInitiateAuth).toHaveBeenCalledWith({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: 'YOUR_COGNITO_CLIENT_ID',
      UserPoolId: 'YOUR_USER_POOL_ID',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });
  });

  test('registerUser should throw an error if signUp fails', async () => {
    mockSignUp.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('Signup error')),
    });

    await expect(registerUser('user', 'password', 'email')).rejects.toThrow(
      'Signup error'
    );
  });

  test('loginUser should throw an error if adminInitiateAuth fails', async () => {
    mockAdminInitiateAuth.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('Login error')),
    });

    await expect(loginUser('user', 'password')).rejects.toThrow('Login error');
  });
});
