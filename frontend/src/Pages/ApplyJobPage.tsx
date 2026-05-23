import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ApplyJobComp from "../Components/ApplyJob/ApplyJobComp";
import { getJob } from "../Services/JobService";

const ApplyJobPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!id) return;

    getJob(id)
      .then((res) => {
        setJob(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  return <div className="min-h-[90vh] bg-mine-shaft-950">
    <Link className="my-4 inline-block" to="/find-jobs">
            <Button leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light" >Back</Button>
        </Link>
        <ApplyJobComp {...job}/>
  </div>;
};

export default ApplyJobPage;
