import { Button, Input, RangeSlider } from "@mantine/core"
import { Fragment } from "react";
import { IconRefresh, IconUserCircle } from "@tabler/icons-react";
import { searchFields } from "../../Data/TalentData";
import MultiSelectCreatable from "../FindJobs/MultiSelectCreatable";

type TalentFilters = {
  talentName: string;
  jobTitle: string[];
  location: string[];
  skills: string[];
  salaryRange: [number, number];
};

type SearchBarProps = {
  filters: TalentFilters;
  onFiltersChange: (update: Partial<TalentFilters>) => void;
};

const fieldMap: Record<string, keyof TalentFilters> = {
  'Job Title': 'jobTitle',
  Location: 'location',
  Skills: 'skills',
};

const SearchBar = ({ filters, onFiltersChange }: SearchBarProps) => {
  const activeFilters = filters.talentName.length + filters.jobTitle.length + filters.location.length + filters.skills.length;
  const clearFilters = () => onFiltersChange({
    talentName: '',
    jobTitle: [],
    location: [],
    skills: [],
    salaryRange: [1, 100],
  });

  const handleFieldChange = (title: string, selected: string[]) => {
    const fieldName = fieldMap[title];
    if (!fieldName) return;

    onFiltersChange?.({ [fieldName]: selected });
  };

  return (
    <section className="mx-5 mt-6 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/40 p-4 text-mine-shaft-100! shadow-[0_18px_60px_-48px_rgba(255,189,32,0.7)]">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-xl font-semibold">Filter Students</div>
          <div className="text-sm text-mine-shaft-300">Narrow by role, location, skills, and expected salary.</div>
        </div>
        <Button leftSection={<IconRefresh size={16} />} variant="subtle" color="brightSun.4" disabled={!activeFilters && filters.salaryRange[0] === 1 && filters.salaryRange[1] === 100} onClick={clearFilters}>
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <div className="flex min-w-0 items-center rounded-md border border-mine-shaft-800 bg-mine-shaft-950/60 px-3 py-2">
        <div className="text-bright-sun-400 bg-mine-shaft-900 rounded-full p-1 mr-2">
          <IconUserCircle size={20} />
        </div>
        <Input
          className="[&_input]:placeholder-mine-shaft-300!"
          variant="unstyled"
          placeholder="Talent Name"
          value={filters?.talentName ?? ''}
          onChange={(event) => onFiltersChange?.({ talentName: event.currentTarget.value })}
        />
      </div>
      {searchFields.map((item) => (
        <Fragment key={item.title}>
          <div className="min-w-0 rounded-md border border-mine-shaft-800 bg-mine-shaft-950/60 px-3 py-2">
            <MultiSelectCreatable
              {...item}
              value={filters?.[item.title === 'Job Title' ? 'jobTitle' : item.title === 'Location' ? 'location' : 'skills'] ?? []}
              onChange={(value: string[]) => handleFieldChange(item.title, value)}
            />
          </div>
        </Fragment>
      ))}
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



