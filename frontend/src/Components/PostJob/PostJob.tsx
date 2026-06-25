import SelectInput from "./SelectInput"
import { content, fields } from "../../Data/PostJobData"
import { Button, NumberInput, TagsInput, Textarea, TextInput } from "@mantine/core";
import TextEditor from "./TextEditor";
import { IconArrowLeft, IconBuilding, IconShieldExclamation, IconAlertTriangle } from "@tabler/icons-react";
import { isNotEmpty, useForm } from "@mantine/form";
import { postJob } from "../../Services/JobService";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { useNavigate } from "react-router";
import { getItem, setItem, removeItem } from "../../Services/LocalStorageService";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../Types";
import { isCompanyPending, isCompanyRejected, isCompanyProfileComplete, getMissingCompanyFields } from "../../Services/RoleService";
import { Link } from "react-router-dom";

const buildJobPayload = (values: any, status = 'OPEN', companyLogo?: string, companyPicture?: string) => ({
  jobTitle: values.jobTitle,
  company: values.company,
  experience: values.experience,
  jobType: values.jobType,
  location: values.location,
  packageOffered: Number(values.packageOffered),
  skillsRequired: values.skillsRequired || [],
  about: values.about,
  description: values.description,
  applicants: values.applicants || [],
  companyLogo,
  companyPicture,
  jobStatus: status,
});

