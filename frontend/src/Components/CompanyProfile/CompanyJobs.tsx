import { jobList } from "../../Data/JobsData"
import JobCard from "../FindJobs/JobCard"

const CompanyJobs = () => {
  return (
    <div>
       <div className="flex flex-wrap gap-3 mt-10">
              {
              jobList.map((job, index) => 
                <JobCard key={index} {...job}/>
              )
              }
        </div>
    </div>
  )
}

export default CompanyJobs
