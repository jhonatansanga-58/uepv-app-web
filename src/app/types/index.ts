export interface Course {
  id: number;
  name: string;
}

export interface Parallel {
  id: number;
  name: string;
}
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
}

export interface Student {
  id: number;
  cardCode: string;
  courseId: number;
  parallelId: number;
  user: User;
}
