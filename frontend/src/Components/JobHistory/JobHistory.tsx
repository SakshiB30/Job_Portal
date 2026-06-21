import { Button, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import JobCard from "../FindJobs/JobCard";
import { getAllJobs, getAppliedJobs } from "../../Services/JobService";
import { Link } from "react-router-dom";
import type { JobItem, RootState } from "../../Types";
import { getUser } from "../../Services/UserService";
import { setUser } from "../../Slices/UserSlice";
import AnimatedSection from "../AnimatedSection";

type ApplicantHistoryStatus =
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFERED"
  | "REJECTED"
  | "ACCEPTED"
  | "DECLINED";

type ApplicantHistoryItem = {
  applicantId?: string | number | null;
  email?: string | null;
  applicationStatus?: ApplicantHistoryStatus | string | null;
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="col-span-full rounded-md border border-dashed border-mine-shaft-700 bg-mine-shaft-900/60 p-8 text-center text-mine-shaft-300">
    <div>{label}</div>

    <Link to="/find-jobs">
      <Button
        className="mt-4"
        color="brightSun.4"
        variant="light"
      >
        Browse Jobs
      </Button>
    </Link>
  </div>
);

const JobHistory = () => {

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [jobs, setJobs] = useState<JobItem[]>([]);

  // NEW STATE
  const [appliedJobs, setAppliedJobs] = useState<JobItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadJobHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const fetchUser = user?.id
          ? getUser(user.id).catch(() => null)
          : Promise.resolve(null);

        const [allJobsResponse, appliedJobsResponse, updatedUser] = await Promise.all([
          getAllJobs(),
          user?.id ? getAppliedJobs(user.id) : Promise.resolve([]),
          fetchUser,
        ]);

        if (!mounted) return;

        const allJobs = Array.isArray(allJobsResponse) ? allJobsResponse : [];
        const serverAppliedJobs = Array.isArray(appliedJobsResponse)
          ? appliedJobsResponse
          : [];

        setJobs(allJobs);
        const fallbackHistoryIds = [
          ...(user?.appliedJobs || []),
          ...(user?.interviewingJobs || []),
          ...(user?.offeredJobs || []),
        ];
        setAppliedJobs(
          serverAppliedJobs.length
            ? serverAppliedJobs
            : filterJobsByIds(allJobs, fallbackHistoryIds)
        );

        if (updatedUser && mounted) {
          dispatch(setUser(updatedUser));
        }
      } catch (error) {
        console.error(error);

        if (!mounted) return;

        setError(
          "Unable to load the latest job history from the server. Showing any stored jobs available on your account."
        );
        const fallbackHistoryIds = [
          ...(user?.appliedJobs || []),
          ...(user?.interviewingJobs || []),
          ...(user?.offeredJobs || []),
        ];
        setAppliedJobs((current) =>
          current.length ? current : filterJobsByIds(jobs, fallbackHistoryIds)
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadJobHistory();

    return () => {
      mounted = false;
    };

  }, [user?.id, dispatch]);

  const filterJobsByIds = (
    sourceJobs: JobItem[],
    ids: Array<string | number>
  ) => {

    if (!ids?.length) return [];

    const normalizedIds = ids.map((id) => String(id));

    return sourceJobs.filter((job) => {

      const jobId = String(
        job.id ?? job._id ?? job.jobId ?? ""
      );

      return normalizedIds.includes(jobId);
    });
  };

  const filterByIds = (ids: Array<string | number>) => filterJobsByIds(jobs, ids);

  // ── Derive offered/interviewing/applied from appliedJobs (source of truth) ──
  const userIdStr = user?.id ? String(user.id) : null;
  const userEmail = user?.email?.toLowerCase();

  const findUserApplicantStatus = (job: JobItem): string | null => {
    if (!Array.isArray(job.applicants)) return null;
    const applicants = job.applicants as ApplicantHistoryItem[];
    const match = applicants.find(
      (applicant: ApplicantHistoryItem) =>
        (userIdStr && applicant.applicantId != null && String(applicant.applicantId) === userIdStr) ||
        (userEmail && applicant.email?.toLowerCase() === userEmail)
    );
    return match?.applicationStatus ?? null;
  };

  const findUserInterviewDetails = (job: JobItem) => {
    if (!Array.isArray(job.applicants)) return {};
    const applicants = job.applicants as any[];
    const match = applicants.find(
      (a: any) =>
        (userIdStr && a.applicantId != null && String(a.applicantId) === userIdStr) ||
        (userEmail && a.email?.toLowerCase() === userEmail)
    );
    if (!match) return {};
    return {
      interviewDate: match.interviewDate,
      interviewMode: match.interviewMode,
      interviewMeetingLink: match.interviewMeetingLink,
      interviewNotes: match.interviewNotes,
    };
  };

  const getJobId = (job: JobItem) => String(job.id ?? job._id ?? job.jobId ?? "");
  const offeredIdSet = new Set((user?.offeredJobs || []).map((id) => String(id)));
  const interviewingIdSet = new Set((user?.interviewingJobs || []).map((id) => String(id)));

  const offeredJobs: JobItem[] = [];
  const interviewingJobs: JobItem[] = [];
  const appliedNoProgress: JobItem[] = [];
  const completedJobs: JobItem[] = [];

  const isActiveJob = (job: JobItem) => (job.jobStatus ?? "OPEN") !== "CLOSED";

  for (const job of appliedJobs) {
    const status = findUserApplicantStatus(job);
    const statusFromOfferedSet = offeredIdSet.has(getJobId(job)) ? "OFFERED" : null;
    const actualStatus = status || statusFromOfferedSet;

    if (actualStatus === "OFFERED") {
      offeredJobs.push({ ...job, offered: true });
    } else if (actualStatus === "INTERVIEWING" || interviewingIdSet.has(getJobId(job))) {
      const interviewDetails = findUserInterviewDetails(job);
      interviewingJobs.push({ ...job, ...interviewDetails });
    } else if (actualStatus === "ACCEPTED") {
      completedJobs.push({ ...job, accepted: true });
    } else if (actualStatus === "DECLINED") {
      completedJobs.push({ ...job, declined: true });
    } else if ((!actualStatus || actualStatus === "APPLIED") && isActiveJob(job)) {
      appliedNoProgress.push(job);
    } else if (!isActiveJob(job)) {
      // Closed jobs – include in completed for context
      completedJobs.push(job);
    }
  }

  // SAVED JOBS (keeps using Redux + localStorage fallback)
  const savedFallbackKey = user?.id
    ? `savedJobs_fallback_${user.id}`
    : null;

  let fallbackSaved: string[] = [];

  try {

    const parsed = savedFallbackKey
      ? JSON.parse(
          localStorage.getItem(savedFallbackKey) || "[]"
        )
      : [];

    fallbackSaved = Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    fallbackSaved = [];
  }

  const mergedSavedIds = Array.from(
    new Set([
      ...(user?.savedJobs || []).map((id) => String(id)),
      ...fallbackSaved.map((id) => String(id)),
    ])
  );

  const activeSavedJobs = filterByIds(mergedSavedIds || []).filter(isActiveJob);

  const renderJobs = (
    items: JobItem[],
    emptyLabel: string,
    flag:
      | "applied"
      | "saved"
      | "offered"
      | "interviewing"
  ) => (

    <AnimatedSection animation="slide-up" className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

      {loading ? (

        <EmptyState label="Loading your job history..." />

      ) : items.length ? (

        items.map((job, index) => (

          <JobCard
            key={job.id ?? job._id ?? index}
            {...job}
            {...{ [flag]: true }}
          />
        ))

      ) : (

        <EmptyState label={emptyLabel} />
      )}
    </AnimatedSection>
  );

  if (!user) {

    return (

      <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-8 text-center">

        <div className="text-2xl font-semibold">
          Job History
        </div>

        <div className="mx-auto mt-2 max-w-xl text-mine-shaft-300">
          Log in to see applied, saved, offered,
          and interviewing jobs.
        </div>

        <Link to="/login">

          <Button
            className="mt-5"
            color="brightSun.4"
            variant="light"
          >
            Login
          </Button>

        </Link>
      </div>
    );
  }

  return (

    <div>

      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">

        <div>

          <div className="text-3xl font-semibold">
            Job History
          </div>

          <div className="mt-1 text-sm text-mine-shaft-300">
            Track every job you have saved,
            applied to, or moved into a hiring stage.
          </div>

        </div>

        <div className="grid grid-cols-2 gap-2 text-center sm:min-w-96 sm:grid-cols-5">

          {[
            ["Applied", appliedNoProgress.length],
            ["Saved", activeSavedJobs.length],
            ["In-Progress", interviewingJobs.length],
            ["Offers", offeredJobs.length],
            ["Completed", completedJobs.length],
          ].map(([label, count]) => (

            <div
              key={label}
              className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3"
            >

              <div className="text-lg font-semibold text-bright-sun-400">
                {count}
              </div>

              <div className="text-[11px] text-mine-shaft-300">
                {label}
              </div>

            </div>
          ))}
        </div>
      </div>

      {error && (

        <div className="mb-4 rounded-md border border-bright-sun-400/40 bg-bright-sun-400/10 px-4 py-3 text-sm text-bright-sun-100">

          {error}

        </div>
      )}          <Tabs variant="outline"
        radius="lg"
        defaultValue="applied"
      >

        <Tabs.List className="mb-5 flex-nowrap overflow-x-auto [&_button]:text-base! [&_button]:font-semibold! [&_button[data-active='true']]:text-bright-sun-400! md:[&_button]:text-lg!">

          <Tabs.Tab value="applied">
            Applied
          </Tabs.Tab>

          <Tabs.Tab value="saved">
            Saved
          </Tabs.Tab>

          <Tabs.Tab value="in-progress">
            In-Progress
          </Tabs.Tab>

          <Tabs.Tab value="offered">
            Offered
          </Tabs.Tab>

          <Tabs.Tab value="completed">
            Completed
          </Tabs.Tab>

        </Tabs.List>

        <Tabs.Panel value="applied">

          {renderJobs(
            appliedNoProgress,
            "No applied jobs yet.",
            "applied"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="saved">

          {renderJobs(
            activeSavedJobs,
            "No saved jobs yet.",
            "saved"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="in-progress">

          {renderJobs(
            interviewingJobs,
            "No in-progress applications yet.",
            "interviewing"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="offered">

          {renderJobs(
            offeredJobs,
            "No offers yet.",
            "offered"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="completed">

          {renderJobs(
            completedJobs,
            "No completed applications yet.",
            "applied"
          )}

        </Tabs.Panel>

      </Tabs>
    </div>
  );
};

export default JobHistory;
