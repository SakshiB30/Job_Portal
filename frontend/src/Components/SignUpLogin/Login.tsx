import { Button, LoadingOverlay, PasswordInput, rem, TextInput } from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../Services/UserService";
import { loginValidation } from "../../Services/FormValidation";
import { useDisclosure } from "@mantine/hooks";
import ResetPassword from "./ResetPassword";
import { useDispatch } from "react-redux";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { setUser } from "../../Slices/UserSlice";
import { getRoleHome } from "../../Services/RoleService";
import type { UserState } from "../../Types";

const form={
  email:"",
  password:"",
}

const Login = () => {
  const[loading, setLoading]= useState(false);
  const dispatch = useDispatch();
  const [data, setData]= useState<{[key:string]:string}>(form);
  const [formError, setFormError] = useState<{[key:string]:string}>(form);
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  const handleChange=(event:any)=>{
      setFormError({...formError, [event.target.name]: ""});
      setData({...data, [event.target.name]:event.target.value});
      
  } 

  const handleSubmit=()=>{
    setLoading(true);
    let valid=true, newFormError:{[key:string]:string}={};
    for(let key in data){
      newFormError[key]=loginValidation(key, data[key]);
      if(newFormError[key])valid=false;
    }
    
    setFormError(newFormError);
    if(valid===true){
        loginUser(data).then((res)=>{
        const destination = getRoleHome(res as UserState);
        successNotification("Login Successful", "Redirecting...");

        setTimeout(()=>{
          setLoading(false); 
          dispatch(setUser(res));
          navigate(destination)
        }, 4000);

      }).catch((err)=> {
        setLoading(false);
        errorNotification("Login Failed", err.response.data.errorMessage);
      });
      
    }
      
  }

  return (
    <>
    <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'brightSun.4', type: 'bars' }}
        />
    <div className="w-full max-w-xl px-4 sm:px-8 lg:px-12 mx-auto flex flex-col justify-center gap-4">
      <div className="text-3xl font-semibold">Login</div>
      <TextInput value={data.email} error={formError.email} name="email" onChange={handleChange} withAsterisk leftSection={<IconAt style={{width: rem(16), height: rem(16)}}/>} label="Email" placeholder="Your email" />
      <PasswordInput value={data.password} error={formError.password} name="password" onChange={handleChange} withAsterisk leftSection={<IconLock size={18} stroke={1.5} />} label="Password" placeholder="Password" />
      <Button onClick={handleSubmit} variant="filled">Sign In</Button>
      <div className="text-center"> Don't have an Account? <span className="text-bright-sun-400 hover:underline cursor-pointer" onClick={()=>navigate("/sign-up")}>Sign Up</span></div>
      <div className="text-center"> <span className="text-bright-sun-400 hover:underline cursor-pointer" onClick={open}>Forgot Password?</span></div>
    </div> 
    <ResetPassword opened={opened} close={close} />
    </>
  )
};
  

export default Login
