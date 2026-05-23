import { Divider } from "@mantine/core"
import { useState } from "react"
import SearchBar from "../Components/FindJobs/SearchBar"
import Jobs from "../Components/FindJobs/Jobs"

const FindJobs = () => {
  const [filters, setFilters] = useState({
    jobTitle: [] as string[],
    location: [] as string[],
    experience: [] as string[],
    jobType: [] as string[],
    salaryRange: [1, 100] as [number, number],
  });
  const [sort, setSort] = useState<string | null>('Relevance');

  return (
    <div className="min-h-screen bg-mine-shaft-950 font-['poppins']">
      <div className="bg-mine-shaft-950/90 backdrop-blur-sm min-h-screen">
        <SearchBar filters={filters} onFiltersChange={(update) => setFilters((prev) => ({ ...prev, ...update }))} />
        <Divider size="xs" mx="md" />
        <Jobs filters={filters} sort={sort} onSortChange={setSort} />
      </div>
    </div>
  )
}

export default FindJobs
