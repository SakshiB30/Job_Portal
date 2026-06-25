import { ActionIcon, Badge, Collapse, Loader, Modal, Tabs, Button, Tooltip } from "@mantine/core";
import { useState } from "react";
import JobDesc from "../JobDescription/JobDesc";
import { Link, useNavigate } from "react-router-dom";
import { IconFile, IconDownload, IconEye, IconEyeOff, IconArrowsMaximize } from "@tabler/icons-react";
import { postJob, updateApplicationStatus } from "../../Services/JobService";
import { getItem, setItem } from "../../Services/LocalStorageService";
import { successNotification, errorNotification } from "../../Services/NotificationService";
import ScheduleInterviewModal from "../ScheduleInterviewModal";
import { IconEdit, IconRocket, IconBan } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { closeJob } from "../../Services/JobService";
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
  resume?: string;
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
  companyLogo: job.companyLogo,
  companyPicture: job.companyPicture,
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
            <div className="truncate text-xl sm:text-2xl font-semibold">{job.jobTitle || "Untitled Job"}</div>
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
                  errorNotification('Error', (err as ApiError).response?.data?.errorMessage || 'Failed to close job');
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
          </Tabs.List>
          <Tabs.Panel value="overview" className="[&>div]:w-full">
            <JobDesc edit {...job} />
          </Tabs.Panel>
          <Tabs.Panel value="applicants">
            <ApplicantPipeline job={job} onJobUpdated={onJobUpdated} />
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

const decodeBase64ToBytes = (base64: string): Uint8Array => {
  const raw = base64.startsWith("data:") ? base64.split(",")[1] : base64;
  const byteChars = atob(raw);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i);
  }
  return bytes;
};

const detectMimeType = (bytes: Uint8Array): { mime: string; ext: string } => {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { mime: "application/pdf", ext: "pdf" };
  }
  if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
    return { mime: "application/msword", ext: "doc" };
  }
  if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
    return { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" };
  }
  return { mime: "application/pdf", ext: "pdf" };
};const getResumeBlobUrl = (base64: string): string => {
    const bytes = decodeBase64ToBytes(base64);
    const { mime } = detectMimeType(bytes);
    const blob = new Blob([bytes.slice(0)], { type: mime });
    return URL.createObjectURL(blob);
  };

