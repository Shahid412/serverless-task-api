// src/tests/auth.integration.test.ts
import { APIGatewayEvent } from 'aws-lambda';
import { register, login } from '../../src/handlers/auth';
import AWS from 'aws-sdk';
import { mocked } from 'jest-mock';

jest.mock('aws-sdk');

describe('Auth Handler Integration Tests', () => {
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

  test('POST /register should register a user', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        username: 'testuser',
        password: 'Test@123',
        email: 'test@example.com',
      }),
    } as any;

    mockSignUp.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({}),
    });

    const response = await register(event, {} as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Signup successful');
  });

  test('POST /login should authenticate a user', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        username: 'testuser',
        password: 'Test@123',
      }),
    } as any;

    mockAdminInitiateAuth.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({}),
    });

    const response = await login(event, {} as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Login successful');
  });
});
