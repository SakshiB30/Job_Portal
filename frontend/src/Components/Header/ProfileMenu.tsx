import { Menu, Avatar, Switch, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import {
  IconUserCircle,
  IconFileCv,
  IconMoon,
  IconSun,
  IconMoonStars,
  IconLogout,
  IconBriefcase,
  IconClipboardList,
  IconBuilding,
  IconUserSearch,
  IconPlus,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeUser } from '../../Slices/UserSlice';
import type { RootState } from '../../Types';
import { getRoleLabel, isCompany, isStudent } from '../../Services/RoleService';


const ProfileMenu=() => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const profile = useSelector((state: RootState) => state.profile);
    const user= useSelector((state: RootState)=>state.user);
    const [opened, setOpened] = useState(false);
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("dark", { getInitialValueInEffect: true });
    const darkMode = computedColorScheme === "dark";
    const companyAccount = isCompany(user);
    const displayName = companyAccount
      ? profile?.company || user?.name || "Company"
      : profile?.name || user?.name || "Profile";
    const avatarSrc = profile?.picture
      ? `data:image/jpeg;base64,${profile.picture}`
      : companyAccount ? "/Icons/Google.png" : "/A3.png";
    

    const handleLogOut = () => {
      dispatch(removeUser());
      navigate("/login");
    }

  return (
    <Menu shadow="md" width={230} opened={opened} onChange={setOpened} position="bottom-end">
      <Menu.Target>
        <button type="button" className="flex max-w-48 items-center gap-2 rounded-full bg-mine-shaft-900 px-2 py-1 text-left transition hover:bg-mine-shaft-800">
                <div className="hidden max-w-28 truncate text-sm font-medium sm:block">{displayName}</div>
                <Avatar size="sm" src={avatarSrc} alt={displayName}/>
            </button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{displayName} &bull; {getRoleLabel(user)}</Menu.Label>
        <Menu.Item component={Link} to="/profile" leftSection={companyAccount ? <IconBuilding size={14} /> : <IconUserCircle size={14} />}>
          {companyAccount ? "Company Profile" : "Profile"}
        </Menu.Item>
        {isCompany(user) && <Menu.Item component={Link} to="/find-talent" leftSection={<IconUserSearch size={14} />}>
          Find Students
        </Menu.Item>}
        {isCompany(user) && <Menu.Item component={Link} to="/post-job" leftSection={<IconPlus size={14} />}>
          Post Job
        </Menu.Item>}
        {isStudent(user) && <Menu.Item component={Link} to="/job-history" leftSection={<IconClipboardList size={14} />}>
          Job History
        </Menu.Item>}
        {isCompany(user) && <Menu.Item component={Link} to="/posted-job" leftSection={<IconBriefcase size={14} />}>
          Posted Jobs
        </Menu.Item>}
        {isStudent(user) && <Menu.Item component={Link} to="/resume" leftSection={<IconFileCv size={14} />}>
          Resume
        </Menu.Item>}
        <Menu.Item
          leftSection={darkMode ? <IconMoon size={14} /> : <IconSun size={14} />}
          rightSection={
            <Switch checked={darkMode} onChange={(event) => setColorScheme(event.currentTarget.checked ? "dark" : "light")} size="md" color="dark.4" onLabel={<IconMoonStars size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />} offLabel={<IconSun size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />} />
          }
        >
          {darkMode ? "Dark Mode" : "Light Mode"}
        </Menu.Item>

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
}

export default ProfileMenu
