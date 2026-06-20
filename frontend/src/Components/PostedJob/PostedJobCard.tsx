import { timeAgo } from "../../Services/Utilities";
import { IconClockHour3, IconMapPin, IconUsers } from "@tabler/icons-react";
import CompanyLogo from "../CompanyLogo";
import { useSelector } from "react-redux";
import type { RootState } from "../../Types";
import type { PostedJobItem } from "../../Pages/PostedJobpage";

type PostedJobCardProps = PostedJobItem & {
  selected?: boolean;
  onClick?: () => void;
};

const PostedJobCard = (props: PostedJobCardProps) => {
  const profile = useSelector((state: RootState) => state.profile);
  const companyLogo = props.companyLogo || profile?.companyLogo;
  const companyPicture = props.companyPicture || profile?.picture;

  const postedLabel = (() => {
    const rawPostTime = props.postTime;
    if (rawPostTime) {
      const computed = timeAgo(rawPostTime);
      if (computed) return computed;
    }
    return props.posted || "Unknown";
  })();
  const applicants = Array.isArray(props.applicants)
    ? props.applicants.length
    : typeof props.applicants === "number"
      ? props.applicants
      : 0;

  return (
    <div
      onClick={props.onClick}
      className={`card-standard cursor-pointer h-full ${
        props.selected ? "border-bright-sun-400 shadow-[0_0_20px_-14px_rgba(255,189,32,0.9)]" : ""
      }`}
    >
      <div className="flex justify-between">
        <div className="flex gap-2 items-center min-w-0">
          <div className="p-2 bg-mine-shaft-800 rounded-full shrink-0">
            <CompanyLogo logo={companyLogo} picture={companyPicture} company={props.company} className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{props.jobTitle || "Untitled Job"}</div>
            <div className="text-xs text-mine-shaft-300">
              <span className="flex items-center gap-1">
                <IconMapPin size={12} />
                <span className="truncate">{props.location || "Location not set"}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          {(() => {
            const status = props.jobStatus;
            const label = status === "DRAFT" ? "Draft" : status === "CLOSED" ? "Closed" : "Active";
            const classes =
              status === "DRAFT"
                ? "bg-mine-shaft-800 text-mine-shaft-200"
                : status === "CLOSED"
                  ? "bg-mine-shaft-800 text-mine-shaft-300"
                  : "bg-bright-sun-400/15 text-bright-sun-400";

            return (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${classes}`}>
                {label}
              </span>
            );
          })()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs [&>div]:py-1 [&>div]:px-2 [&>div]:bg-mine-shaft-800 [&>div]:rounded-lg [&>div]:text-bright-sun-400">
        <div>{typeof props.experience === "string" && props.experience ? props.experience : "N/A"}</div>
        <div>{typeof props.jobType === "string" && props.jobType ? props.jobType : "N/A"}</div>
      </div>

      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-1 text-xs text-mine-shaft-300">
          <IconUsers size={14} />
          <span>{applicants} Applicants</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-mine-shaft-300">
          <IconClockHour3 size={14} />
          <span>{postedLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default PostedJobCard;