const ResumePreview = ({ resume, name: applicantName }: { resume: string; name?: string }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [modalBlobUrl, setModalBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isPdfPreview, setIsPdfPreview] = useState(false);
  const [isPdfModal, setIsPdfModal] = useState(false);

  const togglePreview = () => {
    if (showPreview) {
      if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null); }
      setShowPreview(false);
    } else {
      if (resume) {
        const bytes = decodeBase64ToBytes(resume);
        const { mime } = detectMimeType(bytes);
        const pdf = mime === "application/pdf";
        if (pdf) {
          setPreviewBlobUrl(getResumeBlobUrl(resume));
          setPreviewLoading(true);
        }
        setIsPdfPreview(pdf);
        setShowPreview(true);
      }
    }
  };

  const openModal = () => {
    if (resume) {
      const bytes = decodeBase64ToBytes(resume);
      const { mime } = detectMimeType(bytes);        const pdf = mime === "application/pdf";
        if (pdf) {
          setModalBlobUrl(getResumeBlobUrl(resume));
          setModalLoading(true);
        }
        setIsPdfModal(pdf);
        setModalOpen(true);
    }
  };

  const closeModal = () => {
    if (modalBlobUrl) { URL.revokeObjectURL(modalBlobUrl); setModalBlobUrl(null); }
    setModalOpen(false);
  };

  const handleDownload = () => {
    if (!resume) return;
    const bytes = decodeBase64ToBytes(resume);
    const { mime, ext } = detectMimeType(bytes);
    const blob = new Blob([bytes.slice(0)], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${applicantName || "resume"}_Resume.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 rounded-lg border border-mine-shaft-700 bg-mine-shaft-800/60 px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-bright-sun-400/15 text-bright-sun-400">
          <IconFile size={16} stroke={1.5} />
        </div>
        <span className="flex-1 text-xs font-medium text-mine-shaft-200 truncate">Resume</span>
        <div className="flex items-center gap-0.5">
          <Tooltip label={showPreview ? "Hide preview" : "Show preview"} withArrow>
            <ActionIcon onClick={togglePreview} variant="subtle" color="brightSun.4" size="sm">
              {showPreview ? <IconEyeOff size={15} stroke={1.5} /> : <IconEye size={15} stroke={1.5} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Fullscreen view" withArrow>
            <ActionIcon onClick={openModal} variant="subtle" color="brightSun.4" size="sm">
              <IconArrowsMaximize size={15} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Download resume" withArrow>
            <ActionIcon onClick={handleDownload} variant="subtle" color="brightSun.4" size="sm">
              <IconDownload size={15} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>

      <Collapse in={showPreview}>
        <div className="relative rounded-b-lg border-x border-b border-mine-shaft-700 overflow-hidden bg-mine-shaft-950">
          {previewLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-mine-shaft-950 z-10">
              <Loader color="brightSun.4" size="lg" />
            </div>
          )}
          {isPdfPreview && previewBlobUrl && (
            <iframe
              src={previewBlobUrl}
              onLoad={() => setPreviewLoading(false)}
              className="w-full h-[350px]"
              title="Resume preview"
            />
          )}
          {!isPdfPreview && !previewLoading && (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <IconFile size={48} className="text-mine-shaft-500" stroke={1} />
              <p className="text-sm text-mine-shaft-400">
                Preview not available for this file format.
              </p>
              <p className="text-xs text-mine-shaft-500">
                Use the download button or fullscreen view to open it.
              </p>
            </div>
          )}
        </div>
      </Collapse>

      <Modal opened={modalOpen} onClose={closeModal} title={`Resume — ${applicantName || "Applicant"}`} fullScreen styles={{ body: { height: "calc(100vh - 80px)" } }}>
        <div className="relative w-full h-full">
          {modalLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader color="brightSun.4" size="lg" />
            </div>
          )}
          {isPdfModal && modalBlobUrl && (
            <iframe src={modalBlobUrl} onLoad={() => setModalLoading(false)} className="w-full h-full rounded-md" title="Resume fullscreen" />
          )}
          {!isPdfModal && !modalLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <IconFile size={64} className="text-mine-shaft-500" stroke={1} />
              <p className="text-lg text-mine-shaft-400">
                Preview not available for this file format.
              </p>
              <p className="text-sm text-mine-shaft-500">
                Download the file to view it.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

const ApplicantPipeline = ({ job, onJobUpdated }: { job: PostedJobItem; onJobUpdated?: (updatedJob: PostedJobItem) => void }) => {
  const [interviewingApplicant, setInterviewingApplicant] = useState<ApplicantRef | null>(null);
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
    <>
      <div className="mt-8">
        <div className="mb-5 grid grid-cols-3 gap-2 text-center md:grid-cols-3 xl:grid-cols-6">
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
                    <Link to={`/talent-profile/${String(applicant.applicantId)}`} className="text-lg font-semibold hover:text-bright-sun-400">
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
                </div>
                <Badge color={getApplicantStatusColor(status)} variant="light">
                  {status}
                </Badge>
              </div>
              {applicant.resume && (
                <ResumePreview resume={applicant.resume} name={applicant.name} />
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/talent-profile/${applicant.applicantId}`}>
                  <Button size="xs" color="brightSun.4" variant="outline" disabled={!applicant.applicantId}>
                    Profile
                  </Button>
                </Link>

                <Button size="xs" color="brightSun.4" variant="light" disabled={status === "INTERVIEWING" || offerSent} onClick={() => setInterviewingApplicant(applicant)}>
                  Schedule Interview
                </Button>
                <Button size="xs" color="green.7" variant="light" disabled={status === "OFFERED" || studentResponded} onClick={() => handleStatusChange(applicant, "OFFERED")}>
                  Offer
                </Button>
                <Button size="xs" color="green.9" variant="filled" disabled={status === "ACCEPTED" || status === "DECLINED" || status === "REJECTED"} onClick={() => handleStatusChange(applicant, "ACCEPTED")}>
                  Mark as Hired
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

      {interviewingApplicant?.applicantId !== undefined && (
        <ScheduleInterviewModal
          opened={!!interviewingApplicant}
          onClose={() => setInterviewingApplicant(null)}
          jobId={String(job.id ?? job._id ?? job.jobId)}
          applicantId={interviewingApplicant.applicantId}
          applicantName={interviewingApplicant?.name || ""}
          jobTitle={job.jobTitle || ""}
          onSuccess={(updatedJob: any) => {
            if (updatedJob) onJobUpdated?.(updatedJob);
            setInterviewingApplicant(null);
          }}
        />
      )}
    </>
  );
}

export default PostedJobDescription;
