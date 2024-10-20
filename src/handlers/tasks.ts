// src/handlers/tasks.ts
import { APIGatewayEvent, Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import {
  getTasksFromDB,
  createTaskInDB,
  getTaskById,
  updateTaskInDB,
  deleteTaskFromDB,
} from '../utils/db';
import { getUserId } from '../utils/auth';
import { Task } from '../models/task';

export const get = async (event: APIGatewayEvent) => {
  const token = event.headers.Authorization || event.headers.authorization;

  if (!token) {
    console.log('Missing token!');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Missing token' }),
    };
  }

  try {
    console.log('Getting UserID...');
    const userId = getUserId(event);

    if (!userId) {
      console.log('UserId not found!');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    console.log('Querying user tasks...');
    const tasks = await getTasksFromDB(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ tasks }),
    };
  } catch (error: any) {
    console.error('Get Tasks Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error?.message ?? error,
      }),
    };
  }
};

export const create = async (event: APIGatewayEvent) => {
  const token = event.headers.Authorization || event.headers.authorization;

  if (!token) {
    console.log('Missing token!');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Missing token' }),
    };
  }

  try {
    const userId = getUserId(event);

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    const { title, description, status } = JSON.parse(event.body || '{}');

    if (!title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Title is required.' }),
      };
    }

    const task: Task = {
      TaskId: uuidv4(),
      UserId: userId,
      title,
      description: description || '',
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createTaskInDB(task);

    return {
      statusCode: 201,
      body: JSON.stringify({ task }),
    };
  } catch (error: any) {
    console.error('Create Task Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error?.message ?? error,
      }),
    };
  }
};

export const update = async (event: APIGatewayEvent) => {
  const token = event.headers.Authorization || event.headers.authorization;

  if (!token) {
    console.log('Missing token!');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Missing token' }),
    };
  }

  try {
    const userId = getUserId(event);
    const taskId = event.pathParameters?.taskId;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Task ID is required.' }),
      };
    }

    const existingTask: Task | null = await getTaskById(taskId, userId);

    if (!existingTask) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Task not found.' }),
      };
    }

    const { title, description, status } = JSON.parse(event.body || '{}');

    const updates: Partial<Task> = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) updates.status = status;

    updates.updatedAt = new Date().toISOString();

    await updateTaskInDB(taskId, userId, updates);

    const updatedTask: Task | null = await getTaskById(taskId, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ task: updatedTask }),
    };
  } catch (error: any) {
    console.error('Update Task Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error?.message ?? error,
      }),
    };
  }
};

export const remove = async (event: APIGatewayEvent) => {
  const token = event.headers.Authorization || event.headers.authorization;

  if (!token) {
    console.log('Missing token!');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Missing token' }),
    };
  }
  try {
    const userId = getUserId(event);
    const taskId = event.pathParameters?.taskId;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Task ID is required.' }),
      };
    }

    const existingTask = await getTaskById(taskId, userId);

    if (!existingTask) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Task not found.' }),
      };
    }

    await deleteTaskFromDB(taskId, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Task deleted successfully.' }),
    };
  } catch (error: any) {
    console.error('Delete Task Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error?.message ?? error,
      }),
    };
  }
};
