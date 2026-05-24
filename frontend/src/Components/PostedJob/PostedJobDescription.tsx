import { Badge, Tabs, Button } from "@mantine/core";
import JobDesc from "../JobDescription/JobDesc";
import { Link, useNavigate } from "react-router-dom";
import { postJob, updateApplicationStatus } from "../../Services/JobService";
import { getItem, setItem } from "../../Services/LocalStorageService";
import { successNotification, errorNotification } from "../../Services/NotificationService";
import { IconEdit, IconRocket, IconBan, IconUserX, IconMapPin, IconCurrencyRupee, IconBrandGithub, IconBrandLinkedin, IconMail } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { closeJob } from "../../Services/JobService";
import { useEffect, useState } from "react";
import { getInvitedStudents, removeInvitedStudent } from "../../Services/InvitationService";
import type { InvitedStudent } from "../../Services/InvitationService";
import type { PostedJobItem } from "../../Pages/PostedJobpage";

type PostedJobDescriptionProps = {
  job: PostedJobItem | null;
  emptyMessage?: string;
  onPublished?: (publishedJob: PostedJobItem, draftId?: string | number) => void;
  onJobUpdated?: (updatedJob: PostedJobItem) => void;
  onDelete?: (job: PostedJobItem) => void;
};

type DraftActionsProps = {
  job: PostedJobItem;
  onPublished?: (publishedJob: PostedJobItem, draftId?: string | number) => void;
};

type ApiError = {
  response?: {
    data?: {
      errorMessage?: string;
    };
  };
};

type ApplicantStatus = "APPLIED" | "INTERVIEWING" | "OFFERED" | "REJECTED" | "ACCEPTED" | "DECLINED";

type ApplicantRef = {
  applicantId?: string | number;
  name?: string;
  email?: string;
  phone?: string | number;
  website?: string;
  coverLetter?: string;
  timeStamp?: string;
  applicationStatus?: ApplicantStatus;
};

const getJobKey = (job: PostedJobItem | null) => job?.id ?? job?._id ?? job?.jobId ?? job?.draftId;

const getApplicantStatusColor = (status: ApplicantStatus) => {
  if (status === "REJECTED" || status === "DECLINED") return "red";
  if (status === "OFFERED" || status === "ACCEPTED") return "green";
  if (status === "INTERVIEWING") return "blue";
  return "brightSun.4";
};

const buildPublishPayload = (job: PostedJobItem) => ({
  jobTitle: job.jobTitle,
  company: job.company,
  experience: job.experience,
  jobType: job.jobType,
  location: job.location,
  packageOffered: Number(job.packageOffered),
  skillsRequired: job.skillsRequired || [],
  about: job.about,
  description: job.description,
  applicants: Array.isArray(job.applicants) ? job.applicants : [],
  jobStatus: "OPEN",
});

