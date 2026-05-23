import { IconBookmark, IconBookmarkFilled, IconCalendarMonth, IconClockHour3 } from "@tabler/icons-react"
import { Button, Divider, Text } from '@mantine/core';
import { timeAgo } from "../../Services/Utilities";
import { Link } from "react-router-dom";

const Card = (props:any) => {
  return (
    <Link to="/jobs" className="card-standard h-full min-h-104 mt-5">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <div className="p-2 bg-mine-shaft-800 rounded-md">
            <img className="h-7" src={`/Icons/${props.company}.png`} alt="" />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="font-semibold">{props.jobTitle}</div>
            <div className="text-xs text-mine-shaft-300">{props.company} &#x2022; {Array.isArray(props.applicants) ? props.applicants.length : props.applicants ?? '0'} Applicants</div>
          </div>

        </div>

          {props.saved ? <IconBookmarkFilled className="text-bright-sun-400 cursor-pointer" /> : <IconBookmark className="text-mine-shaft-300 cursor-pointer" />}
        </div>

      <div className="flex gap-2 [&>div]:py-1 [&>div]:px-2 [&>div]:bg-mine-shaft-800 [&>div]:rounded-lg text-xs [&>div]:text-bright-sun-400">
        <div>{props.experience}</div>
        <div>{props.jobType}</div>
        <div>{props.location}</div>
      </div>

        <Text className="text-xs text-justify text-mine-shaft-300" lineClamp={3}>
          {props.about || props.description || "No description available."}
        </Text>
        <Divider size="xs" color="!mineShaft.7"/>

      <div className="flex justify-between items-center mt-2">
        <div className="text-mine-shaft-200 font-semibold ">&#8377; {props.packageOffered ?? props.package ?? 'N/A'}</div>
        <div className="flex items-center text-mine-shaft-400 gap-1 text-xs"> <IconClockHour3 className="h-5 w-5" stroke={1.5}/>{props.applied?"Applied":props.offered?"Offered":props.interviewing?"Interviewing":"Posted"} • {timeAgo(props.postTime)}</div>
      </div>
      {(props.offered || props.interviewing) &&<Divider size="xs" color="!mineShaft.7"/>}
      {
        props.offered &&<div className="flex gap-2">
          <Button color="brightSun.4" variant="outline" fullWidth>Accept</Button>
          <Button color="brightSun.4" variant="light" fullWidth>Reject</Button>
        </div>
      }
      {
        props.interviewing &&<div className="flex gap-1 text-sm items-center">
            <IconCalendarMonth stroke={1.5} className="text-bright-sun-400 w-5 h-5"/> Sun, 25 August &bull; <span className="text-mine-shaft-400">10:00 AM</span>
          </div>
      }
    </Link>
  )
}

export default Card

