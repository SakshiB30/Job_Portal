import { timeAgo } from "../../Services/Utilities";
import { IconClockHour3, IconMapPin, IconUsers } from "@tabler/icons-react";
import type { PostedJobItem } from "../../Pages/PostedJobpage";

type PostedJobCardProps = PostedJobItem & {
  selected?: boolean;
  onClick?: () => void;
};

const PostedJobCard = (props: PostedJobCardProps) => {
  const postedLabel = props.postTime ? timeAgo(props.postTime) : props.posted || "Unknown";
  const applicants = Array.isArray(props.applicants)
    ? props.applicants.length
    : typeof props.applicants === "number"
      ? props.applicants
      : 0;

  return (
    <div
      onClick={props.onClick}
      className={`w-full rounded-md border bg-mine-shaft-900 p-4 text-left transition hover:border-bright-sun-400/70 hover:bg-mine-shaft-800 ${
        props.selected ? "border-bright-sun-400 shadow-[0_0_20px_-14px_rgba(255,189,32,0.9)]" : "border-mine-shaft-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-mine-shaft-50">{props.jobTitle || "Untitled Job"}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-mine-shaft-300">
            <IconMapPin size={14} />
            <span className="truncate">{props.location || "Location not set"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const status = props.jobStatus;
            const label = status === "DRAFT" ? "Draft" : status === "CLOSED" ? "Closed" : "Active";
            const classes = status === "DRAFT"
              ? "bg-mine-shaft-800 text-mine-shaft-200"
              : status === "CLOSED"
                ? "bg-mine-shaft-800 text-mine-shaft-300"
                : "bg-bright-sun-400/15 text-bright-sun-400";
            return (
              <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${classes}`}>
                {label}
              </span>
            );
          })()}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-mine-shaft-300">
        <div className="flex items-center gap-1">
          <IconUsers size={14} />
          <span>{applicants} Applicants</span>
        </div>
        <div className="flex items-center gap-1">
          <IconClockHour3 size={14} />
          <span>{postedLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default PostedJobCard;
