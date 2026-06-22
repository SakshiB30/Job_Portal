import { Burger, Button, Drawer, Indicator } from "@mantine/core"
import { IconBell, IconBriefcase, IconCheck, IconClock, IconRefresh, IconShieldCheck, IconSparkles, IconUsers } from "@tabler/icons-react"
import NavLinks from "./NavLinks"
import { Link, useLocation, useNavigate } from "react-router-dom"
import ProfileMenu from "./ProfileMenu"
import { useDispatch, useSelector } from "react-redux"
import { setProfile } from "../../Slices/ProfileSlice"
import { useEffect, useRef, useState } from "react"
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
    const [dropdownClosing, setDropdownClosing] = useState(false);
    const [notifs, setNotifs] = useState<WebsiteNotification[]>([]);
    const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("all");
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const unreadCount = notifs.filter((notification) => !notification.read).length;
    const visibleNotifications = notificationFilter === "unread" ? notifs.filter((notification) => !notification.read) : notifs;
    const dropdownRef = useRef<HTMLDivElement>(null);

    const renderDropdown = showDropdown || dropdownClosing;
    const ANIM_DURATION = 200;

    const openDropdown = () => {
      setDropdownClosing(false);
      setShowDropdown(true);
    };

    const closeDropdown = () => {
      setDropdownClosing(true);
      setShowDropdown(false);
      setTimeout(() => setDropdownClosing(false), ANIM_DURATION);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!showDropdown) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          closeDropdown();
        }
      };

      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showDropdown]);


  useEffect(() => {
  if (isAdmin(user)) return;
  const profileId = user?.profileId || user?.id;
  if (profileId) {
    getProfile(profileId)
      .then((data: ProfileState) => {
        dispatch(setProfile(data));
      })
      .catch(() => {
        // profile not found for non-admin user
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
        // silent mark-read failure
      }
    }

    closeDropdown();
    if (notification.link) navigate(notification.link);
  };

  const toggleDropdown = () => {
    if (showDropdown) {
      closeDropdown();
    } else {
      openDropdown();
      if (user?.id) {
        setNotifs((current) => current.map((n) => ({ ...n, read: true })));
        markAllRead(user.id).catch(() => {});
      }
    }
  };

  const getNotifIcon = (type?: string) => {
    const t = type?.toUpperCase();
    if (t === "SYSTEM") return <IconSparkles size={16} />;
    if (t === "SECURITY") return <IconShieldCheck size={16} />;
    if (t === "HIRING") return <IconUsers size={16} />;
    if (t === "APPLICATION") return <IconBriefcase size={16} />;
    if (t === "STATUS") return <IconClock size={16} />;
    if (t === "PROFILE") return <IconCheck size={16} />;
    return <IconBell size={16} />;
  };

    const location = useLocation();
  return (
    location.pathname!="/sign-up" && location.pathname!="/login" && location.pathname!="/admin-login" && !location.pathname.startsWith("/admin") ?<div className="sticky top-0 z-50 w-full border-b border-mine-shaft-800 bg-mine-shaft-950/95 text-white backdrop-blur font-['poppins']">
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 gap-3 items-center text-bright-sun-400">
          <img
            src="/JobNexusLogo.png"
            alt="JobNexus logo"
            className="w-36 sm:w-48 md:w-75 object-contain"
          />
        </Link>
        
            <NavLinks />

        <div className="flex items-center gap-2 sm:gap-5">   

            <div>
              {user ? (
                <ProfileMenu />
              ) : (
                <Link to="/login"><Button variant="subtle" color="brightSun.4">Login</Button></Link>
              )}
            </div>

            {user && <div className="relative" ref={dropdownRef}>

              <button type="button" onClick={toggleDropdown} className="rounded-full bg-mine-shaft-900 p-1.5 transition hover:bg-mine-shaft-800">

                <Indicator color="pink" offset={6} size={9} label={unreadCount > 0 ? unreadCount : undefined} disabled={unreadCount === 0} processing={false}>
                <IconBell stroke={1.5}/>
                </Indicator>
              </button>
              {renderDropdown && (
                <div className={`absolute right-0 z-50 mt-3 w-[90vw] sm:w-[22rem] max-w-[22rem] overflow-hidden rounded-lg border border-mine-shaft-800 bg-mine-shaft-950 shadow-lg shadow-black/40 transition-all duration-150 ease-out ${dropdownClosing ? "pointer-events-none opacity-0 translate-y-1 scale-[0.97]" : "animate-in fade-in slide-in-from-top-1"}`}>
                  {/* ── Header ── */}
                  <div className="border-b border-mine-shaft-800/60 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-mine-shaft-100">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-bright-sun-400/15 px-1.5 text-[10px] font-semibold text-bright-sun-400">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setNotificationFilter("all")}
                          className={`text-xs transition-colors ${notificationFilter === "all" ? "text-mine-shaft-100 font-medium" : "text-mine-shaft-500 hover:text-mine-shaft-300"}`}
                        >
                          All
                        </button>
                        <span className="text-mine-shaft-700 text-xs">·</span>
                        <button
                          type="button"
                          onClick={() => setNotificationFilter("unread")}
                          className={`text-xs transition-colors ${notificationFilter === "unread" ? "text-mine-shaft-100 font-medium" : "text-mine-shaft-500 hover:text-mine-shaft-300"}`}
                        >
                          Unread
                        </button>
                        <span className="mx-1.5 text-mine-shaft-700">·</span>
                        <button
                          type="button"
                          title="Refresh"
                          onClick={() => user?.id && getNotifications(user.id).then((list) => setNotifs(Array.isArray(list) ? list : []))}
                          className="text-mine-shaft-500 hover:text-mine-shaft-300 transition-colors"
                        >
                          <IconRefresh size={13} className={loadingNotifications ? "animate-spin" : ""} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Notification list ── */}
                  <div className="max-h-96 overflow-y-auto overscroll-contain">
                    {visibleNotifications.length > 0 ? (
                      <>
                      {(() => {
                        const unreadItems = visibleNotifications.filter((n) => !n.read);
                        const readItems = visibleNotifications.filter((n) => n.read);
                        return (
                          <>
                            {unreadItems.map((n, idx) => (
                              <button
                                key={n.id ?? `n-${idx}`}
                                type="button"
                                onClick={() => handleNotificationClick(n)}
                                className="relative flex w-full cursor-pointer gap-3 border-b border-bright-sun-400/15 bg-gradient-to-r from-bright-sun-400/8 to-transparent px-4 py-3 text-left transition-colors hover:from-bright-sun-400/12 last:border-b-0"
                              >
                                {/* Unread left accent bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-bright-sun-400 to-yellow-500 shadow-sm shadow-bright-sun-400/40" />
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bright-sun-400/15 text-bright-sun-400 ring-1 ring-bright-sun-400/25">
                                  {getNotifIcon(n.type)}
                                </div>
                                <div className="min-w-0 flex-1 pt-0.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="text-sm font-semibold leading-5 text-mine-shaft-50">{n.title || "Notification"}</div>
                                    <span className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-bright-sun-400 shadow-sm shadow-bright-sun-400/60" />
                                  </div>
                                  <div className="mt-0.5 line-clamp-2 text-xs leading-5 text-mine-shaft-300">{n.message || ""}</div>
                                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-bright-sun-400/70">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-bright-sun-400/50" />
                                    {n.timeStamp ? timeAgo(n.timeStamp) : "just now"}
                                  </div>
                                </div>
                              </button>
                            ))}
                            {readItems.length > 0 && unreadItems.length > 0 && (
                              <div className="border-t border-mine-shaft-800/40" />
                            )}
                            {readItems.map((n, idx) => (
                              <button
                                key={n.id ?? `r-${idx}`}
                                type="button"
                                onClick={() => handleNotificationClick(n)}
                                className="flex w-full cursor-pointer gap-3 border-b border-mine-shaft-800/30 px-4 py-3 text-left transition-colors hover:bg-mine-shaft-900/40 last:border-b-0"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mine-shaft-800/40 text-mine-shaft-500">
                                  {getNotifIcon(n.type)}
                                </div>
                                <div className="min-w-0 flex-1 pt-0.5">
                                  <div className="text-sm font-medium leading-5 text-mine-shaft-500">{n.title || "Notification"}</div>
                                  <div className="mt-0.5 line-clamp-2 text-xs leading-5 text-mine-shaft-600">{n.message || ""}</div>
                                  <div className="mt-1.5 text-[11px] text-mine-shaft-600">
                                    {n.timeStamp ? timeAgo(n.timeStamp) : "just now"}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        );
                      })()}
                      </>
                    ) : (
                      <div className="flex flex-col items-center px-6 py-14 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mine-shaft-800/60">
                          <IconBell size={22} className="text-mine-shaft-500" stroke={1.5} />
                        </div>
                        <div className="text-sm font-medium text-mine-shaft-300">
                          {notificationFilter === "unread" ? "All caught up" : "No notifications"}
                        </div>
                        <div className="mt-1 text-xs text-mine-shaft-500 max-w-[12rem]">
                          {notificationFilter === "unread"
                            ? "You've read everything."
                            : "Updates from applications and jobs will show up here."}
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
