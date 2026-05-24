
import { talents } from "../../Data/TalentData"
import Sort from "../FindJobs/Sort"
import TalentCard from "./TalentCard"
import TalentCardSkeleton from "./TalentCardSkeleton"
import { useEffect, useMemo, useState } from "react"
import { getApplicantProfiles } from "../../Services/ProfileService";
import AnimatedSection from "../AnimatedSection";

type TalentFilters = {
  talentName: string;
  jobTitle: string[];
  location: string[];
  skills: string[];
  salaryRange: [number, number];
};

type TalentItem = (typeof talents)[number];

const Talents = ({ filters, sort, onSortChange, loading }: { filters: TalentFilters; sort: string | null; onSortChange: (value: string | null) => void; loading?: boolean }) => {
  const [liveTalents, setLiveTalents] = useState<TalentItem[]>([]);
  const [loadingLiveTalents, setLoadingLiveTalents] = useState(true);

  useEffect(() => {
    getApplicantProfiles()
      .then((profiles) => {
        const mappedTalents = Array.isArray(profiles)
          ? profiles.map((profile) => ({
              id: profile.id,
              name: profile.email?.split("@")?.[0] || "New Candidate",
              role: profile.jobTitle || profile.resumeHeadline || "Candidate",
              company: profile.company || "Open to work",
              topSkills: Array.isArray(profile.skills) ? profile.skills : [],
              about: profile.about || profile.resumeHeadline || "This candidate has not added a profile summary yet.",
              expectedCtc: "0 - 100LPA",
              location: profile.location || "Location not added",
              email: profile.email,
              image: profile.picture ? `data:image/jpeg;base64,${profile.picture}` : "A3.png",
            }))
          : [];
        setLiveTalents(mappedTalents);
      })
      .catch((error) => {
        console.error("Failed to load applicant profiles:", error);
        setLiveTalents([]);
      })
      .finally(() => setLoadingLiveTalents(false));
  }, []);

  const allTalents = useMemo(() => {
    const staticIds = new Set(talents.map((talent) => String(talent.email || talent.id)));
    const uniqueLiveTalents = liveTalents.filter((talent) => !staticIds.has(String(talent.email || talent.id)));
    return [...uniqueLiveTalents, ...talents];
  }, [liveTalents]);

  const filteredTalents = useMemo(() => {
    return allTalents.filter((talent) => {
      const nameMatch = !filters.talentName || talent.name.toLowerCase().includes(filters.talentName.toLowerCase());
      const roleMatch = !filters.jobTitle.length || filters.jobTitle.some((value:string) => talent.role?.toLowerCase().includes(value.toLowerCase()));
      const locationMatch = !filters.location.length || filters.location.some((value:string) => talent.location?.toLowerCase().includes(value.toLowerCase()));
      const skillsMatch = !filters.skills.length || filters.skills.some((value:string) => talent.topSkills?.some((skill:string) => skill.toLowerCase().includes(value.toLowerCase())));

      const salaryNumbers = (talent.expectedCtc ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/g) || [];
      const minSalary = salaryNumbers.length > 0 ? parseFloat(salaryNumbers[0] ?? '0') : 0;
      const maxSalary = salaryNumbers.length > 1 ? parseFloat(salaryNumbers[1] ?? '0') : minSalary;
      const salaryMatch = maxSalary >= filters.salaryRange[0] && minSalary <= filters.salaryRange[1];

      return nameMatch && roleMatch && locationMatch && skillsMatch && salaryMatch;
    });
  }, [allTalents, filters]);

  const rankSalary = (ctc = '') => {
    const numbers = ctc.replace(/,/g, '').match(/\d+(?:\.\d+)?/g) || [];
    return numbers.length > 0 ? parseFloat(numbers[0] ?? '0') : 0;
  };

  const relevanceScore = (talent: TalentItem) => {
    let score = 0;
    if (filters.talentName && talent.name.toLowerCase().includes(filters.talentName.toLowerCase())) score += 4;
    score += filters.jobTitle.reduce((sum:number, value:string) => sum + (talent.role?.toLowerCase().includes(value.toLowerCase()) ? 3 : 0), 0);
    score += filters.location.reduce((sum:number, value:string) => sum + (talent.location?.toLowerCase().includes(value.toLowerCase()) ? 2 : 0), 0);
    score += filters.skills.reduce((sum:number, value:string) => sum + (talent.topSkills?.some((skill:string) => skill.toLowerCase().includes(value.toLowerCase())) ? 2 : 0), 0);
    const salaryValue = rankSalary(talent.expectedCtc ?? '0');
    if (salaryValue >= filters.salaryRange[0] && salaryValue <= filters.salaryRange[1]) score += 1;
    return score;
  };

  const sortedTalents = (() => {
    const items = [...filteredTalents];
    if (sort === 'Salary High to Low') {
      return items.sort((a,b) => rankSalary(b.expectedCtc ?? '') - rankSalary(a.expectedCtc ?? ''));
    }
    if (sort === 'Salary Low to High') {
      return items.sort((a,b) => rankSalary(a.expectedCtc ?? '') - rankSalary(b.expectedCtc ?? ''));
    }
    if (sort === 'Experience High to Low') {
      return items.sort((a,b) => (b.topSkills?.length ?? 0) - (a.topSkills?.length ?? 0));
    }
    if (sort === 'Experience Low to High') {
      return items.sort((a,b) => (a.topSkills?.length ?? 0) - (b.topSkills?.length ?? 0));
    }
    if (sort === 'Relevance') {
      return items.sort((a,b) => relevanceScore(b) - relevanceScore(a));
    }
    return items;
  })();

  return (
    <AnimatedSection animation="slide-up" className="site-container site-section-gap"> 
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-2xl font-semibold">Talents</div>
        <div>
          <Sort selectedItem={sort} onSortChange={onSortChange} />
        </div>   
      </div>
      <div className="mt-10 grid grid-cols-1 site-grid-gap sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading || loadingLiveTalents
          ? Array.from({ length: 8 }).map((_, index) => (
              <TalentCardSkeleton key={`skeleton-${index}`} />
            ))
          : sortedTalents.length
            ? sortedTalents.map((talent, index) => (
                <TalentCard key={index} {...talent} />
              ))
            : (
              <div className="col-span-full rounded-md border border-dashed border-mine-shaft-700 p-8 text-center text-mine-shaft-300">
                No talents match your filters.
              </div>
            )}
      </div>
    </AnimatedSection>
  )
}

export default Talents


