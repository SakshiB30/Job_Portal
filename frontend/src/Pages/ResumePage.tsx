import {
  Button,
  Checkbox,
  Progress,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconExternalLink,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,

  IconSchool,
  IconSparkles,
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
type EducationItem     = { degree?: string; institute?: string; year?: string; score?: string };
type ProjectItem       = { title?: string; description?: string; link?: string };
type ExperienceItem    = { title?: string; company?: string; location?: string; startDate?: string; endDate?: string; working?: boolean; description?: string };
type CertificationItem = { name?: string; issuer?: string; issueDate?: string };

/* ─── Empty templates ────────────────────────────────────────────────────── */
const emptyEducation:     EducationItem     = { degree: "", institute: "", year: "", score: "" };
const emptyProject:       ProjectItem       = { title: "", description: "", link: "" };
const emptyExperience:    ExperienceItem    = { title: "", company: "", location: "", startDate: "", endDate: "", working: false, description: "" };
const emptyCertification: CertificationItem = { name: "", issuer: "", issueDate: "" };

/* ─── Mantine dark-theme input styles ───────────────────────────────────── */
const IS = {
  label:       { fontSize: "12px", fontWeight: 600, color: "#a1a1aa", marginBottom: "5px" },
  description: { fontSize: "11px", color: "#71717a" },
  input: {
    fontSize: "13px", backgroundColor: "#111113", borderColor: "#3f3f46", color: "#f4f4f5",
    "&::placeholder": { color: "#52525b" },
    "&:focus": { borderColor: "#fbbf24", boxShadow: "0 0 0 2px rgba(251,191,36,0.15)" },
  },
};

/* ─── Step tracker config ────────────────────────────────────────────────── */
const STEPS = [
  { label: "Headline",   key: "headline"   },
  { label: "Summary",    key: "about"      },
  { label: "Contact",    key: "contact"    },
  { label: "Skills",     key: "skills"     },
  { label: "Education",  key: "education"  },
  { label: "Experience", key: "experience" },
  { label: "Projects",   key: "projects"   },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
const ResumePage = () => {
  const dispatch = useDispatch();
  const user    = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);

  const [saving, setSaving]               = useState(false);
  const [saved,  setSaved]                = useState(false);
  const [activeSection, setActiveSection] = useState<string>("basic");

  const [resume, setResume] = useState({
    phone: "", portfolio: "", resumeHeadline: "", about: "",
    skills:         [] as string[],
    education:      [] as EducationItem[],
    projects:       [] as ProjectItem[],
    achievements:   [] as string[],
    experiences:    [] as ExperienceItem[],
    certifications: [] as CertificationItem[],
  });

  /* sync from redux */
  useEffect(() => {
    setResume({
      phone:          profile?.phone           || "",
      portfolio:      profile?.portfolio       || "",
      resumeHeadline: profile?.resumeHeadline  || profile?.jobTitle || "",
      about:          profile?.about           || "",
      skills:         profile?.skills          || [],
      education:      (profile?.education      as EducationItem[])     || [],
      projects:       (profile?.projects       as ProjectItem[])       || [],
      achievements:   profile?.achievements    || [],
      experiences:    (profile?.experiences    as ExperienceItem[])    || [],
      certifications: (profile?.certifications as CertificationItem[]) || [],
    });
  }, [profile, user]);

  /* completion % */
  const completion = useMemo(() => {
    const checks = [
      Boolean(resume.resumeHeadline),
      Boolean(resume.about),
      Boolean(resume.phone),
      Boolean(profile?.email || user?.name),
      resume.skills.length         > 0,
      resume.education.length      > 0,
      resume.experiences.length    > 0,
      resume.projects.length       > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [resume, profile, user]);

  const completedSteps = useMemo(() => ({
    headline:   Boolean(resume.resumeHeadline),
    about:      Boolean(resume.about),
    contact:    Boolean(resume.phone),
    skills:     resume.skills.length         > 0,
    education:  resume.education.length      > 0,
    experience: resume.experiences.length    > 0,
    projects:   resume.projects.length       > 0,
  }), [resume]);

  if (!user) return <Navigate to="/login" replace />;

  /* ── helpers ── */
  const updateItem = <T,>(key: keyof typeof resume, index: number, field: keyof T, value: string | boolean) =>
    setResume(cur => ({
      ...cur,
      [key]: (cur[key] as T[]).map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));

  const addItem = <T,>(key: keyof typeof resume, empty: T) => {
    setResume(cur => ({ ...cur, [key]: [...(cur[key] as T[]), { ...empty }] }));
  };

  const removeItem = (key: keyof typeof resume, index: number) =>
    setResume(cur => ({ ...cur, [key]: (cur[key] as unknown[]).filter((_, i) => i !== index) }));

  const saveResume = async () => {
    try {
      setSaving(true);
      const updated = {
        ...profile,
        id: profile?.id ?? user?.profileId,
        phone: resume.phone, portfolio: resume.portfolio,
        resumeHeadline: resume.resumeHeadline, about: resume.about,
        skills: resume.skills, education: resume.education,
        projects: resume.projects, achievements: resume.achievements,
        experiences: resume.experiences, certifications: resume.certifications,
      };
      const savedData = await updateProfile(updated);
      dispatch(changeProfile(savedData));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      successNotification("Resume saved", "Your resume was updated successfully.");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { errorMessage?: string } } }).response?.data?.errorMessage
        : undefined;
      errorNotification("Save failed", msg || "Unable to save resume.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || profile?.name || "Your Name";
  const toggle = (key: string) => setActiveSection(prev => prev === key ? "" : key);

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="site-page px-0 py-0">

      {/* ══ TOP BAR ══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-mine-shaft-950/95 backdrop-blur-sm border-b border-mine-shaft-800">
        <div className="site-container px-4 sm:px-6 lg:px-8">

          {/* row 1 — title + actions */}
          <div className="flex items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bright-sun-400/10 border border-bright-sun-400/25">
                <IconSparkles size={17} className="text-bright-sun-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-mine-shaft-100 leading-none">Resume Builder</div>
                <div className="text-xs text-mine-shaft-500 mt-0.5">Edit · Live Preview · Save</div>
              </div>
            </div>

            {/* completion pill — hidden on small screens */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div
                className="flex items-center gap-2 rounded-full border border-mine-shaft-700 bg-mine-shaft-900 px-3 py-1.5 text-xs font-semibold text-mine-shaft-300"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: completion >= 80 ? "#4ade80" : completion >= 50 ? "#fbbf24" : "#f87171" }}
                />
                {completion}% complete
              </div>
              <div className="w-24">
                <Progress value={completion} color="brightSun.4" size="xs" radius="xl" />
              </div>
            </div>

            {/* buttons */}
            <div className="flex items-center gap-2 shrink-0">
              
              <Button
                loading={saving}
                leftSection={saved ? <IconCheck size={15} /> : <IconDeviceFloppy size={15} />}
                color={saved ? "green" : "brightSun.4"}
                variant={saved ? "light" : "filled"}
                size="sm"
                onClick={saveResume}
              >
                {saved ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>

          {/* row 2 — step tracker */}
          <div className="flex gap-1.5 overflow-x-auto pb-2.5 scrollbar-none">
            {STEPS.map(step => {
              const done = completedSteps[step.key as keyof typeof completedSteps];
              return (
                <div
                  key={step.key}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    done
                      ? "border-bright-sun-400/30 bg-bright-sun-400/10 text-bright-sun-400"
                      : "border-mine-shaft-700 bg-mine-shaft-900 text-mine-shaft-500"
                  }`}
                >
                  {done
                    ? <IconCheck size={10} />
                    : <span className="h-1.5 w-1.5 rounded-full bg-mine-shaft-600 inline-block" />
                  }
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════════════ */}
      <div className="site-container px-4 py-5 sm:px-6 lg:px-8 grid grid-cols-1 xl:grid-cols-[420px_1fr] site-grid-gap items-start">

        {/* ── LEFT: FORM PANEL ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* ── Basic Info ── */}
          <Section
            id="basic" active={activeSection} onToggle={toggle}
            icon={<IconUserCircle size={18} className="text-bright-sun-400" />}
            title="Basic Info"
            done={completedSteps.headline && completedSteps.about && completedSteps.contact}
          >
            <TextInput
              label="Resume Headline"
              placeholder="e.g. B.Tech CSE | Java Developer | Open to Internships"
              value={resume.resumeHeadline} styles={IS}
              onChange={e => setResume({ ...resume, resumeHeadline: e.currentTarget.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <TextInput
                label="Phone" placeholder="+91 XXXXX XXXXX"
                value={resume.phone} styles={IS}
                onChange={e => setResume({ ...resume, phone: e.currentTarget.value })}
              />
              <TextInput
                label="Portfolio / LinkedIn" placeholder="https://linkedin.com/in/..."
                value={resume.portfolio} styles={IS}
                onChange={e => setResume({ ...resume, portfolio: e.currentTarget.value })}
              />
            </div>
            <Textarea
              className="mt-3" label="Career Objective / Summary"
              placeholder="Write 2–3 lines about your goals and key strengths..."
              minRows={4} autosize value={resume.about} styles={IS}
              onChange={e => setResume({ ...resume, about: e.currentTarget.value })}
            />
            <TagsInput
              className="mt-3" label="Skills"
              description='Type a skill and press Enter (or use comma / | to separate)'
              placeholder="e.g. React, Node.js, SQL..."
              value={resume.skills} splitChars={[",", "|"]} clearable styles={IS}
              onChange={skills => setResume({ ...resume, skills })}
            />
          </Section>

          {/* ── Education ── */}
          <Section
            id="education" active={activeSection} onToggle={toggle}
            icon={<IconSchool size={18} className="text-bright-sun-400" />}
            title="Education"
            count={resume.education.length}
            done={completedSteps.education}
            addBtn={{ label: "Add Education", onClick: () => { addItem("education", emptyEducation); setActiveSection("education"); } }}
          >
            {resume.education.length === 0 && (
              <EmptyHint icon="🎓" text="No education added yet. Click 'Add Education' to get started." />
            )}
            {resume.education.map((item, i) => (
              <ItemCard
                key={i}
                title={item.degree || "Untitled Degree"}
                subtitle={item.institute}
                onDelete={() => removeItem("education", i)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextInput label="Degree / Certificate" placeholder="B.Tech / 12th / Diploma"
                    value={item.degree || ""} styles={IS}
                    onChange={e => updateItem<EducationItem>("education", i, "degree", e.currentTarget.value)} />
                  <TextInput label="School / College"
                    value={item.institute || ""} styles={IS}
                    onChange={e => updateItem<EducationItem>("education", i, "institute", e.currentTarget.value)} />
                  <TextInput label="Year of Passing" placeholder="2024"
                    value={item.year || ""} styles={IS}
                    onChange={e => updateItem<EducationItem>("education", i, "year", e.currentTarget.value)} />
                  <TextInput label="Score / CGPA / %" placeholder="8.5 / 85%"
                    value={item.score || ""} styles={IS}
                    onChange={e => updateItem<EducationItem>("education", i, "score", e.currentTarget.value)} />
                </div>
              </ItemCard>
            ))}
            <AddMoreBtn
              label="Add Education"
              onClick={() => { addItem("education", emptyEducation); setActiveSection("education"); }}
            />
          </Section>

          {/* ── Experience ── */}
          <Section
            id="experience" active={activeSection} onToggle={toggle}
            icon={<IconBriefcase size={18} className="text-bright-sun-400" />}
            title="Work Experience / Internships"
            count={resume.experiences.length}
            done={completedSteps.experience}
            addBtn={{ label: "Add Experience", onClick: () => { addItem("experiences", emptyExperience); setActiveSection("experience"); } }}
          >
            {resume.experiences.length === 0 && (
              <EmptyHint icon="💼" text="No experience added yet. Click 'Add Experience' to get started." />
            )}
            {resume.experiences.map((item, i) => (
              <ItemCard
                key={i}
                title={item.title || "Untitled Role"}
                subtitle={[item.company, item.location].filter(Boolean).join(" · ")}
                onDelete={() => removeItem("experiences", i)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextInput label="Job Title" placeholder="Frontend Developer Intern"
                    value={item.title || ""} styles={IS}
                    onChange={e => updateItem<ExperienceItem>("experiences", i, "title", e.currentTarget.value)} />
                  <TextInput label="Company"
                    value={item.company || ""} styles={IS}
                    onChange={e => updateItem<ExperienceItem>("experiences", i, "company", e.currentTarget.value)} />
                  <TextInput label="Location" placeholder="Remote / Bangalore"
                    value={item.location || ""} styles={IS}
                    onChange={e => updateItem<ExperienceItem>("experiences", i, "location", e.currentTarget.value)} />
                  <TextInput label="Start Date" placeholder="Jan 2024"
                    value={item.startDate || ""} styles={IS}
                    onChange={e => updateItem<ExperienceItem>("experiences", i, "startDate", e.currentTarget.value)} />
                  {!item.working && (
                    <TextInput label="End Date" placeholder="Jun 2024"
                      value={item.endDate || ""} styles={IS}
                      onChange={e => updateItem<ExperienceItem>("experiences", i, "endDate", e.currentTarget.value)} />
                  )}
                </div>
                <Checkbox
                  className="mt-3" label="Currently working here"
                  checked={item.working || false} color="brightSun.4"
                  styles={{ label: { color: "#a1a1aa", fontSize: "13px" } }}
                  onChange={e => updateItem<ExperienceItem>("experiences", i, "working", e.currentTarget.checked)}
                />
                <Textarea
                  className="mt-3" label="Description" minRows={3} autosize
                  placeholder="Describe your responsibilities and achievements..."
                  value={item.description || ""} styles={IS}
                  onChange={e => updateItem<ExperienceItem>("experiences", i, "description", e.currentTarget.value)}
                />
              </ItemCard>
            ))}
            <AddMoreBtn
              label="Add Experience"
              onClick={() => { addItem("experiences", emptyExperience); setActiveSection("experience"); }}
            />
          </Section>

          {/* ── Projects ── */}
          <Section
            id="projects" active={activeSection} onToggle={toggle}
            icon={<IconTrophy size={18} className="text-bright-sun-400" />}
            title="Projects"
            count={resume.projects.length}
            done={completedSteps.projects}
            addBtn={{ label: "Add Project", onClick: () => { addItem("projects", emptyProject); setActiveSection("projects"); } }}
          >
            {resume.projects.length === 0 && (
              <EmptyHint icon="🚀" text="No projects added yet. Click 'Add Project' to get started." />
            )}
            {resume.projects.map((item, i) => (
              <ItemCard
                key={i}
                title={item.title || "Untitled Project"}
                onDelete={() => removeItem("projects", i)}
              >
                <TextInput label="Project Title"
                  value={item.title || ""} styles={IS}
                  onChange={e => updateItem<ProjectItem>("projects", i, "title", e.currentTarget.value)} />
                <Textarea
                  className="mt-3" label="Description" minRows={3} autosize
                  placeholder="What did you build? What problem does it solve?"
                  value={item.description || ""} styles={IS}
                  onChange={e => updateItem<ProjectItem>("projects", i, "description", e.currentTarget.value)}
                />
                <TextInput
                  className="mt-3" label="Project Link (GitHub / Live)"
                  placeholder="https://github.com/..."
                  value={item.link || ""} styles={IS}
                  onChange={e => updateItem<ProjectItem>("projects", i, "link", e.currentTarget.value)}
                />
              </ItemCard>
            ))}
            <AddMoreBtn
              label="Add Project"
              onClick={() => { addItem("projects", emptyProject); setActiveSection("projects"); }}
            />
          </Section>

          {/* ── Certifications ── */}
          <Section
            id="certifications" active={activeSection} onToggle={toggle}
            icon={<IconSchool size={18} className="text-bright-sun-400" />}
            title="Certifications"
            count={resume.certifications.length}
            addBtn={{ label: "Add Certification", onClick: () => { addItem("certifications", emptyCertification); setActiveSection("certifications"); } }}
          >
            {resume.certifications.length === 0 && (
              <EmptyHint icon="🏅" text="No certifications added yet." />
            )}
            {resume.certifications.map((item, i) => (
              <ItemCard
                key={i}
                title={item.name || "Untitled Certification"}
                subtitle={item.issuer}
                onDelete={() => removeItem("certifications", i)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextInput label="Certificate Name"
                    value={item.name || ""} styles={IS}
                    onChange={e => updateItem<CertificationItem>("certifications", i, "name", e.currentTarget.value)} />
                  <TextInput label="Issuing Organization" placeholder="Coursera / NPTEL / Google"
                    value={item.issuer || ""} styles={IS}
                    onChange={e => updateItem<CertificationItem>("certifications", i, "issuer", e.currentTarget.value)} />
                  <TextInput label="Issue Date" placeholder="Mar 2024"
                    value={item.issueDate || ""} styles={IS}
                    onChange={e => updateItem<CertificationItem>("certifications", i, "issueDate", e.currentTarget.value)} />
                </div>
              </ItemCard>
            ))}
            <AddMoreBtn
              label="Add Certification"
              onClick={() => { addItem("certifications", emptyCertification); setActiveSection("certifications"); }}
            />
          </Section>

          {/* ── Achievements ── */}
          <Section
            id="achievements" active={activeSection} onToggle={toggle}
            icon={<IconTrophy size={18} className="text-bright-sun-400" />}
            title="Achievements & Extra-Curriculars"
            count={resume.achievements.length}
          >
            <TagsInput
              description="Type an achievement and press Enter or | to separate"
              placeholder="e.g. Hackathon winner | NSS volunteer | 98 percentile JEE"
              value={resume.achievements}
              onChange={achievements => setResume({ ...resume, achievements })}
              splitChars={["|"]} clearable styles={IS}
            />
          </Section>
        </div>

        {/* ── RIGHT: RESUME PREVIEW ─────────────────────────────────────── */}
        <div
          id="resume-preview"
          className="sticky top-[110px] rounded-xl overflow-hidden border border-mine-shaft-700 shadow-[0_0_60px_-5px_rgba(251,191,36,0.12)] print:shadow-none bg-white"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {/* ── NAME + HEADLINE ── */}
          <div className="bg-[#1a2a4a] px-8 pt-7 pb-6 text-center">
            <h1
              className="text-[26px] font-bold tracking-widest text-white uppercase"
              style={{ letterSpacing: "0.18em" }}
            >
              {displayName}
            </h1>
            <p className="mt-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-[#7eb8c9]">
              {resume.resumeHeadline || (
                <span className="italic opacity-40 normal-case tracking-normal text-[#7eb8c9]">Add a resume headline →</span>
              )}
            </p>
            {/* contact row */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[10px] text-[#a8c4d4]">
              {resume.phone && (
                <span className="flex items-center gap-1.5">
                  <IconPhone size={11} className="shrink-0" />{resume.phone}
                </span>
              )}
              {profile?.email && (
                <span className="flex items-center gap-1.5">
                  <IconMail size={11} className="shrink-0" />{profile.email}
                </span>
              )}
              {profile?.location && (
                <span className="flex items-center gap-1.5">
                  <IconMapPin size={11} className="shrink-0" />{profile.location}
                </span>
              )}
              {resume.portfolio && (
                <span className="flex items-center gap-1.5">
                  <IconWorld size={11} className="shrink-0" />{resume.portfolio}
                </span>
              )}
            </div>
          </div>

          {/* ── BODY — single column ── */}
          <div className="px-8 py-6 space-y-5 bg-white text-gray-800">

            {/* Summary */}
            {resume.about && (
              <CVSection title="Summary">
                <p className="text-[11px] leading-[1.85] text-gray-600">{resume.about}</p>
              </CVSection>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <CVSection title="Education">
                <div className="space-y-3">
                  {resume.education.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11.5px] font-bold text-[#1a2a4a]">
                          {item.institute || "Institution"}
                        </span>
                        <span className="shrink-0 text-[10px] text-gray-500">{item.year}</span>
                      </div>
                      <div className="text-[11px] italic text-gray-500">
                        {item.degree}{item.score ? ` — ${item.score}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </CVSection>
            )}

            {/* Work Experience */}
            {resume.experiences.length > 0 && (
              <CVSection title="Work Experience">
                <div className="space-y-4">
                  {resume.experiences.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11.5px] font-bold text-[#1a2a4a]">
                          {item.company || "Company"}
                        </span>
                        <span className="shrink-0 text-[10px] text-gray-500">
                          {[item.startDate, item.working ? "Present" : item.endDate].filter(Boolean).join(" – ")}
                        </span>
                      </div>
                      <div className="text-[11px] italic text-gray-500 mb-1">
                        {[item.title, item.location].filter(Boolean).join(" · ")}
                      </div>
                      {item.description && (
                        <ul className="space-y-0.5">
                          {item.description.split(/\n|•/).filter(s => s.trim()).map((line, j) => (
                            <li key={j} className="flex items-start gap-2 text-[11px] leading-[1.7] text-gray-600">
                              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a2a4a]" />
                              {line.trim()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CVSection>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <CVSection title="Projects">
                <div className="space-y-3">
                  {resume.projects.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11.5px] font-bold text-[#1a2a4a]">
                          {item.title || "Project"}
                        </span>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer"
                            className="shrink-0 text-[#3b7ea1] hover:underline text-[10px]">
                            <IconExternalLink size={11} className="inline" /> View
                          </a>
                        )}
                      </div>
                      {item.description && (
                        <ul className="space-y-0.5 mt-0.5">
                          {item.description.split(/\n|•/).filter(s => s.trim()).map((line, j) => (
                            <li key={j} className="flex items-start gap-2 text-[11px] leading-[1.7] text-gray-600">
                              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a2a4a]" />
                              {line.trim()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CVSection>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <CVSection title="Skills">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {resume.skills.map((s, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1a2a4a] shrink-0" />{s}
                    </span>
                  ))}
                </div>
              </CVSection>
            )}

            {/* Certifications */}
            {resume.certifications.length > 0 && (
              <CVSection title="Certifications">
                <div className="space-y-2">
                  {resume.certifications.map((item, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#1a2a4a]">{item.name}</span>
                      <span className="shrink-0 text-[10px] text-gray-500">
                        {[item.issuer, item.issueDate].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  ))}
                </div>
              </CVSection>
            )}

            {/* Achievements */}
            {resume.achievements.length > 0 && (
              <CVSection title="Achievements & Extra-Curriculars">
                <ul className="space-y-0.5">
                  {resume.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] leading-[1.7] text-gray-600">
                      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a2a4a]" />
                      {a}
                    </li>
                  ))}
                </ul>
              </CVSection>
            )}

            {/* Empty state */}
            {!resume.about && !resume.education.length && !resume.experiences.length &&
             !resume.projects.length && !resume.skills.length && (
              <div className="py-10 text-center text-xs text-gray-300 italic">
                Fill in the form on the left to see your resume preview here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE UI PIECES
══════════════════════════════════════════════════════════════════════════ */

/* Accordion section wrapper */
const Section = ({
  id, active, onToggle, icon, title, count, done, addBtn, children,
}: {
  id: string; active: string; onToggle: (id: string) => void;
  icon: React.ReactNode; title: string;
  count?: number; done?: boolean;
  addBtn?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) => {
  const isOpen = active === id;
  return (
    <div className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900 overflow-hidden">

      {/* header row */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-mine-shaft-800/40 transition-colors text-left"
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bright-sun-400/10 border border-bright-sun-400/20">
            {icon}
          </div>
          <span className="text-sm font-semibold text-mine-shaft-100 truncate">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="shrink-0 rounded-full bg-bright-sun-400/15 border border-bright-sun-400/30 px-2 py-0.5 text-xs font-medium text-bright-sun-400">
              {count}
            </span>
          )}
          {done && (
            <span className="shrink-0 flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
              <IconCheck size={10} /> Done
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {addBtn && isOpen && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); addBtn.onClick(); }}
              className="flex items-center gap-1.5 rounded-lg bg-bright-sun-400 px-3 py-1.5 text-xs font-semibold text-mine-shaft-950 hover:bg-bright-sun-300 active:scale-95 transition-all"
            >
              <IconPlus size={13} />
              {addBtn.label}
            </button>
          )}
          {isOpen
            ? <IconChevronUp   size={16} className="text-mine-shaft-400" />
            : <IconChevronDown size={16} className="text-mine-shaft-400" />
          }
        </div>
      </button>

      {/* body */}
      {isOpen && (
        <div className="border-t border-mine-shaft-800 px-4 pt-4 pb-4 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
};

/* Individual item card (education, experience, etc.) */
const ItemCard = ({
  title, subtitle, onDelete, children,
}: {
  title: string; subtitle?: string; onDelete: () => void; children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-mine-shaft-700 overflow-hidden">
    {/* card header */}
    <div className="flex items-center justify-between px-3 py-2 bg-mine-shaft-800 border-b border-mine-shaft-700">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-mine-shaft-200 truncate">{title}</div>
        {subtitle && <div className="text-xs text-mine-shaft-500 truncate">{subtitle}</div>}
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 ml-2 flex h-7 w-7 items-center justify-center rounded-md text-mine-shaft-500 hover:bg-red-500/15 hover:text-red-400 transition-colors"
        aria-label="Delete"
      >
        <IconTrash size={14} />
      </button>
    </div>
    <div className="px-3 py-3 bg-mine-shaft-950/50">{children}</div>
  </div>
);

/* "＋ Add another …" dashed button at bottom of section */
const AddMoreBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-mine-shaft-700 py-2.5 text-xs font-medium text-mine-shaft-400 hover:border-bright-sun-400/50 hover:text-bright-sun-400 hover:bg-bright-sun-400/5 transition-all"
  >
    <IconPlus size={14} />
    {label}
  </button>
);

/* Empty state hint */
const EmptyHint = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-dashed border-mine-shaft-700 bg-mine-shaft-950/40 px-4 py-3">
    <span className="text-xl leading-none">{icon}</span>
    <span className="text-xs text-mine-shaft-500">{text}</span>
  </div>
);

/* CV section heading — navy bold uppercase + teal underline, matching the screenshot */
const CVSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2
      className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a2a4a] pb-[3px]"
      style={{ borderBottom: "2px solid #3b7ea1" }}
    >
      {title}
    </h2>
    {children}
  </div>
);

export default ResumePage;
