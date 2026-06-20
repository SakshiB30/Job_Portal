import { useEffect, useState } from "react";
import {
  IconCalendarEvent,
  IconClock,
  IconVideo,
  IconMessage,
  IconMapPin,
  IconCheck,
  IconDotsVertical,
  IconPlus,
  IconSearch,
  IconCalendarDue,
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { isCompany } from "../Services/RoleService";
import type { RootState } from "../Types";
import axios from "axios";
import AnimatedSection from "../Components/AnimatedSection";

const API = "http://localhost:8080";

type Interview = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantId?: number;
  jobTitle: string;
  jobId: number;
  date: string;
  time: string;
  duration: string;
  type: "video" | "phone" | "in-person";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  meetingLink?: string;
  location?: string;
};

const INTERVIEW_TYPES = [
  { key: "all", label: "All Interviews" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const InterviewsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await axios.get(`${API}/jobs/my`);
        const jobs = Array.isArray(res.data) ? res.data : [];
        const allInterviews: Interview[] = [];
        jobs.forEach((job: any) => {
          (job.applicants || []).forEach((app: any) => {
            if (["INTERVIEWING", "OFFERED"].includes(app.applicationStatus || "")) {
              allInterviews.push({
                id: `${job.id || job._id}_${app.applicantId || app.email}`,
                applicantName: app.name || "Unknown",
                applicantEmail: app.email || "",
                applicantId: app.applicantId,
                jobTitle: job.jobTitle || "Untitled",
                jobId: job.id || job._id,
                date: app.interviewDate || new Date().toISOString(),
                time: app.interviewTime || "TBD",
                duration: "45 min",
                type: "video",
                status: "scheduled",
                meetingLink: app.meetingLink,
              });
            }
          });
        });
        setInterviews(allInterviews);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!isCompany(user)) return <Navigate to="/find-jobs" replace />;

  const filtered = interviews.filter((iv) => {
    if (filter !== "all" && iv.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !iv.applicantName.toLowerCase().includes(q) &&
        !iv.jobTitle.toLowerCase().includes(q) &&
        !iv.applicantEmail.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const statusColors: Record<string, string> = {
    scheduled: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    rescheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    video: <IconVideo size={14} />,
    phone: <IconMessage size={14} />,
    "in-person": <IconMapPin size={14} />,
  };

  const upcomingCount = interviews.filter((iv) => iv.status === "scheduled").length;
  const completedCount = interviews.filter((iv) => iv.status === "completed").length;

  return (
    <div className="site-page animate-fade-in">
      <div className="site-container">
        <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/25">
              <IconCalendarEvent size={22} className="text-yellow-400" />
            </div>
          <div>
            <div className="text-2xl font-semibold">Interviews</div>
            <div className="text-sm text-mine-shaft-300">
              {upcomingCount} upcoming · {completedCount} completed
            </div>
          </div>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 rounded-lg bg-bright-sun-400 px-4 py-2.5 text-sm font-semibold text-mine-shaft-950 transition-all hover:bg-bright-sun-300 active:scale-95"
        >
          <IconPlus size={18} /> Schedule Interview
        </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-yellow-400">
              <IconCalendarDue size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider text-mine-shaft-400">Upcoming</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-mine-shaft-50">{upcomingCount}</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-green-400">
              <IconCheck size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider text-mine-shaft-400">Completed</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-mine-shaft-50">{completedCount}</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-blue-400">
              <IconClock size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider text-mine-shaft-400">Total</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-mine-shaft-50">{interviews.length}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mine-shaft-400" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/60 py-2.5 pl-9 pr-4 text-sm text-mine-shaft-100 placeholder:text-mine-shaft-500 focus:border-bright-sun-400/50 focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/40 p-1">
            {INTERVIEW_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === t.key
                    ? "bg-bright-sun-400/10 text-bright-sun-400 border border-bright-sun-400/20"
                    : "text-mine-shaft-400 hover:text-mine-shaft-200 border border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/60 p-5">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-mine-shaft-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-mine-shaft-800" />
                    <div className="h-3 w-32 rounded bg-mine-shaft-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-ats mt-8 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mine-shaft-800/60 mb-4">
              <IconCalendarEvent size={30} className="text-mine-shaft-500" />
            </div>
            <h3 className="text-lg font-semibold text-mine-shaft-200 mb-2">No interviews scheduled</h3>
            <p className="text-sm text-mine-shaft-400 max-w-md mb-5">
              {searchQuery
                ? "No interviews match your search."
                : "When you schedule interviews with candidates, they will appear here."}
            </p>
          </div>
        ) : (
          <AnimatedSection animation="slide-up" className="mt-6 space-y-3">
            {filtered.map((iv) => (
              <div
                key={iv.id}
                className="ats-card p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-up"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bright-sun-400/10 text-bright-sun-400 text-base font-bold border border-bright-sun-400/20">
                    {getInitials(iv.applicantName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-mine-shaft-100">{iv.applicantName}</span>
                      <span className={`badge-ats ${statusColors[iv.status] || ""}`}>
                        {iv.status.charAt(0).toUpperCase() + iv.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-mine-shaft-400 mt-0.5">{iv.jobTitle}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-mine-shaft-500">
                      <span className="flex items-center gap-1">
                        <IconCalendarEvent size={12} />
                        {formatDate(iv.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconClock size={12} />
                        {iv.time} · {iv.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        {typeIcons[iv.type]}
                        {iv.type.charAt(0).toUpperCase() + iv.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {iv.meetingLink && (
                    <a
                      href={iv.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-bright-sun-400 px-3.5 py-2 text-xs font-semibold text-mine-shaft-950 transition-all hover:bg-bright-sun-300"
                    >
                      <IconVideo size={14} /> Join
                    </a>
                  )}

                  <button className="flex items-center gap-1.5 rounded-lg border border-mine-shaft-700/60 px-3.5 py-2 text-xs font-medium text-mine-shaft-300 transition-all hover:bg-mine-shaft-800/60">
                    <IconDotsVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default InterviewsPage;