const PostedJobDescription = ({ job, emptyMessage, onPublished, onJobUpdated, onDelete }: PostedJobDescriptionProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    localStorage.setItem('editingJob', JSON.stringify(job));
    navigate('/post-job');
  };

  if (!job) {
    return (
      <div className="w-full rounded-md border border-dashed border-mine-shaft-700 bg-mine-shaft-900/60 p-8 text-center text-mine-shaft-300">
        {emptyMessage || "No posted job selected. Post a job or refresh the page to load available jobs."}
      </div>
    );
  }

  return (
    <section className="w-full min-w-0 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 lg:flex-1 lg:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-2xl font-semibold">{job.jobTitle || "Untitled Job"}</div>
            <Badge variant="light" color="brightSun.4" size="sm">
              {job.jobStatus || "OPEN"}
            </Badge>
          </div>
          <div className="mt-1 font-medium text-mine-shaft-300">{job.company || "Company not set"} &bull; {job.location || "Location not set"}</div>
        </div>
        <div className="flex flex-wrap shrink-0 gap-2">
          {job.jobStatus === 'DRAFT' && (
            <DraftActions job={job} onPublished={onPublished} />
          )}
          {job.jobStatus !== 'CLOSED' && job.jobStatus !== 'DRAFT' && (
            <>
              <Button color="gray.6" variant="outline" leftSection={<IconEdit size={16} />} onClick={handleEdit} size="sm">
                Edit
              </Button>
              <Button color="yellow.6" variant="outline" leftSection={<IconBan size={16} />} size="sm" onClick={async () => {
                try {
                  const jobId = getJobKey(job);
                  const updated = await closeJob(jobId);
                  successNotification('Closed', 'Job closed successfully');
                  onJobUpdated?.(updated);
                } catch (err: unknown) {
                  console.error(err);
                  errorNotification('Error', 'Failed to close job');
                }
              }}>
                Close
              </Button>
            </>
          )}
          <Button color="red.7" variant="outline" leftSection={<IconTrash size={16} />} size="sm" onClick={() => onDelete && onDelete(job)}>
            Delete
          </Button>
        </div>
      </div>
      <div className="pt-5">
        <Tabs variant="outline" radius="lg" defaultValue="overview">
          <Tabs.List className="mb-5 [&_button]:text-base! [&_button]:font-semibold! [&_button[data-active='true']]:text-bright-sun-400! md:[&_button]:text-lg!">
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="applicants">Applicants</Tabs.Tab>
            <Tabs.Tab value="invited">Invited</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overview" className="[&>div]:w-full">
            <JobDesc edit {...job} />
          </Tabs.Panel>
          <Tabs.Panel value="applicants">
            <ApplicantPipeline job={job} onJobUpdated={onJobUpdated} />
          </Tabs.Panel>

          <Tabs.Panel value="invited">
            <InvitedTab job={job} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </section>
  );
};

const DraftActions = ({ job, onPublished }: DraftActionsProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    localStorage.setItem('editingJob', JSON.stringify(job));
    navigate('/post-job');
  }

  const handlePublish = async () => {
    try {
      const draftKey = getJobKey(job);
      const publishedJob = await postJob(buildPublishPayload(job));
      const drafts = (getItem('draftJobs') || []) as PostedJobItem[];
      const remaining = drafts.filter((draft) => String(getJobKey(draft)) !== String(draftKey));
      setItem('draftJobs', remaining);
      successNotification('Published', 'Draft published successfully');
      onPublished?.(publishedJob || { ...job, jobStatus: "OPEN" }, draftKey);
    } catch (err: unknown) {
      console.error(err);
      errorNotification('Error', (err as ApiError).response?.data?.errorMessage || 'Failed to publish draft');
    }
  }

  return (
    <>
      <Button variant="default" color="brightSun.4" leftSection={<IconEdit size={16} />} onClick={handleEdit}>Edit</Button>
      <Button variant="light" color="brightSun.4" leftSection={<IconRocket size={16} />} onClick={handlePublish}>Publish</Button>
    </>
  );
}

