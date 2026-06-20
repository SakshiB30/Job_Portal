import { Burger, Button, Drawer, Indicator } from "@mantine/core"
import { IconBell, IconBriefcase, IconCheck, IconClock, IconRefresh, IconShieldCheck, IconSparkles, IconUsers } from "@tabler/icons-react"
import NavLinks from "./NavLinks"
import { Link, useLocation, useNavigate } from "react-router-dom"
import ProfileMenu from "./ProfileMenu"
import { useDispatch, useSelector } from "react-redux"
import { setProfile } from "../../Slices/ProfileSlice"
import { useEffect, useState } from "react"
import { getProfile } from "../../Services/ProfileService"
import type { ProfileState, RootState } from "../../Types"
import { getNotifications, markAllRead, markRead, type WebsiteNotification } from "../../Services/NotificationApi";
import { timeAgo } from "../../Services/Utilities";
import { isAdmin, isCompany, isStudent } from "../../Services/RoleService";


const Header = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();
    const [opened, setOpened] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifs, setNotifs] = useState<WebsiteNotification[]>([]);
    const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("all");
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const unreadCount = notifs.filter((notification) => !notification.read).length;
    const visibleNotifications = notificationFilter === "unread" ? notifs.filter((notification) => !notification.read) : notifs;


  useEffect(() => {
  if (isAdmin(user)) return;
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
}, [dispatch, user]);

  useEffect(() => {
    if (!user?.id || isAdmin(user)) return;

    const loadNotifications = () => {
      setLoadingNotifications(true);
      getNotifications(user.id!)
        .then((list) => setNotifs(Array.isArray(list) ? list : []))
        .catch(() => setNotifs([]))
        .finally(() => setLoadingNotifications(false));
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [user]);

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

  const getNotificationIcon = (type?: string) => {
    const normalizedType = type?.toUpperCase();
    if (normalizedType === "SYSTEM") return <IconSparkles size={18} />;
    if (normalizedType === "SECURITY") return <IconShieldCheck size={18} />;
    if (normalizedType === "HIRING") return <IconUsers size={18} />;
    if (normalizedType === "APPLICATION" || normalizedType === "STATUS") return <IconBriefcase size={18} />;
    return <IconBell size={18} />;
  };

    const location = useLocation();
  return (
    location.pathname!="/sign-up" && location.pathname!="/login" && location.pathname!="/admin-login" && !location.pathname.startsWith("/admin") ?<div className="sticky top-0 z-50 w-full border-b border-mine-shaft-800 bg-mine-shaft-950/95 px-4 text-white backdrop-blur font-['poppins'] sm:px-6">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 gap-3 items-center text-bright-sun-400">
          <img
            src="/JobNexusLogo.png"
            alt="JobNexus logo"
            className="w-75 object-contain"
          />
        </Link>
        
            <NavLinks />

        <div className="flex items-center gap-2 sm:gap-5">   

            <div className="hidden md:block">
              {user ? (
                <ProfileMenu />
              ) : (
                <Link to="/login"><Button variant="subtle" color="brightSun.4">Login</Button></Link>
              )}
            </div>
            <div className="md:hidden">
              {user ? (
                <ProfileMenu />
              ) : (
                <Link to="/login"><Button variant="subtle" color="brightSun.4">Login</Button></Link>
              )}
            </div>

            {user && <div className="relative">

              <button type="button" onClick={() => setShowDropdown((s)=>!s)} className="rounded-full bg-mine-shaft-900 p-1.5 transition hover:bg-mine-shaft-800">

                <Indicator color="pink" offset={6} size={9} label={unreadCount > 0 ? unreadCount : undefined} disabled={unreadCount === 0} processing={false}>
                <IconBell stroke={1.5}/>
                </Indicator>
              </button>
              {showDropdown && (
                <div className="absolute right-0 z-50 mt-3 w-[90vw] sm:w-[22rem] max-w-[22rem] overflow-hidden rounded-md border border-mine-shaft-800 bg-mine-shaft-900 shadow-2xl shadow-black/40">
                  <div className="border-b border-mine-shaft-800 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold">Notifications</div>
                        <div className="mt-1 text-xs text-mine-shaft-400">
                          {unreadCount ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "You are all caught up"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" title="Refresh" onClick={() => user?.id && getNotifications(user.id).then((list) => setNotifs(Array.isArray(list) ? list : []))} className="rounded-md border border-mine-shaft-700 p-1.5 text-mine-shaft-300 transition hover:border-bright-sun-400 hover:text-bright-sun-400">
                          <IconRefresh size={16} className={loadingNotifications ? "animate-spin" : ""} />
                        </button>
                        <button type="button" className="rounded-md border border-mine-shaft-700 p-1.5 text-mine-shaft-300 transition hover:border-bright-sun-400 hover:text-bright-sun-400" onClick={handleMarkAllRead} title="Mark all read">
                          <IconCheck size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-mine-shaft-950 p-1">
                      <button type="button" onClick={() => setNotificationFilter("all")} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${notificationFilter === "all" ? "bg-bright-sun-400 text-mine-shaft-950" : "text-mine-shaft-300 hover:bg-mine-shaft-800"}`}>
                        All
                      </button>
                      <button type="button" onClick={() => setNotificationFilter("unread")} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${notificationFilter === "unread" ? "bg-bright-sun-400 text-mine-shaft-950" : "text-mine-shaft-300 hover:bg-mine-shaft-800"}`}>
                        Unread
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-auto p-2">
                    {visibleNotifications.length ? visibleNotifications.map((n, idx) => (
                      <button type="button" key={n.id ?? idx} onClick={() => handleNotificationClick(n)} className={`mb-2 flex w-full cursor-pointer gap-3 rounded-md border p-3 text-left transition hover:border-bright-sun-400/70 hover:bg-mine-shaft-800 ${n.read ? "border-mine-shaft-800 bg-mine-shaft-900" : "border-bright-sun-400/40 bg-bright-sun-400/10"}`}>
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-mine-shaft-800 text-mine-shaft-300" : "bg-bright-sun-400 text-mine-shaft-950"}`}>
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="font-semibold leading-5 text-mine-shaft-50">{n.title || "Notification"}</div>
                            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-bright-sun-400" />}
                          </div>
                          <div className="mt-1 line-clamp-2 text-sm leading-5 text-mine-shaft-300">{n.message || "You have a new website update."}</div>
                          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-mine-shaft-400">
                            <span className="inline-flex items-center gap-1">
                              <IconClock size={13} />
                              {n.timeStamp ? timeAgo(n.timeStamp) : "just now"}
                            </span>
                            {n.type && <span className="shrink-0 rounded-full bg-mine-shaft-800 px-2 py-0.5 text-[10px] uppercase text-bright-sun-400">{n.type}</span>}
                          </div>
                        </div>
                      </button>
                    )) : (
                      <div className="px-4 py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mine-shaft-800 text-mine-shaft-300">
                          <IconBell size={22} />
                        </div>
                        <div className="mt-3 font-medium">{notificationFilter === "unread" ? "No unread notifications" : "No notifications yet"}</div>
                        <div className="mt-1 text-sm text-mine-shaft-400">Welcome, applications, jobs, and status updates will appear here.</div>
                      </div>
                    )}
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
          <div className="mt-5 border-t border-mine-shaft-800 pt-4">
            <a
              href="mailto:jobnexus.portal@gmail.com"
              className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2"
            >
              jobnexus.portal@gmail.com
            </a>
            <Link
              to="/about"
              className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2"
            >
              About
            </Link>
            <div className="mt-2 text-xs font-semibold text-bright-sun-400">Quick Links</div>
            {isCompany(user) ? (
              <>
                <Link className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2" to="/post-job">
                  Post Job
                </Link>
                <Link className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2" to="/posted-job">
                  Posted Jobs
                </Link>
                <Link className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2" to="/dashboard">
                  Dashboard
                </Link>
              </>
            ) : isStudent(user) ? (
              <>
                <Link className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2" to="/find-jobs">
                  Find Jobs
                </Link>
                <Link className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2" to="/job-history">
                  Applications
                </Link>
                {/* <Link className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2" to="/resume">
                  Resume
                </Link> */}
              </>
            ) : (
              <>
                <Link className="block text-sm text-mine-shaft-300 hover:text-bright-sun-400 py-2" to="/find-jobs">
                  Find Jobs
                </Link>
              </>
            )}
          </div>
        </div>
      </Drawer>
    </div>: 
    <>
    </>
  )
}

export default Header
