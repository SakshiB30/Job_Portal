import {
  IconBriefcase,
  IconChartBar,
  IconEye,
  IconPlus,
  IconUsers,
  IconCalendarEvent,
  IconChecklist,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { isCompany } from "../Services/RoleService";
import type { RootState, UserState } from "../Types";
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

const DashboardPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0, activeJobs: 0, totalApplicants: 0,
    shortlisted: 0, interviewsScheduled: 0, offersSent: 0, hired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyJobs().then((jobList) => {
      const activeJobs = jobList.filter((j) => (j?.jobStatus || "OPEN") === "OPEN");
      let totalApplicants = 0, shortlisted = 0, interviews = 0, offers = 0, hired = 0;
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
      setStats({
        totalJobs: jobList.length, activeJobs: activeJobs.length,
        totalApplicants, shortlisted, interviewsScheduled: interviews,
        offersSent: offers, hired,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!isCompany(user)) return <Navigate to="/find-jobs" replace />;

  const maxVal = Math.max(stats.totalApplicants, stats.shortlisted, stats.interviewsScheduled, stats.offersSent, stats.hired, 1);

  const statCards = [
    { label: "Total Jobs", value: stats.totalJobs, icon: <IconBriefcase size={22} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Active Jobs", value: stats.activeJobs, icon: <IconEye size={22} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Applicants", value: stats.totalApplicants, icon: <IconUsers size={22} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Shortlisted", value: stats.shortlisted, icon: <IconChecklist size={22} />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
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

        <div className="mt-8 grid site-grid-gap md:grid-cols-3">
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
          <Link to="/find-talent" className="group rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-5 transition-all hover:border-bright-sun-400/40 hover:shadow-[0_0_30px_-12px_rgba(255,189,32,0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 text-green-400"><IconUsers size={20} /></div>
              <div><div className="font-semibold">Find Students</div><div className="text-sm text-mine-shaft-400">Source & invite candidates</div></div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
