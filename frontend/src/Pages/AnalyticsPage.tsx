import { useEffect, useState } from "react";
import AnimatedSection from "../Components/AnimatedSection";
import {
  IconChartBar,
  IconTrendingUp,
  IconUsers,
  IconBriefcase,
  IconClock,
  IconCheck,
  IconX,
  IconEye,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { isCompany } from "../Services/RoleService";
import type { RootState } from "../Types";
import axios from "axios";

const API = "http://localhost:8080";

const AnalyticsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/jobs/my`)
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!isCompany(user)) return <Navigate to="/find-jobs" replace />;

  const activeJobs = jobs.filter((j) => (j.jobStatus || "OPEN") === "OPEN");
  const allApplicants = jobs.flatMap((j) => j.applicants || []);

  const stageCounts = {
    APPLIED: allApplicants.filter((a: any) => (a.applicationStatus || "APPLIED") === "APPLIED").length,
    SHORTLISTED: allApplicants.filter((a: any) => a.applicationStatus === "SHORTLISTED").length,
    INTERVIEWING: allApplicants.filter((a: any) => a.applicationStatus === "INTERVIEWING").length,
    OFFERED: allApplicants.filter((a: any) => a.applicationStatus === "OFFERED").length,
    ACCEPTED: allApplicants.filter((a: any) => a.applicationStatus === "ACCEPTED").length,
    REJECTED: allApplicants.filter((a: any) => a.applicationStatus === "REJECTED").length,
  };

  const conversionRate = allApplicants.length > 0
    ? Math.round((stageCounts.ACCEPTED / allApplicants.length) * 100)
    : 0;
  const interviewRate = allApplicants.length > 0
    ? Math.round((stageCounts.INTERVIEWING / allApplicants.length) * 100)
    : 0;
  const shortlistRate = allApplicants.length > 0
    ? Math.round((stageCounts.SHORTLISTED / allApplicants.length) * 100)
    : 0;

  const funnelStages = [
    { label: "Applied", value: stageCounts.APPLIED, color: "bg-blue-500", width: 100 },
    { label: "Shortlisted", value: stageCounts.SHORTLISTED, color: "bg-cyan-500", width: stageCounts.APPLIED > 0 ? Math.round((stageCounts.SHORTLISTED / Math.max(stageCounts.APPLIED, 1)) * 100) : 0 },
    { label: "Interviewed", value: stageCounts.INTERVIEWING, color: "bg-yellow-500", width: stageCounts.APPLIED > 0 ? Math.round((stageCounts.INTERVIEWING / Math.max(stageCounts.APPLIED, 1)) * 100) : 0 },
    { label: "Offered", value: stageCounts.OFFERED, color: "bg-orange-500", width: stageCounts.APPLIED > 0 ? Math.round((stageCounts.OFFERED / Math.max(stageCounts.APPLIED, 1)) * 100) : 0 },
    { label: "Hired", value: stageCounts.ACCEPTED, color: "bg-green-500", width: stageCounts.APPLIED > 0 ? Math.round((stageCounts.ACCEPTED / Math.max(stageCounts.APPLIED, 1)) * 100) : 0 },
  ];

  const jobsByApplicants = [...jobs]
    .map((j) => ({
      title: j.jobTitle || "Untitled",
      count: (j.applicants || []).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxJobApps = Math.max(...jobsByApplicants.map((j) => j.count), 1);

  const avgAppsPerJob = jobs.length > 0 ? Math.round(allApplicants.length / jobs.length) : 0;

  const metricsCards = [
    { label: "Total Applications", value: allApplicants.length, icon: <IconUsers size={20} />, color: "text-blue-400", bg: "bg-blue-500/10", change: "+12%", changeUp: true },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: <IconTrendingUp size={20} />, color: "text-green-400", bg: "bg-green-500/10", change: `${shortlistRate}% shortlisted`, changeUp: shortlistRate > 30 },
    { label: "Active Jobs", value: activeJobs.length, icon: <IconBriefcase size={20} />, color: "text-purple-400", bg: "bg-purple-500/10", change: `${jobs.length} total`, changeUp: true },
    { label: "Avg per Job", value: avgAppsPerJob, icon: <IconChartBar size={20} />, color: "text-yellow-400", bg: "bg-yellow-500/10", change: `applicants/job`, changeUp: true },
    { label: "Interview Rate", value: `${interviewRate}%`, icon: <IconEye size={20} />, color: "text-cyan-400", bg: "bg-cyan-500/10", change: `${stageCounts.INTERVIEWING} interviewing`, changeUp: interviewRate > 20 },
    { label: "Hired", value: stageCounts.ACCEPTED, icon: <IconCheck size={20} />, color: "text-green-400", bg: "bg-green-500/10", change: `${conversionRate}% acceptance`, changeUp: conversionRate > 10 },
  ];

  return (
    <div className="site-page animate-fade-in">
      <div className="site-container">
        <div className="flex items-center gap-3 border-b border-mine-shaft-800 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/25">
            <IconChartBar size={22} className="text-green-400" />
          </div>
          <div>
            <div className="text-2xl font-semibold">Analytics</div>
            <div className="text-sm text-mine-shaft-300">Track your hiring performance</div>
          </div>
        </div>

        {loading ? (
          <div className="site-section-gap grid grid-cols-2 site-grid-gap md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/60 p-5">
                <div className="mb-2 h-4 w-24 rounded bg-mine-shaft-800" />
                <div className="h-8 w-16 rounded bg-mine-shaft-800" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="site-section-gap grid grid-cols-2 site-grid-gap md:grid-cols-3 lg:grid-cols-6">
              {metricsCards.map((card, i) => (
                <div key={i} className="stat-card group animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-mine-shaft-400 uppercase tracking-wider">{card.label}</span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg} border ${card.color}`}>{card.icon}</div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-mine-shaft-50">{card.value}</div>
                  <div className={`mt-1 flex items-center gap-1 text-xs ${card.changeUp ? "text-green-400" : "text-red-400"}`}>
                    {card.changeUp ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
                    {card.change}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid site-grid-gap lg:grid-cols-2">
              <div className="rounded-xl border border-mine-shaft-800/60 bg-mine-shaft-900/40 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <IconTrendingUp size={18} className="text-bright-sun-400" />
                  <span className="text-base font-semibold">Hiring Funnel</span>
                </div>
                <div className="space-y-4">
                  {funnelStages.map((stage, i) => (
                    <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                          <span className="text-sm text-mine-shaft-300">{stage.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-mine-shaft-100">{stage.value}</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-mine-shaft-800/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${stage.color} opacity-80 transition-all duration-700`}
                          style={{ width: `${stage.width}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-mine-shaft-800/60 bg-mine-shaft-900/40 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <IconBriefcase size={18} className="text-bright-sun-400" />
                  <span className="text-base font-semibold">Most Applied Jobs</span>
                </div>
                {jobsByApplicants.length === 0 ? (
                  <div className="empty-state-ats py-8">
                    <IconBriefcase size={24} className="text-mine-shaft-500 mb-2" />
                    <p className="text-sm text-mine-shaft-400">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobsByApplicants.map((job, i) => (
                      <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-mine-shaft-300 truncate pr-2">{job.title}</span>
                          <span className="text-sm font-semibold text-mine-shaft-100">{job.count}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-mine-shaft-800/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-bright-sun-400/70 transition-all duration-700"
                            style={{ width: `${(job.count / maxJobApps) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <AnimatedSection animation="fade-in" className="mt-6">
            <div className="rounded-xl border border-mine-shaft-800/60 bg-mine-shaft-900/40 p-5">
              <div className="flex items-center gap-2 mb-5">
                <IconUsers size={18} className="text-bright-sun-400" />
                <span className="text-base font-semibold">Hiring Pipeline Summary</span>
              </div>
              <div className="grid grid-cols-2 site-grid-gap sm:grid-cols-3 md:grid-cols-6">
                {funnelStages.map((stage, i) => (
                  <div key={i} className="rounded-lg bg-mine-shaft-950/50 border border-mine-shaft-800/40 p-4 text-center">
                    <div className={`text-2xl font-bold ${stage.color.replace("bg", "text")}-400`}>{stage.value}</div>
                    <div className="text-xs text-mine-shaft-400 mt-1">{stage.label}</div>
                  </div>
                ))}
              </div>
            </div>
            </AnimatedSection>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
