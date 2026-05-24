import { Divider } from "@mantine/core"
import { useState } from "react"
import SearchBar from "../Components/FindTalent/SearchBar"
import Talents from "../Components/FindTalent/Talents"

const FindTalentPage = () => {
  const [filters, setFilters] = useState({
    talentName: '',
    jobTitle: [] as string[],
    location: [] as string[],
    skills: [] as string[],
    salaryRange: [1, 100] as [number, number],
  });
  const [sort, setSort] = useState<string | null>('Relevance');

  return (
    <div className="site-page">
      <SearchBar filters={filters} onFiltersChange={(update) => setFilters((prev) => ({ ...prev, ...update }))} />
      <Divider size="xs" mx="md" />
      <Talents filters={filters} sort={sort} onSortChange={setSort} />
    </div>
  )
}

export default FindTalentPage

