import {
  Button,
  Modal,
  PasswordInput,
  PinInput,
  rem,
  TextInput,
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { resetPass, sendOTP, verifyOtp } from "../../Services/UserService";
import { signupValidation } from "../../Services/FormValidation";
import { errorNotification, successNotification } from "../../Services/NotificationService";

type ResetPasswordProps = {
  opened: boolean;
  close: () => void;
};

type ApiError = {
  response?: {
    data?: {
      errorMessage?: string;
      message?: string;
    };
  };
  message?: string;
};

const ResetPassword = (props: ResetPasswordProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendLoader, setResendLoader] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!resendLoader) return;

    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setResendLoader(false);
          return 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendLoader]);

  const getErrorMessage = (err: ApiError, fallback: string) =>
    err?.response?.data?.errorMessage || err?.response?.data?.message || err?.message || fallback;
  

  const handleSendOtp = () => {
    if (!email.trim()) {
      errorNotification("Email required", "Enter your registered email to receive OTP.");
      return;
    }
    setOtpSending(true);
    sendOTP(email.trim())
  .then(() => {
    successNotification(
      "OTP Sent",
      "Enter the OTP sent to your email to verify."
    );
    setOtpSent(true);
    setOtpSending(false);
    setResendLoader(true);
  })
  .catch((err) => {
    setOtpSending(false);

    errorNotification(
      "Failed to send OTP",
      getErrorMessage(err, "Unable to send OTP right now.")
    );
  });
  };
  const handleVerifyOtp = (otp: string) => {
    setOtp(otp);
    verifyOtp(email.trim(), otp)
      .then(() => {
        successNotification("OTP Verified", "You can now reset your password.");
        setVerified(true);
      })
      .catch((err) => {
        errorNotification("Failed to verify OTP", getErrorMessage(err, "Unable to verify OTP."));
      });
  };

  const resendOtp = () => {
    if (resendLoader) return;
    handleSendOtp();
    successNotification("OTP Resent", "Enter the new OTP sent to your email to verify.");
  };

  const changeEmail = () => {
    setOtpSent(false);
    setOtp("");
    setResendLoader(false);
    setSeconds(60);
    setVerified(false);
    successNotification("Change Email", "You can now enter a new email to receive OTP.");
  };

  const handleResetPassword = () => {
    if (passError || !password) {
      errorNotification("Invalid password", passError || "Enter a valid password.");
      return;
    }

    if (!otp) {
      errorNotification("OTP required", "Verify the OTP before changing your password.");
      return;
    }

    resetPass(email.trim(), otp, password)
      .then(() => {
        successNotification("Password Changed", "Your password has been successfully changed.");
        props.close();
      })
      .catch((err) => {
        errorNotification("Failed to change password", getErrorMessage(err, "Unable to change password."));
      });
  };

  return (
    <div>
      <Modal
        opened={props.opened}
        onClose={props.close}
        title="Reset Password"
        centered
      >
        <div className="flex flex-col mt-3">
          <TextInput
            value={email}
            name="email"
            size="md"
            onChange={(e) => setEmail(e.target.value)}
            withAsterisk
            leftSection={<IconAt style={{ width: rem(16), height: rem(16) }} />}
            label="Email"
            placeholder="Your email"
            rightSection={
              <Button
                size="xs"
                loading={otpSending && !otpSent}
                className="mr-1"
                onClick={handleSendOtp}
                disabled={email === "" || otpSent}
                variant="filled"
              >
                Send OTP
              </Button>
            }
            rightSectionWidth="xl"
          />

          {otpSent && (
            <div className="flex justify-center mt-4">
              <div className="overflow-x-auto px-1 pb-2 max-w-full">
              <PinInput
                onComplete={handleVerifyOtp}
                size="md"
                gap="sm"
                length={6}
                type="number"
              />
              </div>
            </div>
          )}

          {otpSent && !verified && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                fullWidth
                color="brightSun.4"
                loading={otpSending}
                onClick={resendOtp}
                variant="light"
              >
                { resendLoader ? `Resend OTP in ${seconds}s` : "Resend OTP" }
              </Button>
              <Button
                fullWidth
                onClick={changeEmail}
                variant="filled"
              >
                Change Email
              </Button>
            </div>
          )}
          {verified && (
            <PasswordInput
              value={password}
              error={passError}
              name="password"
              onChange={(e) => {
                setPassword(e.target.value);
                setPassError(signupValidation("password", e.target.value));
              }}
              withAsterisk
              leftSection={<IconLock size={18} stroke={1.5} />}
              label="Password"
              placeholder="Password"
            />
          )}
          {verified && (
            <Button
              onClick={handleResetPassword}
              variant="filled"
              className="mt-4"
            >
              Change Password
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ResetPassword;


