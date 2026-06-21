import { IconArrowLeft } from "@tabler/icons-react";

import { useLocation, useNavigate } from "react-router-dom";
import Login from "../Components/SignUpLogin/Login";
import SignUp from "../Components/SignUpLogin/SignUp";
import { Button } from "@mantine/core";

const SignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-mine-shaft-950 font-['poppins'] overflow-hidden relative">
      <Button my="md" className="absolute! left-5 z-10" onClick={()=>navigate("/")} leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light" >Home</Button>

      {/* Mobile: single form view */}
      <div className="flex sm:hidden h-screen px-4 items-center justify-center">
        {location.pathname === '/sign-up' ? <SignUp key="signup" /> : <Login key="login" />}
      </div>

      {/* Desktop: animated split layout */}
      <div className={`hidden sm:flex w-screen h-screen transition-all ease-in-out duration-1000 *:shrink-0 ${location.pathname === '/sign-up' ? '-translate-x-1/2' : 'translate-x-0'}`}> 
        <div className="w-1/2 h-full flex items-center justify-center">
          <Login />
        </div>
        <div className={`w-1/2 h-full transition-all duration-1000 ease-in-out ${location.pathname === '/sign-up' ? 'rounded-r-[200px]' : 'rounded-l-[200px]'} bg-mine-shaft-900 flex items-center gap-5 justify-center flex-col`}>
          <div className="flex gap-3 items-center text-bright-sun-400">
            <div className="text-5xl lg:text-6xl font-semibold"> JobNexus</div>
          </div>
          <div className="text-xl lg:text-2xl text-mine-shaft-200 font-semibold px-4 text-center">Find the Job made for you</div>
        </div>
        <div className="w-1/2 h-full flex items-center justify-center">
          <SignUp />
        </div>
      </div>
      
    </div>
  );
};

export default SignUpPage;