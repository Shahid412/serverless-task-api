// src/models/task.ts

export interface Task {
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}
