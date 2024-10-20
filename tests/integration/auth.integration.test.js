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
const auth_1 = require("../../src/handlers/auth");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const jest_mock_1 = require("jest-mock");
jest.mock('aws-sdk');
describe('Auth Handler Integration Tests', () => {
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
    test('POST /register should register a user', () => __awaiter(void 0, void 0, void 0, function* () {
        const event = {
            body: JSON.stringify({
                username: 'testuser',
                password: 'Test@123',
                email: 'test@example.com',
            }),
        };
        mockSignUp.mockReturnValueOnce({
            promise: jest.fn().mockResolvedValue({}),
        });
        const response = yield (0, auth_1.register)(event, {});
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).message).toBe('Signup successful');
    }));
    test('POST /login should authenticate a user', () => __awaiter(void 0, void 0, void 0, function* () {
        const event = {
            body: JSON.stringify({
                username: 'testuser',
                password: 'Test@123',
            }),
        };
        mockAdminInitiateAuth.mockReturnValueOnce({
            promise: jest.fn().mockResolvedValue({}),
        });
        const response = yield (0, auth_1.login)(event, {});
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).message).toBe('Login successful');
    }));
});
