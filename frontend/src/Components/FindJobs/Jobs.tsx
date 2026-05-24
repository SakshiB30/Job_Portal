import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../Types";
import JobCard from "./JobCard"
import JobCardSkeleton from "./JobCardSkeleton"
import Sort from "./Sort"
import { getAllJobs } from "../../Services/JobService";
import AnimatedSection from "../AnimatedSection";

const parseSalary = (salary: any) => {
  if (typeof salary === 'number') return salary;
  if (typeof salary !== 'string') return 0;
  const match = salary.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  return match ? parseFloat(match[0]) : 0;
};

const experienceRank = (experience: string) => {
  const value = (experience ?? '').toLowerCase();
  if (value.includes('expert') || value.includes('senior') || value.includes('lead')) return 3;
  if (value.includes('intermediate') || value.includes('mid')) return 2;
  if (value.includes('entry') || value.includes('junior')) return 1;
  return 0;
};

const Jobs = ({ filters, sort, onSortChange }: any) => {
  const [jobList, setJobList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  useEffect(() => {
    const enrich = (jobs: any[]) => {
      return jobs.map((job) => {
        const jobId = job.id ?? job._id ?? job.jobId;
        return {
          ...job,
          applied: !!(user?.appliedJobs || []).map((id: any) => String(id)).includes(String(jobId)),
          interviewing: !!(user?.interviewingJobs || []).map((id: any) => String(id)).includes(String(jobId)),
          offered: !!(user?.offeredJobs || []).map((id: any) => String(id)).includes(String(jobId)),
          rejected: !!(user?.rejectedJobs || []).map((id: any) => String(id)).includes(String(jobId)),
        };
      });
    };

    setLoading(true);
    getAllJobs().then((res) => {
      setJobList(enrich(res || []));
    }).catch((error) => {
      console.log(error);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  // if user changes, re-enrich existing list
  useEffect(() => {
    setJobList((current) => {
      return current.map((job) => {
        const jobId = job.id ?? job._id ?? job.jobId;
        return {
          ...job,
          applied: !!(user?.appliedJobs || []).map((id: any) => String(id)).includes(String(jobId)),
          interviewing: !!(user?.interviewingJobs || []).map((id: any) => String(id)).includes(String(jobId)),
          offered: !!(user?.offeredJobs || []).map((id: any) => String(id)).includes(String(jobId)),
          rejected: !!(user?.rejectedJobs || []).map((id: any) => String(id)).includes(String(jobId)),
        };
      });
    });
  }, [user]);

  const filteredJobs = useMemo(() => {
    return jobList.filter((job) => {
      const titleMatch = !filters.jobTitle.length || filters.jobTitle.some((value:string) => job.jobTitle?.toLowerCase().includes(value.toLowerCase()));
      const locationMatch = !filters.location.length || filters.location.some((value:string) => job.location?.toLowerCase().includes(value.toLowerCase()));
      const experienceMatch = !filters.experience.length || filters.experience.some((value:string) => job.experience?.toLowerCase().includes(value.toLowerCase()));
      const typeMatch = !filters.jobType.length || filters.jobType.some((value:string) => job.jobType?.toLowerCase().includes(value.toLowerCase()));
      const salary = parseSalary(job.packageOffered ?? job.package ?? job.salary);
      const salaryMatch = salary >= filters.salaryRange[0] && salary <= filters.salaryRange[1];
      return titleMatch && locationMatch && experienceMatch && typeMatch && salaryMatch;
    });
  }, [jobList, filters]);

  const relevanceScore = (job:any) => {
    let score = 0;
    score += filters.jobTitle.reduce((sum:number, value:string) => sum + (job.jobTitle?.toLowerCase().includes(value.toLowerCase()) ? 3 : 0), 0);
    score += filters.location.reduce((sum:number, value:string) => sum + (job.location?.toLowerCase().includes(value.toLowerCase()) ? 2 : 0), 0);
    score += filters.experience.reduce((sum:number, value:string) => sum + (job.experience?.toLowerCase().includes(value.toLowerCase()) ? 2 : 0), 0);
    score += filters.jobType.reduce((sum:number, value:string) => sum + (job.jobType?.toLowerCase().includes(value.toLowerCase()) ? 2 : 0), 0);
    const salary = parseSalary(job.packageOffered ?? job.package ?? job.salary);
    if (salary >= filters.salaryRange[0] && salary <= filters.salaryRange[1]) score += 1;
    return score;
  };

  const sortedJobs = useMemo(() => {
    const jobs = [...filteredJobs];
    if (sort === 'Salary High to Low') {
      return jobs.sort((a,b) => parseSalary(b.packageOffered ?? b.package ?? b.salary) - parseSalary(a.packageOffered ?? a.package ?? a.salary));
    }
    if (sort === 'Salary Low to High') {
      return jobs.sort((a,b) => parseSalary(a.packageOffered ?? a.package ?? a.salary) - parseSalary(b.packageOffered ?? b.package ?? b.salary));
    }
    if (sort === 'Experience High to Low') {
      return jobs.sort((a,b) => experienceRank(b.experience) - experienceRank(a.experience));
    }
    if (sort === 'Experience Low to High') {
      return jobs.sort((a,b) => experienceRank(a.experience) - experienceRank(b.experience));
    }
    if (sort === 'Relevance') {
      return jobs.sort((a,b) => relevanceScore(b) - relevanceScore(a));
    }
    return jobs;
  }, [filteredJobs, sort]);

  return (
    <AnimatedSection animation="slide-up" className="site-container site-section-gap">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-2xl font-semibold text-white">Recommended Jobs</div>
        <Sort selectedItem={sort} onSortChange={onSortChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 site-grid-gap mt-10 items-stretch">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <JobCardSkeleton key={`skeleton-${index}`} />
            ))
          : sortedJobs.length > 0 ? (
            sortedJobs.map((job, index) => (
              <JobCard key={job.id ?? index} {...job} />
            ))
          ) : (
            <div className="col-span-full rounded-md border border-dashed border-mine-shaft-700 p-8 text-center text-mine-shaft-300">
              No jobs found matching your filters.
            </div>
          )}
      </div>    </AnimatedSection>
  )
}


export default Jobs


