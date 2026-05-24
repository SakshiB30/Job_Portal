import { IconCalendarMonth, IconHeart, IconHeartFilled, IconMailForward, IconMapPin, IconUserPlus, IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react"
import { ActionIcon, Avatar, Button, Divider, Modal, Select, Text, Textarea, Loader } from '@mantine/core';
import { Link } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { DateInput, TimeInput } from '@mantine/dates';
import { useEffect, useRef, useState } from "react";
import { getItem, setItem } from "../../Services/LocalStorageService";
import { useSelector } from "react-redux";
import type { RootState } from "../../Types";
import { sendSelectionEmail, sendInvitationEmail, sendInterviewEmail } from "../../Services/UserService";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { inviteStudent } from "../../Services/InvitationService";
import { getMyJobs } from "../../Services/JobService";

type TalentCardProps = {
  id?: string | number;
  name?: string;
  role?: string;
  company?: string;
  topSkills?: string[];
  about?: string;
  expectedCtc?: string;
  location?: string;
  image?: string;
  email?: string;
  posted?: boolean;
  invited?: boolean;
  keys?: number;
};

type MessageThread = {
  id: string;
  participant: string;
  role?: string;
  subject?: string;
  status?: string;
  avatar?: string;
  items?: Array<Record<string, string>>;
  messages?: Array<Record<string, string>>;
};

const TalentCard = (props: TalentCardProps) => {
   const [opened, { close }] = useDisclosure(false);
   const [messageOpened, { close: closeMessage }] = useDisclosure(false);
   const [value, setValue] = useState<string | null>(null);
   const [time, setTime] = useState("");
   const [isLiked, setIsLiked] = useState(false);
   const [isSelected, setIsSelected] = useState(false);
   const [inviteResponse, setInviteResponse] = useState<"ACCEPTED" | "REJECTED" | null>(null);
   const [inviteModalOpened, { open: openInvite, close: closeInvite }] = useDisclosure(false);
   const [companyJobs, setCompanyJobs] = useState<Array<{ id?: string | number; jobTitle?: string }>>([]);
   const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
   const [loadingJobs, setLoadingJobs] = useState(false);
   const [inviting, setInviting] = useState(false);
   const [roundName, setRoundName] = useState<string | null>("Technical Interview");
   const [message, setMessage] = useState("Congratulations. You have been selected for the next round. Our team will contact you with the schedule and preparation details.");
   const [sending, setSending] = useState(false);
   const ref = useRef<HTMLInputElement>(null);
   const user = useSelector((state: RootState) => state.user);
   const profile = useSelector((state: RootState) => state.profile);
   const companyName = profile?.company || user?.name || "Company";
   const talentKey = props.id ?? props.name ?? "unknown";
   const selectedStorageKey = `selectedTalents:${user?.id || "guest"}`;
   const messageStorageKey = `messageThreads:${user?.accountType || "guest"}:${user?.id || "guest"}`;
   const interviewStorageKey = `scheduledInterviews:${user?.id || "guest"}`;
   const likedStorageKey = `likedTalents:${user?.id || "guest"}`;
   const imageSrc = props.image?.startsWith("data:") ? props.image : `/${props.image || "A3.png"}`;

  useEffect(() => {
    const likedTalents = getItem(likedStorageKey) || [];
    const selectedTalents = getItem(selectedStorageKey) || [];
    const responses = getItem("inviteResponses") || {};
    setIsLiked(likedTalents.includes(props.id));
    setIsSelected(selectedTalents.includes(props.id));
    setInviteResponse(responses[talentKey] || null);
   }, [props.id, selectedStorageKey]);

   const handleLikeClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const likedTalents = getItem(likedStorageKey) || [];
    const updatedLikes = likedTalents.includes(props.id)
      ? likedTalents.filter((id: string | number) => id !== props.id)
      : [...likedTalents, props.id];
    setItem(likedStorageKey, updatedLikes);
    setIsLiked(!isLiked);
   };

   const handleSelectionEmail = async () => {
    if (!props.email) {
      errorNotification("Email missing", "This student does not have an email address.");
      return;
    }
    try {
      setSending(true);
      await sendSelectionEmail({
        toEmail: props.email,
        candidateName: props.name,
        companyName,
        role: props.role,
        roundName,
        message,
      });
      const selectedTalents = getItem(selectedStorageKey) || [];
      const updatedSelected = selectedTalents.includes(props.id) ? selectedTalents : [...selectedTalents, props.id];
      setItem(selectedStorageKey, updatedSelected);
      const threads = getItem(messageStorageKey) || [];
      const existingThread = (threads as MessageThread[]).find((thread) => thread.id === `selection-${props.id}`);
      const sentMessage = {
        id: crypto.randomUUID(),
        from: "company",
        text: `${props.name} selected for ${roundName}. ${message}`,
        time: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      };
      const nextThreads = existingThread
        ? (threads as MessageThread[]).map((thread) => thread.id === `selection-${props.id}` ? { ...thread, status: "read", items: [...(thread.items || thread.messages || []), sentMessage] } : thread)
        : [{
            id: `selection-${props.id}`,
            participant: props.name,
            role: props.role,
            subject: `Selected for ${roundName}`,
            status: "read",
            avatar: imageSrc,
            items: [sentMessage],
          }, ...threads];
      setItem(messageStorageKey, nextThreads);
      setIsSelected(true);
      closeMessage();
      successNotification("Email sent", `${props.name} has been notified for the next round.`);
    } catch (error: unknown) {
      console.error(error);
      const message = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { errorMessage?: string } } }).response?.data?.errorMessage
        : undefined;
      errorNotification("Email failed", message || "Unable to send selection email right now.");
    } finally {
      setSending(false);
    }
   };

   const handleScheduleInterview = async () => {
    if (!value || !time) {
      errorNotification("Schedule incomplete", "Select both interview date and time.");
      return;
    }

    const interviews = getItem(interviewStorageKey) || [];
    const scheduledAt = `${value} ${time}`;
    const nextInterviews = [
      {
        id: crypto.randomUUID(),
        talentId: talentKey,
        talentName: props.name,
        role: props.role,
        scheduledAt,
      },
      ...interviews,
    ];
    setItem(interviewStorageKey, nextInterviews);
    if (props.email) {
      try {
        await sendInterviewEmail({
          toEmail: props.email,
          candidateName: props.name,
          companyName,
          role: props.role,
          scheduledAt,
          message: "Please check your email and be available at the scheduled time.",
        });
      } catch (emailErr) {
        console.error("Interview email failed:", emailErr);
        errorNotification("Email failed", "Interview was scheduled locally, but the email could not be sent.");
      }
    }
    successNotification("Interview scheduled", `${props.name || "Student"} is scheduled for ${scheduledAt}.`);
    close();
   };

   const handleOpenInvite = async () => {
    setLoadingJobs(true);
    try {
      const jobs = await getMyJobs();
      setCompanyJobs(jobs || []);
      if ((jobs || []).length > 0) {
        setSelectedJobId(String(jobs[0].id ?? ''));
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
    openInvite();
   };

   const handleConfirmInvite = async () => {
    if (!selectedJobId) {
      errorNotification('No job selected', 'Select a job to invite the candidate.');
      return;
    }
    setInviting(true);
    try {
      inviteStudent(selectedJobId, {
        id: props.id ?? talentKey,
        name: props.name,
        role: props.role,
        company: props.company,
        topSkills: props.topSkills,
        about: props.about,
        expectedCtc: props.expectedCtc,
        location: props.location,
        email: props.email,
        image: props.image,
      });
      // Send invitation email
      if (props.email) {
        try {
          await sendInvitationEmail({
            toEmail: props.email,
            candidateName: props.name,
            companyName: companyName,
            jobTitle: companyJobs.find(j => String(j.id) === selectedJobId)?.jobTitle || 'a position',
            jobId: selectedJobId,
          });
        } catch (emailErr) {
          console.error('Invitation email failed:', emailErr);
          // Still show success for the invite itself
        }
      }
      successNotification('Invited', `${props.name || 'Student'} has been invited to apply.`);
      closeInvite();
    } catch {
      errorNotification('Invite failed', 'Could not invite the candidate.');
    } finally {
      setInviting(false);
    }
   };

   const handleInviteResponse = (response: "ACCEPTED" | "REJECTED") => {
    const responses = getItem("inviteResponses") || {};
    setItem("inviteResponses", { ...responses, [talentKey]: response });
    setInviteResponse(response);
    successNotification(response === "ACCEPTED" ? "Invitation accepted" : "Invitation rejected", `${props.name || "Student"} invitation marked as ${response.toLowerCase()}.`);
   };

  return (
      <div className="card-standard h-full mt-5">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <div className="p-2 bg-mine-shaft-800 rounded-full">
            <Avatar size="lg" src={imageSrc} alt="" />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-lg">{props.name}</div>
            <div className="text-sm text-mine-shaft-300">{props.role} &#x2022; {props.company} </div>
            {isSelected && <div className="w-fit rounded-full bg-bright-sun-400/15 px-2 py-0.5 text-xs font-medium text-bright-sun-400">Selected for next round</div>}
          </div>
        </div>
        <ActionIcon
          onClick={handleLikeClick}
          variant="light"
          color="red"
          radius="xl"
          size="lg"
          className="border border-mine-shaft-800"
          aria-label={isLiked ? 'Unlike talent' : 'Like talent'}
        >
          {isLiked ? <IconHeartFilled className="text-red-500" /> : <IconHeart className="text-mine-shaft-300" />}
        </ActionIcon>
      </div>

      {isSelected && (
        <span className="badge-ats bg-bright-sun-400/10 text-bright-sun-400 border border-bright-sun-400/20 w-fit">
          Selected
        </span>
      )}

      {(() => {
        const MAX_SKILLS_SHOWN = 6;
        const skills = props.topSkills ?? [];
        const displaySkills = skills.slice(0, MAX_SKILLS_SHOWN);
        const remaining = Math.max(0, skills.length - MAX_SKILLS_SHOWN);

        return (
          <div className="flex flex-wrap gap-2 [&>div]:py-1 [&>div]:px-2 [&>div]:bg-mine-shaft-800 [&>div]:rounded-lg text-xs [&>div]:text-bright-sun-400">
            {displaySkills.map((skill, index) => (
              <div key={`${skill}-${index}`}>{skill}</div>
            ))}
            {remaining > 0 && <div>+{remaining} more</div>}
          </div>
        );
      })()}

        <Text className="text-xs! text-justify text-mine-shaft-300!" lineClamp={3}>
          {props.about}
        </Text>

        <div className="flex items-center gap-2 mt-1">
          <a href={`https://github.com/${props.name?.toLowerCase().replace(/\s+/g, '') || 'github'}`} target="_blank" rel="noreferrer" className="text-mine-shaft-400 hover:text-bright-sun-400 transition-colors" title="GitHub Profile">
            <IconBrandGithub size={16} />
          </a>
          <a href={`https://linkedin.com/in/${props.name?.toLowerCase().replace(/\s+/g, '-') || 'linkedin'}`} target="_blank" rel="noreferrer" className="text-mine-shaft-400 hover:text-bright-sun-400 transition-colors" title="LinkedIn Profile">
            <IconBrandLinkedin size={16} />
          </a>
        </div>
        <Divider size="xs" color="!mineShaft.7"/>
        {
          props.invited?<div className="flex gap-1 text-mine-shaft-200 text-sm items-center">
            <IconCalendarMonth stroke={1.5} className="w-5 h-5"/>Interview: August 27, 2024 10:00 AM
          </div>:
            <div className="flex justify-between items-center mt-2">
            <div className="text-mine-shaft-200 font-semibold ">{props.expectedCtc}</div>
            <div className="flex items-center text-mine-shaft-400 gap-1 text-xs"> <IconMapPin className="h-5 w-5" stroke={1.5}/> {props.location} </div>
            </div>
        }
   
      <Divider size="xs" color="!mineShaft.7"/>

      <div className="flex flex-col sm:flex-row *:w-full sm:*:w-1/2 *:p-1">
      {
        !props.invited &&
        <>
        <Link to={`/talent-profile/${props.id}`}>
            <Button color="brightSun.4" variant="outline" fullWidth>Profile</Button>
        </Link>
        <div>
            <Button onClick={handleOpenInvite} rightSection={<IconUserPlus className="w-5 h-5" />} color="brightSun.4" variant="light" fullWidth>Invite</Button>
        </div>
        </>
      }
      
      {
        props.invited && <>
        <div>
           <Button disabled={inviteResponse === "ACCEPTED"} onClick={() => handleInviteResponse("ACCEPTED")} color="brightSun.4" variant={inviteResponse === "ACCEPTED" ? "filled" : "outline"} fullWidth>
            {inviteResponse === "ACCEPTED" ? "Accepted" : "Accept"}
           </Button>
        </div>
        <div>
           <Button disabled={inviteResponse === "REJECTED"} onClick={() => handleInviteResponse("REJECTED")} color="red.7" variant={inviteResponse === "REJECTED" ? "filled" : "light"} fullWidth>
            {inviteResponse === "REJECTED" ? "Rejected" : "Reject"}
           </Button>
        </div>
        </>
      }

      </div>
      <Modal opened={inviteModalOpened} onClose={closeInvite} title={`Invite ${props.name || 'Student'}`} centered>
        <div className="flex flex-col gap-4">
          {loadingJobs ? (
            <div className="flex items-center justify-center py-8">
              <Loader size="sm" />
              <span className="ml-2 text-sm text-mine-shaft-300">Loading your jobs...</span>
            </div>
          ) : companyJobs.length === 0 ? (
            <div className="rounded-md border border-dashed border-mine-shaft-700 p-4 text-center text-sm text-mine-shaft-300">
              No active jobs found. Post a job first before inviting candidates.
            </div>
          ) : (
            <>
              <Select
                label="Select Job"
                placeholder="Pick a job to invite to"
                value={selectedJobId}
                onChange={setSelectedJobId}
                data={companyJobs.map((job) => ({
                  value: String(job.id ?? ''),
                  label: job.jobTitle || `Job #${job.id}`,
                }))}
              />
              <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900/60 p-3 text-sm text-mine-shaft-300">
                An invitation email will be sent to <span className="font-semibold text-mine-shaft-100">{props.email || "email not available"}</span>, notifying them to apply.
              </div>
              <Button
                loading={inviting}
                disabled={!selectedJobId}
                onClick={handleConfirmInvite}
                leftSection={<IconUserPlus size={18} />}
                color="brightSun.4"
                variant="filled"
                fullWidth
              >
                Send Invitation
              </Button>
            </>
          )}
        </div>
      </Modal>
      <Modal opened={opened} onClose={close} title="Schedule Interview" centered>
        <div className="flex flex-col gap-4">
          <DateInput minDate={new Date()} value={value} onChange={setValue} label="Date" placeholder="Enter Date" />
          <TimeInput value={time} onChange={(event) => setTime(event.currentTarget.value)} label="Time" ref={ref} onClick={()=> ref.current?.showPicker()}/>
          <Button onClick={handleScheduleInterview} color="brightSun.4" variant="light" fullWidth>Schedule</Button>
        </div>         
      </Modal>
      <Modal opened={messageOpened} onClose={closeMessage} title={`Message ${props.name}`} centered>
        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900/60 p-3 text-sm text-mine-shaft-300">
            Email will be sent to <span className="font-semibold text-mine-shaft-100">{props.email || "email not available"}</span> from {companyName}.
          </div>
          <Select
            label="Next Round"
            value={roundName}
            onChange={setRoundName}
            data={["Technical Interview", "HR Interview", "Manager Round", "Assignment Round", "Final Round"]}
          />
          <Textarea
            label="Email Message"
            minRows={5}
            autosize
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
          <Button loading={sending} disabled={!props.email || !roundName || !message.trim()} onClick={handleSelectionEmail} leftSection={<IconMailForward size={18} />} color="brightSun.4" variant="filled" fullWidth>
            Send Selection Email
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default TalentCard

