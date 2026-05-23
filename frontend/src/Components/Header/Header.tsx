import { Burger, Button, Drawer, Indicator } from "@mantine/core"
import { IconAnchor, IconBell } from "@tabler/icons-react"
import  NavLinks from "./NavLinks"
import { Link, useLocation, useNavigate } from "react-router-dom"
import ProfileMenu from "./ProfileMenu"
import { useDispatch, useSelector } from "react-redux"
import { setProfile } from "../../Slices/ProfileSlice"
import { useEffect, useState } from "react"
import { getProfile } from "../../Services/ProfileService"
import type { ProfileState, RootState } from "../../Types"
import { getNotifications, markAllRead, markRead, type WebsiteNotification } from "../../Services/NotificationApi";

const Header = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();
    const [opened, setOpened] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifs, setNotifs] = useState<WebsiteNotification[]>([]);
    const unreadCount = notifs.filter((notification) => !notification.read).length;


  useEffect(() => {
  const profileId = user?.profileId || user?.id;
  if (profileId) {
    getProfile(profileId)
      .then((data: ProfileState) => {
        dispatch(setProfile(data));
      })
      .catch((error: unknown) => {
        console.log(error);
      });
  }
}, [dispatch, user?.id, user?.profileId]);

  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = () => {
      getNotifications(user.id!)
        .then((list) => setNotifs(Array.isArray(list) ? list : []))
        .catch(() => setNotifs([]));
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [user?.id]);

  const handleNotificationClick = async (notification: WebsiteNotification) => {
    if (notification.id && !notification.read) {
      setNotifs((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
      try {
        await markRead(notification.id);
      } catch (error) {
        console.error(error);
      }
    }

    setShowDropdown(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setNotifs((current) => current.map((notification) => ({ ...notification, read: true })));
    try {
      await markAllRead(user.id);
    } catch (error) {
      console.error(error);
    }
  };

    const location = useLocation();
  return (
    location.pathname!="/sign-up" && location.pathname!="/login" ?<div className="sticky top-0 z-50 w-full border-b border-mine-shaft-800 bg-mine-shaft-950/95 px-4 text-white backdrop-blur font-['poppins'] sm:px-6">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 gap-3 items-center text-bright-sun-400">
            <IconAnchor className="h-10 w-10" stroke={3}/>
            <div className="text-2xl font-semibold sm:text-3xl">JobHook</div>
            </Link>
        
            <NavLinks />

        <div className="flex items-center gap-3 sm:gap-5">   
            
            {user ? <ProfileMenu/>: <Link to="/login"><Button variant="subtle" color="brightSun.4">Login</Button></Link>}
            {user && <div className="relative">
              <button type="button" onClick={() => setShowDropdown((s)=>!s)} className="rounded-full bg-mine-shaft-900 p-1.5 transition hover:bg-mine-shaft-800">
                <Indicator color="pink" offset={6} size={9} label={unreadCount > 0 ? unreadCount : undefined} disabled={unreadCount === 0} processing={false}>
                <IconBell stroke={1.5}/>
                </Indicator>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3 z-50">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold">Notifications</div>
                    <button className="text-sm text-mine-shaft-300 hover:text-bright-sun-400" onClick={handleMarkAllRead}>Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    {notifs.length ? notifs.map((n, idx) => (
                      <button type="button" key={n.id ?? idx} onClick={() => handleNotificationClick(n)} className={`mb-2 w-full cursor-pointer rounded-md p-2 text-left transition hover:bg-mine-shaft-800 ${n.read?"bg-mine-shaft-900":"bg-mine-shaft-950/60 border-l-2 border-bright-sun-400"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold">{n.title || "Notification"}</div>
                          {n.type && <div className="shrink-0 rounded-full bg-mine-shaft-800 px-2 py-0.5 text-[10px] uppercase text-bright-sun-400">{n.type}</div>}
                        </div>
                        <div className="mt-1 text-sm text-mine-shaft-300">{n.message || "You have a new website update."}</div>
                        {n.timeStamp && <div className="mt-2 text-xs text-mine-shaft-400">{new Date(n.timeStamp).toLocaleString()}</div>}
                      </button>
                    )) : <div className="text-sm text-mine-shaft-300">No notifications</div>}
                  </div>
                </div>
              )}
            </div>}
            <Burger className="lg:hidden" color="white" opened={opened} onClick={() => setOpened((current) => !current)} aria-label="Toggle navigation" />
        </div>
      </div>
      <Drawer opened={opened} onClose={() => setOpened(false)} position="right" size="xs" title="Navigation">
        <div onClick={() => setOpened(false)}>
          <NavLinks mobile />
        </div>
      </Drawer>
    </div>: 
    <>
    </>
  )
}

export default Header
