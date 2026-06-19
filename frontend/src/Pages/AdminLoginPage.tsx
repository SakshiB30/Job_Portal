import { Button, LoadingOverlay, PasswordInput, TextInput } from "@mantine/core";
import { IconAt, IconLock, IconShieldCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { errorNotification, successNotification } from "../Services/NotificationService";
import { ADMIN_ROLE } from "../Services/RoleService";
import { loginUser } from "../Services/UserService";
import { setUser } from "../Slices/UserSlice";

const AdminLoginPage = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async () => {
    setLoading(true);
    try {
      const user = await loginUser(data);
      if (user?.accountType !== ADMIN_ROLE) {
        errorNotification("Admin access denied", "This account is not an admin account.");
        return;
      }
      dispatch(setUser(user));
      successNotification("Admin login successful", "Redirecting to Admin Dashboard...");
      navigate("/admin/dashboard");
    } catch (error: any) {
      errorNotification("Admin login failed", error?.response?.data?.errorMessage || "Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-page flex items-center justify-center">
      <LoadingOverlay visible={loading} zIndex={1000} loaderProps={{ color: "brightSun.4", type: "bars" }} />
      <div className="w-full max-w-md rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bright-sun-400 text-mine-shaft-950">
            <IconShieldCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-mine-shaft-50">Admin Login</div>
            <div className="text-sm text-mine-shaft-400">Restricted JobNexus control access</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <TextInput label="Email" placeholder="admin@email.com" leftSection={<IconAt size={16} />} value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          <PasswordInput label="Password" placeholder="Password" leftSection={<IconLock size={16} />} value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
          <Button onClick={submit} autoContrast>Sign In</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