const PostJob = () => {
  const profile = useSelector((state: RootState) => state.profile);
  const companyName = profile?.company || "";

  const select = useMemo(() => {
    const companyField = { ...fields[1] };
    // Add the user's registered company to the options if not already present
    if (companyName && !companyField.options.includes(companyName)) {
      companyField.options = [companyName, ...companyField.options];
    }
    return [fields[0], companyField, ...fields.slice(2)];
  }, [companyName]);

  const Navigate = useNavigate();
  const form = useForm({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: {
      jobTitle: '',
      company: companyName,
      experience:'',
      jobType: '',
      location: '', 
      packageOffered: '',
      skillsRequired: [],
      about: '',
      description: content,
    },
    validate: { 
      jobTitle: isNotEmpty('Job Title is required'),
      experience: isNotEmpty('Experience is required'),
      jobType: isNotEmpty('Job Type is required'),
      location: isNotEmpty('Location is required'),
      packageOffered: isNotEmpty('Package Offered is required'),
      skillsRequired: (value:any) => value.length > 0 ? null : 'At least one skill is required',
      about: isNotEmpty('About is required'),
      description: isNotEmpty('Description is required'),
    },

  })

  useEffect(() => {
    const editing = getItem('editingJob');
    if (editing) {
      try {
        form.setValues(editing);
      } catch (e) {
        // silent failure
      }
      removeItem('editingJob');
    }
  }, []);

  // Sync company from profile if form company field is still empty
  // (handles the case where profile loads after component mount)
  useEffect(() => {
    if (profile?.company && !form.getValues().company) {
      form.setFieldValue('company', profile.company);
    }
  }, [profile?.company]);

  const user = useSelector((state: RootState) => state.user);

  const verificationBlocked = isCompanyPending(user) || isCompanyRejected(user);
  const profileComplete = isCompanyProfileComplete(profile);
  const missingFields = getMissingCompanyFields(profile);

  if (verificationBlocked) {
    return (
      <div className="site-container max-w-2xl py-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
            <IconShieldExclamation size={32} className="text-yellow-400" />
          </div>
        </div>
        <div className="text-2xl font-semibold mb-2">Account Pending Approval</div>
        <p className="text-mine-shaft-300 max-w-md mx-auto">
          {isCompanyPending(user)
            ? "Your company account is awaiting admin approval. You will be able to post jobs once an admin verifies your account."
            : "Your company account has been rejected. Please contact support for more information."
          }
        </p>
      </div>
    );
  }

  // ── Block posting if company profile is incomplete ──
  if (!profileComplete) {
    const labels: Record<string, string> = {
      company: "Company Name",
      location: "Location",
      about: "Company Overview",
      industry: "Industry",
      companySize: "Company Size",
      portfolio: "Website",
    };
    return (
      <div className="site-container max-w-3xl py-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 mb-6">
            <IconAlertTriangle size={40} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-mine-shaft-50 mb-2">Company Profile Incomplete</h2>
          <p className="text-mine-shaft-300 max-w-lg mx-auto mb-6">
            You need to complete your company profile before you can post jobs. 
            Fill in the missing details below, then come back to publish your job.
          </p>

          {/* Missing fields checklist */}
          <div className="w-full max-w-md rounded-xl border border-mine-shaft-800 bg-mine-shaft-900/60 p-6 mb-8">
            <div className="text-sm font-semibold text-mine-shaft-200 mb-4 text-left">
              Missing {missingFields.length} field{missingFields.length !== 1 ? "s" : ""}:
            </div>
            <div className="flex flex-col gap-2.5">
              {missingFields.map((field) => (
                <div key={field} className="flex items-center gap-3 rounded-lg bg-mine-shaft-800/40 px-4 py-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10">
                    <span className="text-[10px] font-bold text-amber-400">!</span>
                  </div>
                  <span className="text-sm text-mine-shaft-300">{labels[field] || field}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/profile">
              <button className="flex items-center gap-2 rounded-lg bg-bright-sun-400 px-6 py-3 text-sm font-semibold text-mine-shaft-950 transition-all hover:bg-bright-sun-300 shadow-lg shadow-bright-sun-400/20">
                <IconBuilding size={18} />
                Complete Company Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePost = () => {
    form.validate();
    if(!form.isValid()) {
      errorNotification("Form incomplete", "Please fill in all required fields before posting.");
      return;
    }
    postJob(buildJobPayload(form.getValues(), 'OPEN', profile?.companyLogo, profile?.picture)).then(() => {
      successNotification("Success","Job Posted Successfully");
      Navigate('/posted-job');
    }).catch((error) => {
      errorNotification("Error",error.response?.data?.errorMessage || 'Unable to publish job');
    });
  }

  const handleSaveDraft = () => {
    const values = form.values;
    if (!values.jobTitle?.trim()) {
      errorNotification('Cannot save blank draft', 'Please enter a job title before saving as a draft.');
      return;
    }
    const draft = {
      ...values,
      draftId: Date.now(),
      jobStatus: 'DRAFT',
      postTime: new Date().toISOString(),
      companyLogo: profile?.companyLogo,
      companyPicture: profile?.picture,
    };
    const existingDrafts = getItem('draftJobs') || [];
    setItem('draftJobs', [draft, ...existingDrafts]);
    successNotification('Draft saved', 'Your job has been saved as a draft');
    Navigate('/posted-job');
  }

  return (
    <div className="site-container">
        <div className="text-2xl font-semibold mb-5">Post a Job</div>
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput form={form} name="jobTitle" {...select[0]}/>
            <TextInput
              label="Company Name"
              value={companyName}
              readOnly
              variant="filled"
              className="[&_input]:text-mine-shaft-300 [&_input]:cursor-not-allowed"
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput form={form} name="experience" {...select[2]}/>
            <SelectInput form={form} name="jobType" {...select[3]}/>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput form={form} name="location" {...select[4]}/>
            <NumberInput {...form.getInputProps("packageOffered")} min={1} max={300} clampBehavior="strict" label="Salary" withAsterisk placeholder="Enter Salary" hideControls/>
          </div>
          <TagsInput {...form.getInputProps("skillsRequired")} label="Skills" placeholder="Enter Skill" clearable acceptValueOnBlur splitChars={[',', ' ', '|']} withAsterisk />
          <Textarea
                  {...form.getInputProps("about")}
                  withAsterisk
                  label="About the Job"
                  autosize
                  minRows={3}
                  placeholder="Enter a brief about the job"
                />
          <div className="[&_button[data-active='true']]:text-bright-sun-400! [&_button[data-active='true']]:bg-bright-sun-400/2!">
            <div className="text-sm font-medium">Job Description <span className="text-red-500">*</span></div>
            <TextEditor form={form} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button onClick={handlePost} leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light">Publish Job</Button>
            <Button onClick={handleSaveDraft} leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="outline">Save as Draft</Button>           
          </div>
        </div>
    </div>
  )
}

export default PostJob
