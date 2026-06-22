import {
  Anchor,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  PasswordInput,
  Radio,
  rem,
  TextInput,
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../Services/UserService";
import { signupValidation } from "../../Services/FormValidation";
import {
  errorNotification,
  successNotification,
} from "../../Services/NotificationService";
const form = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  accountType: "APPLICANT",
};

const SignUp = () => {
  const [data, setData] = useState<{ [key: string]: string }>(form);
  const [formError, setFormError] = useState<{ [key: string]: string }>(form);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (event: any) => {
    if (typeof event === "string") {
      setData({ ...data, accountType: event });
      return;
    }

    const { name, value } = event.target;

    setData({ ...data, [name]: value });

    let errors: any = {
      ...formError,
      [name]: signupValidation(name, value),
    };

    if (name === "password") {
      if (data.confirmPassword && data.confirmPassword !== value) {
        errors.confirmPassword = "Passwords do not match.";
      } else {
        errors.confirmPassword = "";
      }
    }

    if (name === "confirmPassword") {
      if (data.password !== value) {
        errors.confirmPassword = "Passwords do not match.";
      } else {
        errors.confirmPassword = "";
      }
    }

    setFormError(errors);
  };

  const handleSubmit = () => {
    let valid = true,
      newFormError: { [key: string]: string } = {};
    for (let key in data) {
      if (key === "accountType") continue;
      if (key !== "confirmPassword")
        newFormError[key] = signupValidation(key, data[key]);
      else if (data[key] != data["password"])
        newFormError[key] = "Password do not match.";
      if (newFormError[key]) valid = false;
    }

    setFormError(newFormError);
    if (valid === true) {
      setLoading(true);
      registerUser(data)
        .then(() => {
          setData(form);
          const isCompany = data.accountType === "EMPLOYER";
          const message = isCompany
            ? "Your company account is registered and is now Pending Approval. You will be able to post jobs once an admin approves your account."
            : "Redirecting to Login page...";
          successNotification("Registration Successful", message);
          setTimeout(() => {
            setLoading(false);
            navigate("/login");
          }, 4000);
        })
        .catch((err) => {
          setLoading(false);
          errorNotification(
            "Registration Failed",
            err.response.data.errorMessage,
          );
        });
    }
  };

  return (
    <>
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        className="translate-x-1/2"
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "brightSun.4", type: "bars" }}
      />

      <div className="w-full max-w-xl px-4 sm:px-8 lg:px-12 mx-auto flex flex-col justify-center gap-4">
        <div className="text-3xl font-semibold">Create Account</div>
        {data.accountType === "EMPLOYER" && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            <strong>Note:</strong> Company accounts require admin approval before you can post jobs or access recruitment features.
          </div>
        )}
        <TextInput
          value={data.name}
          error={formError.name}
          name="name"
          onChange={handleChange}
          withAsterisk
          label="Full Name"
          placeholder="Your name"
        />
        <TextInput
          value={data.email}
          error={formError.email}
          name="email"
          onChange={handleChange}
          withAsterisk
          leftSection={<IconAt style={{ width: rem(16), height: rem(16) }} />}
          label="Email"
          placeholder="Your email"
        />
        <PasswordInput
          value={data.password}
          error={formError.password}
          name="password"
          onChange={handleChange}
          withAsterisk
          leftSection={<IconLock size={18} stroke={1.5} />}
          label="Password"
          placeholder="Password"
        />
        <PasswordInput
          value={data.confirmPassword}
          error={formError.confirmPassword}
          name="confirmPassword"
          onChange={handleChange}
          withAsterisk
          leftSection={<IconLock size={18} stroke={1.5} />}
          label="Confirm Password"
          placeholder="Confirm Password"
        />
        <Radio.Group
          value={data.accountType}
          onChange={handleChange}
          label="Choose your role"
          withAsterisk
        >
          <Group mt="xs" className="flex flex-col gap-3 sm:flex-row">
            <Radio
              className="py-4 px-6 border hover:bg-mine-shaft-900 has-checked:border-bright-sun-400 has-checked:bg-bright-sun-400/5 border-mine-shaft-800 rounded-lg"
              autoContrast
              value="APPLICANT"
              label="Student"
            />
            <Radio
              className="py-4 px-6 border hover:bg-mine-shaft-900 has-checked:border-bright-sun-400 has-checked:bg-bright-sun-400/5 border-mine-shaft-800 rounded-lg"
              autoContrast
              value="EMPLOYER"
              label="Company"
            />
          </Group>
        </Radio.Group>

        <Checkbox
          autoContrast
          label={
            <>
              I accept <Anchor>term & conditions</Anchor>
            </>
          }
        />
        <Button
          loading={loading}
          onClick={handleSubmit}
          autoContrast
          variant="filled"
        >
          Sign Up
        </Button>
        <div className="mx-auto text-center">
          Have an Account? <span
            className="text-bright-sun-400 hover:underline cursor-pointer"
            onClick={() => {
              navigate("/login");
              setFormError(form);
            }}
          >
            Login
          </span>
        </div>
      </div>
    </>
  );
};

export default SignUp;
