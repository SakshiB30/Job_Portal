export type UserState = {
  id?: string | number;
  profileId?: string | number;
  name?: string;
  email?: string;
  accountType?: "APPLICANT" | "EMPLOYER" | string;
  savedJobs?: Array<string | number>;
  appliedJobs?: Array<string | number>;
  offeredJobs?: Array<string | number>;
  interviewingJobs?: Array<string | number>;
  rejectedJobs?: Array<string | number>;
  acceptedJobs?: Array<string | number>;
  declinedJobs?: Array<string | number>;
};

export type ProfileState = {
  id?: string | number;
  email?: string;
  name?: string;
  banner?: string;
  picture?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  about?: string;
  phone?: string;
  portfolio?: string;
  resumeHeadline?: string;
  education?: Record<string, string>[];
  projects?: Record<string, string>[];
  achievements?: string[];
  skills?: string[];
  experiences?: Record<string, unknown>[];
  certifications?: Record<string, unknown>[];
  [key: string]: unknown;
};

export type JobItem = {
  id?: string | number;
  _id?: string | number;
  jobId?: string | number;
  jobTitle?: string;
  company?: string;
  experience?: string;
  jobType?: string;
  location?: string;
  packageOffered?: string | number;
  package?: string | number;
  salary?: string | number;
  about?: string;
  description?: string;
  postTime?: string;
  jobStatus?: string;
  applicants?: unknown[] | number;
  saved?: boolean;
  applied?: boolean;
  offered?: boolean;
  interviewing?: boolean;
  rejected?: boolean;
  accepted?: boolean;
  declined?: boolean;
};

export type RootState = {
  user: UserState | null;
  profile: ProfileState;
};
