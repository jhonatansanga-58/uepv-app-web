import { User } from "./auth";

export interface Student {
  id: number;
  user: User;
  courseParallel?: {
    course: {
      name: string;
    };
    parallel: {
      name: string;
    };
  };
}

export interface Meeting {
  id: number;
  topic: string;
  message: string;
  date: string;
  active: boolean;
  student: Student;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  sendDate: string;
  dueDate: string;
  active: boolean;
  subject?: {
    id: number;
    name: string;
  };
  courseParallel?: {
    course: {
      name: string;
    };
    parallel: {
      name: string;
    };
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  creator: User;
}