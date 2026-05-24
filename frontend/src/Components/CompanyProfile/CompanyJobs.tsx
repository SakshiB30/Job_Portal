import { Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import JobCard from "../FindJobs/JobCard"
import { getJobsByCompany } from "../../Services/JobService";

const CompanyJobs = ({ companyName }: { companyName: string }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyName) return;
    setLoading(true);
    getJobsByCompany(companyName)
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [companyName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader color="brightSun.4" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
        {jobs.length > 0 ? (
          jobs.map((job, index) => (
            <JobCard key={job.id ?? index} {...job} />
          ))
        ) : (
          <div className="w-full rounded-md border border-dashed border-mine-shaft-700 p-8 text-center text-sm text-mine-shaft-300">
            No jobs posted by this company yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyJobs
