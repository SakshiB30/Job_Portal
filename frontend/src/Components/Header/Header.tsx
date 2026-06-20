import { Burger, Button, Drawer, Indicator } from "@mantine/core"
import { IconBell, IconBriefcase, IconClock, IconRefresh, IconShieldCheck, IconSparkles, IconUsers } from "@tabler/icons-react"
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

  const toggleDropdown = () => {
    const opening = !showDropdown;
    setShowDropdown(opening);
    if (opening && user?.id) {
      setNotifs((current) => current.map((n) => ({ ...n, read: true })));
      markAllRead(user.id).catch(() => {});
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

              <button type="button" onClick={toggleDropdown} className="rounded-full bg-mine-shaft-900 p-1.5 transition hover:bg-mine-shaft-800">

                <Indicator color="pink" offset={6} size={9} label={unreadCount > 0 ? unreadCount : undefined} disabled={unreadCount === 0} processing={false}>
                <IconBell stroke={1.5}/>
                </Indicator>
              </button>
              {showDropdown && (
                <div className="absolute right-0 z-50 mt-3 w-[90vw] sm:w-[22rem] max-w-[22rem] overflow-hidden rounded-xl border border-mine-shaft-700/60 bg-mine-shaft-900 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* ── Header ── */}
                  <div className="border-b border-mine-shaft-800/80 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bright-sun-400/15 text-bright-sun-400">
                            <IconBell size={15} />
                          </div>
                          <span className="text-base font-semibold">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="rounded-full bg-bright-sun-400/20 px-2 py-0.5 text-[11px] font-medium text-bright-sun-400">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 text-xs text-mine-shaft-400">
                          {unreadCount > 0
                            ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""} — marked read on open`
                            : "You are all caught up"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-1.5 rounded-lg bg-mine-shaft-950 p-1">
                        <button type="button" onClick={() => setNotificationFilter("all")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${notificationFilter === "all" ? "bg-bright-sun-400 text-mine-shaft-950 shadow-sm" : "text-mine-shaft-300 hover:text-mine-shaft-100"}`}>
                          All
                        </button>
                        <button type="button" onClick={() => setNotificationFilter("unread")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${notificationFilter === "unread" ? "bg-bright-sun-400 text-mine-shaft-950 shadow-sm" : "text-mine-shaft-300 hover:text-mine-shaft-100"}`}>
                          Unread
                        </button>
                      </div>
                      <button type="button" title="Refresh" onClick={() => user?.id && getNotifications(user.id).then((list) => setNotifs(Array.isArray(list) ? list : []))} className="rounded-md border border-mine-shaft-700 p-1.5 text-mine-shaft-400 transition hover:border-bright-sun-400/50 hover:text-bright-sun-400">
                        <IconRefresh size={15} className={loadingNotifications ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* ── Notification list ── */}
                  <div className="max-h-112 overflow-y-auto overscroll-contain p-2">
                    {visibleNotifications.length > 0 ? (
                      <>
                      {/* Group by read/unread */}
                      {(() => {
                        const unreadItems = visibleNotifications.filter((n) => !n.read);
                        const readItems = visibleNotifications.filter((n) => n.read);
                        return (
                          <>
                            {unreadItems.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 px-3 py-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-bright-sun-400" />
                                  <span className="text-[11px] font-semibold uppercase tracking-widest text-mine-shaft-400">New</span>
                                  <div className="flex-1 border-t border-mine-shaft-800/60" />
                                </div>
                                {unreadItems.map((n, idx) => (
                                  <button type="button"
                                    key={n.id ?? `unread-${idx}`}
                                    onClick={() => handleNotificationClick(n)}
                                    className="group relative mb-1.5 flex w-full cursor-pointer gap-3 rounded-lg border border-bright-sun-400/30 bg-bright-sun-400/[0.06] p-3.5 text-left transition-all hover:border-bright-sun-400/60 hover:bg-bright-sun-400/[0.1] hover:shadow-[0_0_20px_-8px_rgba(255,189,32,0.15)]"
                                  >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bright-sun-400/20 text-bright-sun-400 ring-1 ring-bright-sun-400/20">
                                      {getNotificationIcon(n.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="text-sm font-semibold leading-5 text-mine-shaft-50">{n.title || "Notification"}</div>
                                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-bright-sun-400 shadow-[0_0_6px_2px_rgba(255,189,32,0.3)]" />
                                      </div>
                                      <div className="mt-1 line-clamp-2 text-sm leading-5 text-mine-shaft-300">{n.message || "You have a new update."}</div>
                                      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-mine-shaft-500">
                                        <span className="inline-flex items-center gap-1">
                                          <IconClock size={12} />
                                          {n.timeStamp ? timeAgo(n.timeStamp) : "just now"}
                                        </span>
                                        {n.type && (
                                          <span className="shrink-0 rounded-md bg-mine-shaft-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-bright-sun-400/80">{n.type}</span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                            {readItems.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 px-3 py-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-mine-shaft-600" />
                                  <span className="text-[11px] font-semibold uppercase tracking-widest text-mine-shaft-500">Earlier</span>
                                  <div className="flex-1 border-t border-mine-shaft-800/60" />
                                </div>
                                {readItems.map((n, idx) => (
                                  <button type="button"
                                    key={n.id ?? `read-${idx}`}
                                    onClick={() => handleNotificationClick(n)}
                                    className="group relative mb-1 flex w-full cursor-pointer gap-3 rounded-lg border border-transparent p-3.5 text-left transition-all hover:border-mine-shaft-700/60 hover:bg-mine-shaft-800/40"
                                  >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mine-shaft-800 text-mine-shaft-400 ring-1 ring-mine-shaft-700/60">
                                      {getNotificationIcon(n.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium leading-5 text-mine-shaft-300">{n.title || "Notification"}</div>
                                      <div className="mt-0.5 line-clamp-2 text-sm leading-5 text-mine-shaft-500">{n.message || "You have a new update."}</div>
                                      <div className="mt-2 flex items-center gap-3 text-xs text-mine-shaft-600">
                                        <span className="inline-flex items-center gap-1">
                                          <IconClock size={12} />
                                          {n.timeStamp ? timeAgo(n.timeStamp) : "just now"}
                                        </span>
                                        {n.type && (
                                          <span className="shrink-0 rounded-md bg-mine-shaft-800/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-mine-shaft-500">{n.type}</span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                      </>
                    ) : (
                      <div className="px-4 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mine-shaft-800/60 ring-1 ring-mine-shaft-700/50">
                          <IconBell size={24} className="text-mine-shaft-400" />
                        </div>
                        <div className="mt-4 text-base font-semibold text-mine-shaft-50">
                          {notificationFilter === "unread" ? "All caught up!" : "No notifications yet"}
                        </div>
                        <div className="mt-1.5 text-sm leading-5 text-mine-shaft-400 max-w-[14rem] mx-auto">
                          {notificationFilter === "unread"
                            ? "You've read all your notifications."
                            : "Welcome, applications, jobs, and status updates will appear here."}
                        </div>
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
