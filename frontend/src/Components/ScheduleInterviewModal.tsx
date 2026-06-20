import { Button, Modal, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { scheduleInterview } from "../Services/JobService";
import { errorNotification, successNotification } from "../Services/NotificationService";

type Props = {
  opened: boolean;
  onClose: () => void;
  jobId: string | number;
  applicantId: string | number;
  applicantName: string;
  jobTitle: string;
  onSuccess?: (response?: any) => void;
};

const ScheduleInterviewModal = ({
  opened,
  onClose,
  jobId,
  applicantId,
  applicantName,
  jobTitle,
  onSuccess,
}: Props) => {
  const form = useForm({
    mode: "controlled",
    initialValues: { scheduledAt: "", meetingLink: "", notes: "" },
    validate: {
      scheduledAt: (value: string) => (!value ? "Interview date & time is required" : null),
    },
  });

  const handleSubmit = async () => {
    if (form.validate().hasErrors) return;
    try {
      const res = await scheduleInterview(jobId, applicantId, form.getValues());
      successNotification("Interview Scheduled", `Interview details sent to ${applicantName} for ${jobTitle}.`);
      form.reset();
      onClose();
      onSuccess?.(res);
    } catch (error: unknown) {
      const message = (error as any)?.response?.data?.errorMessage || "Failed to schedule interview.";
      errorNotification("Error", message);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Schedule Interview`} size="lg">
      <div className="flex flex-col gap-4">
        <div className="text-sm text-mine-shaft-300">
          <span className="font-semibold text-mine-shaft-100">{applicantName}</span> &mdash; {jobTitle}
        </div>
        <TextInput
          {...form.getInputProps("scheduledAt")}
          label="Date & Time"
          placeholder="e.g. April 15, 2026 at 2:00 PM"
          withAsterisk
        />
        <TextInput
          {...form.getInputProps("meetingLink")}
          label="Location / Meeting Link"
          placeholder="Video link or office address"
        />
        <Textarea
          {...form.getInputProps("notes")}
          label="Notes for Candidate"
          placeholder="Preparation instructions, documents to bring, etc."
          autosize
          minRows={3}
        />
        <div className="flex gap-3 mt-2 justify-end">
          <Button variant="outline" color="gray" onClick={onClose}>Cancel</Button>
          <Button color="brightSun.4" variant="light" onClick={handleSubmit}>Send Interview Schedule</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleInterviewModal;
