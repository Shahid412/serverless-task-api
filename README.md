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
- **Task Management**: Create, retrieve, update, and delete tasks (CRUD operations).
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
   TABLE_NAME=tasks
   USER_POOL_ID=your_cognito_user_pool_id
   CLIENT_ID=your_cognito_app_client_id
   ```
   Note: Sensitive information should be managed securely, possibly using AWS Secrets Manager.

## Deployment

The project can be deployed either manually or automatically using a provided script. Both Unix-like (Linux/macOS) and Windows systems are supported. Below are the detailed steps for each approach.

### Prerequisites

- **AWS CLI**: Ensure it's configured with the necessary permissions to deploy resources.
- **AWS CDK**: Install globally by running:

  ```bash
  npm install -g aws-cdk
  ```

### Automated Deployment (Using Script)

For convenience, a deployment script is included to automate the process. The script handles installing dependencies, building the project, and deploying it using AWS CDK.

**Run the deployment script:**

```bash
npm run deploy
```

The script will:

- Install project dependencies (`npm install`).
- Build the project (`npm run build`).
- Bootstrap CDK (`cdk bootstrap aws://{{aws-account-id}}/{{aws-region}}` - needed for first-time deployment): AWS account ID and AWS region to for stack to be deployed to specific account and region
- Deploy the project to AWS (`cdk deploy --app "npx ts-node infrastructure/bin/serverless-task-api.ts"`): Explicitely mention which app to be deployed.
- Once the deployment is complete, the output will display the API - URL that can be used to interact with the endpoints.

### Manual Deployment (Detailed Steps)

If you prefer to deploy manually or run into any issues with the script, follow these steps for both Unix-like systems and Windows.

**Step 1 - Install Dependencies**

Run this command to install all required project dependencies:

```bash
npm install
```

**Step 2 - Build the Project**

Build the TypeScript project before deployment:

```bash
npm run build
```

**Step 3 - Bootstrap the CloudFormation Template**

This command generates the necessary AWS CloudFormation template that will be used to deploy your serverless infrastructure.

```bash
cdk bootstrap aws://{{aws-account-id}}/{{aws-region}}
```

**Step 4 - Deploy the Project Using AWS CDK**

Finally, run the following command to deploy the project to AWS. CDK will create or update all the necessary AWS resources (Lambda, API Gateway, DynamoDB, etc.):

```bash
cdk deploy --app "npx ts-node infrastructure/bin/serverless-task-api.ts"
```

**Post-Deployment**

After deployment, the API URL will be shown in the terminal. Make sure to note this URL as it will be used to interact with your API endpoints.

## API Endpoints

1. **Register a New User**
   Endpoint: POST `/register`

   Description: Register a new user.

   Request Body:

   ```bash
   {
     "email":"string",
     "username": "string",
     "password": "string"
   }
   ```

   Responses:

   • `201 Created`: User registered successfully. (Auto confirms newly created user)

   • `400 Bad Request`: Validation errors.

   • `500 Internal Server Error`: Server error.

2. **User Login**

   Endpoint: POST `/login`

   Description: Authenticate a user and retrieve tokens.

   Request Body:

   ```bash
   {
      "username": "string",
      "password": "string"
   }
   ```

   Responses:

   • `200 OK`: Returns accessToken, idToken, refreshToken, and expiresIn. (idToken to be used in Tasks CRUD APIs)

   • `400 Bad Request`: Validation errors.

   • `401 Unauthorized`: Invalid credentials.

   • `500 Internal Server Error`: Server error.

3. **Retrieve Tasks**

   Endpoint: GET `/tasks`

   Description: Retrieve all tasks for the authenticated user.

   Headers:
   Authorization: `Bearer <accessToken>` (`idToken` received in login response)

   Responses:

   • `200 OK`: Returns a list of tasks.

   • `401 Unauthorized`: Missing or invalid token.

   • `500 Internal Server Error`: Server error.

4. **Create a New Task**
   Endpoint: POST `/tasks`

   Description: Create a new task.

   Headers:

   Authorization: `Bearer <accessToken>` (`idToken` received in login response)
   Request Body:

   ```bash
   {
     "userId": "string",
     "title": "string",
     "description": "string",
     "status": "pending" | "in-progress" | "completed"
   }
   ```

   Responses:

   • `201 Created`: Task created successfully.

   • `400 Bad Request`: Validation errors.

   • `401 Unauthorized`: Missing or invalid token.

   • `500 Internal Server Error`: Server error.

5. **Update an Existing Task**

   Endpoint: PUT `/tasks/{taskId}`

   Description: Update a task by ID.

   Headers:

   Authorization: `Bearer <accessToken>` (`idToken` received in login response)
   Request Body:

   ```bash
   {
     "title": "string",
     "description": "string",
     "status": "pending" | "in-progress" | "completed"
   }
   ```

   Responses:

   • `200 OK`: Task updated successfully.

   • `400 Bad Request`: Validation errors.

   • `401 Unauthorized`: Missing or invalid token.

   • `404 Not Found`: Task not found.

   • `500 Internal Server Error`: Server error.

6. **Delete a Task**

   Endpoint: DELETE `/tasks/{taskId}`

   Description: Delete a task by ID.

   Headers:
   Authorization: `Bearer <accessToken>` (`idToken` received in login response)

   Responses:

   • `200 OK`: Task deleted successfully.

   • `401 Unauthorized`: Missing or invalid token.

   • `404 Not Found`: Task not found.

   • `500 Internal Server Error`: Server error.

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

## Author

Shahid H. - Senior Software Engineer with 5+ years of experience in software development. [GitHub Profile](https://github.com/Shahid412)

---
