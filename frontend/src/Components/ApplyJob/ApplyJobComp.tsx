import {  Divider, Notification, rem} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import ApplicationForm from "./ApplicationForm";
import { timeAgo } from "../../Services/Utilities";

const ApplyJobComp = (props:any) => {
    const [submit] = useState(false);
    const [sec] = useState(5);
    const applicantCount = Array.isArray(props.applicants)
      ? props.applicants.length
      : props.applicants ?? 0;
    
  return <>
    <div className="w-2/3 mx-auto">
   
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <div className="p-3 bg-mine-shaft-800 rounded-xl">
            {props.company && <img className="h-14" src={`/Icons/${props.company}.png`} alt="" />}
          </div>

          <div className="flex flex-col gap-1">
            <div className="font-semibold text-2xl">{props.jobTitle || "Loading job..."}</div>
            <div className="text-lg text-mine-shaft-300">
              {props.company || "Company"} &#x2022; {props.postTime ? timeAgo(props.postTime) : "Recently"} &bull; {applicantCount} Applicants
            </div>
          </div>
        </div>
      </div>  
      <Divider my="xl" />
      <ApplicationForm/>
    </div>
    <Notification className={`border-bright-sun-400! -translate-y-20 fixed! top-0 left-[35%] z-1001 transition duration-300 ease-in-out ${submit?"translate-y-0":""}`} icon={<IconCheck style={{ width: rem(20), height: rem(20) }} />} color="teal" withBorder title="Application Submitted" mt="md" withCloseButton={false} >
       Redirecting to find jobs in {sec} seconds...
      </Notification>  
 </>
  }
export default ApplyJobComp;
