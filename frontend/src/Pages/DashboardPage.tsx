import {
  IconBriefcase,
  IconChartBar,
  IconEye,
  IconUsers,
  IconCalendarEvent,
  IconTrendingUp,
  IconClock,
  IconTarget,
  IconMapPin,
  IconCheck,
  IconAlertCircle,
  IconArrowRight,
  IconUserPlus,
  IconStar,
  IconBuildingStore,
} from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { isCompany, getMissingCompanyFields, getCompanyProfileCompletionPercent } from "../Services/RoleService";
import type { RootState } from "../Types";
import { getMyJobs } from "../Services/JobService";
import CompanyLogo from "../Components/CompanyLogo";
import { getUser } from "../Services/UserService";
import { setUser } from "../Slices/UserSlice";

type DashboardStats = {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  shortlisted: number;
  interviewsScheduled: number;
  offersSent: number;
  hired: number;
  declined: number;
};

type ScheduledInterview = {
  id: string;
  talentName: string;
  jobTitle: string;
  scheduledAt: string;
  status: "upcoming" | "completed" | "cancelled";
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const userId = user?.id;
  const companyUser = isCompany(user);
  const [refreshedCompanyStatus, setRefreshedCompanyStatus] = useState<string | undefined>();
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0, activeJobs: 0, totalApplicants: 0,
    shortlisted: 0, interviewsScheduled: 0, offersSent: 0, hired: 0, declined: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);

  useEffect(() => {
    if (!userId || !companyUser) return;
    let cancelled = false;

    const refreshCompanyStatus = () => {
      getUser(userId)
        .then((freshUser) => {
          if (cancelled) return;
          setRefreshedCompanyStatus(freshUser?.companyStatus);
          setVerificationChecked(true);
          dispatch(setUser(freshUser));
        })
        .catch(() => {
          if (!cancelled) setVerificationChecked(true);
          // keep the cached status if refresh fails
        });
    };

    refreshCompanyStatus();
    window.addEventListener("focus", refreshCompanyStatus);
    const interval = window.setInterval(refreshCompanyStatus, 30000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshCompanyStatus);
      window.clearInterval(interval);
    };
  }, [companyUser, dispatch, userId]);

  useEffect(() => {
    setLoading(true);
    setError("");
    getMyJobs().then((jobList) => {
      const jobArray = Array.isArray(jobList) ? jobList : [];
      const activeJobs = jobArray.filter((j) => (j?.jobStatus || "OPEN") === "OPEN");
      let totalApplicants = 0, shortlisted = 0, interviews = 0, offers = 0, hired = 0, declined = 0;
      let upcomingInterviews: ScheduledInterview[] = [];
      
      activeJobs.forEach((job) => {
        const applicants = job.applicants;
        if (Array.isArray(applicants)) {
          totalApplicants += applicants.length;
          shortlisted += applicants.filter((a: any) =>
            ["SHORTLISTED", "INTERVIEWING", "OFFERED", "ACCEPTED", "DECLINED"].includes(a?.applicationStatus)
          ).length;
          interviews += applicants.filter((a: any) => a?.applicationStatus === "INTERVIEWING").length;
          offers += applicants.filter((a: any) =>
            ["OFFERED", "ACCEPTED", "DECLINED"].includes(a?.applicationStatus)
          ).length;
          hired += applicants.filter((a: any) => a?.applicationStatus === "ACCEPTED").length;
          declined += applicants.filter((a: any) => a?.applicationStatus === "DECLINED").length;
        }
      });

      // Load scheduled interviews from localStorage
      const storedInterviews = localStorage.getItem(`scheduledInterviews:${userId || "guest"}`);
      if (storedInterviews) {
        try {
          const parsed = JSON.parse(storedInterviews);
          upcomingInterviews = parsed.slice(0, 5);
        } catch (e) {
          // silent parse failure
        }
      }

      setScheduledInterviews(upcomingInterviews);
      setStats({
        totalJobs: jobArray.length, activeJobs: activeJobs.length,
        totalApplicants, shortlisted, interviewsScheduled: interviews,
        offersSent: offers, hired, declined,
      });
    }).catch(() => {
      setError("Unable to load dashboard data. Make sure you have posted jobs and the backend server is running.");
    }).finally(() => setLoading(false));
  }, [userId]);

  if (!user) return <Navigate to="/login" replace />;
  if (!companyUser) return <Navigate to="/find-jobs" replace />;

  // ── Profile completion ──
  const missingFields = useMemo(() => getMissingCompanyFields(profile), [profile]);
  const completionPercent = useMemo(() => getCompanyProfileCompletionPercent(profile), [profile]);
  const profileComplete = missingFields.length === 0;

  const pendingOffers = stats.offersSent - stats.hired - stats.declined;
  const maxVal = Math.max(stats.totalApplicants, stats.shortlisted, stats.interviewsScheduled, pendingOffers, stats.hired, 1);

  // Calculate conversion rates
  const conversionRates = {
    applied_to_shortlisted: stats.totalApplicants > 0 ? Math.round((stats.shortlisted / stats.totalApplicants) * 100) : 0,
    shortlisted_to_interviewed: stats.shortlisted > 0 ? Math.round((stats.interviewsScheduled / stats.shortlisted) * 100) : 0,
    interviewed_to_offered: stats.interviewsScheduled > 0 ? Math.round((pendingOffers / stats.interviewsScheduled) * 100) : 0,
    offered_to_hired: stats.offersSent > 0 ? Math.round((stats.hired / stats.offersSent) * 100) : 0,
  };

  const statCards = [
    { label: "Total Jobs", value: stats.totalJobs, icon: <IconBriefcase size={22} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", accent: "bg-blue-500" },
    { label: "Active Jobs", value: stats.activeJobs, icon: <IconEye size={22} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", accent: "bg-green-500" },
    { label: "Applicants", value: stats.totalApplicants, icon: <IconUsers size={22} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", accent: "bg-purple-500" },
    { label: "Shortlisted", value: stats.shortlisted, icon: <IconTarget size={22} />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", accent: "bg-cyan-500" },
    { label: "Interviews", value: stats.interviewsScheduled, icon: <IconCalendarEvent size={22} />, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", accent: "bg-yellow-500" },
    { label: "Offers Sent", value: stats.offersSent, icon: <IconTrendingUp size={22} />, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", accent: "bg-orange-500" },
    { label: "Hired", value: stats.hired, icon: <IconUserPlus size={22} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", accent: "bg-green-500" },
    { label: "Declined", value: stats.declined, icon: <IconAlertCircle size={22} />, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", accent: "bg-red-500" },
  ];

  const funnelStages = [
    { label: "Applied", value: stats.totalApplicants, color: "bg-blue-500", textColor: "text-blue-300", icon: <IconUsers size={16} /> },
    { label: "Shortlisted", value: stats.shortlisted, color: "bg-cyan-500", textColor: "text-cyan-300", icon: <IconStar size={16} /> },
    { label: "Interviewed", value: stats.interviewsScheduled, color: "bg-yellow-500", textColor: "text-yellow-300", icon: <IconCalendarEvent size={16} /> },
    { label: "Offered", value: pendingOffers, color: "bg-orange-500", textColor: "text-orange-300", icon: <IconTrendingUp size={16} /> },
    { label: "Hired", value: stats.hired, color: "bg-green-500", textColor: "text-green-300", icon: <IconCheck size={16} /> },
  ];

  const bannerUrl = profile?.banner
    ? `data:image/jpeg;base64,${profile.banner}`
    : null;
  const companyStatus = (refreshedCompanyStatus || user?.companyStatus || "").toUpperCase();
  const showVerificationBadge = companyUser && verificationChecked && Boolean(companyStatus) && companyStatus !== "APPROVED";
  const verificationLabel = companyStatus === "REJECTED" ? "Verification Rejected" : "Pending Verification";

  return (
    <div className="site-page animate-fade-in">
      <div className="site-container pb-10">

        {/* ════════════════════════════════════════ */}
        {/* COMPANY PROFILE HERO                       */}
        {/* ════════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-mine-shaft-800 bg-mine-shaft-900 shadow-[0_24px_80px_-48px_rgba(255,189,32,0.6)]">
          {/* Background banner */}
          <div
            className={`relative h-40 sm:h-48 bg-cover bg-center ${bannerUrl ? '' : 'bg-gradient-to-br from-mine-shaft-700/50 via-mine-shaft-800/70 to-mine-shaft-950'}`}
            style={bannerUrl ? { backgroundImage: `url('${bannerUrl}')` } : {}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-mine-shaft-950/80 via-mine-shaft-950/50 to-mine-shaft-950/30" />
          </div>

          {/* Logo + Info overlay */}
          <div className="relative -mt-12 flex flex-col gap-4 px-6 pb-6 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-mine-shaft-950 bg-mine-shaft-900 shadow-xl sm:h-28 sm:w-28">
              <CompanyLogo
                logo={profile?.companyLogo}
                picture={profile?.picture}
                company={profile?.company || "Company"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-white sm:text-3xl truncate">
                  {profile?.company || user?.name || "Your Company"}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mine-shaft-300">
                  {profile?.industry && (
                    <span className="inline-flex items-center gap-1.5">
                      <IconBuildingStore size={15} className="text-bright-sun-400" />
                      {profile.industry}
                    </span>
                  )}
                  {profile?.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <IconMapPin size={15} className="text-bright-sun-400" />
                      {profile.location}
                    </span>
                  )}
                  {profile?.companySize && (
                    <span className="inline-flex items-center gap-1.5">
                      <IconUsers size={15} className="text-bright-sun-400" />
                      {profile.companySize}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex shrink-0 gap-2 sm:mt-0">
                {showVerificationBadge && (
                  <Link to="/profile">
                    <button className="flex items-center gap-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400 transition hover:bg-yellow-500/20">
                      <IconAlertCircle size={14} />
                      {verificationLabel}
                    </button>
                  </Link>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════ */}
        {/* PROFILE COMPLETION BANNER (if incomplete) */}
        {/* ════════════════════════════════════════ */}
        {!profileComplete && (
          <div className="mb-8 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-transparent">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                  <IconAlertCircle size={20} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-300">Complete your company profile to post jobs</div>
                  <div className="mt-1 text-xs text-mine-shaft-400">
                    {missingFields.length} field{missingFields.length !== 1 ? "s" : ""} missing — fill them in to start hiring
                  </div>
                </div>
              </div>
              <Link to="/profile" className="shrink-0">
                <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30 sm:w-auto">
                  Complete Profile <IconArrowRight size={15} />
                </button>
              </Link>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-mine-shaft-800">
              <div
                className="h-full rounded-r-full bg-gradient-to-r from-amber-500 to-bright-sun-400 transition-all duration-700"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            {/* Missing fields list */}
            <div className="flex flex-wrap gap-2 px-5 pb-4 pt-3">
              {missingFields.map((field) => {
                const fieldDef = [
                  { key: "company", label: "Company Name" },
                  { key: "location", label: "Location" },
                  { key: "about", label: "Company Overview" },
                  { key: "industry", label: "Industry" },
                  { key: "companySize", label: "Company Size" },
                  { key: "portfolio", label: "Website" },
                ].find((f) => f.key === field);
                return (
                  <span
                    key={field}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400/80"
                  >
                    <IconAlertCircle size={11} />
                    {fieldDef?.label || field}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-md border border-bright-sun-400/40 bg-bright-sun-400/10 px-4 py-3 text-sm text-bright-sun-100">
            {error}
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* STATS CARDS                               */}
        {/* ════════════════════════════════════════ */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/60 p-4">
                <div className="mb-2 h-4 w-20 rounded bg-mine-shaft-800" />
                <div className="h-8 w-16 rounded bg-mine-shaft-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/60 p-4 transition-all duration-300 hover:border-bright-sun-400/30 hover:shadow-[0_0_30px_-12px_rgba(255,189,32,0.25)] animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Accent bar */}
                <div className={`absolute left-0 top-0 h-full w-0.5 ${card.accent} opacity-50`} />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-mine-shaft-400">{card.label}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg} ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-mine-shaft-50">{card.value}</div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-mine-shaft-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${card.accent} opacity-60`}
                    style={{
                      width: `${
                        stats.totalJobs > 0
                          ? Math.min(100, (card.value / Math.max(...statCards.map((c) => c.value || 1))) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* HIRING FUNNEL                             */}
        {/* ════════════════════════════════════════ */}
        <div className="mt-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-bright-sun-400/20 to-bright-sun-400/5 border border-bright-sun-400/20">
              <IconTrendingUp size={18} className="text-bright-sun-400" />
            </div>
            <div>
              <div className="text-base font-semibold text-mine-shaft-50">Hiring Funnel</div>
              <div className="text-xs text-mine-shaft-500">Pipeline summary across all active jobs</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {funnelStages.map((stage, i) => {
              const height = Math.max(10, (stage.value / maxVal) * 100);
              return (
                <div key={i} className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="relative flex h-32 w-full items-end justify-center rounded-xl bg-mine-shaft-900/40 border border-mine-shaft-800/60 p-2 sm:h-44">
                    <div
                      className={`w-10 rounded-lg transition-all duration-700 ${stage.color} opacity-70 hover:opacity-100`}
                      style={{ height: `${height}%`, minHeight: "24px" }}
                    />
                    {/* Icon on the bar */}
                    <div className={`absolute bottom-2 flex items-center justify-center ${stage.textColor}`}>
                      {stage.icon}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-mine-shaft-50">{stage.value}</div>
                    <div className={`text-[11px] font-medium ${stage.textColor}`}>{stage.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════ */}
        {/* CONVERSION METRICS + INTERVIEWS          */}
        {/* ════════════════════════════════════════ */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Conversion metrics */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-bright-sun-400/20 to-bright-sun-400/5 border border-bright-sun-400/20">
                <IconTrendingUp size={18} className="text-bright-sun-400" />
              </div>
              <div>
                <div className="text-base font-semibold text-mine-shaft-50">Conversion Metrics</div>
                <div className="text-xs text-mine-shaft-500">Stage-by-stage hiring efficiency</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Applied → Shortlisted", value: conversionRates.applied_to_shortlisted, color: "text-bright-sun-400", bar: "bg-bright-sun-400" },
                { label: "Shortlisted → Interviewed", value: conversionRates.shortlisted_to_interviewed, color: "text-cyan-400", bar: "bg-cyan-400" },
                { label: "Interviewed → Offered", value: conversionRates.interviewed_to_offered, color: "text-yellow-400", bar: "bg-yellow-400" },
                { label: "Offered → Hired", value: conversionRates.offered_to_hired, color: "text-green-400", bar: "bg-green-400" },
              ].map((metric, i) => (
                <div key={i} className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 transition-all duration-300 hover:border-bright-sun-400/40 hover:shadow-[0_0_20px_-8px_rgba(255,189,32,0.15)]">
                  <div className="text-xs text-mine-shaft-400 mb-2">{metric.label}</div>
                  <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}%</div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mine-shaft-800">
                    <div className={`h-full rounded-full ${metric.bar} transition-all duration-700`} style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming interviews */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 border border-yellow-400/20">
                <IconCalendarEvent size={18} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-base font-semibold text-mine-shaft-50">Upcoming Interviews</div>
                <div className="text-xs text-mine-shaft-500">Scheduled candidate conversations</div>
              </div>
            </div>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {scheduledInterviews.length > 0 ? (
                scheduledInterviews.map((interview) => (
                  <div key={interview.id} className="group rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/40 p-3 transition-all duration-300 hover:border-bright-sun-400/40 hover:shadow-[0_0_20px_-8px_rgba(255,189,32,0.12)]">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bright-sun-400/10 text-bright-sun-400 text-[10px] font-bold">
                            {interview.talentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="font-semibold text-sm truncate">{interview.talentName}</div>
                        </div>
                        <div className="text-xs text-mine-shaft-400 mt-1 ml-9">{interview.jobTitle}</div>
                        <div className="flex items-center gap-1 mt-1.5 ml-9 text-[11px] text-mine-shaft-500">
                          <IconClock size={12} />
                          {new Date(interview.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${
                        interview.status === 'upcoming' ? 'bg-green-500/15 text-green-300' :
                        interview.status === 'completed' ? 'bg-blue-500/15 text-blue-300' :
                        'bg-red-500/15 text-red-300'
                      }`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-mine-shaft-700 bg-mine-shaft-900/20 p-8 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mine-shaft-800/60">
                      <IconCalendarEvent size={24} className="text-mine-shaft-500" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-mine-shaft-400">No upcoming interviews</div>
                  <div className="mt-1 text-xs text-mine-shaft-500">Scheduled interview details will appear here when available.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════ */}
        {/* SUMMARY CARDS                             */}
        {/* ════════════════════════════════════════ */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Posted Jobs", desc: `${stats.activeJobs} active / ${stats.totalJobs} total`, icon: <IconBriefcase size={20} />, color: "text-bright-sun-400", bg: "bg-bright-sun-400/10", border: "border-bright-sun-400/20" },
            { label: "Applicants", desc: `${stats.totalApplicants} total applicants`, icon: <IconUsers size={20} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            { label: "Interviews", desc: `${stats.interviewsScheduled} scheduled`, icon: <IconCalendarEvent size={20} />, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
            { label: "Analytics", desc: `${conversionRates.offered_to_hired}% offer-to-hire rate`, icon: <IconChartBar size={20} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          ].map((link) => (
            <div
              key={link.label}
              className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${link.bg} ${link.border} border ${link.color}`}>
                  {link.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-mine-shaft-50">{link.label}</div>
                  <div className="text-xs text-mine-shaft-400 truncate">{link.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
