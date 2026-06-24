import { ActionIcon, Collapse, Divider, Loader, Modal, Tooltip } from "@mantine/core";
import { IconMapPin, IconMail, IconPhone, IconLink, IconSchool, IconCode, IconAward, IconFile, IconDownload, IconEye, IconEyeOff, IconArrowsMaximize } from "@tabler/icons-react";
import { useState } from "react";
import ExpCard from "./ExpCard";
import CertifCard from "./CertifCard";
import AnimatedSection from "../AnimatedSection";


const Profile = (props: any) => {
  const {
    name,
    location,
    about,
    skills = [],
    experience = [],
    certifications = [],
    email,
    phone,
    portfolio,
    resume,
    resumeHeadline,
    education = [],
    projects = [],
    achievements = [],
  } = props;

  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [modalBlobUrl, setModalBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isPdfPreview, setIsPdfPreview] = useState(false);
  const [isPdfModal, setIsPdfModal] = useState(false);

  const hasBanner = !!props.banner;
  const bannerUrl = hasBanner ? `data:image/jpeg;base64,${props.banner}` : null;
  const profileUrl = props.image ? `/${props.image}` : props.picture ? `data:image/jpeg;base64,${props.picture}` : null;

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
    // Check magic bytes to detect file type
    // PDF: %PDF (25 50 44 46)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { mime: "application/pdf", ext: "pdf" };
    }
    // DOC (OLE2): D0 CF 11 E0 A1 B1
    if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
      return { mime: "application/msword", ext: "doc" };
    }
    // DOCX / ZIP: PK (50 4B)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
      return { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" };
    }
    return { mime: "application/pdf", ext: "pdf" };
  };

  const getResumeBlobUrl = (base64: string): string => {
    const bytes = decodeBase64ToBytes(base64);
    const { mime } = detectMimeType(bytes);
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  };

  const togglePreview = () => {
    if (showResumePreview) {
      if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null); }
      setShowResumePreview(false);
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
        setShowResumePreview(true);
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
        setResumeModalOpen(true);
    }
  };

  const closeModal = () => {
    if (modalBlobUrl) { URL.revokeObjectURL(modalBlobUrl); setModalBlobUrl(null); }
    setResumeModalOpen(false);
  };

  const handleDownloadResume = () => {
    if (!resume) return;
    const bytes = decodeBase64ToBytes(resume);
    const { mime, ext } = detectMimeType(bytes);
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name || "resume"}_Resume.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };



  return (
    
    <div className="w-full">
      <div className="relative">
        {bannerUrl ? (
          <img className="rounded-t-2xl w-full h-32 sm:h-48 object-cover" src={bannerUrl} alt="" />
        ) : (
          <div className="rounded-t-2xl w-full h-32 sm:h-48 bg-gradient-to-br from-mine-shaft-700/40 via-mine-shaft-800/60 to-mine-shaft-950" />
        )}
        {profileUrl ? (
          <img
            className="h-24 w-24 sm:h-48 sm:w-48 rounded-full -bottom-1/4 sm:-bottom-1/3 absolute left-3 border-mine-shaft-950 border-4 sm:border-8 object-cover"
            src={profileUrl}
            alt={name || "Profile"}
          />
        ) : (
          <div className="h-24 w-24 sm:h-48 sm:w-48 rounded-full -bottom-1/4 sm:-bottom-1/3 absolute left-3 border-mine-shaft-950 border-4 sm:border-8 bg-gradient-to-br from-bright-sun-400 to-yellow-400 flex items-center justify-center text-3xl sm:text-6xl font-bold text-mine-shaft-950">
            {(name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="mt-16 sm:mt-32">
        <div className="text-xl sm:text-3xl font-semibold">
          {name}
        </div>
        <div className="text-base sm:text-lg flex gap-1 items-center text-mine-shaft-300">
          <IconMapPin className="h-5 w-5 shrink-0" stroke={1.5} />
          <span className="truncate">{location}</span>
        </div>

        {/* Contact info row */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mine-shaft-300">
          {email && (
            <div className="flex items-center gap-1.5">
              <IconMail size={16} className="text-mine-shaft-500 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5">
              <IconPhone size={16} className="text-mine-shaft-500 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {portfolio && (
            <div className="flex items-center gap-1.5">
              <IconLink size={16} className="text-mine-shaft-500 shrink-0" />
              <a href={portfolio} target="_blank" rel="noreferrer" className="text-bright-sun-400 hover:underline truncate max-w-[200px]">
                {portfolio}
              </a>
            </div>
          )}
        </div>

        {resumeHeadline && (
          <div className="mt-2 text-sm font-medium text-bright-sun-400">
            {resumeHeadline}
          </div>
        )}

        {/* ── Resume preview + download ── */}
        {resume ? (
          <div className="mt-4">
            {/* Header bar */}
            <div className="flex items-center gap-3 rounded-t-lg border border-mine-shaft-700 bg-mine-shaft-900/60 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bright-sun-400/15 text-bright-sun-400">
                <IconFile size={22} stroke={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-mine-shaft-200 truncate">
                  {name || "Student"}_Resume
                </p>
                <p className="text-xs text-mine-shaft-400">PDF</p>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip label={showResumePreview ? "Hide preview" : "Show preview"} withArrow>
                  <ActionIcon onClick={togglePreview} variant="subtle" color="brightSun.4" size="md">
                    {showResumePreview ? <IconEyeOff size={18} stroke={1.5} /> : <IconEye size={18} stroke={1.5} />}
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Fullscreen view" withArrow>
                  <ActionIcon onClick={openModal} variant="subtle" color="brightSun.4" size="md">
                    <IconArrowsMaximize size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Download resume" withArrow>
                  <ActionIcon
                    onClick={handleDownloadResume}
                    variant="subtle"
                    color="brightSun.4"
                    size="md"
                  >
                    <IconDownload size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>

            {/* Collapsible PDF iframe preview */}
            <Collapse in={showResumePreview}>
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
                    className="w-full h-[500px] sm:h-[600px]"
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
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-mine-shaft-700 bg-mine-shaft-900/30 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mine-shaft-800 text-mine-shaft-500">
              <IconFile size={22} stroke={1.5} />
            </div>
            <p className="text-sm text-mine-shaft-400">
              No resume uploaded.
            </p>
          </div>
        )}
      </div>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="fade-in">
      <div>
        <div className="text-2xl font-semibold mb-3">About</div>
        <div className="text-sm text-mine-shaft-300 text-justify">{about}</div>
      </div>
      </AnimatedSection>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="fade-in">
      <div>
        <div className="text-2xl font-semibold mb-3">Skills</div>
        <div className="flex flex-wrap gap-2">
          {skills?.map((skill: any, index: any) => (
            <div
              key={index}
              className=" bg-bright-sun-300/15 text-sm font-medium rounded-3xl text-bright-sun-400 px-3 py-1"
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
      </AnimatedSection>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="slide-up">
      <div>
        <div className="text-2xl font-semibold mb-5">Experience</div>
        <div className="flex flex-col gap-8">
          {experience?.map((exp: any, index: any) => (
            <ExpCard key={index} {...exp} />
          ))}
        </div>
      </div>
      </AnimatedSection>
      <Divider mx="xs" my="xl" />

      {/* Education section */}
      {education?.length > 0 && (
        <>
          <AnimatedSection animation="slide-up">
            <div>
              <div className="text-2xl font-semibold mb-5 flex items-center gap-2">
                <IconSchool size={28} className="text-bright-sun-400" /> Education
              </div>
              <div className="flex flex-col gap-6">
                {education.map((edu: Record<string, string>, index: number) => (
                  <div key={index} className="flex flex-col gap-1 rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/60 p-4">
                    <div className="font-semibold text-mine-shaft-100">{edu?.degree || edu?.field || "Degree"} {edu?.field ? `in ${edu.field}` : ""}</div>
                    <div className="text-sm text-mine-shaft-300">{edu?.school || edu?.institution || "School"}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mine-shaft-400">
                      {edu?.grade && <span>Grade: {edu.grade}</span>}
                      {(edu?.startYear || edu?.endYear) && (
                        <span>{edu.startYear || "?"} - {edu.endYear || "Present"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
          <Divider mx="xs" my="xl" />
        </>
      )}

      {/* Projects section */}
      {projects?.length > 0 && (
        <>
          <AnimatedSection animation="slide-up">
            <div>
              <div className="text-2xl font-semibold mb-5 flex items-center gap-2">
                <IconCode size={28} className="text-bright-sun-400" /> Projects
              </div>
              <div className="flex flex-col gap-6">
                {projects.map((proj: Record<string, string>, index: number) => (
                  <div key={index} className="flex flex-col gap-1 rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/60 p-4">
                    <div className="font-semibold text-mine-shaft-100">{proj?.name || "Project"}</div>
                    {proj?.description && (
                      <div className="text-sm text-mine-shaft-300 text-justify">{proj.description}</div>
                    )}
                    {proj?.technologies && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {proj.technologies.split(",").map((tech: string, i: number) => (
                          <span key={i} className="bg-bright-sun-300/10 text-xs font-medium rounded-2xl text-bright-sun-400 px-2 py-0.5">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mine-shaft-400 mt-1">
                      {(proj?.startDate || proj?.endDate) && (
                        <span>{proj.startDate || "?"} - {proj.endDate || "Present"}</span>
                      )}
                      {proj?.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-bright-sun-400 hover:underline truncate">
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
          <Divider mx="xs" my="xl" />
        </>
      )}

      {/* Achievements section */}
      {achievements?.length > 0 && (
        <>
          <AnimatedSection animation="slide-up">
            <div>
              <div className="text-2xl font-semibold mb-5 flex items-center gap-2">
                <IconAward size={28} className="text-bright-sun-400" /> Achievements
              </div>
              <ul className="list-disc list-inside text-sm text-mine-shaft-300 space-y-2">
                {achievements.map((ach: string, index: number) => (
                  <li key={index}>{ach}</li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
          <Divider mx="xs" my="xl" />
        </>
      )}

      <AnimatedSection animation="slide-up">
      <div>
        <div className="text-2xl font-semibold mb-5">Certifications</div>
        <div className="flex flex-col gap-8">
          {certifications?.map((certi: any, index: any) => (
            <CertifCard key={index} {...certi} />
          ))}
        </div>
      </div>
      </AnimatedSection>

      {/* ── Fullscreen resume modal ── */}
      <Modal
        opened={resumeModalOpen}
        onClose={closeModal}
        title={`Resume — ${name || "Student"}`}
        fullScreen
        styles={{ body: { height: "calc(100vh - 80px)" } }}
      >
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

export default Profile;
 