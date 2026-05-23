import { IconCalendarMonth, IconHeart, IconHeartFilled, IconMailForward, IconMapPin } from "@tabler/icons-react"
import { ActionIcon, Avatar, Button, Divider, Modal, Select, Text, Textarea } from '@mantine/core';
import { Link } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { DateInput, TimeInput } from '@mantine/dates';
import { useEffect, useRef, useState } from "react";
import { getItem, setItem } from "../../Services/LocalStorageService";
import { useSelector } from "react-redux";
import type { RootState } from "../../Types";
import { sendSelectionEmail } from "../../Services/UserService";
import { errorNotification, successNotification } from "../../Services/NotificationService";

const TalentCard = (props:any) => {
   const [opened, { open, close }] = useDisclosure(false);
   const [messageOpened, { open: openMessage, close: closeMessage }] = useDisclosure(false);
   const [value, setValue] = useState<string | null>(null);
   const [isLiked, setIsLiked] = useState(false);
   const [isSelected, setIsSelected] = useState(false);
   const [roundName, setRoundName] = useState<string | null>("Technical Interview");
   const [message, setMessage] = useState("Congratulations. You have been selected for the next round. Our team will contact you with the schedule and preparation details.");
   const [sending, setSending] = useState(false);
   const ref = useRef<HTMLInputElement>(null);
   const user = useSelector((state: RootState) => state.user);
   const profile = useSelector((state: RootState) => state.profile);
   const companyName = profile?.company || user?.name || "Company";
   const selectedStorageKey = `selectedTalents:${user?.id || "guest"}`;
   const messageStorageKey = `messageThreads:${user?.accountType || "guest"}:${user?.id || "guest"}`;

   useEffect(() => {
    const likedTalents = getItem('likedTalents') || [];
    const selectedTalents = getItem(selectedStorageKey) || [];
    setIsLiked(likedTalents.includes(props.id));
    setIsSelected(selectedTalents.includes(props.id));
   }, [props.id, selectedStorageKey]);

   const handleLikeClick = (event:any) => {
    event.preventDefault();
    event.stopPropagation();
    const likedTalents = getItem('likedTalents') || [];
    const updatedLikes = likedTalents.includes(props.id)
      ? likedTalents.filter((id:any) => id !== props.id)
      : [...likedTalents, props.id];
    setItem('likedTalents', updatedLikes);
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
      const existingThread = threads.find((thread: any) => thread.id === `selection-${props.id}`);
      const sentMessage = {
        id: crypto.randomUUID(),
        from: "company",
        text: `${props.name} selected for ${roundName}. ${message}`,
        time: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      };
      const nextThreads = existingThread
        ? threads.map((thread: any) => thread.id === `selection-${props.id}` ? { ...thread, status: "read", items: [...(thread.items || thread.messages || []), sentMessage] } : thread)
        : [{
            id: `selection-${props.id}`,
            participant: props.name,
            role: props.role,
            subject: `Selected for ${roundName}`,
            status: "read",
            avatar: `/${props.image}`,
            items: [sentMessage],
          }, ...threads];
      setItem(messageStorageKey, nextThreads);
      setIsSelected(true);
      closeMessage();
      successNotification("Email sent", `${props.name} has been notified for the next round.`);
    } catch (error:any) {
      console.error(error);
      errorNotification("Email failed", error?.response?.data?.errorMessage || "Unable to send selection email right now.");
    } finally {
      setSending(false);
    }
   };

  return (
      <div className="card-standard h-full mt-5">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <div className="p-2 bg-mine-shaft-800 rounded-full">
            <Avatar size="lg" src={`/${props.image}`} alt="" />
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

      <div className="flex gap-2 [&>div]:py-1 [&>div]:px-2 [&>div]:bg-mine-shaft-800 [&>div]:rounded-lg text-xs [&>div]:text-bright-sun-400 ">
       { 
        props.topSkills?.map((skill:any, index:number) => (
        <div key={index}>{skill}</div>
      ))
      }
       
      </div>

        <Text className="text-xs! text-justify text-mine-shaft-300!" lineClamp={3}>
          {props.about}
        </Text>
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

      <div className="flex *:w-1/2 *:p-1">
      {
        !props.invited &&
        <>
        <Link to="/talent-profile">
            <Button color="brightSun.4" variant="outline" fullWidth>Profile</Button>
        </Link>
        <div>
            {props.posted?<Button onClick={open} rightSection={<IconCalendarMonth className="w-5 h-5" />} color="brightSun.4" variant="light" fullWidth>Schedule</Button>:<Button onClick={openMessage} rightSection={<IconMailForward className="w-5 h-5" />} color="brightSun.4" variant={isSelected ? "filled" : "light"} fullWidth>{isSelected ? "Sent" : "Message"}</Button>}
        </div>
        </>
      }
      
      {
        props.invited && <>
        <div>
           <Button color="brightSun.4" variant="outline" fullWidth>Accept</Button>
        </div>
        <div>
           <Button color="brightSun.4" variant="light" fullWidth>Reject</Button>
        </div>
        </>
      }

      </div>
      <Modal opened={opened} onClose={close} title="Schedule Interview" centered>
        <div className="flex flex-col gap-4">
          <DateInput minDate={new Date()} value={value} onChange={setValue} label="Date" placeholder="Enter Date" />
          <TimeInput label="Time" ref={ref} onClick={()=> ref.current?.showPicker()}/>
          <Button color="brightSun.4" variant="light" fullWidth>Schedule</Button>
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

