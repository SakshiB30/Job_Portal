import { Navigate, Route, Routes, useLocation, useNavigationType } from "react-router-dom"
import Footer from "../Components/Footer/Footer"
import Header from "../Components/Header/Header"
import JobDescriptionPage from "./JobDescriptionPage"
import FindJobs from "./FindJobs"
import PostedJobPage from "./PostedJobpage"
import TalentProfilePage from "./TalentProfilePage"
import PostJobPage from "./PostJobPage"
import SignUpPage from "./SignUpPage"
import ProfilePage from "./ProfilePage"
import JobHistoryPage from "./JobHistoryPage"
import HomePage from "./HomePage"
import DashboardPage from "./DashboardPage"
import AboutPage from "./AboutPage"
import NotFoundPage from "./NotFoundPage"
import AdminLoginPage from "./AdminLoginPage"
import AdminPanelPage from "./AdminPanelPage"
import { Divider } from "@mantine/core"
import { useSelector } from "react-redux"
import type { RootState, UserState } from "../Types"
import { ADMIN_ROLE, COMPANY_ROLE, getRoleHome, STUDENT_ROLE } from "../Services/RoleService"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"

// ── Scroll position cache keyed by pathname ──
const scrollPositions = new Map<string, number>();

// Scrolls to top on forward nav, restores scroll position on back nav
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const isFirstRender = useRef(true);

  // Save scroll position before leaving the current page
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (navigationType === "POP") {
      // User navigated back/forward — restore saved position
      const saved = scrollPositions.get(pathname);
      // Use requestAnimationFrame to wait for the DOM to paint
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved ?? 0, behavior: "instant" });
      });
    } else {
      // PUSH or REPLACE — scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, navigationType]);

  return null;
};

// ── Direction-aware page wrapper ──
// Forward nav (PUSH/REPLACE): slide up from bottom
// Back nav (POP via navigate(-1) or browser back): slide in from left
const PageWrapper = ({ children }: { children: ReactNode }) => {
  const navigationType = useNavigationType();

  return (
    <div className={`page-wrapper ${navigationType === "POP" ? "page-enter-back" : ""}`}>
      {children}
    </div>
  );
};

// Separate component that listens for scroll events and saves positions
const ScrollSaver = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(pathname, window.scrollY);
    };
    // Throttle with passive listener for performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
};

const RoleRoute = ({ user, allowedRoles, children }: { user: UserState | null; allowedRoles: string[]; children: ReactNode }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.accountType || "")) return <Navigate to={getRoleHome(user)} replace />;
  return children;
};

const AppRoutes = () => {

    const location = useLocation();
    const user= useSelector((state: RootState)=>state.user);
  const isAdminRoute = location.pathname === "/admin-login" || location.pathname.startsWith("/admin");
  const isAdminUser = user?.accountType === ADMIN_ROLE;

  return (
    <div className='relative flex flex-col min-h-screen'>
      <ScrollToTop />
      <ScrollSaver />
      {!isAdminRoute && <Header />}
      {location.pathname !== "/sign-up" && location.pathname !== "/login" && !isAdminRoute && <Divider size="xs" />}
      <div className="flex-1 pb-10 bg-mine-shaft-950">
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <PageWrapper><HomePage/></PageWrapper>}/>
        <Route path='/admin-login' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage/>}/>
        <Route path='/admin/*' element={<RoleRoute user={user} allowedRoles={[ADMIN_ROLE]}><AdminPanelPage/></RoleRoute>}/>
        <Route path='/dashboard' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><PageWrapper><DashboardPage/></PageWrapper></RoleRoute>}/>
        <Route path='/find-jobs' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><PageWrapper><FindJobs/></PageWrapper></RoleRoute>}/>
        <Route path='/jobs/:id' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><PageWrapper><JobDescriptionPage/></PageWrapper></RoleRoute>}/>
        <Route path='/posted-job' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><PageWrapper><PostedJobPage/></PageWrapper></RoleRoute>}/>
        <Route path='/talent-profile' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><PageWrapper><TalentProfilePage/></PageWrapper></RoleRoute>}/>
        <Route path='/talent-profile/:userId' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><PageWrapper><TalentProfilePage/></PageWrapper></RoleRoute>}/>
        <Route path='/post-job' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><PageWrapper><PostJobPage/></PageWrapper></RoleRoute>}/>
        <Route path='/sign-up' element={user?<Navigate to={getRoleHome(user)} replace />:<PageWrapper><SignUpPage/></PageWrapper>}/>        
        <Route path='/login' element={user?<Navigate to={getRoleHome(user)} replace />:<PageWrapper><SignUpPage/></PageWrapper>}/> 
        <Route path='/profile' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE, COMPANY_ROLE]}><PageWrapper><ProfilePage/></PageWrapper></RoleRoute>}/>      
        <Route path='/job-history' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><PageWrapper><JobHistoryPage/></PageWrapper></RoleRoute>}/>
        <Route path='/about' element={<PageWrapper><AboutPage/></PageWrapper>}/>
        <Route path='*' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <PageWrapper><NotFoundPage/></PageWrapper>}/>
      </Routes> 
      </div>
      {!isAdminRoute && <Footer />}
    </div> 
  )
}

export default AppRoutes
