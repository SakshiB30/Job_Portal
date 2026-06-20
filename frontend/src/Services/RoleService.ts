import type { UserState } from "../Types";

export const STUDENT_ROLE = "APPLICANT";
export const COMPANY_ROLE = "EMPLOYER";
export const ADMIN_ROLE = "ADMIN";

export const isStudent = (user?: UserState | null) => user?.accountType === STUDENT_ROLE;
export const isCompany = (user?: UserState | null) => user?.accountType === COMPANY_ROLE;
export const isAdmin = (user?: UserState | null) => user?.accountType === ADMIN_ROLE;

export const isCompanyVerified = (user?: UserState | null) =>
  isCompany(user) && user?.companyStatus === "APPROVED";

export const isCompanyPending = (user?: UserState | null) =>
  isCompany(user) && user?.companyStatus === "PENDING";

export const isCompanyRejected = (user?: UserState | null) =>
  isCompany(user) && user?.companyStatus === "REJECTED";

export const getRoleHome = (user?: UserState | null) => {
  if (isAdmin(user)) return "/admin/dashboard";
  if (isCompany(user)) return "/posted-job";
  if (isStudent(user)) return "/find-jobs";
  return "/";
};

export const getRoleLabel = (user?: UserState | null) => {
  if (isCompany(user)) return "Company";
  if (isStudent(user)) return "Student";
  if (isAdmin(user)) return "Admin";
  return "Guest";
};
