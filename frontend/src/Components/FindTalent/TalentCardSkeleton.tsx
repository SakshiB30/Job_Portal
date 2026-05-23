import { Divider, Skeleton } from "@mantine/core";

const TalentCardSkeleton = () => {
  return (
    <div className="card-standard h-full w-full animate-pulse">
      {/* Header — avatar + name + heart */}
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Skeleton circle height={48} width={48} />
          <div className="flex flex-col gap-2">
            <Skeleton height={18} width={130} />
            <Skeleton height={14} width={100} />
          </div>
        </div>
        <Skeleton circle height={36} width={36} />
      </div>

      {/* Skills chips */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <Skeleton height={24} width={75} radius="md" />
        <Skeleton height={24} width={90} radius="md" />
        <Skeleton height={24} width={65} radius="md" />
      </div>

      {/* About text */}
      <div className="space-y-2 mb-3">
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="80%" />
      </div>

      <Divider size="xs" color="!mineShaft.7" />

      {/* Footer — salary + location */}
      <div className="flex justify-between items-center mt-2">
        <Skeleton height={16} width={80} />
        <Skeleton height={14} width={90} />
      </div>

      <Divider size="xs" color="!mineShaft.7" />

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Skeleton height={36} radius="md" />
        <Skeleton height={36} radius="md" />
      </div>
    </div>
  );
};

export default TalentCardSkeleton;
