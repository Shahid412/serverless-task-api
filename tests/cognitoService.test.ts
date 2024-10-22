// // src/tests/cognitoService.test.ts
// import { registerUser, loginUser } from '../src/services/cognitoService';
// import AWS from 'aws-sdk';

// const USER_POOL_ID = process.env.USER_POOL_ID || 'eu-north-1_ulBNaZw2c';
// const CLIENT_ID = process.env.CLIENT_ID || '603flp00erns7drshfc1n397at';

// // Mocking AWS SDK
// jest.mock('aws-sdk');

// describe('Cognito Service', () => {
//   const mockSignUp = jest.fn() as jest.Mock;
//   const mockAdminInitiateAuth = jest.fn() as jest.Mock;

//   beforeEach(() => {
//     (
//       AWS.CognitoIdentityServiceProvider.prototype.constructor as jest.Mock
//     ).mockImplementation(() => ({
//       signUp: mockSignUp,
//       adminInitiateAuth: mockAdminInitiateAuth,
//     }));
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test('registerUser should call signUp with correct parameters', async () => {
//     const username = 'testuser';
//     const password = 'Test@123';
//     const email = 'test@example.com';
//     console.log('IDs:', CLIENT_ID, USER_POOL_ID);
//     mockSignUp.mockReturnValueOnce({
//       promise: jest.fn().mockResolvedValue({ UserSub: 'unique-user-id' }),
//     });

//     await registerUser(username, password, email);

//     expect(mockSignUp).toHaveBeenCalledWith({
//       ClientId: CLIENT_ID,
//       Username: username,
//       Password: password,
//       UserAttributes: [
//         {
//           Name: 'email',
//           Value: email,
//         },
//       ],
//     });
//   });

//   test('loginUser should call adminInitiateAuth with correct parameters', async () => {
//     const username = 'testuser';
//     const password = 'Test@123';

//     mockAdminInitiateAuth.mockReturnValueOnce({
//       promise: jest.fn().mockResolvedValue({}),
//     });

//     await loginUser(username, password);

//     expect(mockAdminInitiateAuth).toHaveBeenCalledWith({
//       AuthFlow: 'ADMIN_NO_SRP_AUTH',
//       ClientId: CLIENT_ID,
//       UserPoolId: USER_POOL_ID,
//       AuthParameters: {
//         USERNAME: username,
//         PASSWORD: password,
//       },
//     });
//   });

//   test('registerUser should throw an error if signUp fails', async () => {
//     mockSignUp.mockReturnValueOnce({
//       promise: jest.fn().mockRejectedValue(new Error('Signup failed')),
//     });

//     await expect(registerUser('user', 'password', 'email')).rejects.toThrow(
//       'Signup failed'
//     );
//   });

//   test('loginUser should throw an error if adminInitiateAuth fails', async () => {
//     mockAdminInitiateAuth.mockReturnValueOnce({
//       promise: jest.fn().mockRejectedValue(new Error('Login failed')),
//     });

//     await expect(loginUser('user', 'password')).rejects.toThrow('Login failed');
//   });
// });

// src/tests/cognitoService.test.ts
import { registerUser, loginUser } from '../src/services/cognitoService';
import AWS from 'aws-sdk';

// Define constants for User Pool and Client IDs
const USER_POOL_ID = process.env.USER_POOL_ID || 'eu-north-1_ulBNaZw2c';
const CLIENT_ID = process.env.CLIENT_ID || '603flp00erns7drshfc1n397at';

// Mocking AWS SDK
jest.mock('aws-sdk');

describe('Cognito Service', () => {
  const mockSignUp = jest.fn();
  const mockAdminInitiateAuth = jest.fn();

  beforeEach(() => {
    // Mock implementation of CognitoIdentityServiceProvider
    (
      AWS.CognitoIdentityServiceProvider as unknown as jest.Mock
    ).mockImplementation(() => ({
      signUp: mockSignUp,
      adminInitiateAuth: mockAdminInitiateAuth,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('registerUser should call signUp with correct parameters', async () => {
    const username = 'testuser';
    const password = 'Test@123';
    const email = 'test@example.com';

    // Mocking the response for signUp
    mockSignUp.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({ UserSub: 'unique-user-id' }),
    });

    await registerUser(username, password, email);

    expect(mockSignUp).toHaveBeenCalledWith({
      ClientId: CLIENT_ID,
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

    // Mocking the response for adminInitiateAuth
    mockAdminInitiateAuth.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({}),
    });

    await loginUser(username, password);

    expect(mockAdminInitiateAuth).toHaveBeenCalledWith({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: CLIENT_ID,
      UserPoolId: USER_POOL_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });
  });

  test('registerUser should throw an error if signUp fails', async () => {
    mockSignUp.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('Signup failed')),
    });

    await expect(registerUser('user', 'password', 'email')).rejects.toThrow(
      'Signup failed'
    );
  });

  test('loginUser should throw an error if adminInitiateAuth fails', async () => {
    mockAdminInitiateAuth.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('Login failed')),
    });

    await expect(loginUser('user', 'password')).rejects.toThrow('Login failed');
  });
});
