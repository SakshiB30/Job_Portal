import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Footer from "../Components/Footer/Footer"
import Header from "../Components/Header/Header"
import JobDescriptionPage from "./JobDescriptionPage"
import FindJobs from "./FindJobs"
import ApplyJobPage from "./ApplyJobPage"
import PostedJobPage from "./PostedJobpage"
import TalentProfilePage from "./TalentProfilePage"
import PostJobPage from "./PostJobPage"
import SignUpPage from "./SignUpPage"
import ProfilePage from "./ProfilePage"
import JobHistoryPage from "./JobHistoryPage"
import HomePage from "./HomePage"
import DashboardPage from "./DashboardPage"
import ApplicantsPage from "./ApplicantsPage"
import InterviewsPage from "./InterviewsPage"
import AnalyticsPage from "./AnalyticsPage"
import AboutPage from "./AboutPage"
import AdminLoginPage from "./AdminLoginPage"
import AdminPanelPage from "./AdminPanelPage"
import { Divider } from "@mantine/core"
import { useSelector } from "react-redux"
import type { RootState, UserState } from "../Types"
import { ADMIN_ROLE, COMPANY_ROLE, getRoleHome, STUDENT_ROLE } from "../Services/RoleService"
import type { ReactNode } from "react"

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
    <div className='relative'>
      {!isAdminRoute && <Header />}
      {location.pathname !== "/sign-up" && location.pathname !== "/login" && !isAdminRoute && <Divider size="xs" />}
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <div className="page-wrapper"><HomePage/></div>}/>
        <Route path='/admin-login' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage/>}/>
        <Route path='/admin/*' element={<RoleRoute user={user} allowedRoles={[ADMIN_ROLE]}><AdminPanelPage/></RoleRoute>}/>
        <Route path='/dashboard' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><DashboardPage/></div></RoleRoute>}/>
        <Route path='/applicants' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><ApplicantsPage/></div></RoleRoute>}/>
        <Route path='/interviews' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><InterviewsPage/></div></RoleRoute>}/>
        <Route path='/analytics' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><AnalyticsPage/></div></RoleRoute>}/>
        <Route path='/find-jobs' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><div className="page-wrapper"><FindJobs/></div></RoleRoute>}/>
        <Route path='/jobs/:id' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><div className="page-wrapper"><JobDescriptionPage/></div></RoleRoute>}/>
        <Route path='/apply-job/:id' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><div className="page-wrapper"><ApplyJobPage/></div></RoleRoute>}/>
        <Route path='/posted-job' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><PostedJobPage/></div></RoleRoute>}/>
        <Route path='/talent-profile' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><TalentProfilePage/></div></RoleRoute>}/>
        <Route path='/talent-profile/:userId' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><TalentProfilePage/></div></RoleRoute>}/>
        <Route path='/post-job' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><div className="page-wrapper"><PostJobPage/></div></RoleRoute>}/>
        <Route path='/sign-up' element={user?<Navigate to="/" replace />:<div className="page-wrapper"><SignUpPage/></div>}/>        
        <Route path='/login' element={user?<Navigate to="/" replace />:<div className="page-wrapper"><SignUpPage/></div>}/> 
        <Route path='/profile' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE, COMPANY_ROLE]}><div className="page-wrapper"><ProfilePage/></div></RoleRoute>}/>      
        <Route path='/job-history' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><div className="page-wrapper"><JobHistoryPage/></div></RoleRoute>}/>
        <Route path='/about' element={<div className="page-wrapper"><AboutPage/></div>}/>
        <Route path='*' element={isAdminUser ? <Navigate to="/admin/dashboard" replace /> : <div className="page-wrapper"><HomePage/></div>}/>
      </Routes>  
      {!isAdminRoute && <Footer />}
    </div> 
  )
}

export default AppRoutes
