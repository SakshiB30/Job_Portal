import { ActionIcon, Button, Divider, Skeleton } from "@mantine/core";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { card} from "../../Data/JobDescData";
import DOMPurify from "dompurify";
import { timeAgo } from "../../Services/Utilities";
import { toggleSaveJob } from "../../Services/UserService";
import { setUser } from "../../Slices/UserSlice";
import { getCompanyProfile } from "../../Services/ProfileService";
import type { ProfileState } from "../../Types";

const JobDesc = (props:any) => {
  const [companyProfile, setCompanyProfile] = useState<ProfileState | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  useEffect(() => {
    if (props.company) {
      setCompanyLoading(true);
      getCompanyProfile(props.company)
        .then(setCompanyProfile)
        .catch(() => {
          // company profile not found – keep null, fallback to template
          setCompanyProfile(null);
        })
        .finally(() => setCompanyLoading(false));
    }
  }, [props.company]);
  const user = useSelector((state:any) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const jobId = props.id ?? props._id ?? props.jobId;
  const savedIds = user?.savedJobs?.map((id:any) => String(id)) || [];
  const appliedIds = user?.appliedJobs?.map((id:any) => String(id)) || [];
  const interviewingIds = user?.interviewingJobs?.map((id:any) => String(id)) || [];
  const offeredIds = user?.offeredJobs?.map((id:any) => String(id)) || [];
  const rejectedIds = user?.rejectedJobs?.map((id:any) => String(id)) || [];
  const acceptedIds = user?.acceptedJobs?.map((id:any) => String(id)) || [];
  const declinedIds = user?.declinedJobs?.map((id:any) => String(id)) || [];
  const hasAppliedStatus = [
    ...appliedIds,
    ...interviewingIds,
    ...offeredIds,
    ...rejectedIds,
    ...acceptedIds,
    ...declinedIds,
  ].includes(String(jobId));
  const [isSaved, setIsSaved] = useState(!!(props.saved || savedIds.includes(String(jobId))));
  

  useEffect(() => {
    const currentSavedIds = user?.savedJobs?.map((id:any) => String(id)) || [];
    setIsSaved(!!(props.saved || currentSavedIds.includes(String(jobId))));
  }, [props.saved, jobId, user?.savedJobs]);

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // optimistic update first
      const currentlySavedIds = user?.savedJobs?.map((id:any) => String(id)) || [];
      const willBeSaved = !currentlySavedIds.includes(String(jobId));
      const newSavedIds = willBeSaved
        ? [...currentlySavedIds, String(jobId)]
        : currentlySavedIds.filter((id:any) => id !== String(jobId));
      dispatch(setUser({ ...user, savedJobs: newSavedIds }));
      setIsSaved(willBeSaved);

      const updatedUser = await toggleSaveJob(user.id, jobId);
      dispatch(setUser(updatedUser));
      const updatedSavedIds = updatedUser.savedJobs?.map((id:any) => String(id)) || [];
      setIsSaved(updatedSavedIds.includes(String(jobId)));
    } catch (error) {
      console.error(error);
      // fallback to localStorage
      try {
        const fallbackKey = `savedJobs_fallback_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
        const current = Array.isArray(existing) ? existing.map((id:any) => String(id)) : [];
        const toggled = current.includes(String(jobId))
          ? current.filter((id:any) => id !== String(jobId))
          : [...current, String(jobId)];
        localStorage.setItem(fallbackKey, JSON.stringify(toggled));
        dispatch(setUser({ ...user, savedJobs: toggled }));
        setIsSaved(toggled.includes(String(jobId)));
      } catch (e) {
        console.error('Fallback save failed', e);
      }
    }
  };

  const data = DOMPurify.sanitize(props?.description ?? "");
  return (
    <div className="w-full lg:w-2/3">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <div className="p-3 bg-mine-shaft-800 rounded-xl">
            <img className="h-14" src={companyProfile?.picture ? `data:image/jpeg;base64,${companyProfile.picture}` : `/Icons/${props.company}.png`} alt="" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="font-semibold text-2xl">{props.jobTitle}</div>
            <div className="text-lg text-mine-shaft-300">
              {props.company} &#x2022; {timeAgo(props.postTime)} &bull; {props.applicants? `${props.applicants} Applicants` : 'No Applicants'}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          {!props.edit && (
            <>
              {hasAppliedStatus ? (
                <div className="rounded-full bg-bright-sun-400/15 px-4 py-1.5 text-sm font-semibold text-bright-sun-400">
                  Already Applied
                </div>
              ) : (
                <Link to={`/apply-job/${jobId}`}>
                  <Button color="brightSun.4" size="sm" variant="light">
                    Apply
                  </Button>
                </Link>
              )}
              {!hasAppliedStatus && (
                <ActionIcon onClick={handleSave} variant="light" color="brightSun.4" radius="xl" size="lg" className="border border-mine-shaft-800">
                  {isSaved ? <IconBookmarkFilled className="text-bright-sun-400" /> : <IconBookmark className="text-mine-shaft-300" />}
                </ActionIcon>
              )}
            </>
          )}
        </div>
      </div>
      <Divider my="xl" />
      <div className="flex justify-between">
        {card.map((item: any, index: number) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <ActionIcon
              color="brightSun.4"
              className="h-12! w-12!"
              variant="light"
              radius="xl"
              aria-label="Settings"
            >
              <item.icon className="h-4/5 w-4/5" stroke={1.5} />
            </ActionIcon>
            <div className="text-mine-shaft-300 text-sm">{item.name}</div>
            <div className="font-semibold">{props?props[item.id]: "NA"} {item.id =="packageOffered" && <>LPA</>}</div>
          </div>
        ))}
      </div>
      <Divider my="xl" />
      <div>
        <div className="text-xl font-semibold mb-5">Required Skills</div>
        <div className="flex flex-wrap gap-2">
          {props?.skillsRequired?.map((item: any, index: number) => (
            <ActionIcon
              key={index}
              color="brightSun.4"
              className="h-fit! font-medium! text-sm! w-fit!"
              variant="light"
              radius="xl"
              p="xs"
              aria-label="Settings"
            >
              {item}
            </ActionIcon>
          ))}
        </div>
      </div>
      <Divider my="xl" />
      <div
        className=" *:text-mine-shaft-300 [&_h4]:text-xl [&_h4]:my-5 [&_h4]:font-semibold [&_h4]:text-mine-shaft-200 [&_p]:text-justify [&_li]:marker:text-bright-sun-400 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: data }}
      ></div>
      <Divider my="xl" />
      <div>
        <div className="text-xl font-semibold mb-5">About Company</div>
        <div>
          <div className="flex justify-between mb-3">
            <div className="flex gap-2 items-center">
              <div className="p-3 bg-mine-shaft-800 rounded-xl">
                <img className="h-8" src={companyProfile?.picture ? `data:image/jpeg;base64,${companyProfile.picture}` : `/Icons/${props.company}.png`} alt="" />
              </div>

              <div className="flex flex-col">
                <div className="font-medium text-lg">{props.company}</div>
                {companyLoading ? (
                  <Skeleton height={14} width={100} />
                ) : (
                  <div className="text-mine-shaft-300 text-sm">
                    {companyProfile?.companySize || (companyProfile?.industry ? companyProfile.industry : "")}
                  </div>
                )}
              </div>
            </div>


          </div>
          {companyLoading ? (
            <div className="space-y-2">
              <Skeleton height={14} width="100%" />
              <Skeleton height={14} width="85%" />
              <Skeleton height={14} width="60%" />
            </div>
          ) : companyProfile?.about ? (
            <div className="text-mine-shaft-300 text-justify">{companyProfile.about}</div>
          ) : (
            <div className="text-mine-shaft-300 text-justify">
              {props.company || "This company"} is a leading organization in the {props.jobType || "technology"} sector, 
              known for innovation, excellence, and a people-first culture. With a strong presence in 
              {props.location || "multiple locations"}, they are committed to delivering top-tier products 
              and services while fostering an inclusive and dynamic work environment. 
              Employees enjoy opportunities for growth, cutting-edge tools, and a collaborative atmosphere 
              that values creativity and initiative.
            </div>
          )}
          {companyProfile?.website && (
            <a href={companyProfile.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-bright-sun-400 hover:underline">
              {companyProfile.website}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDesc;
