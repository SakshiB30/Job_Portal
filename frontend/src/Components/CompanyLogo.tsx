import { IconBuilding } from "@tabler/icons-react";

interface CompanyLogoProps {
  /** Base64-encoded company logo (without the data:image prefix) */
  logo?: string | null;
  /** Fallback: base64-encoded profile picture (for backward compatibility) */
  picture?: string | null;
  /** Company name used for alt text */
  company?: string;
  /** Tailwind classes for sizing (default: "h-8 w-8") */
  className?: string;
  /** Alt text */
  alt?: string;
}

const CompanyLogo = ({
  logo,
  picture,
  company,
  className = "h-8 w-8",
  alt = "",
}: CompanyLogoProps) => {
  // Priority 1: dedicated companyLogo field
  if (logo) {
    return (
      <img
        className={`object-cover rounded-xl ${className}`}
        src={`data:image/jpeg;base64,${logo}`}
        alt={alt || company || "Company logo"}
      />
    );
  }

  // Priority 2: profile picture (backward compatibility)
  if (picture) {
    return (
      <img
        className={`object-cover rounded-xl ${className}`}
        src={`data:image/jpeg;base64,${picture}`}
        alt={alt || company || "Company logo"}
      />
    );
  }

  // Priority 3: clean placeholder icon
  return (
    <div
      className={`flex items-center justify-center bg-mine-shaft-800/60 rounded-xl border border-dashed border-mine-shaft-600 overflow-hidden ${className}`}
    >
      <IconBuilding className="text-mine-shaft-500 w-1/2 h-1/2" stroke={1.5} />
    </div>
  );
};

export default CompanyLogo;
