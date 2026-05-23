import SelectInput from "./SelectInput"
import { content, fields } from "../../Data/PostJobData"
import { Button, NumberInput, TagsInput, Textarea } from "@mantine/core";
import TextEditor from "./TextEditor";
import { IconArrowLeft } from "@tabler/icons-react";
import { isNotEmpty, useForm } from "@mantine/form";
import { postJob } from "../../Services/JobService";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { useNavigate } from "react-router";
import { getItem, setItem, removeItem } from "../../Services/LocalStorageService";
import { useEffect } from "react";

const buildJobPayload = (values: any, status = 'OPEN') => ({
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
  jobStatus: status,
});

const PostJob = () => {
  const select = fields;
  const Navigate = useNavigate();
  const form = useForm({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: {
      jobTitle: '',
      company: '',
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
      company: isNotEmpty('Company Name is required'),
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
        console.error('Failed to set editing job values', e);
      }
      removeItem('editingJob');
    }
  }, []);

  const handlePost = () => {
    form.validate();
    if(!form.isValid()) return;
    postJob(buildJobPayload(form.getValues(), 'OPEN')).then((res) => {
      successNotification("Success","Job Posted Successfully");
      console.log(res);
      Navigate('/posted-job');
    }).catch((error) => {
      console.log(error);
      errorNotification("Error",error.response?.data?.errorMessage || 'Unable to publish job');
    });
  }

  const handleSaveDraft = () => {
    const draft = {
      ...form.values,
      draftId: Date.now(),
      jobStatus: 'DRAFT',
      postTime: new Date().toISOString(),
    };
    const existingDrafts = getItem('draftJobs') || [];
    setItem('draftJobs', [draft, ...existingDrafts]);
    successNotification('Draft saved', 'Your job has been saved as a draft');
    Navigate('/posted-job');
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-2xl font-semibold mb-5">Post a Job</div>
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput form={form} name="jobTitle" {...select[0]}/>
            <SelectInput form={form} name="company" {...select[1]}/>
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
