import { useEffect, useState } from "react";
import PostedJob from "../Components/PostedJob/PostedJob";
import PostedJobDescription from "../Components/PostedJob/PostedJobDescription";
import { getMyJobs, deleteJob } from "../Services/JobService";
import { setItem, getItem } from "../Services/LocalStorageService";

export type PostedJobItem = {
  id?: string | number;
  _id?: string | number;
  jobId?: string | number;
  draftId?: string | number;
  jobTitle?: string;
  company?: string;
  location?: string;
  jobStatus?: string;
  postTime?: string;
  posted?: string;
  applicants?: unknown;
  [key: string]: unknown;
};

const PostedJobPage = () => {
  const [jobs, setJobs] = useState<PostedJobItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<PostedJobItem | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getJobKey = (job: PostedJobItem | null) => job?.id ?? job?._id ?? job?.jobId ?? job?.draftId;

  const sortByLatest = (items: PostedJobItem[]) =>
    [...items].sort((a, b) => {
      const first = new Date(b?.postTime ?? b?.posted ?? 0).getTime();
      const second = new Date(a?.postTime ?? a?.posted ?? 0).getTime();
      return first - second;
    });

  const getFirstJobByTab = (items: PostedJobItem[], tab: string) => {
    if (tab === "closed") return items.find((job) => job?.jobStatus === "CLOSED") || null;
    if (tab === "draft") return items.find((job) => job?.jobStatus === "DRAFT") || null;
    return items.find((job) => (job?.jobStatus ?? "OPEN") === "OPEN") || null;
  };

  useEffect(() => {
    const drafts = (getItem('draftJobs') || []) as PostedJobItem[];
    getMyJobs()
      .then((res) => {
        const merged = sortByLatest([...((res || []) as PostedJobItem[]), ...drafts]);
        setJobs(merged);
        setSelectedJob(getFirstJobByTab(merged, activeTab));
      })
      .catch((error) => {
        console.error("Failed to load posted jobs:", error);
        const sortedDrafts = sortByLatest(drafts);
        setError(drafts.length ? "Showing saved drafts because posted jobs could not be loaded." : "Unable to load posted jobs right now.");
        setJobs(sortedDrafts);
        setSelectedJob(getFirstJobByTab(sortedDrafts, activeTab));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Deduplicate jobs by their key to ensure counts are accurate
  const uniqueMap = new Map<string, PostedJobItem>();
  jobs.forEach((j, index) => {
    const key = String(getJobKey(j) ?? `job-${index}`);
    uniqueMap.set(key, j);
  });
  const uniqueJobs = Array.from(uniqueMap.values());

  // Treat missing/null jobStatus as OPEN (active) for counting
  const activeJobs = uniqueJobs.filter((job) => (job?.jobStatus ?? 'OPEN') === "OPEN");
  const closedJobs = uniqueJobs.filter((job) => job?.jobStatus === "CLOSED");
  const draftJobs = uniqueJobs.filter((job) => job?.jobStatus === "DRAFT");

  const selectedJobId = getJobKey(selectedJob);
  const emptyMessages: Record<string, string> = {
    active: "No active posted jobs found.",
    closed: "No closed jobs found.",
    draft: "No draft jobs found.",
  };
  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const nextJobs = value === "closed" ? closedJobs : value === "draft" ? draftJobs : activeJobs;
    setActiveTab(value);
    setSelectedJob(nextJobs[0] || null);
  };

  return (
    <div className="site-page">
      <div className="site-container flex flex-col site-grid-gap">
        <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">
          <div>
            <div className="text-3xl font-semibold">Posted Jobs</div>
            <div className="mt-1 text-sm text-mine-shaft-300">
              Manage live openings, review drafts, and track candidates from one workspace.
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center sm:min-w-96">
            <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3">
              <div className="text-xl font-semibold text-bright-sun-400">{jobs.length}</div>
              <div className="text-xs text-mine-shaft-300">Total</div>
            </div>
            <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3">
              <div className="text-xl font-semibold text-bright-sun-400">{activeJobs.length}</div>
              <div className="text-xs text-mine-shaft-300">Active</div>
            </div>
            <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3">
              <div className="text-xl font-semibold text-bright-sun-400">{closedJobs.length}</div>
              <div className="text-xs text-mine-shaft-300">Closed</div>
            </div>
            <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3">
              <div className="text-xl font-semibold text-bright-sun-400">{draftJobs.length}</div>
              <div className="text-xs text-mine-shaft-300">Drafts</div>
            </div>
          </div>
        </div>
        {error && <div className="rounded-md border border-bright-sun-400/40 bg-bright-sun-400/10 px-4 py-3 text-sm text-bright-sun-100">{error}</div>}
      </div>
      <div className="site-container mt-5 flex flex-col site-grid-gap lg:flex-row">
        <PostedJob
          activeJobs={activeJobs}
          closedJobs={closedJobs}
          draftJobs={draftJobs}
          loading={loading}
          selectedJobId={selectedJobId}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSelect={setSelectedJob}
        />
        <PostedJobDescription job={selectedJob} emptyMessage={emptyMessages[activeTab]} onPublished={(publishedJob: PostedJobItem, draftId?: string | number) => {
          const publishedId = getJobKey(publishedJob);
          setJobs((current) =>
            sortByLatest(
              current
                .filter((job) => String(getJobKey(job)) !== String(publishedId) && String(getJobKey(job)) !== String(draftId))
                .concat({ ...publishedJob, jobStatus: publishedJob.jobStatus || "OPEN" })
            )
          );
          setSelectedJob({ ...publishedJob, jobStatus: publishedJob.jobStatus || "OPEN" });
        }} onJobUpdated={(updatedJob: PostedJobItem) => {
          const updatedId = getJobKey(updatedJob);
          // Replace the job in the local list
          setJobs((current) => current.map((job) => String(getJobKey(job)) === String(updatedId) ? updatedJob : job));
          setSelectedJob(updatedJob);
          // If the job was closed, refresh the jobs list from server to ensure it moves out of Active tab
          if (updatedJob?.jobStatus === 'CLOSED') {
            const drafts = (getItem('draftJobs') || []) as PostedJobItem[];
            getMyJobs()
              .then((res) => {
                const merged = sortByLatest([...((res || []) as PostedJobItem[]), ...drafts]);
                setJobs(merged);
                // if the closed job was selected, clear selection
                if (String(getJobKey(updatedJob)) === String(selectedJobId)) setSelectedJob(null);
              })
              .catch((err) => {
                console.error('Failed to refresh jobs after close:', err);
              });
          }
        }} onDelete={(job: PostedJobItem) => {
          const key = getJobKey(job);
          if (job.jobStatus === 'DRAFT' || job.draftId) {
            const drafts = (getItem('draftJobs') || []) as PostedJobItem[];
            const remaining = drafts.filter((d) => String(getJobKey(d)) !== String(key));
            setItem('draftJobs', remaining);
            setJobs((current) => current.filter((j) => String(getJobKey(j)) !== String(key)));
            if (String(selectedJobId) === String(key)) setSelectedJob(null);
            return;
          }
          deleteJob(key)
            .then(() => {
              setJobs((current) => current.filter((j) => String(getJobKey(j)) !== String(key)));
              if (String(selectedJobId) === String(key)) setSelectedJob(null);
            })
            .catch((err) => {
              console.error('Failed to delete job', err);
            });
        }} />
      </div>
    </div>
  );
};

export default PostedJobPage;
