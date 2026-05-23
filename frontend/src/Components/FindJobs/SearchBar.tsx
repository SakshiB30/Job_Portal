import { Button, RangeSlider } from "@mantine/core"
import { dropdownData } from "../../Data/JobsData"
import MultiSelectCreatable from "./MultiSelectCreatable"
import { Fragment } from "react";
import { IconRefresh } from "@tabler/icons-react";

type JobFilters = {
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
  const activeFilters = filters.jobTitle.length + filters.location.length + filters.experience.length + filters.jobType.length;
  const clearFilters = () => onFiltersChange({
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
    <section className="mx-5 mt-6 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 text-mine-shaft-100 shadow-[0_18px_60px_-48px_rgba(255,189,32,0.7)]">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-xl font-semibold">Filter Jobs</div>
          <div className="text-sm text-mine-shaft-300">Refine openings by title, location, experience, job type, and salary.</div>
        </div>
        <Button leftSection={<IconRefresh size={16} />} variant="subtle" color="brightSun.4" disabled={!activeFilters && filters.salaryRange[0] === 1 && filters.salaryRange[1] === 100} onClick={clearFilters}>
          Reset
        </Button>
      </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {dropdownData.map((item) => {
        const fieldName = fieldMap[item.title];
        return (
          <Fragment key={item.title}>
            <div className="min-w-0 rounded-md border border-mine-shaft-800 bg-mine-shaft-950/60 px-3 py-2">
              <MultiSelectCreatable
                {...item}
                value={filters?.[fieldName] ?? []}
                onChange={(value: string[]) => handleFieldChange(item.title, value)}
              />
            </div>
          </Fragment>
        );
      })}
      <div className="min-w-0 rounded-md border border-mine-shaft-800 bg-mine-shaft-950/60 px-3 py-2">
        <div className="flex text-sm justify-between ">
          <div>Salary</div>
          <div>
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
    </section>
  );
}

export default SearchBar
