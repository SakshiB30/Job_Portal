import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Footer from "../Components/Footer/Footer"
import Header from "../Components/Header/Header"
import JobDescriptionPage from "./JobDescriptionPage"
import FindJobs from "./FindJobs"
import ApplyJobPage from "./ApplyJobPage"
import FindTalentPage from "./FindTalentPage"
import PostedJobPage from "./PostedJobpage"
import TalentProfilePage from "./TalentProfilePage"
import PostJobPage from "./PostJobPage"
import SignUpPage from "./SignUpPage"
import ProfilePage from "./ProfilePage"
import MessagesPage from "./MessagesPage"
import ResumePage from "./ResumePage"
import JobHistoryPage from "./JobHistoryPage"
import HomePage from "./HomePage"
import { Divider } from "@mantine/core"
import { useSelector } from "react-redux"
import type { RootState, UserState } from "../Types"
import { COMPANY_ROLE, getRoleHome, STUDENT_ROLE } from "../Services/RoleService"
import type { ReactNode } from "react"

const RoleRoute = ({ user, allowedRoles, children }: { user: UserState | null; allowedRoles: string[]; children: ReactNode }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.accountType || "")) return <Navigate to={getRoleHome(user)} replace />;
  return children;
};


const AppRoutes = () => {

    const location = useLocation();
    const user= useSelector((state: RootState)=>state.user);

  return (
    
    <div className='relative'>
      <Header/ >
      {location.pathname!="/sign-up" &&(<Divider size="xs" />)}
      <Routes> 
        <Route path='/find-jobs' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><FindJobs/></RoleRoute>}/>
        <Route path='/jobs/:id' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><JobDescriptionPage/></RoleRoute>}/>
        <Route path='/apply-job/:id' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><ApplyJobPage/></RoleRoute>}/>        
        <Route path='/find-talent' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><FindTalentPage/></RoleRoute>}/>
        <Route path='/posted-job' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><PostedJobPage/></RoleRoute>}/>        
        <Route path='/talent-profile' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><TalentProfilePage/></RoleRoute>}/>
        <Route path='/talent-profile/:userId' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><TalentProfilePage/></RoleRoute>}/>
        <Route path='/post-job' element={<RoleRoute user={user} allowedRoles={[COMPANY_ROLE]}><PostJobPage/></RoleRoute>}/>
        <Route path='/sign-up' element={user?<Navigate to={getRoleHome(user)}/>:<SignUpPage/>}/>        
        <Route path='/login' element={user?<Navigate to={getRoleHome(user)}/>:<SignUpPage/>}/> 
        <Route path='/profile' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE, COMPANY_ROLE]}><ProfilePage/></RoleRoute>}/>      
        <Route path='/messages' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE, COMPANY_ROLE]}><MessagesPage/></RoleRoute>}/>      
        <Route path='/resume' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><ResumePage/></RoleRoute>}/>      
        <Route path='/job-history' element={<RoleRoute user={user} allowedRoles={[STUDENT_ROLE]}><JobHistoryPage/></RoleRoute>}/>
        <Route path='*' element={<HomePage/>}/>
      </Routes>  
      <Footer />
      </div> 
      
  )
}

export default AppRoutes
