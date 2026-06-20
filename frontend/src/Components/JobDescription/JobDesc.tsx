import { ActionIcon, Button, Divider, Skeleton, LoadingOverlay } from "@mantine/core";
import { IconBookmark, IconBookmarkFilled, IconUserPlus, IconUserCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { card} from "../../Data/JobDescData";
import DOMPurify from "dompurify";
import { timeAgo } from "../../Services/Utilities";
import { toggleSaveJob, followProfile, unfollowProfile } from "../../Services/UserService";
import { setUser } from "../../Slices/UserSlice";
import { getCompanyProfile, getProfile } from "../../Services/ProfileService";
import CompanyLogo from "../CompanyLogo";
import type { ProfileState, RootState } from "../../Types";
import { successNotification, errorNotification } from "../../Services/NotificationService";
import { isStudent } from "../../Services/RoleService";
import { applyJob } from "../../Services/JobService";

const JobDesc = (props:any) => {
  const [companyProfile, setCompanyProfile] = useState<ProfileState | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [applying, setApplying] = useState(false);


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
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const jobId = props.id ?? props._id ?? props.jobId;
  const savedIds = user?.savedJobs?.map((id:any) => String(id)) || [];
  const appliedIds = user?.appliedJobs?.map((id:any) => String(id)) || [];
  const interviewingIds = user?.interviewingJobs?.map((id:any) => String(id)) || [];
  const offeredIds = user?.offeredJobs?.map((id:any) => String(id)) || [];
  const hasAppliedStatus = [
    ...appliedIds,
    ...interviewingIds,
    ...offeredIds,
  ].includes(String(jobId));
  const [isSaved, setIsSaved] = useState(!!(props.saved || savedIds.includes(String(jobId))));
  
  const isStudentUser = isStudent(user);
  const followingIds = user?.following?.map((id: any) => String(id)) || [];
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const currentSavedIds = user?.savedJobs?.map((id:any) => String(id)) || [];
    setIsSaved(!!(props.saved || currentSavedIds.includes(String(jobId))));
  }, [props.saved, jobId, user?.savedJobs]);

  useEffect(() => {
    if (companyProfile?.id) {
      setIsFollowing(followingIds.includes(String(companyProfile.id)));
    }
  }, [companyProfile?.id, user?.following]);

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

  const handleFollow = async () => {
    if (!user || !companyProfile?.id) return;
    try {
      if (isFollowing) {
        const updatedUser = await unfollowProfile(user.id, companyProfile.id);
        dispatch(setUser(updatedUser));
        setIsFollowing(false);
        successNotification("Unfollowed", `You are no longer following ${props.company}.`);
      } else {
        const updatedUser = await followProfile(user.id, companyProfile.id);
        dispatch(setUser(updatedUser));
        setIsFollowing(true);
        successNotification("Following", `You are now following ${props.company}.`);
      }
    } catch (error) {
      console.error(error);
      errorNotification("Error", "Unable to update follow status.");
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      // Fetch the user's profile to check completeness
      let profile = null;
      if (user?.profileId) {
        try {
          profile = await getProfile(user.profileId);
        } catch {
          // profile not found
        }
      }

      if (!profile) {
        errorNotification("Profile Required", "Please create your profile before applying.");
        navigate('/profile');
        setApplying(false);
        return;
      }

      // Debug: log what the API returned
      const missing: string[] = [];
      if (!profile.phone) missing.push("Phone Number");
      if (!profile.about) missing.push("About section");
      if (!profile.skills || profile.skills.length === 0) missing.push("At least one Skill");

      console.log('[Apply] Profile from API:', { id: profile.id, phone: profile.phone, about: profile?.about?.substring(0, 30), skillsCount: profile?.skills?.length });

      if (missing.length > 0) {
        errorNotification("Incomplete Profile", "Missing: " + missing.join(", ") + ". Please update your profile and try again.");
        navigate('/profile');
        setApplying(false);
        return;
      }

      // One-click apply using profile data
      const applicant = {
        applicantId: user.id,
      };

      await applyJob(jobId, applicant);

      // Optimistic UI update
      try {
        const currentApplied = Array.isArray(user.appliedJobs) ? user.appliedJobs.map((id: any) => String(id)) : [];
        if (!currentApplied.includes(String(jobId))) {
          const optimistic = { ...user, appliedJobs: [...(user.appliedJobs || []), jobId] };
          dispatch(setUser(optimistic));
        }
      } catch (e) {
        console.warn('Failed to update local state after apply', e);
      }

      successNotification("Application Submitted", "Your application has been submitted successfully using your profile information.");
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.errorMessage ||
        "Something went wrong. Please try again later.";
      errorNotification("Error", message);
    } finally {
      setApplying(false);
    }
  };

  const data = DOMPurify.sanitize(props?.description ?? "");
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <LoadingOverlay
        visible={applying}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'brightSun.4', type: 'bars' }}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="flex gap-2 items-center min-w-0">
          <div className="p-3 bg-mine-shaft-800 rounded-xl shrink-0">
            <CompanyLogo logo={companyProfile?.companyLogo} picture={companyProfile?.picture} company={props.company} className="h-14 w-14" />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-semibold text-xl sm:text-2xl truncate">{props.jobTitle}</div>
            <div className="text-sm sm:text-lg text-mine-shaft-300">
              {props.company} &#x2022; {timeAgo(props.postTime)} &bull; {(() => {
                const count = Array.isArray(props.applicants) ? props.applicants.length : props.applicants;
                return count ? `${count} Applicant${count !== 1 ? 's' : ''}` : 'No Applicants';
              })()}
            </div>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-end shrink-0">
          {!props.edit && (
            <>
              {hasAppliedStatus ? (
                <div className="rounded-full bg-bright-sun-400/15 px-4 py-1.5 text-sm font-semibold text-bright-sun-400 whitespace-nowrap">
                  Already Applied
                </div>
              ) : (
                <Button
                  color="brightSun.4"
                  size="sm"
                  variant="light"
                  onClick={handleApply}
                  loading={applying}
                >
                  Apply Now
                </Button>
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {card.map((item: any, index: number) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <ActionIcon
              color="brightSun.4"
              className="h-10! w-10! sm:h-12! sm:w-12!"
              variant="light"
              radius="xl"
              aria-label="Settings"
            >
              <item.icon className="h-4/5 w-4/5" stroke={1.5} />
            </ActionIcon>
            <div className="text-mine-shaft-300 text-xs sm:text-sm text-center">{item.name}</div>
            <div className="font-semibold text-sm sm:text-base text-center">{props?props[item.id]: "NA"} {item.id =="packageOffered" && <>LPA</>}</div>
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
          <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-2">
            <div className="flex gap-2 items-center min-w-0">
              <div className="p-3 bg-mine-shaft-800 rounded-xl shrink-0">
                <CompanyLogo logo={companyProfile?.companyLogo} picture={companyProfile?.picture} company={props.company} className="h-8 w-8" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium text-base sm:text-lg truncate">{props.company}</div>
                  {isStudentUser && companyProfile?.id && (
                    <Button
                      size="xs"
                      color={isFollowing ? "gray" : "brightSun.4"}
                      variant={isFollowing ? "outline" : "light"}
                      onClick={handleFollow}
                      leftSection={isFollowing ? <IconUserCheck size={14} /> : <IconUserPlus size={14} />}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
                {companyLoading ? (
                  <Skeleton height={14} width={100} />
                ) : (
                  <div className="flex items-center gap-3 text-mine-shaft-300 text-sm">
                    {companyProfile?.companySize || (companyProfile?.industry ? companyProfile.industry : "")}
                    {companyProfile?.followerCount !== undefined && companyProfile?.followerCount !== null && (
                      <span className="text-mine-shaft-500">
                        &middot; {Number(companyProfile.followerCount)} follower{Number(companyProfile.followerCount) !== 1 ? 's' : ''}
                      </span>
                    )}
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
