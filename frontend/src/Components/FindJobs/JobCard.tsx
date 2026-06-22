import { IconBookmark, IconBookmarkFilled, IconClockHour3 } from "@tabler/icons-react"
import { ActionIcon, Button, Divider, Text } from '@mantine/core';
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../../Services/Utilities";
import { updateApplicationStatus } from "../../Services/JobService";
import { toggleSaveJob } from "../../Services/UserService";
import { getUser } from "../../Services/UserService";
import { setUser } from "../../Slices/UserSlice";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import CompanyLogo from "../CompanyLogo";
import type { JobItem, RootState } from "../../Types";

const JobCard = (props: JobItem) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDraft = props.jobStatus === "DRAFT";
  const applicantCount = Array.isArray(props.applicants)
    ? props.applicants.length
    : typeof props.applicants === 'number'
    ? props.applicants
    : undefined;
  const jobId = props.id ?? props._id ?? props.jobId;
  const savedIds = user?.savedJobs?.map((id) => String(id)) || [];
  const derivedSaved = !!(props.saved || savedIds.includes(String(jobId)));
  const [actionLoading, setActionLoading] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null);
  const isSaved = optimisticSaved ?? derivedSaved;

  const handleSaveClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      // optimistic update: toggle locally first for snappy UI
      const currentlySavedIds = user?.savedJobs?.map((id) => String(id)) || [];
      const willBeSaved = !currentlySavedIds.includes(String(jobId));
      const newSavedIds = willBeSaved
        ? [...currentlySavedIds, String(jobId)]
        : currentlySavedIds.filter((id) => id !== String(jobId));
      dispatch(setUser({ ...user, savedJobs: newSavedIds }));
      setOptimisticSaved(willBeSaved);

      // attempt backend update; if it succeeds, reconcile state with server
      const updatedUser = await toggleSaveJob(user.id, jobId);
      dispatch(setUser(updatedUser));
      const updatedSavedIds = updatedUser.savedJobs?.map((id: string | number) => String(id)) || [];
      setOptimisticSaved(updatedSavedIds.includes(String(jobId)));
    } catch (error) {
      // Backend failed, so persist a local fallback and keep the UI consistent.
      try {
        const fallbackKey = `savedJobs_fallback_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
        const current = Array.isArray(existing) ? existing.map((id) => String(id)) : [];
        const toggled = current.includes(String(jobId))
          ? current.filter((id) => id !== String(jobId))
          : [...current, String(jobId)];
        localStorage.setItem(fallbackKey, JSON.stringify(toggled));
        dispatch(setUser({ ...user, savedJobs: toggled }));
        setOptimisticSaved(toggled.includes(String(jobId)));
      } catch (e) {
        // silent fallback failure
      }
    }
  };

  const handleOfferResponse = async (status: "ACCEPTED" | "DECLINED") => {
    if (!user?.id || !jobId) return;

    try {
      setActionLoading(status);
      await updateApplicationStatus(jobId, user.id, status);
      const updatedUser = await getUser(user.id);
      dispatch(setUser(updatedUser));
      successNotification(
        status === "ACCEPTED" ? "Offer accepted" : "Offer declined",
        status === "ACCEPTED"
          ? "Your acceptance has been saved."
          : "Your response has been saved."
      );
    } catch (error) {
      errorNotification("Error", "Unable to update your offer response.");
    } finally {
      setActionLoading(null);
    }
  };

  

  return (
    <div className="card-standard relative h-full w-full min-w-0 max-w-full">
      <div className="flex justify-between gap-2 sm:gap-3">
        <div className="flex gap-2 items-center min-w-0 flex-1">
          <div className="p-2 bg-mine-shaft-800 rounded-full shrink-0">
            <CompanyLogo logo={props.companyLogo} picture={props.companyPicture} company={props.company} className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-semibold text-sm sm:text-lg leading-snug truncate">{props.jobTitle || "Untitled Job"}</div>
            <div className="text-xs sm:text-sm text-mine-shaft-300 truncate">
              {props.company || "Company"} &middot; {applicantCount !== undefined ? `${applicantCount} Applicants` : 'No Applicants'}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <ActionIcon onClick={handleSaveClick} variant="light" color="brightSun.4" radius="xl" size="lg" className="border border-mine-shaft-800">
            {isSaved ? <IconBookmarkFilled className="text-bright-sun-400" /> : <IconBookmark className="text-mine-shaft-300" />}
          </ActionIcon>
        </div>
      </div>

      <div className="mt-4 mb-4 flex flex-wrap gap-2 text-xs [&>div]:rounded-lg [&>div]:bg-mine-shaft-800 [&>div]:px-2 [&>div]:py-1 [&>div]:text-bright-sun-400">
        <div>{props.experience || "Experience N/A"}</div>
        <div>{props.jobType || "Job Type N/A"}</div>
        <div>{props.location || "Location N/A"}</div>
      </div>

      {isDraft && (
        <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-bright-sun-400 bg-mine-shaft-800 px-3 py-1 rounded-full inline-block mb-3">
          Draft
        </div>
      )}

      <Text className="text-xs! text-justify text-mine-shaft-300" lineClamp={3}>
        {props.about || props.description || "No description available."}
      </Text>
      <Divider size="xs" color="!mineShaft.7" />

      <div className="flex justify-between items-center mt-3 gap-2">
        <div className="text-mine-shaft-200 font-semibold text-xs sm:text-sm truncate">₹ {props.packageOffered ?? "N/A"} LPA</div>
        <div className="flex items-center text-mine-shaft-400 gap-1 text-[11px] sm:text-xs shrink-0">
          <IconClockHour3 className="h-4 w-4 sm:h-5 sm:w-5" stroke={1.5}/> {props.postTime ? timeAgo(props.postTime) : "Recently"}
        </div>
      </div>

      <Link to={`/jobs/${jobId}`} className="w-full mt-4 block">
        <Button fullWidth color="brightSun.4" variant="light">
          View Job
        </Button>
      </Link>

      {props.offered && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            color="green.7"
            variant="light"
            loading={actionLoading === "ACCEPTED"}
            onClick={() => handleOfferResponse("ACCEPTED")}
            fullWidth
          >
            Accept Offer
          </Button>
          <Button
            color="red.7"
            variant="outline"
            loading={actionLoading === "DECLINED"}
            onClick={() => handleOfferResponse("DECLINED")}
            fullWidth
          >
            Decline
          </Button>
        </div>
      )}

      {props.interviewing && (props.interviewDate || props.interviewMeetingLink) && (
        <div className="mt-3 rounded-md bg-blue-500/10 border border-blue-500/30 p-3">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs mb-2">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Interview Scheduled
          </div>
          <div className="space-y-1 text-xs text-mine-shaft-300">
            {props.interviewDate && (
              <div className="flex items-center gap-1.5">
                <span className="text-mine-shaft-400 w-14 shrink-0">Date:</span>
                <span className="text-mine-shaft-200">{props.interviewDate}</span>
              </div>
            )}
            {props.interviewMode && (
              <div className="flex items-center gap-1.5">
                <span className="text-mine-shaft-400 w-14 shrink-0">Mode:</span>
                <span className="text-mine-shaft-200">{props.interviewMode}</span>
              </div>
            )}
            {props.interviewMeetingLink && (
              <div className="flex items-center gap-1.5">
                <span className="text-mine-shaft-400 w-14 shrink-0">Link:</span>
                <a href={props.interviewMeetingLink} target="_blank" rel="noopener noreferrer" className="text-bright-sun-400 hover:underline truncate max-w-[200px] inline-block">
                  {props.interviewMeetingLink}
                </a>
              </div>
            )}
            {props.interviewNotes && (
              <div className="flex items-start gap-1.5">
                <span className="text-mine-shaft-400 w-14 shrink-0 mt-0.5">Notes:</span>
                <span className="text-mine-shaft-200">{props.interviewNotes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {props.accepted && (
        <div className="mt-3 rounded-md bg-green-500/10 border border-green-500/30 px-4 py-2.5 text-center">
          <div className="flex items-center justify-center gap-2 text-green-400 font-semibold text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Offer Accepted
          </div>
          <div className="text-xs text-green-500/70 mt-0.5">You've accepted this offer.</div>
        </div>
      )}

      {props.declined && (
        <div className="mt-3 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-center">
          <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Offer Declined
          </div>
          <div className="text-xs text-red-500/70 mt-0.5">You've declined this offer.</div>
        </div>
      )}
    </div>
  )
}

export default JobCard
