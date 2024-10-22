// src/utils/db.ts

import { DynamoDB } from 'aws-sdk';
import { Task } from '../models/task';

const dynamo = new DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME || 'tasks';

/**
 * Creates a new task in DynamoDB.
 * @param task Task object to create.
 */
export const createTaskInDB = async (task: Task): Promise<void> => {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: TABLE_NAME,
    Item: task,
  };
  await dynamo.put(params).promise();
};

/**
 * Retrieves tasks for a specific user.
 * @param userId User ID to retrieve tasks for.
 * @returns Array of tasks.
 */
export const getTasksFromDB = async (userId: string): Promise<Task[]> => {
  console.log('Getting Tasks From DB...');
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: 'userId', // GSI on UserId
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: {
      ':uid': userId,
    },
  };

  const result = await dynamo.query(params).promise();
  console.log('result', result);
  return result.Items as Task[];
};

/**
 * Updates an existing task in DynamoDB.
 * @param taskId ID of the task to update.
 * @param userId ID of the user owning the task.
 * @param updates Partial task object with fields to update.
 */
export const updateTaskInDB = async (
  taskId: string,
  userId: string,
  updates: Partial<Task>
): Promise<void> => {
  console.log(1);
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  console.log(2);
  Object.keys(updates).forEach((key, index) => {
    updateExpressions.push(`#${key} = :val${index}`);
    expressionAttributeValues[`:val${index}`] = (updates as any)[key];
    expressionAttributeNames[`#${key}`] = key;
  });

  console.log(3);
  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: TABLE_NAME,
    Key: {
      taskId: taskId,
      userId: userId,
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
  };

  console.log('updateTaskInDB params:', params);
  await dynamo.update(params).promise();
};

/**
 * Deletes a task from DynamoDB.
 * @param taskId ID of the task to delete.
 * @param userId ID of the user owning the task.
 */
export const deleteTaskFromDB = async (
  taskId: string,
  userId: string
): Promise<void> => {
  const params: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: TABLE_NAME,
    Key: {
      taskId: taskId,
      userId: userId,
    },
  };
  await dynamo.delete(params).promise();
};

/**
 * Retrieves a single task by ID and User ID.
 * @param taskId ID of the task.
 * @param userId ID of the user.
 * @returns The task if found, else null.
 */
export const getTaskById = async (
  taskId: string,
  userId: string
): Promise<Task | null> => {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: TABLE_NAME,
    Key: {
      taskId: taskId,
      userId: userId,
    },
  };
  const result = await dynamo.get(params).promise();
  return (result.Item as Task) || null;
};
