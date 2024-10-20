// src/handlers/auth.ts
import { APIGatewayEvent, Context } from 'aws-lambda';
import { registerUser, loginUser } from '../services/cognitoService';

export const register = async (event: APIGatewayEvent, context: Context) => {
  const { username, password, email } = JSON.parse(event.body || '{}');

  console.log('Received register request:', { username, email });

  try {
    const result = await registerUser(username, password, email);
    console.log('User registration successful:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Signup successful', data: result }),
    };
  } catch (error: any) {
    console.error('Error during registration:', error);

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message,
        error: error?.message ?? error,
      }),
    };
  }
};

export const login = async (event: APIGatewayEvent, context: Context) => {
  const { username, password } = JSON.parse(event.body || '{}');

  console.log('Received login request:', { username });

  try {
    const result = await loginUser(username, password);
    console.log('User login successful:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login successful', data: result }),
    };
  } catch (error: any) {
    console.error('Error during login:', error);

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message,
        error: error?.message ?? error,
      }),
    };
  }
};
