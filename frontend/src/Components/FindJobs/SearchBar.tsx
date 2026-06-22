import { Button, Input, RangeSlider } from "@mantine/core"
import { dropdownData } from "../../Data/JobsData"
import MultiSelectCreatable from "./MultiSelectCreatable"
import { Fragment } from "react";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import AnimatedSection from "../AnimatedSection";

type JobFilters = {
  searchQuery: string;
  jobTitle: string[];
  location: string[];
  experience: string[];
  jobType: string[];
  salaryRange: [number, number];
};

type SearchBarProps = {
  filters: JobFilters;
  onFiltersChange: (update: Partial<JobFilters>) => void;
};

const fieldMap: Record<string, keyof JobFilters> = {
  'Job Title': 'jobTitle',
  Location: 'location',
  Experience: 'experience',
  'Job Type': 'jobType',
};

const SearchBar = ({ filters, onFiltersChange }: SearchBarProps) => {
  const activeFilterCount = (filters.searchQuery ? 1 : 0) + filters.jobTitle.length + filters.location.length + filters.experience.length + filters.jobType.length;
  const hasActiveFilters = activeFilterCount > 0 || filters.salaryRange[0] !== 1 || filters.salaryRange[1] !== 100;
  const clearFilters = () => onFiltersChange({
    searchQuery: '',
    jobTitle: [],
    location: [],
    experience: [],
    jobType: [],
    salaryRange: [1, 100],
  });

  const handleFieldChange = (title: string, selected: string[]) => {
    const fieldName = fieldMap[title];
    if (!fieldName) return;
    onFiltersChange?.({ [fieldName]: selected });
  };

  return (
    <AnimatedSection animation="slide-up" className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 text-mine-shaft-100 shadow-[0_18px_60px_-48px_rgba(255,189,32,0.7)]">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-xl font-semibold">Filter Jobs</div>
          <div className="text-sm text-mine-shaft-300">
            Refine openings by keyword, title, location, experience, job type, and salary.
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-bright-sun-400/15 px-2 py-0.5 text-xs font-medium text-bright-sun-400">
                {activeFilterCount + (filters.salaryRange[0] !== 1 || filters.salaryRange[1] !== 100 ? 1 : 0)} active
              </span>
            )}
          </div>
        </div>
        <Button leftSection={<IconRefresh size={16} />} variant="subtle" color="brightSun.4" disabled={!hasActiveFilters} onClick={clearFilters}>
          Reset
        </Button>
      </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div className="flex items-center rounded-xl border border-mine-shaft-800 bg-mine-shaft-950/60 px-3 py-2 lg:col-span-2">
        <div className="text-bright-sun-400 bg-mine-shaft-900 rounded-full p-1 mr-2 shrink-0">
          <IconSearch size={20} />
        </div>
        <Input
          className="w-full [&_input]:placeholder-mine-shaft-300!"
          variant="unstyled"
          placeholder="Search jobs by keyword..."
          value={filters?.searchQuery ?? ''}
          onChange={(event) => onFiltersChange?.({ searchQuery: event.currentTarget.value })}
        />
      </div>
      {dropdownData.map((item) => {
        const fieldName = fieldMap[item.title];
        return (
          <Fragment key={item.title}>
            <div className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-950/60 px-3 py-2">
              <MultiSelectCreatable
                {...item}
                value={filters?.[fieldName] ?? []}
                onChange={(value: string[]) => handleFieldChange(item.title, value)}
              />
            </div>
          </Fragment>
        );
      })}
      <div className="rounded-xl border border-mine-shaft-800 bg-mine-shaft-950/60 px-3 py-2 lg:col-span-2">
        <div className="flex text-sm justify-between ">
          <div>Salary</div>
          <div className="text-right text-xs sm:text-sm">
            &#8377;{filters?.salaryRange?.[0] ?? 1} LPA - &#8377;{filters?.salaryRange?.[1] ?? 100} LPA
          </div>
        </div>
        <RangeSlider
          classNames={{
            label: 'translate-y-10',
          }}
          color="brightSun.4"
          size="xs"
          value={filters?.salaryRange ?? [1, 100]}
          labelTransitionProps={{
            transition: 'skew-down',
            duration: 150,
            timingFunction: 'linear',
          }}
          onChange={(value) => onFiltersChange?.({ salaryRange: value })}
        />
      </div>
    </div>
    </AnimatedSection>
  );
}

export default SearchBar
