import { Button, TextInput, Textarea } from "@mantine/core";
import { IconBuilding, IconCheck, IconMapPin, IconPhone, IconWorld } from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { updateProfile } from "../../Services/ProfileService";
import { changeProfile } from "../../Slices/ProfileSlice";
import type { ProfileState, RootState } from "../../Types";

const CompanyProfileDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: profile?.company || user?.name || "",
    location: profile?.location || "",
    portfolio: profile?.portfolio || "",
    phone: profile?.phone || "",
    about: profile?.about || "",
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.location.trim() || !form.about.trim()) {
      errorNotification("Missing details", "Company name, location, and overview are required.");
      return;
    }

    try {
      setSaving(true);
      const updatedProfile: ProfileState = {
        ...profile,
        id: profile?.id || user?.profileId,
        company: form.company.trim(),
        location: form.location.trim(),
        portfolio: form.portfolio.trim(),
        phone: form.phone.trim(),
        about: form.about.trim(),
      };
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      successNotification("Success", "Company profile updated successfully");
    } catch (error) {
      console.error(error);
      errorNotification("Error", "Unable to update company profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="text-2xl font-semibold">Company Details</div>
          <div className="mt-1 text-sm text-mine-shaft-300">
            These details are shown to students when they review your jobs.
          </div>
        </div>
        <Button loading={saving} color="brightSun.4" variant="light" leftSection={<IconCheck size={16} />} onClick={handleSave}>
          Save Details
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextInput
          label="Company Name"
          placeholder="Enter company name"
          withAsterisk
          value={form.company}
          leftSection={<IconBuilding size={18} />}
          onChange={(event) => updateField("company", event.currentTarget.value)}
        />
        <TextInput
          label="Location"
          placeholder="Enter company location"
          withAsterisk
          value={form.location}
          leftSection={<IconMapPin size={18} />}
          onChange={(event) => updateField("location", event.currentTarget.value)}
        />
        <TextInput
          label="Website"
          placeholder="https://company.com"
          value={form.portfolio}
          leftSection={<IconWorld size={18} />}
          onChange={(event) => updateField("portfolio", event.currentTarget.value)}
        />
        <TextInput
          label="Contact Phone"
          placeholder="Enter contact number"
          value={form.phone}
          leftSection={<IconPhone size={18} />}
          onChange={(event) => updateField("phone", event.currentTarget.value)}
        />
      </div>

      <Textarea
        className="mt-5"
        label="Company Overview"
        placeholder="Describe your company, team, culture, and hiring focus"
        withAsterisk
        autosize
        minRows={5}
        value={form.about}
        onChange={(event) => updateField("about", event.currentTarget.value)}
      />
    </div>
  );
};

export default CompanyProfileDetails;
