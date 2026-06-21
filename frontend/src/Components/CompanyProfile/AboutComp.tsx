import type { ProfileState } from "../../Types";

const AboutComp = ({ data }: { data: ProfileState | null }) => {
  if (!data) return null;

  const sections: { label: string; value: React.ReactNode }[] = [];

  if (data.about) {
    sections.push({ label: "Overview", value: data.about });
  }
  if (data.industry) {
    sections.push({ label: "Industry", value: data.industry });
  }
  if (data.companySize) {
    sections.push({ label: "Company Size", value: data.companySize });
  }
  if (data.headquarters) {
    sections.push({ label: "Headquarters", value: data.headquarters });
  }
  if (data.website) {
    sections.push({
      label: "Website",
      value: (
        <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-sm text-bright-sun-400 text-justify hover:underline">
          {data.website}
        </a>
      ),
    });
  }
  if (data.specialties && data.specialties.length > 0) {
    sections.push({
      label: "Specialties",
      value: (
        <div className="flex flex-wrap gap-2">
          {data.specialties.map((item, index) => (
            <span key={index} className="rounded-full bg-mine-shaft-800 px-3 py-1 text-xs text-bright-sun-400">
              {item}
            </span>
          ))}
        </div>
      ),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section, index) => (
        <div key={index}>
          <div className="text-lg sm:text-xl mb-3 font-semibold">{section.label}</div>
          <div className="text-sm text-mine-shaft-300 text-justify">{section.value}</div>
        </div>
      ))}
      {sections.length === 0 && (
        <div className="py-8 text-center text-sm text-mine-shaft-500">
          No company information available yet.
        </div>
      )}
    </div>
  );
};

export default AboutComp;

