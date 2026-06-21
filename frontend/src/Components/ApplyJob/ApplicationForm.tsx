import { Button, LoadingOverlay, NumberInput, Textarea, TextInput, Tooltip } from "@mantine/core"
import { isNotEmpty, useForm } from "@mantine/form";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applyJob } from "../../Services/JobService";
import { getUser } from "../../Services/UserService";
import { useDispatch } from "react-redux";
import { setUser } from "../../Slices/UserSlice";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { useSelector } from "react-redux";
import { IconFile, IconAlertCircle } from "@tabler/icons-react";


const ApplicationForm = () => {
    const { id } = useParams<{ id: string }>();
    const jobId = id ? parseInt(id, 10) : undefined;
    const user = useSelector((state:any)=>state.user);
    const profile = useSelector((state:any)=>state.profile);
    const dispatch = useDispatch();
    const [preview, setPreview] = useState(false);
    const [submit, setSubmit] = useState(false);
    const navigate = useNavigate();
    const hasResume = !!profile?.resume;

    const form = useForm({
        mode: "controlled",
        validateInputOnChange: true,
        initialValues: {
          name: "",
          email: "",
          phone: "",
          website: "",
          coverLetter: "",
        },
        validate: {
          name: isNotEmpty("Name is required"),
          email: isNotEmpty("Email is required"),
          phone: isNotEmpty("Phone is required"),
          website: isNotEmpty("Website is required"),
        },
      });

    const handlePreview = () => {
      const hasErrors = form.validate().hasErrors;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (hasErrors) return;
      setPreview(!preview);
    };

    const handleSubmit = async () => {
      if (!jobId) {
        errorNotification("Error", "Invalid job ID. Please go back and try again.");
        return;
      }

      setSubmit(true);
      try {
        const applicant = {
          ...form.getValues(),
          applicantId: user?.id,
          name: user?.name || form.getValues().name,
          email: user?.email || form.getValues().email,
        };

        await applyJob(jobId, applicant);
        // optimistic UI: add jobId to user's appliedJobs so it appears immediately
        try {
          if (user?.id) {
            const currentApplied = Array.isArray(user.appliedJobs) ? user.appliedJobs.map((id:any) => String(id)) : [];
            if (!currentApplied.includes(String(jobId))) {
              const optimistic = { ...user, appliedJobs: [...(user.appliedJobs || []), jobId] };
              dispatch(setUser(optimistic));
            }
            // also try to refresh authoritative user state from server
            const updatedUser = await getUser(user.id);
            dispatch(setUser(updatedUser));
          }
        } catch (e) {
          console.warn('Failed to refresh user after apply', e);
        }
        setSubmit(false);
        successNotification("Success", "Your application has been submitted successfully");
        navigate('/job-history');
      } catch (error: unknown) {
        setSubmit(false);
        const message =
  (error as any)?.response?.data?.errorMessage ||
  "Something went wrong. Please try again later.";
        errorNotification("Error", message);
      }
    };
  return (
    
    <div>
         <LoadingOverlay className="fixed! "
          visible={submit}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'brightSun.4', type: 'bars' }}
        />
      <div className="text-xl font-semibold mb-5">Submit Your Applications</div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 *:w-full sm:*:w-1/2">
          <TextInput {...form.getInputProps("name")} readOnly={preview} variant={preview? "unstyled":"default"} className={`${preview?"text-mine-shaft-300 font-semibold": ""}`} label="full name" withAsterisk placeholder="Enter Name"/>
          <TextInput {...form.getInputProps("email")} readOnly={preview} variant={preview? "unstyled":"default"} className={`${preview?"text-mine-shaft-300 font-semibold": ""}`} label="Email" withAsterisk placeholder="Enter Email"/>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 *:w-full sm:*:w-1/2">
            <NumberInput {...form.getInputProps("phone")} readOnly={preview} variant={preview? "unstyled":"default"} className={`${preview?"text-mine-shaft-300 font-semibold": ""}`} label="Phone Number" withAsterisk placeholder="Enter Phone Number" hideControls min={0} max={9999999999} clampBehavior="strict"/>
            <TextInput {...form.getInputProps("website")} readOnly={preview} variant={preview? "unstyled":"default"} className={`${preview?"text-mine-shaft-300 font-semibold": ""}`} label="Personal Website" withAsterisk placeholder="Enter Url"/>  
          </div>
            <Textarea {...form.getInputProps("coverLetter")} readOnly={preview} variant={preview? "unstyled":"default"} className={`${preview?"text-mine-shaft-300 font-semibold": ""}`} label="Cover Letter" placeholder="Type Something About Yourself..." autosize minRows={4} />

            {/* ── Resume status indicator ── */}
            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${hasResume ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
              <IconFile size={22} stroke={1.5} className={hasResume ? "text-green-400" : "text-red-400"} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${hasResume ? "text-green-400" : "text-red-400"}`}>
                  {hasResume ? "Resume attached" : "No resume uploaded"}
                </p>
                <p className="text-xs text-mine-shaft-400">
                  {hasResume
                    ? "Your resume will be included with this application."
                    : "Please upload a resume in your profile before applying."}
                </p>
              </div>
              <a
                href="/profile"
                className="shrink-0 text-xs text-bright-sun-400 hover:underline"
              >
                {hasResume ? "Update" : "Go to Profile"}
              </a>
            </div>

            {
                !preview && (
                  <Tooltip
                    label="Upload a resume in your profile first"
                    withArrow
                    disabled={hasResume}
                    position="top"
                  >
                    <Button
                      onClick={handlePreview}
                      color="brightSun.4"
                      variant="light"
                      disabled={!hasResume}
                      leftSection={!hasResume ? <IconAlertCircle size={18} /> : undefined}
                    >
                      Preview
                    </Button>
                  </Tooltip>
                )
            }
            {
                preview && <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 *:w-full sm:*:w-1/2">
                    <Button fullWidth onClick={handlePreview} color="brightSun.4" variant="outline">Edit</Button>
                    <Tooltip
                      label="Upload a resume in your profile first"
                      withArrow
                      disabled={hasResume}
                      position="top"
                    >
                      <Button
                        fullWidth
                        onClick={handleSubmit}
                        color="brightSun.4"
                        variant="light"
                        disabled={!hasResume}
                      >
                        Submit
                      </Button>
                    </Tooltip>
                </div>
            }
            
      
      </div>
    </div>
  )
}

export default ApplicationForm
