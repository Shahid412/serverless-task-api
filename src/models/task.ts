// src/models/task.ts

export interface Task {
    TaskId: string;
    UserId: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    createdAt: string;
    updatedAt: string;
  }
  