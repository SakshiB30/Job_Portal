import { Button } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { Link, useParams } from "react-router-dom"
import JobDesc from "../Components/JobDescription/JobDesc"
import RecommandedJobs from "../Components/JobDescription/RecommandedJobs"
import { useEffect, useState } from "react"
import { getJob } from "../Services/JobService"




const JobDescriptionPage = () => {
   const {id}= useParams();
   const [job,setJob]=useState<any>(null);
   useEffect(()=>{
      window.scrollTo(0, 0);
      getJob(id).then((res)=>{
         setJob(res);
      }).catch((error)=>{
         console.log(error);
      });
   }
   ,[id])
   return (
    
      <div className="min-h-screen bg-mine-shaft-950 font-['poppins'] p-4">
       
        <Link className="my-4 inline-block" to="/find-jobs">
            <Button leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light" >Back</Button>
        </Link>
        <div className="flex flex-col lg:flex-row gap-5 justify-around">
           <JobDesc {...job}/>
           <RecommandedJobs/>
        </div>
      </div>
  )
}

export default JobDescriptionPage
