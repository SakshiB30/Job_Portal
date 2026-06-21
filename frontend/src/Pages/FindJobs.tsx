import { Divider } from "@mantine/core"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import SearchBar from "../Components/FindJobs/SearchBar"
import Jobs from "../Components/FindJobs/Jobs"

const FindJobs = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    searchQuery: '',
    jobTitle: [] as string[],
    location: [] as string[],
    experience: [] as string[],
    jobType: [] as string[],
    salaryRange: [1, 100] as [number, number],
  });
  const [sort, setSort] = useState<string | null>('Relevance');

  // Read search query from URL params on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setFilters((prev) => ({ ...prev, searchQuery: q }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="site-page">
      <div className="bg-mine-shaft-950/90 backdrop-blur-sm min-h-screen">
        <SearchBar filters={filters} onFiltersChange={(update) => setFilters((prev) => ({ ...prev, ...update }))} />
        <Divider size="xs" mx="md" />
        <Jobs filters={filters} sort={sort} onSortChange={setSort} />
      </div>
    </div>
  )
}

export default FindJobs
