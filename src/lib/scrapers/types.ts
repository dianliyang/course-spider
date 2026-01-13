export interface Course {
  university: string;
  courseCode: string;
  title: string;
  units?: string;
  description?: string;
  details?: Record<string, unknown>;
  popularity?: number;
  field?: string;
  timeCommitment?: string;
  isHidden?: boolean;
}
