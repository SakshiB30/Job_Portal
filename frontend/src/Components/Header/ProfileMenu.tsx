import { Menu, Avatar } from "@mantine/core";
import {
  IconUserCircle,
  IconLogout,
  IconClipboardList,
  IconBuilding,
  IconDashboard,
  IconCalendarEvent,
  IconChartBar,
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
          {displayName} &bull; {getRoleLabel(user)}
        </Menu.Label>

        {/* === Company Additional Links (moved from navbar) === */}
        {isCompany(user) && (
          <>
            <Menu.Item
              component={Link}
              to="/dashboard"
              leftSection={<IconDashboard size={14} />}
            >
              Dashboard
            </Menu.Item>
            <Menu.Item
              component={Link}
              to="/interviews"
              leftSection={<IconCalendarEvent size={14} />}
            >
              Interviews
            </Menu.Item>
            <Menu.Item
              component={Link}
              to="/analytics"
              leftSection={<IconChartBar size={14} />}
            >
              Analytics
            </Menu.Item>
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
            {/* <Menu.Item
              component={Link}
              to="/resume"
              leftSection={<IconFileCv size={14} />}
            >
              Resume
            </Menu.Item> */}
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