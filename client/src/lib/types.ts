import { z } from "zod";

export const importanceLevels = ["Low", "Med", "High", "Very High"] as const;

export const taskSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  deadlineDate: z.string(),
  deadlineTime: z.string(),
  estimatedTimeTaken: z.coerce.number().min(0.5),
  minChunk: z.coerce.number().min(0.5),
  group: z.string(),
  importance: z.enum(importanceLevels),
});

export const settingsSchema = z.object({
  blockOutTimings: z.array(
    z.object({
      from: z.string().min(1, "Start time required"),
      to: z.string().min(1, "End time required"),
      label: z.string().optional(),
      day: z.string().optional(),
    })
  ),
  url: z.string(),
  groups: z.array(
    z.object({
      name: z.string().min(1, "Group name required"),
      color: z.string(),
    })
  ),
  firstSundayOfSem: z.string().min(1, "First Sunday of Sem required"),
});

export const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export interface Lesson {
  moduleCode: string;
  lessonType: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  weeks: Array<number>; // Array of week numbers (1-13)
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

// Base Task Interface (for outstanding/completed tasks)
export interface Task {
  _id: string; // Optional for new objects before saving
  name: string;
  description: string;
  deadlineDate: string;
  deadlineTime: string;
  estimatedTimeTaken: number;
  minChunk: number;
  importance: "Low" | "Med" | "High" | "Very High";
  group: string;
}

// Scheduled Task Interface (extends base Task)
export interface ScheduledTask extends Task {
  day: number; // 0-6 (Sunday-Saturday)
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
}

// Main User Tasks Document
export interface UserTasks {
  _id: string; // Optional for new objects
  userId: string; // Or mongoose.Types.ObjectId if you want to keep ObjectID type
  outstandingTasks: Task[];
  completedTasks: Task[];
  scheduledTasks: ScheduledTask[];
}

export const FriendForm = z.object({
  email: z.string().min(1),
});

export interface FriendRequest {
  _id: string;
  requester: {
    _id: string;
    email: string;
    name: string;
  };
  recipient: {
    _id: string;
    email: string;
    name: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
};

export interface dashboardData {
  userId: string;
  url: string;
  blockOutTimings: any[];
  lessons: Lesson[];
  firstSundayOfSem: string;
  freeTimeSlots: any[];
  groups: any[];
}