import { Skeleton, Tabs } from "@mantine/core";
import PostedJobCard from "./PostedJobCard";
import { IconBriefcase, IconFileText } from "@tabler/icons-react";
import type { PostedJobItem } from "../../Pages/PostedJobpage";

type PostedJobProps = {
  activeJobs?: PostedJobItem[];
  closedJobs?: PostedJobItem[];
  draftJobs?: PostedJobItem[];
  selectedJobId?: string | number;
  loading?: boolean;
  onSelect: (job: PostedJobItem) => void;
};

const getJobKey = (job: PostedJobItem) => job?.id ?? job?._id ?? job?.jobId;

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-md border border-dashed border-mine-shaft-700 bg-mine-shaft-900/60 px-4 py-8 text-center text-sm text-mine-shaft-300">
    {label}
  </div>
);

const PostedJobCardSkeleton = () => (
  <div className="w-full rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-4 animate-pulse">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <Skeleton height={18} width={160} />
        <Skeleton height={14} width={100} />
      </div>
      <Skeleton height={20} width={52} radius="xl" />
    </div>
    <div className="mt-4 flex items-center justify-between gap-3">
      <Skeleton height={14} width={100} />
      <Skeleton height={14} width={90} />
    </div>
  </div>
);

const PostedJob = ({ activeJobs = [], closedJobs = [], draftJobs = [], selectedJobId, onSelect, loading = false }: PostedJobProps) => {
  return (
    <aside className="w-full lg:w-90 lg:shrink-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">Jobs</div>
          <div className="text-sm text-mine-shaft-300">Select a role to view details.</div>
        </div>
      </div>
      <Tabs autoContrast variant="pills" defaultValue="active">
        <Tabs.List className="grid grid-cols-2 gap-2 rounded-md bg-mine-shaft-900 p-1 [&_button]:justify-center [&_button]:font-medium! [&_button[aria-selected='false']]:bg-transparent!">
            <Tabs.Tab value="active" leftSection={<IconBriefcase size={16} />}>
              Active [{activeJobs.length}]
            </Tabs.Tab>
            <Tabs.Tab value="closed" leftSection={<IconBriefcase size={16} />}>
              Closed [{(closedJobs || []).length}]
            </Tabs.Tab>
            <Tabs.Tab value="draft" leftSection={<IconFileText size={16} />}>
              Draft [{draftJobs.length}]
            </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active">
          <div className="mt-4 flex max-h-[calc(100vh-260px)] min-h-64 flex-col gap-3 overflow-y-auto pr-1">
            {loading ? (
              <>
                <PostedJobCardSkeleton />
                <PostedJobCardSkeleton />
                <PostedJobCardSkeleton />
              </>
            ) : activeJobs.length ? (
              activeJobs.map((item, index) => (
                <PostedJobCard
                  key={getJobKey(item) ?? index}
                  {...item}
                  selected={String(getJobKey(item)) === String(selectedJobId)}
                  onClick={() => onSelect(item)}
                />
              ))
            ) : (
              <EmptyState label="No active posted jobs found." />
            )}
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="closed">
          <div className="mt-4 flex max-h-[calc(100vh-260px)] min-h-64 flex-col gap-3 overflow-y-auto pr-1">
            {loading ? (
              <>
                <PostedJobCardSkeleton />
                <PostedJobCardSkeleton />
                <PostedJobCardSkeleton />
              </>
            ) : closedJobs && closedJobs.length ? (
              closedJobs.map((item, index) => (
                <PostedJobCard
                  key={getJobKey(item) ?? index}
                  {...item}
                  selected={String(getJobKey(item)) === String(selectedJobId)}
                    onClick={() => onSelect(item)}
                />
              ))
            ) : (
              <EmptyState label="No closed jobs found." />
            )}
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="draft">
          <div className="mt-4 flex max-h-[calc(100vh-260px)] min-h-64 flex-col gap-3 overflow-y-auto pr-1">
            {loading ? (
              <>
                <PostedJobCardSkeleton />
                <PostedJobCardSkeleton />
                <PostedJobCardSkeleton />
              </>
            ) : draftJobs.length ? (
              draftJobs.map((item, index) => (
                <PostedJobCard
                  key={getJobKey(item) ?? index}
                  {...item}
                  selected={String(getJobKey(item)) === String(selectedJobId)}
                  onClick={() => onSelect(item)}
                />
              ))
            ) : (
              <EmptyState label="No draft jobs found." />
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
};

export default PostedJob;
