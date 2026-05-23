import { Button, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import JobCard from "../FindJobs/JobCard";
import { getAllJobs, getAppliedJobs } from "../../Services/JobService";
import { Link } from "react-router-dom";
import type { JobItem, RootState } from "../../Types";
import { getUser } from "../../Services/UserService";
import { setUser } from "../../Slices/UserSlice";

const EmptyState = ({ label }: { label: string }) => (
  <div className="col-span-full rounded-md border border-dashed border-mine-shaft-700 bg-mine-shaft-900/60 p-8 text-center text-mine-shaft-300">
    <div>{label}</div>

    <Link to="/find-jobs">
      <Button
        className="mt-4"
        color="brightSun.4"
        variant="light"
      >
        Browse Jobs
      </Button>
    </Link>
  </div>
);

const JobHistory = () => {

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [jobs, setJobs] = useState<JobItem[]>([]);

  // NEW STATE
  const [appliedJobs, setAppliedJobs] = useState<JobItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadJobHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const [allJobsResponse, appliedJobsResponse] = await Promise.all([
          getAllJobs(),
          user?.id ? getAppliedJobs(user.id) : Promise.resolve([]),
        ]);

        if (!mounted) return;

        const allJobs = Array.isArray(allJobsResponse) ? allJobsResponse : [];
        const serverAppliedJobs = Array.isArray(appliedJobsResponse)
          ? appliedJobsResponse
          : [];

        setJobs(allJobs);
        setAppliedJobs(
          serverAppliedJobs.length
            ? serverAppliedJobs
            : filterJobsByIds(allJobs, user?.appliedJobs || [])
        );

        if (user?.id) {
          try {
            const updatedUser = await getUser(user.id);
            if (mounted) dispatch(setUser(updatedUser));
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error);

        if (!mounted) return;

        setError(
          "Unable to load the latest job history from the server. Showing any stored jobs available on your account."
        );
        setAppliedJobs((current) =>
          current.length ? current : filterJobsByIds(jobs, user?.appliedJobs || [])
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadJobHistory();

    return () => {
      mounted = false;
    };

  }, [user?.id, dispatch]);

  const filterJobsByIds = (
    sourceJobs: JobItem[],
    ids: Array<string | number>
  ) => {

    if (!ids?.length) return [];

    const normalizedIds = ids.map((id) => String(id));

    return sourceJobs.filter((job) => {

      const jobId = String(
        job.id ?? job._id ?? job.jobId ?? ""
      );

      return normalizedIds.includes(jobId);
    });
  };

  const filterByIds = (ids: Array<string | number>) => filterJobsByIds(jobs, ids);

  // SAVED JOBS
  const savedFallbackKey = user?.id
    ? `savedJobs_fallback_${user.id}`
    : null;

  let fallbackSaved: string[] = [];

  try {

    const parsed = savedFallbackKey
      ? JSON.parse(
          localStorage.getItem(savedFallbackKey) || "[]"
        )
      : [];

    fallbackSaved = Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    fallbackSaved = [];
  }

  const mergedSavedIds = Array.from(
    new Set([
      ...(user?.savedJobs || []).map((id) => String(id)),
      ...fallbackSaved.map((id) => String(id)),
    ])
  );

  const savedJobs = filterByIds(mergedSavedIds || []);

  const offeredJobs = filterByIds(
    user?.offeredJobs || []
  );

  const interviewingJobs = filterByIds(
    user?.interviewingJobs || []
  );

  const rejectedJobs = filterByIds(
    user?.rejectedJobs || []
  );

  const acceptedJobs = filterByIds(
    user?.acceptedJobs || []
  );

  const declinedJobs = filterByIds(
    user?.declinedJobs || []
  );

  const renderJobs = (
    items: JobItem[],
    emptyLabel: string,
    flag:
      | "applied"
      | "saved"
      | "offered"
      | "interviewing"
      | "rejected"
      | "accepted"
      | "declined"
  ) => (

    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

      {loading ? (

        <EmptyState label="Loading your job history..." />

      ) : items.length ? (

        items.map((job, index) => (

          <JobCard
            key={job.id ?? job._id ?? index}
            {...job}
            {...{ [flag]: true }}
          />
        ))

      ) : (

        <EmptyState label={emptyLabel} />
      )}
    </div>
  );

  if (!user) {

    return (

      <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-8 text-center">

        <div className="text-2xl font-semibold">
          Job History
        </div>

        <div className="mx-auto mt-2 max-w-xl text-mine-shaft-300">
          Log in to see applied, saved, offered,
          and interviewing jobs.
        </div>

        <Link to="/login">

          <Button
            className="mt-5"
            color="brightSun.4"
            variant="light"
          >
            Login
          </Button>

        </Link>
      </div>
    );
  }

  return (

    <div>

      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">

        <div>

          <div className="text-3xl font-semibold">
            Job History
          </div>

          <div className="mt-1 text-sm text-mine-shaft-300">
            Track every job you have saved,
            applied to, or moved into a hiring stage.
          </div>

        </div>

        <div className="grid grid-cols-2 gap-2 text-center sm:min-w-130 sm:grid-cols-7">

          {[
            ["Applied", appliedJobs.length],
            ["Saved", savedJobs.length],
            ["Offers", offeredJobs.length],
            ["Interviews", interviewingJobs.length],
            ["Rejected", rejectedJobs.length],
            ["Accepted", acceptedJobs.length],
            ["Declined", declinedJobs.length],
          ].map(([label, count]) => (

            <div
              key={label}
              className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3"
            >

              <div className="text-lg font-semibold text-bright-sun-400">
                {count}
              </div>

              <div className="text-[11px] text-mine-shaft-300">
                {label}
              </div>

            </div>
          ))}
        </div>
      </div>

      {error && (

        <div className="mb-4 rounded-md border border-bright-sun-400/40 bg-bright-sun-400/10 px-4 py-3 text-sm text-bright-sun-100">

          {error}

        </div>
      )}

      <Tabs
        variant="outline"
        radius="lg"
        defaultValue="applied"
      >

        <Tabs.List className="mb-5 flex-nowrap overflow-x-auto [&_button]:text-base! [&_button]:font-semibold! [&_button[data-active='true']]:text-bright-sun-400! md:[&_button]:text-lg!">

          <Tabs.Tab value="applied">
            Applied
          </Tabs.Tab>

          <Tabs.Tab value="saved">
            Saved
          </Tabs.Tab>

          <Tabs.Tab value="offered">
            Offered
          </Tabs.Tab>

          <Tabs.Tab value="interviewing">
            Interviewing
          </Tabs.Tab>

          <Tabs.Tab value="rejected">
            Rejected
          </Tabs.Tab>

          <Tabs.Tab value="accepted">
            Accepted
          </Tabs.Tab>

          <Tabs.Tab value="declined">
            Declined
          </Tabs.Tab>

        </Tabs.List>

        <Tabs.Panel value="applied">

          {renderJobs(
            appliedJobs,
            "No applied jobs yet.",
            "applied"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="saved">

          {renderJobs(
            savedJobs,
            "No saved jobs yet.",
            "saved"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="offered">

          {renderJobs(
            offeredJobs,
            "No offers yet.",
            "offered"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="interviewing">

          {renderJobs(
            interviewingJobs,
            "No interview stages yet.",
            "interviewing"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="rejected">

          {renderJobs(
            rejectedJobs,
            "No rejected applications yet.",
            "rejected"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="accepted">

          {renderJobs(
            acceptedJobs,
            "No accepted offers yet.",
            "accepted"
          )}

        </Tabs.Panel>

        <Tabs.Panel value="declined">

          {renderJobs(
            declinedJobs,
            "No declined offers yet.",
            "declined"
          )}

        </Tabs.Panel>

      </Tabs>
    </div>
  );
};

export default JobHistory;
