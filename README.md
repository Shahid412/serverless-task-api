# Serverless Task Management API

A serverless Task Management API built with Node.js (TypeScript) and AWS serverless technologies. The API supports user registration, authentication, and CRUD operations for managing tasks.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register and authenticate users using AWS Cognito.
- **Task Management**: Create, retrieve, update, and delete tasks.
- **Serverless Architecture**: Built with AWS Lambda, API Gateway, and DynamoDB.
- **Infrastructure as Code**: Managed using AWS CDK in TypeScript.
- **Testing**: Comprehensive unit and integration tests using Jest.

## Tech Stack

- **Runtime & Language**: Node.js, TypeScript
- **Serverless Framework**: AWS Lambda
- **API Management**: Amazon API Gateway
- **Authentication**: AWS Cognito
- **Database**: Amazon DynamoDB
- **Infrastructure as Code**: AWS CDK (TypeScript)
- **Testing**: Jest

## Prerequisites

- **Node.js**: v14.x or later
- **npm**: v6.x or later
- **AWS CLI**: Configured with necessary permissions
- **AWS CDK**: Installed globally (`npm install -g aws-cdk`)
- **Docker**: (Optional) For local testing with DynamoDB Local

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/serverless-task-api.git
   cd serverless-task-api

   ```

2. **Install Dependencies**

   ```bash
   npm install

   ```

3. **Build the Project**

   ```bash
   npm run build

   ```

4. **Configure Environment Variables**
   Create a .env file in the root directory and add necessary environment variables:
   ```bash
   # .env
   TABLE_NAME=TasksTable
   USER_POOL_ID=your_cognito_user_pool_id
   CLIENT_ID=your_cognito_app_client_id
   ```
   Note: Sensitive information should be managed securely, possibly using AWS Secrets Manager.

## Deployment

Use the provided deployment script or deploy manually using CDK.

1. **Using Deployment Script**

   ```bash
   ./scripts/deploy.sh

   ```

2. **Manual Deployment**

   ```bash
   npm run build
   npm run deploy
   ```

   The script will:

   • Install dependencies

   • Build the project

   • Deploy the AWS infrastructure using CDK

3. **Post-Deployment**

   After deployment, note the API URL output by CDK. This is your base URL for API endpoints.

## API Endpoints

1. **Register a New User**
   Endpoint: POST /register

   Description: Register a new user.

   Request Body:

   ```bash
   {
   "username": "string",
   "password": "string"
   }
   ```

   Responses:

   • 201 Created: User registered successfully.

   • 400 Bad Request: Validation errors.

   • 500 Internal Server Error: Server error.

2. **User Login**

   Endpoint: POST /login

   Description: Authenticate a user and retrieve tokens.

   Request Body:

   ```bash
   {
   "username": "string",
   "password": "string"
   }
   ```

   Responses:

   • 200 OK: Returns accessToken, idToken, refreshToken, and expiresIn.

   • 400 Bad Request: Validation errors.

   • 401 Unauthorized: Invalid credentials.

   • 500 Internal Server Error: Server error.

3. **Retrieve Tasks**

   Endpoint: GET /tasks

   Description: Retrieve all tasks for the authenticated user.

   Headers:
   Authorization: Bearer <accessToken>

   Responses:

   • 200 OK: Returns a list of tasks.

   • 401 Unauthorized: Missing or invalid token.

   • 500 Internal Server Error: Server error.

4. **Create a New Task**
   Endpoint: POST /tasks

   Description: Create a new task.

   Headers:

   Authorization: Bearer <accessToken>
   Request Body:

   ```bash
   {
   "title": "string",
   "description": "string",
   "status": "pending" | "in-progress" | "completed"
   }
   ```

   Responses:

   • 201 Created: Task created successfully.

   • 400 Bad Request: Validation errors.

   • 401 Unauthorized: Missing or invalid token.

   • 500 Internal Server Error: Server error.

5. **Update an Existing Task**

   Endpoint: PUT /tasks/{taskId}

   Description: Update a task by ID.

   Headers:

   Authorization: Bearer <accessToken>
   Request Body:

   ```bash
   {
   "title": "string",
   "description": "string",
   "status": "pending" | "in-progress" | "completed"
   }
   ```

   Responses:

   • 200 OK: Task updated successfully.

   • 400 Bad Request: Validation errors.

   • 401 Unauthorized: Missing or invalid token.

   • 404 Not Found: Task not found.

   • 500 Internal Server Error: Server error.

6. **Delete a Task**

   Endpoint: DELETE /tasks/{taskId}

   Description: Delete a task by ID.

   Headers:
   Authorization: Bearer <accessToken>

   Responses:

   • 200 OK: Task deleted successfully.

   • 401 Unauthorized: Missing or invalid token.

   • 404 Not Found: Task not found.

   • 500 Internal Server Error: Server error.

## Testing

1. **Run Unit Tests**
   ```bash
   npm test
   ```
2. **Run Tests in Watch Mode**
   ```bash
   npm run test:watch
   ```
3. **Linting and Formatting**

   _Lint Code_

   ```bash
   npm run lint
   ```

   _Format Code_

   ```bash
   npm run format
   ```

## Contributing

Contributions are welcome! Please follow these steps:

Fork the Repository

Create a Feature Branch

    git checkout -b feature/YourFeature
    Commit Your Changes

    git commit -m "Add some feature"
    Push to the Branch

    git push origin feature/YourFeature

Open a Pull Request

## License

This project is licensed under the MIT License.

---
