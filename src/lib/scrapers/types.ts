export interface Course {
  university: string;
  course_code: string;
  title: string;
  units?: string;
  description?: string;
  details?: Record<string, unknown>;
  popularity?: number;
  field?: string;
  timeCommitment?: string;
  isHidden?: boolean;
}
