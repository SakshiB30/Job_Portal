import {
  Button,
  Modal,
  PasswordInput,
  PinInput,
  rem,
  TextInput,
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { changePass, sendOTP, verifyOtp } from "../../Services/UserService";
import { signupValidation } from "../../Services/FormValidation";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { useInterval } from "@mantine/hooks";

const ResetPassword = (props: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [verfied, setVerified] = useState(false);
  const [resendLoader, setResendLoader] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const interval = useInterval(() => {
    if (seconds == 0) {
      setResendLoader(false);
      setSeconds(60);
      interval.stop();
    } else 
    setSeconds((s) => s - 1)
    }, 1000);
     
  

  const handleSendOtp = () => {
    setOtpSending(true);
    sendOTP(email)
      .then((res) => {
        console.log(res);
        successNotification("OTP Sent", "Enter the OTP sent to your email to verify.");
        setOtpSent(true);
        setOtpSending(false);
        setResendLoader(true);
        interval.start();
      })
      .catch((err) => {
        console.log(err);
        setOtpSending(false);
        errorNotification("Failed to send OTP", err.response.data.errorMessage);
      });
  };
  const handleVerifyOtp = (otp: string) => {
    verifyOtp(email, otp)
      .then((res) => {
        console.log(res);
        successNotification("OTP Verified", "You can now reset your password.");
        setVerified(true);
      })
      .catch((err) => {
        console.log(err);
        errorNotification("Failed to verify OTP", err.response.data.errorMessage);
      });
  };

  const resendOtp = () => {
    if (resendLoader) return;
    handleSendOtp();
    successNotification("OTP Resent", "Enter the new OTP sent to your email to verify.");
  };

  const changeEmail = () => {
    setOtpSent(false);
    setResendLoader(false);
    setSeconds(60);
    setVerified(false);
    interval.stop();
    successNotification("Change Email", "You can now enter a new email to receive OTP.");
  };

  const handleResetPassword = () => {
    changePass(email, password)
      .then((res) => {
        console.log(res);
        successNotification("Password Changed", "Your password has been successfully changed.");
        props.close();
      })
      .catch((err) => {
        console.log(err);
        errorNotification("Failed to change password", err.response.data.errorMessage);
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
                autoContrast
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
              <PinInput
                onComplete={handleVerifyOtp}
                size="md"
                gap="lg"
                length={6}
                type="number"
              />
            </div>
          )}

          {otpSent && !verfied && (
            <div className="flex gap-2 mt-4">
              <Button
                fullWidth
                color="brightSun.4"
                loading={otpSending}
                onClick={resendOtp}
                autoContrast
                variant="light"
              >
                { resendLoader ? `Resend OTP in ${seconds}s` : "Resend OTP" }
              </Button>
              <Button
                fullWidth
                onClick={changeEmail}
                autoContrast
                variant="filled"
              >
                Change Email
              </Button>
            </div>
          )}
          {verfied && (
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
          {verfied && (
            <Button
              onClick={handleResetPassword}
              autoContrast
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


