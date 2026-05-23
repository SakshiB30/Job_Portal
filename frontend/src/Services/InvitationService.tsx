import { getItem, setItem } from "./LocalStorageService";

// Key pattern: invitedCandidates:{jobId}
const getInviteKey = (jobId: string | number) => `invitedCandidates:${jobId}`;

export type InvitedStudent = {
  id: string | number;
  name?: string;
  role?: string;
  company?: string;
  topSkills?: string[];
  about?: string;
  expectedCtc?: string;
  location?: string;
  email?: string;
  image?: string;
  invitedAt?: string;
};

export const inviteStudent = (jobId: string | number, student: InvitedStudent) => {
  const key = getInviteKey(jobId);
  const invites: InvitedStudent[] = getItem(key) || [];
  const alreadyInvited = invites.some((inv) => String(inv.id) === String(student.id));
  if (!alreadyInvited) {
    setItem(key, [
      ...invites,
      { ...student, invitedAt: new Date().toISOString() },
    ]);
  }
};

export const getInvitedStudents = (jobId: string | number): InvitedStudent[] => {
  const key = getInviteKey(jobId);
  return getItem(key) || [];
};

export const removeInvitedStudent = (jobId: string | number, studentId: string | number) => {
  const key = getInviteKey(jobId);
  const invites: InvitedStudent[] = getItem(key) || [];
  setItem(
    key,
    invites.filter((inv) => String(inv.id) !== String(studentId))
  );
};

/** Get all invited students across all jobs of a company (keyed by job ID) */
export const getAllInvitedByCompany = (): Record<string, InvitedStudent[]> => {
  const result: Record<string, InvitedStudent[]> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("invitedCandidates:")) {
      const jobId = key.replace("invitedCandidates:", "");
      result[jobId] = getItem(key) || [];
    }
  }
  return result;
};
