"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/tests/auth.test.ts
const cognitoService_1 = require("../../../src/services/cognitoService");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const jest_mock_1 = require("jest-mock");
// Mocking AWS SDK
jest.mock('aws-sdk');
const userPoolId = process.env.USER_POOL_ID || '';
const clientId = process.env.CLIENT_ID || '';
describe('Cognito Service', () => {
    const mockSignUp = jest.fn();
    const mockAdminInitiateAuth = jest.fn();
    const cognitoMock = {
        signUp: mockSignUp,
        adminInitiateAuth: mockAdminInitiateAuth,
    };
    beforeEach(() => {
        (0, jest_mock_1.mocked)(aws_sdk_1.default.CognitoIdentityServiceProvider.prototype
        // @ts-ignore
        ).constructor.mockReturnValue(cognitoMock);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('registerUser should call signUp with correct parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const username = 'testuser';
        const password = 'Test@123';
        const email = 'test@example.com';
        mockSignUp.mockReturnValueOnce({
            promise: jest.fn().mockResolvedValue({}),
        });
        yield (0, cognitoService_1.registerUser)(username, password, email);
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
    }));
    test('loginUser should call adminInitiateAuth with correct parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const username = 'testuser';
        const password = 'Test@123';
        mockAdminInitiateAuth.mockReturnValueOnce({
            promise: jest.fn().mockResolvedValue({}),
        });
        yield (0, cognitoService_1.loginUser)(username, password);
        expect(mockAdminInitiateAuth).toHaveBeenCalledWith({
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            ClientId: 'YOUR_COGNITO_CLIENT_ID',
            UserPoolId: 'YOUR_USER_POOL_ID',
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        });
    }));
    test('registerUser should throw an error if signUp fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockSignUp.mockReturnValueOnce({
            promise: jest.fn().mockRejectedValue(new Error('Signup error')),
        });
        yield expect((0, cognitoService_1.registerUser)('user', 'password', 'email')).rejects.toThrow('Signup error');
    }));
    test('loginUser should throw an error if adminInitiateAuth fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockAdminInitiateAuth.mockReturnValueOnce({
            promise: jest.fn().mockRejectedValue(new Error('Login error')),
        });
        yield expect((0, cognitoService_1.loginUser)('user', 'password')).rejects.toThrow('Login error');
    }));
});
