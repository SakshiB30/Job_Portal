import type { UserState } from "../Types";

export const STUDENT_ROLE = "APPLICANT";
export const COMPANY_ROLE = "EMPLOYER";

export const isStudent = (user?: UserState | null) => user?.accountType === STUDENT_ROLE;
export const isCompany = (user?: UserState | null) => user?.accountType === COMPANY_ROLE;

export const getRoleHome = (user?: UserState | null) => {
  if (isCompany(user)) return "/posted-job";
  if (isStudent(user)) return "/find-jobs";
  return "/";
};

export const getRoleLabel = (user?: UserState | null) => {
  if (isCompany(user)) return "Company";
  if (isStudent(user)) return "Student";
  return "Guest";
};
