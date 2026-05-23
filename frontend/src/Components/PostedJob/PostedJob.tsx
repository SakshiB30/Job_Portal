import { Tabs } from "@mantine/core";
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
              <EmptyState label="Loading posted jobs..." />
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
              <EmptyState label="Loading posted jobs..." />
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
              <EmptyState label="Loading drafts..." />
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
