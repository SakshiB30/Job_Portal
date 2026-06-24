import type { ProfileState, UserState } from "../Types";

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

/** Profile fields that are required before a company can post jobs */
export const REQUIRED_COMPANY_FIELDS = [
  { key: "company", label: "Company Name", icon: "🏢" },
  { key: "location", label: "Location", icon: "📍" },
  { key: "about", label: "Company Overview", icon: "📝" },
  { key: "industry", label: "Industry", icon: "🏭" },
  { key: "companySize", label: "Company Size", icon: "👥" },
  { key: "portfolio", label: "Website", icon: "🌐" },
  { key: "phone", label: "Contact Phone", icon: "📞" },
] as const;

/**
 * Returns which required company profile fields are missing.
 */
export const getMissingCompanyFields = (profile: ProfileState | null): string[] => {
  if (!profile) return REQUIRED_COMPANY_FIELDS.map((f) => f.key);
  return REQUIRED_COMPANY_FIELDS
    .filter(({ key }) => !profile[key as keyof ProfileState] || String(profile[key as keyof ProfileState]).trim() === "")
    .map(({ key }) => key);
};

/**
 * Returns true when all required company profile fields are filled.
 */
export const isCompanyProfileComplete = (profile: ProfileState | null): boolean => {
  return getMissingCompanyFields(profile).length === 0;
};

/**
 * Returns a percentage (0–100) of how complete the company profile is.
 */
export const getCompanyProfileCompletionPercent = (profile: ProfileState | null): number => {
  if (!profile) return 0;
  const missing = getMissingCompanyFields(profile);
  return Math.round(((REQUIRED_COMPANY_FIELDS.length - missing.length) / REQUIRED_COMPANY_FIELDS.length) * 100);
};

export const getRoleHome = (user?: UserState | null) => {
  if (isAdmin(user)) return "/admin/dashboard";
  if (isCompany(user)) return "/dashboard";
  if (isStudent(user)) return "/find-jobs";
  return "/";
};

export const getRoleLabel = (user?: UserState | null) => {
  if (isCompany(user)) return "Company";
  if (isStudent(user)) return "Student";
  if (isAdmin(user)) return "Admin";
  return "Guest";
};
