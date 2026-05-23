import { useParams } from "react-router-dom";
import JobCard from "../FindJobs/JobCard";
import { useEffect, useState } from "react";
import { getAllJobs } from "../../Services/JobService";

const RecommandedJobs = () => {
  const { id } = useParams();
  const [jobList, setJobList] = useState<any>([{}]);
  useEffect(() => {
    getAllJobs()
      .then((res) => {
        setJobList(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <div className="text-xl font-semibold mb-5">Recommended Talent</div>
      <div className="flex flex-col flex-wrap gap-5 justify-between">
        {jobList?.map(
          (job:any, index:number) => index < 6 && id != job.id && <JobCard keys={index} {...job} />,
        )}
      </div>
    </div>
  );
};

export default RecommandedJobs;
