import { Button } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { useNavigate, useParams } from "react-router-dom"
import JobDesc from "../Components/JobDescription/JobDesc"
import { useEffect, useState } from "react"
import { getJob } from "../Services/JobService"




const JobDescriptionPage = () => {
   const navigate = useNavigate();
   const {id}= useParams();
   const [job,setJob]=useState<any>(null);
   useEffect(()=>{
      window.scrollTo(0, 0);
      getJob(id).then((res)=>{
         setJob(res);
      }).catch(() => {
        // job not found
      });
   }
   ,[id])
   return (
    
      <div className="site-page">
       
        <div className="site-container">
        <Button my="md" onClick={() => navigate(-1)} leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light" >Back</Button>
           <JobDesc {...job}/>
        </div>
      </div>
  )
}

export default JobDescriptionPage
