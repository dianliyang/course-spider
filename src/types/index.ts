export interface Course {
  id: number;
  title: string;
  courseCode: string;
  university: string;
  url: string;
  description: string;
  popularity: number;
  workload: string;
  isHidden: boolean;
  fields: string[];
  semesters: string[];
  level?: string;
  corequisites?: string;
  enrolled?: boolean;
  status?: string;
  progress?: number;
}

export interface University {
  name: string;
  count: number;
}

export interface Field {
  name: string;
  count: number;
}
