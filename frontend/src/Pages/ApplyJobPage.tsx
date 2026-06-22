import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ApplyJobComp from "../Components/ApplyJob/ApplyJobComp";
import { getJob } from "../Services/JobService";

const ApplyJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!id) return;

    getJob(id)
      .then((res) => {
        setJob(res);
      })
      .catch(() => {
        // job not found
      });
  }, [id]);

  return <div className="min-h-[90vh] bg-mine-shaft-950 py-6">
    <div className="site-container">
    <Button my="md" onClick={() => navigate(-1)} leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light" >Back</Button>
        <ApplyJobComp {...job}/>
    </div>
  </div>;
};

export default ApplyJobPage;
