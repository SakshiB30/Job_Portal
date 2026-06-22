import { Button, Skeleton } from "@mantine/core";
import { IconBuilding, IconUserMinus, IconUsers } from "@tabler/icons-react";
import CompanyLogo from "../CompanyLogo";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getFollowing, unfollowProfile } from "../../Services/UserService";
import { setUser } from "../../Slices/UserSlice";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import type { ProfileState, RootState } from "../../Types";

const Following = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [following, setFollowing] = useState<ProfileState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getFollowing(user.id)
      .then((data) => setFollowing(Array.isArray(data) ? data : []))
      .catch(() => setFollowing([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleUnfollow = async (profileId: string | number | undefined) => {
    if (!user?.id || !profileId) return;
    try {
      const updatedUser = await unfollowProfile(user.id, profileId);
      dispatch(setUser(updatedUser));
      setFollowing((prev) => prev.filter((p) => String(p.id) !== String(profileId)));
      successNotification("Unfollowed", "Company removed from your following list.");
    } catch (error) {
      errorNotification("Error", "Unable to unfollow. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-2xl font-semibold mb-5">
        <IconUsers className="text-bright-sun-400" />
        Following
        {!loading && (
          <span className="text-base text-mine-shaft-400 font-normal">
            &middot; {following.length} {following.length === 1 ? "company" : "companies"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-standard animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton height={40} width={40} radius="xl" />
                <div className="flex-1">
                  <Skeleton height={14} width="60%" />
                  <Skeleton height={10} width="40%" mt={6} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : following.length === 0 ? (
        <div className="rounded-md border border-dashed border-mine-shaft-700 p-8 text-center text-mine-shaft-300">
          <IconBuilding className="mx-auto mb-3 h-10 w-10 text-mine-shaft-500" stroke={1.5} />
          <div className="font-semibold text-mine-shaft-200">No companies followed yet</div>
          <div className="mt-1 text-sm">
            Browse jobs and follow companies you're interested in to get updates.
          </div>
          <Link to="/find-jobs">
            <Button color="brightSun.4" variant="light" mt="md" size="sm">
              Browse Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {following.map((company) => (
            <div
              key={company.id}
              className="card-standard"
            >
              <div className="flex justify-between">
                <div className="flex gap-2 items-center min-w-0">
                  <div className="p-2 bg-mine-shaft-800 rounded-full shrink-0">
                    <CompanyLogo logo={company.companyLogo} picture={company.picture} company={company.company} className="h-9 w-9" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate text-mine-shaft-100">
                      {company.company || "Unknown Company"}
                    </div>
                    <div className="text-xs text-mine-shaft-400">
                      {company.industry || company.location || ""}
                    </div>
                  </div>
                </div>
                <Button
                  size="xs"
                  color="gray"
                  variant="subtle"
                  onClick={() => handleUnfollow(company.id)}
                  leftSection={<IconUserMinus size={12} />}
                >
                  Unfollow
                </Button>
              </div>

              {company.specialties && company.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 [&>div]:py-1 [&>div]:px-2 [&>div]:bg-mine-shaft-800 [&>div]:rounded-lg text-xs [&>div]:text-bright-sun-400">
                  {company.specialties.slice(0, 4).map((s, i) => (
                    <div key={i}>{s}</div>
                  ))}
                  {company.specialties.length > 4 && <div>+{company.specialties.length - 4}</div>}
                </div>
              )}

              {company.about && (
                <div className="text-xs text-justify text-mine-shaft-300 line-clamp-3">
                  {company.about}
                </div>
              )}

              <div className="flex justify-between items-center">
                {company.followerCount !== undefined && company.followerCount !== null && (
                  <div className="text-xs text-mine-shaft-500">
                    {Number(company.followerCount)} follower{Number(company.followerCount) !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;
