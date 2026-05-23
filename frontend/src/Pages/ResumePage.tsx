import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Progress,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconBriefcase,
  IconDeviceFloppy,
  IconExternalLink,
  IconMail,
  IconMapPin,
  IconPlus,
  IconPrinter,
  IconSchool,
  IconTrash,
  IconTrophy,
  IconUserCircle,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { changeProfile } from "../Slices/ProfileSlice";
import { updateProfile } from "../Services/ProfileService";
import { errorNotification, successNotification } from "../Services/NotificationService";
import type { RootState } from "../Types";

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

const emptyEducation: EducationItem = { degree: "", institute: "", year: "", score: "" };
const emptyProject: ProjectItem = { title: "", description: "", link: "" };

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
  });

  useEffect(() => {
    setResume({
      phone: profile?.phone || "",
      portfolio: profile?.portfolio || "",
      resumeHeadline: profile?.resumeHeadline || profile?.jobTitle || "",
      about: profile?.about || "",
      skills: profile?.skills || [],
      education: (profile?.education as EducationItem[]) || [],
      projects: (profile?.projects as ProjectItem[]) || [],
      achievements: profile?.achievements || [],
    });
  }, [profile, user]);

  if (!user) return <Navigate to="/login" replace />;

  const completion = useMemo(() => {
    const checks = [
      Boolean(resume.resumeHeadline),
      Boolean(resume.about),
      Boolean(resume.phone),
      Boolean(profile?.email || user?.name),
      resume.skills.length > 0,
      resume.education.length > 0,
      (profile?.experiences?.length || 0) > 0,
      resume.projects.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [resume, profile, user]);

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setResume((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setResume((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

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
      };
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      successNotification("Resume saved", "Your resume details were updated successfully.");
    } catch (error: any) {
      console.error(error);
      errorNotification("Save failed", error?.response?.data?.errorMessage || "Unable to save resume details.");
    } finally {
      setSaving(false);
    }
  };

  const experiences = (profile?.experiences || []) as any[];
  const certifications = (profile?.certifications || []) as any[];
  const displayName = user?.name || profile?.name || "Your Name";

  return (
    <div className="min-h-screen bg-mine-shaft-950 px-4 py-6 font-['poppins'] text-mine-shaft-100 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">
          <div>
            <div className="text-3xl font-semibold">Resume</div>
            <div className="mt-1 text-sm text-mine-shaft-300">
              Build a student resume with profile, education, projects, skills, and experience.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-48 rounded-md border border-mine-shaft-800 bg-mine-shaft-900 px-4 py-3">
              <div className="mb-2 flex justify-between text-sm">
                <span>Completion</span>
                <span className="font-semibold text-bright-sun-400">{completion}%</span>
              </div>
              <Progress value={completion} color="brightSun.4" size="sm" />
            </div>
            <Button leftSection={<IconPrinter size={18} />} color="brightSun.4" variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Button loading={saving} leftSection={<IconDeviceFloppy size={18} />} color="brightSun.4" onClick={saveResume}>
              Save Resume
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
          <section className="flex flex-col gap-4 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/40 p-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <IconUserCircle className="text-bright-sun-400" />
              Resume Details
            </div>
            <TextInput label="Resume Headline" placeholder="e.g. Final-year CSE student | React developer" value={resume.resumeHeadline} onChange={(event) => setResume({ ...resume, resumeHeadline: event.currentTarget.value })} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <TextInput label="Phone" placeholder="Mobile number" value={resume.phone} onChange={(event) => setResume({ ...resume, phone: event.currentTarget.value })} />
              <TextInput label="Portfolio / LinkedIn" placeholder="https://..." value={resume.portfolio} onChange={(event) => setResume({ ...resume, portfolio: event.currentTarget.value })} />
            </div>
            <Textarea label="Career Objective / Summary" minRows={4} autosize value={resume.about} onChange={(event) => setResume({ ...resume, about: event.currentTarget.value })} />
            <TagsInput label="Skills" placeholder="Add skills" value={resume.skills} onChange={(skills) => setResume({ ...resume, skills })} splitChars={[",", "|"]} clearable />

            <Divider className="border-mine-shaft-800" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <IconSchool size={20} className="text-bright-sun-400" />
                Education
              </div>
              <ActionIcon color="brightSun.4" variant="light" onClick={() => setResume((current) => ({ ...current, education: [...current.education, { ...emptyEducation }] }))}>
                <IconPlus size={18} />
              </ActionIcon>
            </div>
            {resume.education.map((item, index) => (
              <div key={index} className="rounded-md border border-mine-shaft-800 bg-mine-shaft-950/50 p-3">
                <div className="mb-3 flex justify-between">
                  <div className="text-sm font-semibold">Education {index + 1}</div>
                  <ActionIcon color="red.7" variant="subtle" onClick={() => setResume((current) => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextInput label="Degree" value={item.degree || ""} onChange={(event) => updateEducation(index, "degree", event.currentTarget.value)} />
                  <TextInput label="Institute" value={item.institute || ""} onChange={(event) => updateEducation(index, "institute", event.currentTarget.value)} />
                  <TextInput label="Year" value={item.year || ""} onChange={(event) => updateEducation(index, "year", event.currentTarget.value)} />
                  <TextInput label="Score" value={item.score || ""} onChange={(event) => updateEducation(index, "score", event.currentTarget.value)} />
                </div>
              </div>
            ))}
            {!resume.education.length && <div className="rounded-md border border-dashed border-mine-shaft-700 p-4 text-sm text-mine-shaft-300">Add your degree, college, year, and score.</div>}

            <Divider className="border-mine-shaft-800" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <IconBriefcase size={20} className="text-bright-sun-400" />
                Projects
              </div>
              <ActionIcon color="brightSun.4" variant="light" onClick={() => setResume((current) => ({ ...current, projects: [...current.projects, { ...emptyProject }] }))}>
                <IconPlus size={18} />
              </ActionIcon>
            </div>
            {resume.projects.map((item, index) => (
              <div key={index} className="rounded-md border border-mine-shaft-800 bg-mine-shaft-950/50 p-3">
                <div className="mb-3 flex justify-between">
                  <div className="text-sm font-semibold">Project {index + 1}</div>
                  <ActionIcon color="red.7" variant="subtle" onClick={() => setResume((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </div>
                <TextInput label="Project Title" value={item.title || ""} onChange={(event) => updateProject(index, "title", event.currentTarget.value)} />
                <Textarea className="mt-3" label="Description" minRows={3} autosize value={item.description || ""} onChange={(event) => updateProject(index, "description", event.currentTarget.value)} />
                <TextInput className="mt-3" label="Project Link" value={item.link || ""} onChange={(event) => updateProject(index, "link", event.currentTarget.value)} />
              </div>
            ))}
            {!resume.projects.length && <div className="rounded-md border border-dashed border-mine-shaft-700 p-4 text-sm text-mine-shaft-300">Add academic, internship, or personal projects.</div>}

            <TagsInput label="Achievements / Responsibilities" placeholder="Add achievement" value={resume.achievements} onChange={(achievements) => setResume({ ...resume, achievements })} splitChars={["|"]} clearable />
          </section>

          <section className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-6 shadow-[0_24px_90px_-58px_rgba(255,189,32,0.75)] print:bg-white print:text-black">
            <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-start">
              <div>
                <div className="text-3xl font-semibold">{displayName}</div>
                <div className="mt-1 text-lg text-bright-sun-400">{resume.resumeHeadline || "Add a resume headline"}</div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-mine-shaft-300">
                  {profile?.email && <span className="flex items-center gap-1"><IconMail size={16} />{profile.email}</span>}
                  {resume.phone && <span>{resume.phone}</span>}
                  {profile?.location && <span className="flex items-center gap-1"><IconMapPin size={16} />{profile.location}</span>}
                  {resume.portfolio && <span className="flex items-center gap-1"><IconExternalLink size={16} />{resume.portfolio}</span>}
                </div>
              </div>
              <Badge size="lg" color="brightSun.4" variant="light">Student Resume</Badge>
            </div>

            <ResumeSection title="Career Objective">
              <p className="text-sm leading-6 text-mine-shaft-200">{resume.about || "Add a concise objective that tells recruiters what role you are seeking and what you bring."}</p>
            </ResumeSection>

            <ResumeSection title="Education">
              {resume.education.length ? resume.education.map((item, index) => (
                <TimelineRow key={index} title={item.degree || "Degree"} subtitle={item.institute || "Institute"} meta={[item.year, item.score].filter(Boolean).join(" | ")} />
              )) : <EmptyResumeText text="Education details will appear here." />}
            </ResumeSection>

            <ResumeSection title="Skills">
              <div className="flex flex-wrap gap-2">
                {resume.skills.length ? resume.skills.map((skill, index) => <Badge key={index} color="brightSun.4" variant="light">{skill}</Badge>) : <EmptyResumeText text="Skills will appear here." />}
              </div>
            </ResumeSection>

            <ResumeSection title="Internships / Experience">
              {experiences.length ? experiences.map((item, index) => (
                <TimelineRow key={index} title={item.title || "Role"} subtitle={`${item.company || "Company"}${item.location ? ` | ${item.location}` : ""}`} meta={`${item.startDate || ""}${item.endDate ? ` - ${item.working ? "Present" : item.endDate}` : ""}`} description={item.description} />
              )) : <EmptyResumeText text="Add internships or work experience from your profile." />}
            </ResumeSection>

            <ResumeSection title="Projects">
              {resume.projects.length ? resume.projects.map((item, index) => (
                <TimelineRow key={index} title={item.title || "Project"} subtitle={item.link} description={item.description} />
              )) : <EmptyResumeText text="Projects will appear here." />}
            </ResumeSection>

            {!!certifications.length && (
              <ResumeSection title="Certifications">
                {certifications.map((item, index) => (
                  <TimelineRow key={index} title={item.name || "Certification"} subtitle={item.issuer} meta={item.issueDate} />
                ))}
              </ResumeSection>
            )}

            <ResumeSection title="Achievements">
              {resume.achievements.length ? (
                <ul className="list-disc pl-5 text-sm text-mine-shaft-200">
                  {resume.achievements.map((achievement, index) => <li key={index}>{achievement}</li>)}
                </ul>
              ) : <EmptyResumeText text="Achievements and responsibilities will appear here." />}
            </ResumeSection>
          </section>
        </div>
      </div>
    </div>
  );
};

const ResumeSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-b border-mine-shaft-800 py-5 last:border-b-0">
    <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
      <IconTrophy size={18} className="text-bright-sun-400" />
      {title}
    </div>
    {children}
  </div>
);

const TimelineRow = ({ title, subtitle, meta, description }: { title?: string; subtitle?: string; meta?: string; description?: string }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex flex-col justify-between gap-1 sm:flex-row">
      <div>
        <div className="font-semibold text-mine-shaft-100">{title}</div>
        {subtitle && <div className="text-sm text-mine-shaft-300">{subtitle}</div>}
      </div>
      {meta && <div className="text-sm text-mine-shaft-300">{meta}</div>}
    </div>
    {description && <div className="mt-2 text-sm leading-6 text-mine-shaft-200">{description}</div>}
  </div>
);

const EmptyResumeText = ({ text }: { text: string }) => (
  <div className="rounded-md border border-dashed border-mine-shaft-700 p-4 text-sm text-mine-shaft-300">{text}</div>
);

export default ResumePage;
