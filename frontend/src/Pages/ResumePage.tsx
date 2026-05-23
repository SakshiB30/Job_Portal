import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Divider,
  Progress,
  TagsInput,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconBriefcase,
  IconDeviceFloppy,
  IconExternalLink,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconPrinter,
  IconSchool,
  IconTrash,
  IconTrophy,
  IconUserCircle,
  IconWorld,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { changeProfile } from "../Slices/ProfileSlice";
import { updateProfile } from "../Services/ProfileService";
import {
  errorNotification,
  successNotification,
} from "../Services/NotificationService";
import type { RootState } from "../Types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type EducationItem = {
  degree?: string;
  institute?: string;
  year?: string;
  score?: string;
};

type ProjectItem = {
  title?: string;
  description?: string;
  link?: string;
};

type ExperienceItem = {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  working?: boolean;
  description?: string;
};

type CertificationItem = {
  name?: string;
  issuer?: string;
  issueDate?: string;
};

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const emptyEducation: EducationItem = {
  degree: "",
  institute: "",
  year: "",
  score: "",
};
const emptyProject: ProjectItem = { title: "", description: "", link: "" };
const emptyExperience: ExperienceItem = {
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  working: false,
  description: "",
};
const emptyCertification: CertificationItem = {
  name: "",
  issuer: "",
  issueDate: "",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

const ResumePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const [saving, setSaving] = useState(false);

  const [resume, setResume] = useState({
    phone: "",
    portfolio: "",
    resumeHeadline: "",
    about: "",
    skills: [] as string[],
    education: [] as EducationItem[],
    projects: [] as ProjectItem[],
    achievements: [] as string[],
    experiences: [] as ExperienceItem[],
    certifications: [] as CertificationItem[],
  });

  useEffect(() => {
    setResume({
      phone: profile?.phone || "",
      portfolio: profile?.portfolio || "",
      resumeHeadline:
        profile?.resumeHeadline || profile?.jobTitle || "",
      about: profile?.about || "",
      skills: profile?.skills || [],
      education: (profile?.education as EducationItem[]) || [],
      projects: (profile?.projects as ProjectItem[]) || [],
      achievements: profile?.achievements || [],
      experiences: (profile?.experiences as ExperienceItem[]) || [],
      certifications:
        (profile?.certifications as CertificationItem[]) || [],
    });
  }, [profile, user]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(resume.resumeHeadline),
      Boolean(resume.about),
      Boolean(resume.phone),
      Boolean(profile?.email || user?.name),
      resume.skills.length > 0,
      resume.education.length > 0,
      resume.experiences.length > 0,
      resume.projects.length > 0,
    ];
    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [resume, profile, user]);

  if (!user) return <Navigate to="/login" replace />;

  /* helpers */
  const updateItem = <T,>(
    key: keyof typeof resume,
    index: number,
    field: keyof T,
    value: string | boolean
  ) => {
    setResume((cur) => ({
      ...cur,
      [key]: (cur[key] as T[]).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = <T,>(key: keyof typeof resume, empty: T) =>
    setResume((cur) => ({
      ...cur,
      [key]: [...(cur[key] as T[]), { ...empty }],
    }));

  const removeItem = (key: keyof typeof resume, index: number) =>
    setResume((cur) => ({
      ...cur,
      [key]: (cur[key] as unknown[]).filter((_, i) => i !== index),
    }));

  const saveResume = async () => {
    try {
      setSaving(true);
      const updatedProfile = {
        ...profile,
        id: profile?.id ?? user?.profileId,
        phone: resume.phone,
        portfolio: resume.portfolio,
        resumeHeadline: resume.resumeHeadline,
        about: resume.about,
        skills: resume.skills,
        education: resume.education,
        projects: resume.projects,
        achievements: resume.achievements,
        experiences: resume.experiences,
        certifications: resume.certifications,
      };
      const saved = await updateProfile(updatedProfile);
      dispatch(changeProfile(saved));
      successNotification(
        "Resume saved",
        "Your resume was updated successfully."
      );
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === "object" &&
        "response" in error
          ? (
              error as {
                response?: { data?: { errorMessage?: string } };
              }
            ).response?.data?.errorMessage
          : undefined;
      errorNotification("Save failed", msg || "Unable to save resume.");
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    user?.name || profile?.name || "Your Name";

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-mine-shaft-950 px-4 py-6 font-['poppins'] text-mine-shaft-100 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">
          <div>
            <div className="text-3xl font-semibold">Resume Builder</div>
            <div className="mt-1 text-sm text-mine-shaft-300">
              Build a professional resume — Internshala style.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-48 rounded-md border border-mine-shaft-800 bg-mine-shaft-900 px-4 py-3">
              <div className="mb-2 flex justify-between text-sm">
                <span>Completion</span>
                <span className="font-semibold text-bright-sun-400">
                  {completion}%
                </span>
              </div>
              <Progress value={completion} color="brightSun.4" size="sm" />
            </div>
            <Button
              leftSection={<IconPrinter size={18} />}
              color="brightSun.4"
              variant="outline"
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              loading={saving}
              leftSection={<IconDeviceFloppy size={18} />}
              color="brightSun.4"
              onClick={saveResume}
            >
              Save Resume
            </Button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[440px_1fr]">

          {/* ── LEFT FORM PANEL ─────────────────────────────────────────── */}
          <section className="flex flex-col gap-4 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/40 p-4">
            <SectionHeader icon={<IconUserCircle className="text-bright-sun-400" />} title="Basic Info" />

            <TextInput
              label="Resume Headline"
              placeholder="e.g. B.Tech CSE | Java Developer | Open to Internships"
              value={resume.resumeHeadline}
              onChange={(e) =>
                setResume({ ...resume, resumeHeadline: e.currentTarget.value })
              }
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <TextInput
                label="Phone"
                placeholder="+91 XXXXX XXXXX"
                value={resume.phone}
                onChange={(e) =>
                  setResume({ ...resume, phone: e.currentTarget.value })
                }
              />
              <TextInput
                label="Portfolio / LinkedIn"
                placeholder="https://linkedin.com/in/..."
                value={resume.portfolio}
                onChange={(e) =>
                  setResume({ ...resume, portfolio: e.currentTarget.value })
                }
              />
            </div>
            <Textarea
              label="Career Objective / Summary"
              minRows={4}
              autosize
              value={resume.about}
              onChange={(e) =>
                setResume({ ...resume, about: e.currentTarget.value })
              }
            />
            <TagsInput
              label="Skills"
              placeholder="Type and press Enter"
              value={resume.skills}
              onChange={(skills) => setResume({ ...resume, skills })}
              splitChars={[",", "|"]}
              clearable
            />

            {/* Education */}
            <Divider className="border-mine-shaft-800" />
            <FormSectionHeader
              icon={<IconSchool size={20} className="text-bright-sun-400" />}
              title="Education"
              onAdd={() => addItem("education", emptyEducation)}
            />
            {resume.education.map((item, i) => (
              <CollapsibleCard
                key={i}
                label={`Education ${i + 1}`}
                onDelete={() => removeItem("education", i)}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Degree / Certificate"
                    placeholder="B.Tech / 12th / Diploma"
                    value={item.degree || ""}
                    onChange={(e) =>
                      updateItem<EducationItem>("education", i, "degree", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="School / College"
                    value={item.institute || ""}
                    onChange={(e) =>
                      updateItem<EducationItem>("education", i, "institute", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="Year of Passing"
                    placeholder="2024"
                    value={item.year || ""}
                    onChange={(e) =>
                      updateItem<EducationItem>("education", i, "year", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="Score / CGPA / %"
                    placeholder="8.5 / 85%"
                    value={item.score || ""}
                    onChange={(e) =>
                      updateItem<EducationItem>("education", i, "score", e.currentTarget.value)
                    }
                  />
                </div>
              </CollapsibleCard>
            ))}
            {!resume.education.length && (
              <EmptyHint text="Add your degree, college, year, and score." />
            )}

            {/* Experience */}
            <Divider className="border-mine-shaft-800" />
            <FormSectionHeader
              icon={<IconBriefcase size={20} className="text-bright-sun-400" />}
              title="Work Experience / Internships"
              onAdd={() => addItem("experiences", emptyExperience)}
            />
            {resume.experiences.map((item, i) => (
              <CollapsibleCard
                key={i}
                label={item.title || `Experience ${i + 1}`}
                onDelete={() => removeItem("experiences", i)}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Job Title"
                    placeholder="Frontend Developer Intern"
                    value={item.title || ""}
                    onChange={(e) =>
                      updateItem<ExperienceItem>("experiences", i, "title", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="Company"
                    value={item.company || ""}
                    onChange={(e) =>
                      updateItem<ExperienceItem>("experiences", i, "company", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="Location"
                    placeholder="Remote / Bangalore"
                    value={item.location || ""}
                    onChange={(e) =>
                      updateItem<ExperienceItem>("experiences", i, "location", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="Start Date"
                    placeholder="Jan 2024"
                    value={item.startDate || ""}
                    onChange={(e) =>
                      updateItem<ExperienceItem>("experiences", i, "startDate", e.currentTarget.value)
                    }
                  />
                  {!item.working && (
                    <TextInput
                      label="End Date"
                      placeholder="Jun 2024"
                      value={item.endDate || ""}
                      onChange={(e) =>
                        updateItem<ExperienceItem>("experiences", i, "endDate", e.currentTarget.value)
                      }
                    />
                  )}
                </div>
                <Checkbox
                  className="mt-3"
                  label="Currently working here"
                  checked={item.working || false}
                  onChange={(e) =>
                    updateItem<ExperienceItem>(
                      "experiences",
                      i,
                      "working",
                      e.currentTarget.checked
                    )
                  }
                  color="brightSun.4"
                />
                <Textarea
                  className="mt-3"
                  label="Description"
                  minRows={3}
                  autosize
                  placeholder="What did you work on? What impact did you make?"
                  value={item.description || ""}
                  onChange={(e) =>
                    updateItem<ExperienceItem>("experiences", i, "description", e.currentTarget.value)
                  }
                />
              </CollapsibleCard>
            ))}
            {!resume.experiences.length && (
              <EmptyHint text="Add internships or full-time experience." />
            )}

            {/* Projects */}
            <Divider className="border-mine-shaft-800" />
            <FormSectionHeader
              icon={<IconTrophy size={20} className="text-bright-sun-400" />}
              title="Projects"
              onAdd={() => addItem("projects", emptyProject)}
            />
            {resume.projects.map((item, i) => (
              <CollapsibleCard
                key={i}
                label={item.title || `Project ${i + 1}`}
                onDelete={() => removeItem("projects", i)}
              >
                <TextInput
                  label="Project Title"
                  value={item.title || ""}
                  onChange={(e) =>
                    updateItem<ProjectItem>("projects", i, "title", e.currentTarget.value)
                  }
                />
                <Textarea
                  className="mt-3"
                  label="Description"
                  minRows={3}
                  autosize
                  value={item.description || ""}
                  onChange={(e) =>
                    updateItem<ProjectItem>("projects", i, "description", e.currentTarget.value)
                  }
                />
                <TextInput
                  className="mt-3"
                  label="Project Link"
                  placeholder="https://github.com/..."
                  value={item.link || ""}
                  onChange={(e) =>
                    updateItem<ProjectItem>("projects", i, "link", e.currentTarget.value)
                  }
                />
              </CollapsibleCard>
            ))}
            {!resume.projects.length && (
              <EmptyHint text="Add academic, personal, or freelance projects." />
            )}

            {/* Certifications */}
            <Divider className="border-mine-shaft-800" />
            <FormSectionHeader
              icon={<IconSchool size={20} className="text-bright-sun-400" />}
              title="Certifications"
              onAdd={() => addItem("certifications", emptyCertification)}
            />
            {resume.certifications.map((item, i) => (
              <CollapsibleCard
                key={i}
                label={item.name || `Certification ${i + 1}`}
                onDelete={() => removeItem("certifications", i)}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Certificate Name"
                    value={item.name || ""}
                    onChange={(e) =>
                      updateItem<CertificationItem>("certifications", i, "name", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="Issuing Organization"
                    placeholder="Coursera / NPTEL"
                    value={item.issuer || ""}
                    onChange={(e) =>
                      updateItem<CertificationItem>("certifications", i, "issuer", e.currentTarget.value)
                    }
                  />
                  <TextInput
                    label="Issue Date"
                    placeholder="Mar 2024"
                    value={item.issueDate || ""}
                    onChange={(e) =>
                      updateItem<CertificationItem>("certifications", i, "issueDate", e.currentTarget.value)
                    }
                  />
                </div>
              </CollapsibleCard>
            ))}
            {!resume.certifications.length && (
              <EmptyHint text="Add online courses or certifications." />
            )}

            {/* Achievements */}
            <Divider className="border-mine-shaft-800" />
            <TagsInput
              label="Achievements / Extra-Curriculars"
              description="Press | to separate items"
              placeholder="e.g. Hackathon winner | NSS volunteer"
              value={resume.achievements}
              onChange={(achievements) => setResume({ ...resume, achievements })}
              splitChars={["|"]}
              clearable
            />
          </section>

          {/* ── RIGHT RESUME PREVIEW (Internshala-style) ────────────────── */}
          <section
            id="resume-preview"
            className="rounded-md border border-mine-shaft-800 bg-white text-gray-800 shadow-[0_20px_80px_-20px_rgba(255,189,32,0.4)] print:shadow-none"
          >
            {/* Name / Headline banner */}
            <div className="border-b-2 border-blue-700 bg-blue-700 px-8 py-6 text-white">
              <div className="text-3xl font-bold tracking-wide">
                {displayName}
              </div>
              <div className="mt-1 text-base font-medium text-blue-100">
                {resume.resumeHeadline || (
                  <span className="italic opacity-60">Add a resume headline</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-100">
                {profile?.email && (
                  <span className="flex items-center gap-1">
                    <IconMail size={14} /> {profile.email}
                  </span>
                )}
                {resume.phone && (
                  <span className="flex items-center gap-1">
                    <IconPhone size={14} /> {resume.phone}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <IconMapPin size={14} /> {profile.location}
                  </span>
                )}
                {resume.portfolio && (
                  <span className="flex items-center gap-1">
                    <IconWorld size={14} /> {resume.portfolio}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
              {/* Sidebar */}
              <aside className="border-r border-gray-200 bg-gray-50 px-5 py-6">

                <PreviewSection title="Skills">
                  {resume.skills.length ? (
                    <div className="flex flex-col gap-1">
                      {resume.skills.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                          {s}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyPreview text="Skills appear here." />
                  )}
                </PreviewSection>

                <PreviewSection title="Education">
                  {resume.education.length ? (
                    resume.education.map((item, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <div className="text-sm font-semibold text-gray-800">
                          {item.degree || "Degree"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.institute}
                        </div>
                        {(item.year || item.score) && (
                          <div className="mt-0.5 text-xs text-gray-400">
                            {[item.year, item.score]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <EmptyPreview text="Education appears here." />
                  )}
                </PreviewSection>

                {resume.certifications.length > 0 && (
                  <PreviewSection title="Certifications">
                    {resume.certifications.map((item, i) => (
                      <div key={i} className="mb-3 last:mb-0">
                        <div className="text-sm font-semibold text-gray-800">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {[item.issuer, item.issueDate]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                    ))}
                  </PreviewSection>
                )}
              </aside>

              {/* Main body */}
              <main className="px-7 py-6">

                <PreviewSection title="Career Objective">
                  <p className="text-sm leading-6 text-gray-600">
                    {resume.about || (
                      <span className="italic text-gray-400">
                        Add a career objective or summary.
                      </span>
                    )}
                  </p>
                </PreviewSection>

                {/* Experience */}
                <PreviewSection title="Work Experience">
                  {resume.experiences.length ? (
                    resume.experiences.map((item, i) => (
                      <ExperienceRow key={i} item={item} />
                    ))
                  ) : (
                    <EmptyPreview text="Add internships or work experience." />
                  )}
                </PreviewSection>

                {/* Projects */}
                <PreviewSection title="Projects">
                  {resume.projects.length ? (
                    resume.projects.map((item, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold text-gray-800">
                            {item.title || "Project Title"}
                          </div>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-blue-600 hover:text-blue-800"
                            >
                              <IconExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        {item.link && (
                          <div className="text-xs text-blue-500">
                            {item.link}
                          </div>
                        )}
                        {item.description && (
                          <p className="mt-1 text-sm leading-5 text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <EmptyPreview text="Projects appear here." />
                  )}
                </PreviewSection>

                {/* Achievements */}
                {resume.achievements.length > 0 && (
                  <PreviewSection title="Achievements & Extra-Curriculars">
                    <ul className="list-disc pl-5 text-sm leading-6 text-gray-600">
                      {resume.achievements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </PreviewSection>
                )}
              </main>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2 text-xl font-semibold">
    {icon}
    {title}
  </div>
);

const FormSectionHeader = ({
  icon,
  title,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  onAdd: () => void;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 font-semibold">
      {icon}
      {title}
    </div>
    <Tooltip label={`Add ${title}`} withArrow>
      <ActionIcon
        color="brightSun.4"
        variant="light"
        onClick={onAdd}
        aria-label={`Add ${title}`}
      >
        <IconPlus size={18} />
      </ActionIcon>
    </Tooltip>
  </div>
);

const CollapsibleCard = ({
  label,
  onDelete,
  children,
}: {
  label: string;
  onDelete: () => void;
  children: React.ReactNode;
}) => (
  <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-950/50 p-3">
    <div className="mb-3 flex items-center justify-between">
      <div className="text-sm font-semibold text-mine-shaft-200">{label}</div>
      <ActionIcon
        color="red.7"
        variant="subtle"
        onClick={onDelete}
        aria-label="Delete"
      >
        <IconTrash size={16} />
      </ActionIcon>
    </div>
    {children}
  </div>
);

const EmptyHint = ({ text }: { text: string }) => (
  <div className="rounded-md border border-dashed border-mine-shaft-700 p-4 text-sm text-mine-shaft-400">
    {text}
  </div>
);

/* Preview helpers */

const PreviewSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-5 last:mb-0">
    <div className="mb-2 border-b-2 border-blue-700 pb-1 text-sm font-bold uppercase tracking-wider text-blue-700">
      {title}
    </div>
    {children}
  </div>
);

const ExperienceRow = ({ item }: { item: ExperienceItem }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex flex-col justify-between gap-0.5 sm:flex-row sm:items-start">
      <div>
        <div className="text-sm font-semibold text-gray-800">
          {item.title || "Role"}
        </div>
        <div className="text-xs font-medium text-blue-600">
          {[item.company, item.location].filter(Boolean).join(" · ")}
        </div>
      </div>
      <div className="text-xs text-gray-400">
        {item.startDate}
        {item.startDate && " – "}
        {item.working ? "Present" : item.endDate}
      </div>
    </div>
    {item.description && (
      <p className="mt-1 text-sm leading-5 text-gray-600">
        {item.description}
      </p>
    )}
  </div>
);

const EmptyPreview = ({ text }: { text: string }) => (
  <p className="text-xs italic text-gray-400">{text}</p>
);

export default ResumePage;