const ApplicantPipeline = ({ job, onJobUpdated }: { job: PostedJobItem; onJobUpdated?: (updatedJob: PostedJobItem) => void }) => {
  const applicants = Array.isArray(job.applicants) ? job.applicants as ApplicantRef[] : [];
  const statusCounts = applicants.reduce<Record<ApplicantStatus, number>>((counts, applicant) => {
    const status = applicant.applicationStatus || "APPLIED";
    counts[status] += 1;
    return counts;
  }, {
    APPLIED: 0,
    INTERVIEWING: 0,
    OFFERED: 0,
    REJECTED: 0,
    ACCEPTED: 0,
    DECLINED: 0,
  });

  const handleStatusChange = async (applicant: ApplicantRef, status: ApplicantStatus) => {
    const jobId = job.id ?? job._id ?? job.jobId;
    if (!jobId || !applicant.applicantId) return;

    try {
      const updatedJob = await updateApplicationStatus(jobId, applicant.applicantId, status);
      successNotification("Application updated", `Candidate moved to ${status.toLowerCase()}.`);
      onJobUpdated?.(updatedJob);
    } catch (err: unknown) {
      console.error(err);
      const fallbackApplicants = applicants.map((item) =>
        item.applicantId === applicant.applicantId ? { ...item, applicationStatus: status } : item
      );
      onJobUpdated?.({ ...job, applicants: fallbackApplicants });
      errorNotification("Saved locally", "Server update failed, but the pipeline was updated on this screen.");
    }
  };

  if (!applicants.length) {
    return (
      <div className="mt-8 rounded-md border border-dashed border-mine-shaft-700 p-8 text-center text-mine-shaft-300">
        No students have applied yet.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-5 grid grid-cols-2 gap-2 text-center md:grid-cols-3 xl:grid-cols-6">
        {([
          ["Applied", statusCounts.APPLIED],
          ["Interviewing", statusCounts.INTERVIEWING],
          ["Offered", statusCounts.OFFERED],
          ["Accepted", statusCounts.ACCEPTED],
          ["Declined", statusCounts.DECLINED],
          ["Rejected", statusCounts.REJECTED],
        ] as Array<[string, number]>).map(([label, count]) => (
          <div key={label} className="rounded-md border border-mine-shaft-800 bg-mine-shaft-950 p-3">
            <div className="text-lg font-semibold text-bright-sun-400">{count}</div>
            <div className="text-[11px] text-mine-shaft-300">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {applicants.map((applicant, index) => {
          const status = applicant.applicationStatus || "APPLIED";
          const studentResponded = status === "ACCEPTED" || status === "DECLINED";
          const offerSent = status === "OFFERED" || studentResponded;

          return (
            <div key={applicant.applicantId ?? index} className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                {applicant.applicantId ? (
                  <Link to={`/talent-profile/${applicant.applicantId}`} className="text-lg font-semibold hover:text-bright-sun-400">
                    {applicant.name || `Applicant #${applicant.applicantId}`}
                  </Link>
                ) : (
                  <div className="text-lg font-semibold">{applicant.name || `Applicant #${index + 1}`}</div>
                )}
                <div className="text-sm text-mine-shaft-300">
                  Applied {applicant.timeStamp ? new Date(applicant.timeStamp).toLocaleDateString() : "recently"}
                </div>
                <div className="mt-1 text-sm text-mine-shaft-300">
                  {applicant.email || "Email not available"}
                  {applicant.phone ? ` • ${applicant.phone}` : ""}
                </div>
                {applicant.website && (
                  <div className="mt-1 break-all text-xs text-bright-sun-400">
                    {applicant.website}
                  </div>
                )}
                {status === "ACCEPTED" && (
                  <div className="mt-3 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-300">
                    Student accepted this offer.
                  </div>
                )}
                {status === "DECLINED" && (
                  <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
                    Student declined this offer.
                  </div>
                )}
              </div>
              <Badge color={getApplicantStatusColor(status)} variant="light">
                {status}
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/talent-profile/${applicant.applicantId}`}>
                <Button size="xs" color="brightSun.4" variant="outline" disabled={!applicant.applicantId}>
                  Profile
                </Button>
              </Link>

              {/* Invite button appears only for applicants who are not yet in interview/offer/accepted/declined */}
              {status === "APPLIED" && (
                <Button
                  size="xs"
                  color="brightSun.4"
                  variant="light"
                  onClick={() => handleStatusChange(applicant, "INTERVIEWING")}
                >
                  Invite
                </Button>
              )}

              <Button size="xs" color="brightSun.4" variant="light" disabled={status === "INTERVIEWING" || offerSent} onClick={() => handleStatusChange(applicant, "INTERVIEWING")}>
                Interview
              </Button>
              <Button size="xs" color="green.7" variant="light" disabled={status === "OFFERED" || studentResponded} onClick={() => handleStatusChange(applicant, "OFFERED")}>
                Offer
              </Button>
              <Button size="xs" color="red.7" variant="outline" disabled={status === "REJECTED" || studentResponded} onClick={() => handleStatusChange(applicant, "REJECTED")}>
                Reject
              </Button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

const InvitedTab = ({ job }: { job: PostedJobItem }) => {
  const jobId = getJobKey(job);
  const [invitedList, setInvitedList] = useState<InvitedStudent[]>([]);

  useEffect(() => {
    if (jobId) {
      setInvitedList(getInvitedStudents(jobId));
    }
  }, [jobId]);

  const handleRemove = (student: InvitedStudent) => {
    if (!jobId) return;
    removeInvitedStudent(jobId, student.id);
    setInvitedList((prev) => prev.filter((s) => String(s.id) !== String(student.id)));
    successNotification('Removed', `${student.name || 'Student'} removed from invited list.`);
  };

  if (!invitedList.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-mine-shaft-700 bg-mine-shaft-900/20 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mine-shaft-800">
          <IconUserX size={28} className="text-mine-shaft-500" />
        </div>
        <div className="text-lg font-semibold text-mine-shaft-200">No students invited yet</div>
        <div className="mt-2 text-sm text-mine-shaft-400">
          Go to{' '}
          <Link to="/find-talent" className="font-medium text-bright-sun-400 hover:underline">
            Find Talent
          </Link>
          {' '}to invite candidates to this job.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-mine-shaft-300">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bright-sun-400/10 text-xs font-bold text-bright-sun-400">
            {invitedList.length}
          </span>
          <span className="font-medium text-mine-shaft-100">Invited</span>
          candidate{invitedList.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {invitedList.map((student) => {
          return (
            <div
              key={student.id}
              className="card-standard"
            >
              <div className="flex justify-between">
                <div className="flex gap-2 items-center min-w-0">
                  <div className="p-2 bg-mine-shaft-800 rounded-full shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-bright-sun-400">
                      {student.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <Link to={`/talent-profile/${student.id}`} className="font-semibold text-sm hover:text-bright-sun-400 transition-colors block truncate">
                      {student.name || 'Unknown Candidate'}
                    </Link>
                    <div className="text-xs text-mine-shaft-300">
                      {student.role || 'Student'}
                      {student.company ? ` \u2022 ${student.company}` : ''}
                    </div>
                  </div>
                </div>
                {student.invitedAt && (
                  <span className="shrink-0 text-[10px] text-mine-shaft-500">
                    {new Date(student.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              {student.topSkills && student.topSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 [&>div]:py-1 [&>div]:px-2 [&>div]:bg-mine-shaft-800 [&>div]:rounded-lg text-xs [&>div]:text-bright-sun-400">
                  {student.topSkills.slice(0, 5).map((skill, i) => (
                    <div key={i}>{skill}</div>
                  ))}
                  {student.topSkills.length > 5 && <div>+{student.topSkills.length - 5}</div>}
                </div>
              )}

              {student.about && (
                <div className="text-xs text-justify text-mine-shaft-300 line-clamp-3">
                  {student.about}
                </div>
              )}

              <div className="flex items-center gap-3">
                {student.email && (
                  <a href={`mailto:${student.email}`} className="text-mine-shaft-400 hover:text-bright-sun-400 transition-colors" title={student.email}>
                    <IconMail size={14} />
                  </a>
                )}
                <a href={`https://github.com/${student.name?.toLowerCase().replace(/\s+/g, '') || 'github'}`} target="_blank" rel="noreferrer" className="text-mine-shaft-400 hover:text-bright-sun-400 transition-colors" title="GitHub">
                  <IconBrandGithub size={14} />
                </a>
                <a href={`https://linkedin.com/in/${student.name?.toLowerCase().replace(/\s+/g, '-') || 'linkedin'}`} target="_blank" rel="noreferrer" className="text-mine-shaft-400 hover:text-bright-sun-400 transition-colors" title="LinkedIn">
                  <IconBrandLinkedin size={14} />
                </a>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-xs text-mine-shaft-400">
                  {student.location && (
                    <span className="inline-flex items-center gap-1">
                      <IconMapPin size={12} />
                      {student.location}
                    </span>
                  )}
                  {student.expectedCtc && (
                    <span className="inline-flex items-center gap-1">
                      <IconCurrencyRupee size={12} />
                      {student.expectedCtc}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 [&>*]:flex-1">
                <Link to={`/talent-profile/${student.id}`}>
                  <Button size="xs" color="brightSun.4" variant="outline" fullWidth>Profile</Button>
                </Link>
                <Button size="xs" color="red.7" variant="light" onClick={() => handleRemove(student)} leftSection={<IconUserX size={13} />}>
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostedJobDescription;
