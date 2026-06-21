import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../Types";
import JobCard from "./JobCard"
import JobCardSkeleton from "./JobCardSkeleton"
import Sort from "./Sort"
import { getAllJobs } from "../../Services/JobService";
import AnimatedSection from "../AnimatedSection";

type JobFilters = {
  searchQuery: string;
  jobTitle: string[];
  location: string[];
  experience: string[];
  jobType: string[];
  salaryRange: [number, number];
};

type JobsProps = {
  filters: JobFilters;
  sort: string | null;
  onSortChange: (value: string | null) => void;
};

type JobItem = Record<string, any>;

const parseSalary = (salary: any): number => {
  if (typeof salary === 'number') return salary;
  if (typeof salary !== 'string') return 0;
  const match = salary.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  return match ? parseFloat(match[0]) : 0;
};

const experienceRank = (experience: string): number => {
  const value = (experience ?? '').toLowerCase();
  if (value.includes('expert') || value.includes('senior') || value.includes('lead')) return 3;
  if (value.includes('intermediate') || value.includes('mid')) return 2;
  if (value.includes('entry') || value.includes('junior')) return 1;
  return 0;
};

const enrichJob = (job: JobItem, userIds: { applied: string[]; interviewing: string[]; offered: string[] }) => {
  const jobId = String(job.id ?? job._id ?? job.jobId ?? '');
  return {
    ...job,
    applied: userIds.applied.includes(jobId),
    interviewing: userIds.interviewing.includes(jobId),
    offered: userIds.offered.includes(jobId),
  };
};

const getUserIds = (user: any) => ({
  applied: (user?.appliedJobs || []).map((id: any) => String(id)),
  interviewing: (user?.interviewingJobs || []).map((id: any) => String(id)),
  offered: (user?.offeredJobs || []).map((id: any) => String(id)),
});

const Jobs = ({ filters, sort, onSortChange }: JobsProps) => {
  const [jobList, setJobList] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);

  // Fetch jobs on mount
  useEffect(() => {
    setLoading(true);
    getAllJobs()
      .then((res) => {
        const jobs = Array.isArray(res) ? res : [];
        const userIds = getUserIds(user);
        setJobList(jobs.map((job) => enrichJob(job, userIds)));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-enrich when user state changes
  useEffect(() => {
    const userIds = getUserIds(user);
    setJobList((current) => current.map((job) => enrichJob(job, userIds)));
  }, [user]);

  const filteredJobs = useMemo(() => {
    return jobList.filter((job) => {
      const query = filters.searchQuery?.toLowerCase().trim();
      const keywordMatch = !query ||
        (job.jobTitle?.toLowerCase() || '').includes(query) ||
        (job.company?.toLowerCase() || '').includes(query) ||
        (job.description?.toLowerCase() || '').includes(query) ||
        (job.about?.toLowerCase() || '').includes(query) ||
        (job.location?.toLowerCase() || '').includes(query);

      const titleMatch = !filters.jobTitle.length || filters.jobTitle.some((value: string) =>
        job.jobTitle?.toLowerCase().includes(value.toLowerCase())
      );
      const locationMatch = !filters.location.length || filters.location.some((value: string) =>
        job.location?.toLowerCase().includes(value.toLowerCase())
      );
      const experienceMatch = !filters.experience.length || filters.experience.some((value: string) =>
        job.experience?.toLowerCase().includes(value.toLowerCase())
      );
      const typeMatch = !filters.jobType.length || filters.jobType.some((value: string) =>
        job.jobType?.toLowerCase().includes(value.toLowerCase())
      );
      const salary = parseSalary(job.packageOffered ?? job.package ?? job.salary);
      const salaryMatch = salary >= filters.salaryRange[0] && salary <= filters.salaryRange[1];

      return keywordMatch && titleMatch && locationMatch && experienceMatch && typeMatch && salaryMatch;
    });
  }, [jobList, filters]);

  const relevanceScore = (job: JobItem): number => {
    let score = 0;
    score += filters.jobTitle.reduce((sum: number, value: string) =>
      sum + (job.jobTitle?.toLowerCase().includes(value.toLowerCase()) ? 3 : 0), 0);
    score += filters.location.reduce((sum: number, value: string) =>
      sum + (job.location?.toLowerCase().includes(value.toLowerCase()) ? 2 : 0), 0);
    score += filters.experience.reduce((sum: number, value: string) =>
      sum + (job.experience?.toLowerCase().includes(value.toLowerCase()) ? 2 : 0), 0);
    score += filters.jobType.reduce((sum: number, value: string) =>
      sum + (job.jobType?.toLowerCase().includes(value.toLowerCase()) ? 2 : 0), 0);
    const salary = parseSalary(job.packageOffered ?? job.package ?? job.salary);
    if (salary >= filters.salaryRange[0] && salary <= filters.salaryRange[1]) score += 1;
    return score;
  };

  const sortedJobs = useMemo(() => {
    const jobs = [...filteredJobs];
    if (sort === 'Salary High to Low') {
      return jobs.sort((a, b) =>
        parseSalary(b.packageOffered ?? b.package ?? b.salary) -
        parseSalary(a.packageOffered ?? a.package ?? a.salary));
    }
    if (sort === 'Salary Low to High') {
      return jobs.sort((a, b) =>
        parseSalary(a.packageOffered ?? a.package ?? a.salary) -
        parseSalary(b.packageOffered ?? b.package ?? b.salary));
    }
    if (sort === 'Experience High to Low') {
      return jobs.sort((a, b) => experienceRank(b.experience) - experienceRank(a.experience));
    }
    if (sort === 'Experience Low to High') {
      return jobs.sort((a, b) => experienceRank(a.experience) - experienceRank(b.experience));
    }
    if (sort === 'Relevance') {
      return jobs.sort((a, b) => relevanceScore(b) - relevanceScore(a));
    }
    return jobs;
  }, [filteredJobs, sort]);

  return (
    <AnimatedSection animation="slide-up" className="site-container site-section-gap">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-xl sm:text-2xl font-semibold text-white">
            {filters.searchQuery
              ? `Results for "${filters.searchQuery}"`
              : 'Recommended Jobs'}
          </div>
          <div className="text-xs sm:text-sm text-mine-shaft-400">
            {!loading && `${sortedJobs.length} job${sortedJobs.length !== 1 ? 's' : ''} found`}
          </div>
        </div>
        <Sort selectedItem={sort} onSortChange={onSortChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 site-grid-gap mt-6 items-stretch">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <JobCardSkeleton key={`skeleton-${index}`} />
            ))
          : sortedJobs.length > 0 ? (
            sortedJobs.map((job, index) => (
              <JobCard key={job.id ?? index} {...job} />
            ))
          ) : (
            <div className="col-span-full rounded-md border border-dashed border-mine-shaft-700 p-6 sm:p-8 text-center text-mine-shaft-300">
              <div className="text-sm sm:text-base">No jobs found matching your filters.</div>
              <div className="mt-1 text-xs sm:text-sm text-mine-shaft-500">Try adjusting your search or filter criteria.</div>
            </div>
          )}
      </div>
    </AnimatedSection>
  )
}

export default Jobs