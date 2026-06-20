import { useEffect, useState } from "react";
import {
  IconSearch,
  IconX,
  IconCalendarEvent,
  IconStar,
  IconStarFilled,
  IconEye,
  IconUserCheck,
  IconUserX,
  IconUsers,
  IconClock,
  IconCheck,
  IconX as IconXMark,
  IconUserCircle,
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { isCompany } from "../Services/RoleService";
import type { RootState } from "../Types";
import axios from "axios";
import AnimatedSection from "../Components/AnimatedSection";
import ScheduleInterviewModal from "../Components/ScheduleInterviewModal";

const API = "http://localhost:8080";

// Reuse the service function for consistency
import { updateApplicationStatus as serviceUpdateStatus } from "../Services/JobService";

type Applicant = {
  applicantId?: number;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  coverLetter?: string;
  applicationStatus?: string;
  applicantDate?: string;
};

type Job = {
  id?: number;
  _id?: number;
  jobId?: number;
  jobTitle?: string;
  company?: string;
  applicants?: Applicant[];
  jobStatus?: string;
};

const STAGES = [
  { key: "APPLIED", label: "Applied", icon: <IconClock size={14} />, color: "text-blue-400", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { key: "SHORTLISTED", label: "Shortlisted", icon: <IconStarFilled size={14} />, color: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { key: "INTERVIEWING", label: "Interview", icon: <IconCalendarEvent size={14} />, color: "text-yellow-400", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { key: "OFFERED", label: "Offered", icon: <IconCheck size={14} />, color: "text-orange-400", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { key: "ACCEPTED", label: "Hired", icon: <IconUserCheck size={14} />, color: "text-green-400", badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  { key: "REJECTED", label: "Rejected", icon: <IconUserX size={14} />, color: "text-red-400", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
];

const getMatchBadge = (applicant: Applicant) => {
  const hash = (applicant.name || applicant.email || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const score = 60 + (hash % 35);
  if (score >= 85) return { label: `${score}% Match`, className: "match-high" };
  if (score >= 70) return { label: `${score}% Match`, className: "match-medium" };
  return { label: `${score}% Match`, className: "match-low" };
};

const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const getStatusActions = (status: string) => {
  switch (status) {
    case "APPLIED":
      return [{ label: "Shortlist", icon: <IconStar size={14} />, action: "SHORTLISTED", color: "text-cyan-400 hover:bg-cyan-500/10" }];
    case "SHORTLISTED":
      return [
        { label: "Schedule Interview", icon: <IconCalendarEvent size={14} />, action: "INTERVIEW", color: "text-yellow-400 hover:bg-yellow-500/10" },
        { label: "Reject", icon: <IconUserX size={14} />, action: "REJECTED", color: "text-red-400 hover:bg-red-500/10" },
      ];
    case "INTERVIEWING":
      return [
        { label: "Offer", icon: <IconCheck size={14} />, action: "OFFERED", color: "text-orange-400 hover:bg-orange-500/10" },
        { label: "Reject", icon: <IconUserX size={14} />, action: "REJECTED", color: "text-red-400 hover:bg-red-500/10" },
      ];
    case "OFFERED":
      return [
        { label: "Hire", icon: <IconUserCheck size={14} />, action: "ACCEPTED", color: "text-green-400 hover:bg-green-500/10" },
      ];
    default:
      return [];
  }
};

const ApplicantsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [interviewModalApplicant, setInterviewModalApplicant] = useState<any | null>(null);

  useEffect(() => {
    axios
      .get(`${API}/jobs/my`)
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!isCompany(user)) return <Navigate to="/find-jobs" replace />;

  const allApplicants = jobs.flatMap((job) =>
    (job.applicants || []).map((a) => ({ ...a, _jobTitle: job.jobTitle, _jobId: job.id ?? job._id ?? job.jobId }))
  );

  const filtered = allApplicants.filter((a) => {
    if (selectedJob !== "all" && a._jobId !== selectedJob) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (a.name || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  const handleStatusUpdate = async (applicant: any, newStatus: string) => {
    const key = `${applicant._jobId}_${applicant.applicantId || applicant.email}`;
    setUpdatingId(key);
    try {
      await serviceUpdateStatus(
        applicant._jobId,
        applicant.applicantId || applicant.email,
        newStatus as any
      );
      const updated = jobs.map((job) => {
        const jId = job.id ?? job._id ?? job.jobId;
        if (jId === applicant._jobId) {
          return {
            ...job,
            applicants: (job.applicants || []).map((a) =>
              (a.applicantId === applicant.applicantId || a.email === applicant.email)
                ? { ...a, applicationStatus: newStatus }
                : a
            ),
          };
        }
        return job;
      });
      setJobs(updated);
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  };

  const getApplicantsByStage = (stage: string) =>
    filtered.filter((a) => (a.applicationStatus || "APPLIED") === stage);

  const totalApplicants = filtered.length;

  return (
    <div className="site-page animate-fade-in">
      <div className="site-container">
        <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/25">
              <IconUsers size={22} className="text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold">Applicants</div>
              <div className="text-sm text-mine-shaft-300">
                {totalApplicants} candidate{totalApplicants !== 1 ? "s" : ""} across {jobs.length} job{ jobs.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mine-shaft-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/60 py-2.5 pl-9 pr-4 text-sm text-mine-shaft-100 placeholder:text-mine-shaft-500 focus:border-bright-sun-400/50 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mine-shaft-400 hover:text-mine-shaft-200">
                <IconX size={14} />
              </button>
            )}
          </div>

          <select
            value={selectedJob as string}
            onChange={(e) => setSelectedJob(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/60 px-3 py-2.5 text-sm text-mine-shaft-100 focus:border-bright-sun-400/50 focus:outline-none"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id ?? job._id ?? job.jobId} value={job.id ?? job._id ?? job.jobId}>
                {job.jobTitle}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/60 p-4">
                <div className="mb-3 h-5 w-28 rounded bg-mine-shaft-800" />
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-mine-shaft-800/50" />
                  <div className="h-16 rounded-lg bg-mine-shaft-800/50" />
                  <div className="h-16 rounded-lg bg-mine-shaft-800/50" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-ats mt-8 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mine-shaft-800/60 mb-4">
              <IconUsers size={30} className="text-mine-shaft-500" />
            </div>
            <h3 className="text-lg font-semibold text-mine-shaft-200 mb-2">No applicants found</h3>
            <p className="text-sm text-mine-shaft-400 max-w-md mb-5">
              {searchQuery
                ? "No applicants match your search. Try different keywords."
                : "When candidates start applying to your jobs, they will appear here in the pipeline."}
            </p>
            {!searchQuery && (
              <Link to="/post-job">
                <button className="rounded-lg bg-bright-sun-400 px-5 py-2.5 text-sm font-semibold text-mine-shaft-950 transition-all hover:bg-bright-sun-300">
                  Post a Job
                </button>
              </Link>
            )}
          </div>
        ) : (
          <AnimatedSection animation="fade-in" className="mt-6 overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: `${STAGES.length * 260}px` }}>
              {STAGES.map((stage) => {
                const stageApplicants = getApplicantsByStage(stage.key);
                return (
                  <div key={stage.key} className="kanban-column flex-1 min-w-[240px] w-[260px]">
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className={`flex items-center gap-2 text-sm font-semibold ${stage.color}`}>
                        {stage.icon}
                        {stage.label}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stage.badge}`}>
                        {stageApplicants.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      {stageApplicants.map((applicant, i) => {
                        const match = getMatchBadge(applicant);
                        const actions = getStatusActions(stage.key);
                        const key = `${applicant._jobId}_${applicant.applicantId || applicant.email}_${i}`;
                        const isUpdating = updatingId === `${applicant._jobId}_${applicant.applicantId || applicant.email}`;
                        return (                <div
              key={key}
              className="kanban-card animate-scale-in group"
              style={{ animationDelay: `${i * 40}ms` }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bright-sun-400/10 text-bright-sun-400 text-sm font-bold border border-bright-sun-400/20">
                                {getInitials(applicant.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-mine-shaft-100 truncate">
                                    {applicant.name || "Unknown"}
                                  </span>
                                </div>
                                <div className="text-xs text-mine-shaft-400 truncate mt-0.5">
                                  {applicant.email}
                                </div>
                                <div className="text-[11px] text-mine-shaft-500 truncate mt-0.5">
                                  {applicant._jobTitle}
                                </div>
                              </div>
                            </div>

                            <div className="mt-2.5 flex items-center gap-2">
                              <span className={`badge-ats ${match.className}`}>
                                {match.label}
                              </span>
                              <button
                                onClick={() => setSelectedApplicant(applicant)}
                                className="badge-ats bg-mine-shaft-800/60 text-mine-shaft-300 border border-mine-shaft-700/60 hover:bg-mine-shaft-700/60 transition-colors flex items-center gap-1"
                              >
                                <IconEye size={12} /> View
                              </button>
                            </div>

                            {actions.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {actions.map((act) => (
                                  <button
                                    key={act.action}
                                    onClick={() => {
                                      if (act.action === "INTERVIEW") {
                                        setInterviewModalApplicant(applicant);
                                      } else {
                                        handleStatusUpdate(applicant, act.action);
                                      }
                                    }}
                                    disabled={isUpdating}
                                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium border border-transparent transition-all ${act.color} ${
                                      isUpdating ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {act.icon} {act.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
        </AnimatedSection>
        )}

        <ScheduleInterviewModal
          opened={!!interviewModalApplicant}
          onClose={() => setInterviewModalApplicant(null)}
          jobId={interviewModalApplicant?._jobId}
          applicantId={interviewModalApplicant?.applicantId}
          applicantName={interviewModalApplicant?.name || ""}
          jobTitle={interviewModalApplicant?._jobTitle || ""}
          onSuccess={() => {
            // Refresh the local state to show updated status
            setInterviewModalApplicant(null);
            window.location.reload();
          }}
        />

        {selectedApplicant && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setSelectedApplicant(null)}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-mine-shaft-800/80 bg-mine-shaft-900/95 backdrop-blur-md p-6 shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bright-sun-400/10 text-bright-sun-400 text-lg font-bold border border-bright-sun-400/20">
                    {getInitials(selectedApplicant.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-mine-shaft-100">{selectedApplicant.name || "Unknown"}</div>
                    <div className="text-xs text-mine-shaft-400">{selectedApplicant.email}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedApplicant(null)} className="text-mine-shaft-400 hover:text-mine-shaft-200 transition-colors">
                  <IconXMark size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                {selectedApplicant.phone && (
                  <div className="flex items-center gap-2 text-mine-shaft-300">
                    <span className="text-mine-shaft-500 w-20">Phone</span>
                    {selectedApplicant.phone}
                  </div>
                )}
                {selectedApplicant.website && (
                  <div className="flex items-center gap-2 text-mine-shaft-300">
                    <span className="text-mine-shaft-500 w-20">Website</span>
                    <a href={selectedApplicant.website} target="_blank" rel="noreferrer" className="text-bright-sun-400 hover:underline truncate">
                      {selectedApplicant.website}
                    </a>
                  </div>
                )}
                {selectedApplicant.coverLetter && (
                  <div>
                    <div className="text-mine-shaft-500 text-xs mb-1">Cover Letter</div>
                    <div className="rounded-lg bg-mine-shaft-950/50 p-3 text-mine-shaft-300 text-xs leading-relaxed max-h-[150px] overflow-y-auto">
                      {selectedApplicant.coverLetter}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-mine-shaft-300">
                  <span className="text-mine-shaft-500 w-20">Status</span>
                  <span className="badge-ats bg-bright-sun-400/10 text-bright-sun-400 border border-bright-sun-400/20">
                    {selectedApplicant.applicationStatus || "APPLIED"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-mine-shaft-800/60 pt-4">
                {selectedApplicant.applicantId && (
                  <Link
                    to={`/talent-profile/${selectedApplicant.applicantId}`}
                    className="flex items-center gap-1.5 rounded-lg bg-bright-sun-400 px-4 py-2 text-xs font-semibold text-mine-shaft-950 transition-all hover:bg-bright-sun-300"
                  >
                    <IconUserCircle size={14} /> View Full Profile
                  </Link>
                )}
                <button className="flex items-center gap-1.5 rounded-lg border border-mine-shaft-700 px-4 py-2 text-xs font-semibold text-mine-shaft-100 transition-all hover:bg-mine-shaft-800/60">
                  <IconCalendarEvent size={14} /> Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsPage;
