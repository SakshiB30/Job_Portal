import { Divider, Skeleton } from "@mantine/core";

const JobCardSkeleton = () => {
  return (
    <div className="card-standard relative h-full w-full min-w-0 max-w-full animate-pulse">
      {/* Header row — logo + title + bookmark */}
      <div className="flex justify-between gap-3">
        <div className="flex gap-2 items-center">
          <Skeleton circle height={48} width={48} />
          <div className="flex flex-col gap-2">
            <Skeleton height={18} width={160} />
            <Skeleton height={14} width={120} />
          </div>
        </div>
        <Skeleton circle height={36} width={36} />
      </div>

      {/* Tag chips */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <Skeleton height={24} width={70} radius="md" />
        <Skeleton height={24} width={90} radius="md" />
        <Skeleton height={24} width={80} radius="md" />
      </div>

      {/* Description lines */}
      <div className="space-y-2 mb-3">
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="85%" />
        <Skeleton height={14} width="60%" />
      </div>

      <Divider size="xs" color="!mineShaft.7" />

      {/* Footer — salary + time */}
      <div className="flex justify-between items-center mt-3">
        <Skeleton height={16} width={90} />
        <Skeleton height={14} width={100} />
      </div>

      {/* Button */}
      <div className="w-full mt-4">
        <Skeleton height={36} width="100%" radius="md" />
      </div>
    </div>
  );
};

export default JobCardSkeleton;
