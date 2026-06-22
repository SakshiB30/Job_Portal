import { Menu, Avatar } from "@mantine/core";
import {
  IconUserCircle,
  IconLogout,
  IconClipboardList,
  IconBuilding,
} from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "../../Slices/UserSlice";
import CompanyLogo from "../CompanyLogo";
import type { RootState } from "../../Types";
import {
  getRoleLabel,
  isCompany,
  isCompanyPending,
  isCompanyRejected,
  isStudent,
} from "../../Services/RoleService";

const ProfileMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.profile);
  const user = useSelector((state: RootState) => state.user);

  const [opened, setOpened] = useState(false);

  const companyAccount = isCompany(user);

  const displayName = companyAccount
    ? profile?.company || user?.name || "Company"
    : profile?.name || user?.name || "Profile";

  const avatarSrc = !companyAccount && profile?.picture
    ? `data:image/jpeg;base64,${profile.picture}`
    : "/A3.png";

  const handleLogOut = () => {
    dispatch(removeUser());
    navigate("/login");
  };

  const getStatusBadge = () => {
    if (!companyAccount) return null;
    if (isCompanyPending(user)) {
      return (
        <span className="rounded-full bg-yellow-500/15 text-yellow-300 px-2 py-0.5 text-[10px] font-medium">
          Pending Approval
        </span>
      );
    }
    if (isCompanyRejected(user)) {
      return (
        <span className="rounded-full bg-red-500/15 text-red-300 px-2 py-0.5 text-[10px] font-medium">
          Rejected
        </span>
      );
    }
    return (
      <span className="rounded-full bg-green-500/15 text-green-300 px-2 py-0.5 text-[10px] font-medium">
        Verified
      </span>
    );
  };

  return (
    <Menu
      shadow="md"
      width={250}
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
    >
      <Menu.Target>
        <button
          type="button"
          className="flex max-w-48 items-center gap-2 rounded-full bg-mine-shaft-900 px-2 py-1 text-left transition hover:bg-mine-shaft-800"
        >
          <div className="hidden max-w-28 truncate text-sm font-medium sm:block">
            {displayName}
          </div>

          {companyAccount ? (
            <div className="p-1 bg-mine-shaft-800 rounded-full">
              <CompanyLogo logo={profile?.companyLogo} picture={profile?.picture} company={profile?.company || user?.name} className="h-6 w-6" />
            </div>
          ) : (
            <Avatar
              size="sm"
              src={avatarSrc}
              alt={displayName}
            />
          )}
        </button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <div className="flex items-center gap-2">
            {displayName} &bull; {getRoleLabel(user)}
            {getStatusBadge()}
          </div>
        </Menu.Label>

        {(companyAccount && isCompanyPending(user)) && (
          <>
            <div className="px-3 py-2 text-xs text-yellow-300 border-b border-mine-shaft-700 mx-2">
              Your account is pending admin approval. Recruitment features are unavailable until approved.
            </div>
            <Menu.Divider />
          </>
        )}

        {(companyAccount && isCompanyRejected(user)) && (
          <>
            <div className="px-3 py-2 text-xs text-red-300 border-b border-mine-shaft-700 mx-2">
              Your account has been rejected. Contact support for more information.
            </div>
            <Menu.Divider />
          </>
        )}

        <Menu.Item
          component={Link}
          to="/profile"
          leftSection={
            companyAccount ? (
              <IconBuilding size={14} />
            ) : (
              <IconUserCircle size={14} />
            )
          }
        >
          {companyAccount ? "Company Profile" : "Profile"}
        </Menu.Item>

        {isStudent(user) && (
          <>
            <Menu.Item
              component={Link}
              to="/job-history"
              leftSection={<IconClipboardList size={14} />}
            >
              Job History
            </Menu.Item>
          </>
        )}

        <Menu.Divider />

        <Menu.Item
          onClick={handleLogOut}
          color="red"
          leftSection={<IconLogout size={14} />}
        >
          Log Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProfileMenu;
