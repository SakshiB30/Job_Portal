import {
  IconBriefcase,
  IconChartBar,
  IconEye,
  IconPlus,
  IconUsers,
  IconCalendarEvent,
  IconTrendingUp,
  IconClock,
  IconTarget,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { isCompany } from "../Services/RoleService";
import type { RootState } from "../Types";
import axios from "axios";

type PostedJobItem = {
  id?: string | number;
  _id?: string | number;
  jobId?: string | number;
  jobTitle?: string;
  company?: string;
  jobStatus?: string;
  applicants?: any[];
  [key: string]: unknown;
};

const API = "http://localhost:8080";

const getMyJobs = async (): Promise<PostedJobItem[]> => {
  try {
    const res = await axios.get(`${API}/jobs/my`);
    return res.data || [];
  } catch {
    return [];
  }
};

type DashboardStats = {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  shortlisted: number;
  interviewsScheduled: number;
  offersSent: number;
  hired: number;
};

type ScheduledInterview = {
  id: string;
  talentName: string;
  jobTitle: string;
  scheduledAt: string;
  status: "upcoming" | "completed" | "cancelled";
};

const DashboardPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0, activeJobs: 0, totalApplicants: 0,
    shortlisted: 0, interviewsScheduled: 0, offersSent: 0, hired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);

  useEffect(() => {
    getMyJobs().then((jobList) => {
      const activeJobs = jobList.filter((j) => (j?.jobStatus || "OPEN") === "OPEN");
      let totalApplicants = 0, shortlisted = 0, interviews = 0, offers = 0, hired = 0;
      let upcomingInterviews: ScheduledInterview[] = [];
      
      activeJobs.forEach((job) => {
        const applicants = job.applicants;
        if (Array.isArray(applicants)) {
          totalApplicants += applicants.length;
          shortlisted += applicants.filter((a: any) =>
            ["SHORTLISTED", "INTERVIEWING", "OFFERED", "ACCEPTED"].includes(a?.applicationStatus)
          ).length;
          interviews += applicants.filter((a: any) => a?.applicationStatus === "INTERVIEWING").length;
          offers += applicants.filter((a: any) => a?.applicationStatus === "OFFERED").length;
          hired += applicants.filter((a: any) => a?.applicationStatus === "ACCEPTED").length;
        }
      });

      // Load scheduled interviews from localStorage
      const storedInterviews = localStorage.getItem(`scheduledInterviews:${user?.id || "guest"}`);
      if (storedInterviews) {
        try {
          const parsed = JSON.parse(storedInterviews);
          upcomingInterviews = parsed.slice(0, 5); // Show only first 5
        } catch (e) {
          console.error("Failed to parse interviews:", e);
        }
      }

      setScheduledInterviews(upcomingInterviews);
      setStats({
        totalJobs: jobList.length, activeJobs: activeJobs.length,
        totalApplicants, shortlisted, interviewsScheduled: interviews,
        offersSent: offers, hired,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isCompany(user)) return <Navigate to="/find-jobs" replace />;

  const maxVal = Math.max(stats.totalApplicants, stats.shortlisted, stats.interviewsScheduled, stats.offersSent, stats.hired, 1);

  // Calculate conversion rates
  const conversionRates = {
    applied_to_shortlisted: stats.totalApplicants > 0 ? Math.round((stats.shortlisted / stats.totalApplicants) * 100) : 0,
    shortlisted_to_interviewed: stats.shortlisted > 0 ? Math.round((stats.interviewsScheduled / stats.shortlisted) * 100) : 0,
    interviewed_to_offered: stats.interviewsScheduled > 0 ? Math.round((stats.offersSent / stats.interviewsScheduled) * 100) : 0,
    offered_to_hired: stats.offersSent > 0 ? Math.round((stats.hired / stats.offersSent) * 100) : 0,
  };

  const statCards = [
    { label: "Total Jobs", value: stats.totalJobs, icon: <IconBriefcase size={22} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Active Jobs", value: stats.activeJobs, icon: <IconEye size={22} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Applicants", value: stats.totalApplicants, icon: <IconUsers size={22} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Shortlisted", value: stats.shortlisted, icon: <IconTarget size={22} />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { label: "Interviews", value: stats.interviewsScheduled, icon: <IconCalendarEvent size={22} />, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { label: "Offers Sent", value: stats.offersSent, icon: <IconTrendingUp size={22} />, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ];

  const funnelStages = [
    { label: "Applied", value: stats.totalApplicants, color: "bg-blue-500", textColor: "text-blue-300" },
    { label: "Shortlisted", value: stats.shortlisted, color: "bg-cyan-500", textColor: "text-cyan-300" },
    { label: "Interviewed", value: stats.interviewsScheduled, color: "bg-yellow-500", textColor: "text-yellow-300" },
    { label: "Offered", value: stats.offersSent, color: "bg-orange-500", textColor: "text-orange-300" },
    { label: "Hired", value: stats.hired, color: "bg-green-500", textColor: "text-green-300" },
  ];

  return (
    <div className="site-page animate-fade-in">
      <div className="site-container">
        <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bright-sun-400/10 border border-bright-sun-400/25">
              <IconChartBar size={22} className="text-bright-sun-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold">Dashboard</div>
              <div className="text-sm text-mine-shaft-300">Welcome back, {profile?.company || user?.name || "Recruiter"}</div>
            </div>
          </div>
          <Link to="/post-job">
            <button className="flex items-center gap-2 rounded-lg bg-bright-sun-400 px-4 py-2.5 text-sm font-semibold text-mine-shaft-950 transition-all hover:bg-bright-sun-300 active:scale-95">
              <IconPlus size={18} /> Post New Job
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="site-section-gap grid grid-cols-2 site-grid-gap md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/60 p-4">
                <div className="mb-2 h-4 w-20 rounded bg-mine-shaft-800" />
                <div className="h-8 w-16 rounded bg-mine-shaft-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="site-section-gap grid grid-cols-2 site-grid-gap md:grid-cols-3 lg:grid-cols-6">
            {statCards.map((card, i) => (
              <div key={i} className="stat-card group animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-mine-shaft-400 uppercase tracking-wider">{card.label}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg} ${card.border} border ${card.color}`}>{card.icon}</div>
                </div>
                <div className="mt-3 text-2xl font-bold text-mine-shaft-50">{card.value}</div>
                <div className="mt-1 h-1 w-full rounded-full bg-mine-shaft-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${card.color.replace("text", "bg")}`}
                    style={{ width: `${stats.totalJobs > 0 ? Math.min(100, (card.value / Math.max(...statCards.map(c => c.value || 1))) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bright-sun-400/10 border border-bright-sun-400/20">
              <IconTrendingUp size={18} className="text-bright-sun-400" />
            </div>
            <div className="text-lg font-semibold">Hiring Funnel</div>
          </div>
          <div className="grid site-grid-gap md:grid-cols-5">
            {funnelStages.map((stage, i) => {
              const height = Math.max(8, (stage.value / maxVal) * 100);
              return (
                <div key={i} className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="relative flex h-44 w-full items-end justify-center rounded-xl bg-mine-shaft-900/40 border border-mine-shaft-800/60 p-2">
                    <div className={`w-12 rounded-lg transition-all duration-700 ${stage.color} opacity-80 hover:opacity-100`}
                      style={{ height: `${height}%`, minHeight: "20px" }} />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-mine-shaft-50">{stage.value}</div>
                    <div className={`text-xs font-medium ${stage.textColor}`}>{stage.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid site-grid-gap md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bright-sun-400/10 border border-bright-sun-400/20">
                <IconTrendingUp size={18} className="text-bright-sun-400" />
              </div>
              <div className="text-lg font-semibold">Conversion Metrics</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 hover:border-bright-sun-400/40 transition-all">
                <div className="text-sm text-mine-shaft-400 mb-1">Applied → Shortlisted</div>
                <div className="text-2xl font-bold text-bright-sun-400">{conversionRates.applied_to_shortlisted}%</div>
              </div>
              <div className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 hover:border-bright-sun-400/40 transition-all">
                <div className="text-sm text-mine-shaft-400 mb-1">Shortlisted → Interviewed</div>
                <div className="text-2xl font-bold text-cyan-400">{conversionRates.shortlisted_to_interviewed}%</div>
              </div>
              <div className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 hover:border-bright-sun-400/40 transition-all">
                <div className="text-sm text-mine-shaft-400 mb-1">Interviewed → Offered</div>
                <div className="text-2xl font-bold text-yellow-400">{conversionRates.interviewed_to_offered}%</div>
              </div>
              <div className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 hover:border-bright-sun-400/40 transition-all">
                <div className="text-sm text-mine-shaft-400 mb-1">Offered → Hired</div>
                <div className="text-2xl font-bold text-green-400">{conversionRates.offered_to_hired}%</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bright-sun-400/10 border border-bright-sun-400/20">
                <IconCalendarEvent size={18} className="text-bright-sun-400" />
              </div>
              <Link to="/interviews" className="text-lg font-semibold hover:text-bright-sun-400 transition-colors">Upcoming Interviews</Link>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {scheduledInterviews.length > 0 ? (
                scheduledInterviews.map((interview) => (
                  <div key={interview.id} className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/40 p-3 hover:border-bright-sun-400/40 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{interview.talentName}</div>
                        <div className="text-xs text-mine-shaft-400 mt-1">{interview.jobTitle}</div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-mine-shaft-300">
                          <IconClock size={14} />
                          {new Date(interview.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        interview.status === 'upcoming' ? 'bg-green-500/20 text-green-300' :
                        interview.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-mine-shaft-700 bg-mine-shaft-900/20 p-6 text-center">
                  <IconClock size={28} className="mx-auto text-mine-shaft-500 mb-2" />
                  <div className="text-sm text-mine-shaft-400">No upcoming interviews</div>
                  <Link to="/interviews" className="text-xs text-bright-sun-400 hover:underline mt-2 block">Schedule an interview →</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid site-grid-gap md:grid-cols-2">
          <Link to="/posted-job" className="group rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-5 transition-all hover:border-bright-sun-400/40 hover:shadow-[0_0_30px_-12px_rgba(255,189,32,0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bright-sun-400/10 border border-bright-sun-400/20 text-bright-sun-400"><IconBriefcase size={20} /></div>
              <div><div className="font-semibold">Posted Jobs</div><div className="text-sm text-mine-shaft-400">{stats.activeJobs} active · {stats.totalJobs} total</div></div>
            </div>
          </Link>
          <Link to="/applicants" className="group rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-5 transition-all hover:border-bright-sun-400/40 hover:shadow-[0_0_30px_-12px_rgba(255,189,32,0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400"><IconUsers size={20} /></div>
              <div><div className="font-semibold">Applicants</div><div className="text-sm text-mine-shaft-400">{stats.totalApplicants} total applicants</div></div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
