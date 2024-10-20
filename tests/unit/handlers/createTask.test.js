"use strict";
// // tests/unit/handlers/createTask.test.ts
// import { handler } from '../../../src/handlers/createTask';
// import { createTaskInDB } from '../../../src/utils/db';
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { mocked } from 'jest-mock';
// jest.mock('../../../src/utils/db');
// const mockCreateTaskInDB = mocked(createTaskInDB, true);
// describe('CreateTask Lambda Function', () => {
//   beforeEach(() => {
//     mockCreateTaskInDB.mockClear();
//   });
//   it('should create a task successfully', async () => {
//     mockCreateTaskInDB.mockResolvedValueOnce();
//     const event: APIGatewayProxyEvent = {
//       body: JSON.stringify({
//         title: 'Test Task',
//         description: 'Test Description',
//         status: 'pending',
//       }),
//       requestContext: {
//         accountId: '123456789012',
//         apiId: 'api-id',
//         authorizer: {
//           claims: {
//             sub: 'user-id-123',
//           },
//         },
//         protocol: 'HTTP/1.1',
//         httpMethod: 'POST',
//         requestId: 'id',
//         requestTimeEpoch: 1234567890,
//         resourceId: 'resource-id',
//         resourcePath: '/tasks',
//         stage: 'prod',
//         identity: {
//           accessKey: null,
//           accountId: '123456789012',
//           apiKey: null,
//           apiKeyId: null,
//           caller: null,
//           cognitoAuthenticationProvider: null,
//           cognitoAuthenticationType: null,
//           cognitoIdentityId: null,
//           cognitoIdentityPoolId: null,
//           sourceIp: '127.0.0.1',
//           user: 'user-id-123',
//           userAgent: 'PostmanRuntime/7.26.8',
//           userArn: null,
//           clientCert: null,
//           principalOrgId: null,
//         },
//         path: '/tasks',
//       },
//       headers: {},
//       multiValueHeaders: {},
//       httpMethod: 'POST',
//       isBase64Encoded: false,
//       path: '/tasks',
//       pathParameters: null,
//       queryStringParameters: null,
//       multiValueQueryStringParameters: null,
//       stageVariables: null,
//       resource: '',
//     };
//     const result = (await handler(
//       event,
//       {} as any,
//       {} as any
//     )) as APIGatewayProxyResult;
//     expect(result.statusCode).toBe(201);
//     const body = JSON.parse(result.body);
//     expect(body.task.title).toBe('Test Task');
//     expect(body.task.UserId).toBe('user-id-123');
//     expect(mockCreateTaskInDB).toHaveBeenCalledTimes(1);
//   });
//   it('should return 400 if title is missing', async () => {
//     const event: APIGatewayProxyEvent = {
//       body: JSON.stringify({
//         description: 'Test Description',
//       }),
//       requestContext: {
//         accountId: '123456789012',
//         apiId: 'api-id',
//         authorizer: {
//           claims: {
//             sub: 'user-id-123',
//           },
//         },
//         protocol: 'HTTP/1.1',
//         httpMethod: 'POST',
//         requestId: 'id',
//         requestTimeEpoch: 1234567890,
//         resourceId: 'resource-id',
//         resourcePath: '/tasks',
//         stage: 'prod',
//         identity: {
//           accessKey: null,
//           accountId: '123456789012',
//           apiKey: null,
//           apiKeyId: null,
//           caller: null,
//           cognitoAuthenticationProvider: null,
//           cognitoAuthenticationType: null,
//           cognitoIdentityId: null,
//           cognitoIdentityPoolId: null,
//           sourceIp: '127.0.0.1',
//           user: 'user-id-123',
//           userAgent: 'PostmanRuntime/7.26.8',
//           userArn: null,
//           clientCert: null,
//           principalOrgId: null,
//         },
//         path: '/tasks',
//       },
//       headers: {},
//       multiValueHeaders: {},
//       httpMethod: 'POST',
//       isBase64Encoded: false,
//       path: '/tasks',
//       pathParameters: null,
//       queryStringParameters: null,
//       multiValueQueryStringParameters: null,
//       stageVariables: null,
//       resource: '',
//     };
//     const result = (await handler(
//       event,
//       {} as any,
//       {} as any
//     )) as APIGatewayProxyResult;
//     expect(result.statusCode).toBe(400);
//     const body = JSON.parse(result.body);
//     expect(body.message).toBe('Title is required.');
//     expect(mockCreateTaskInDB).not.toHaveBeenCalled();
//   });
// });
