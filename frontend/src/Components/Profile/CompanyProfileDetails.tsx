import { Avatar, Button, FileButton, LoadingOverlay, TagsInput, TextInput, Textarea } from "@mantine/core";
import { IconBuilding, IconCamera, IconCheck, IconMapPin, IconPhone, IconPhotoEdit, IconWorld, IconUsers, IconBriefcase, IconBuildingStore } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { updateProfile } from "../../Services/ProfileService";
import { getBase64 } from "../../Services/Utilities";
import { changeProfile } from "../../Slices/ProfileSlice";
import type { ProfileState, RootState } from "../../Types";

const CompanyProfileDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const [saving, setSaving] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [form, setForm] = useState({
    company: "",
    location: "",
    portfolio: "",
    phone: "",
    about: "",
    companySize: "",
    industry: "",
    website: "",
    headquarters: "",
    specialties: [] as string[],
  });

  /* ── Sync local form when Redux profile loads ── */
  useEffect(() => {
    if (profile?.id) {
      setForm({
        company: profile?.company || user?.name || "",
        location: profile?.location || "",
        portfolio: profile?.portfolio || "",
        phone: profile?.phone || "",
        about: profile?.about || "",
        companySize: profile?.companySize || "",
        industry: profile?.industry || "",
        website: profile?.website || "",
        headquarters: profile?.headquarters || "",
        specialties: profile?.specialties || [],
      });
    }
  }, [profile?.id]);

  const bannerUrl = profile?.banner
    ? `data:image/jpeg;base64,${profile.banner}`
    : "/Profile/banner1.jpg";
  const logoUrl = profile?.picture
    ? `data:image/jpeg;base64,${profile.picture}`
    : form.company
      ? `/Icons/${encodeURIComponent(form.company)}.png`
      : "/Icons/Google.png";

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveImage = async (image: File | null, field: "picture" | "banner") => {
    if (!image) return;
    try {
      setSavingImage(true);
      const encoded = await getBase64(image);
      if (!encoded) return;
      const updatedProfile: ProfileState = {
        ...profile,
        id: profile?.id || user?.profileId,
        [field]: encoded.split(",")[1],
      };
      const saved = await updateProfile(updatedProfile);
      dispatch(changeProfile(saved));
      successNotification("Success", `${field === "banner" ? "Cover" : "Logo"} image updated`);
    } catch (error) {
      console.error(error);
      errorNotification("Error", "Unable to upload image.");
    } finally {
      setSavingImage(false);
    }
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.location.trim() || !form.about.trim()) {
      errorNotification("Missing details", "Company name, location, and overview are required.");
      return;
    }

    const profileId = profile?.id || user?.profileId;
    if (!profileId) {
      errorNotification("Profile not loaded", "Your profile data is still loading. Please try again in a moment.");
      return;
    }

    try {
      setSaving(true);
      const updatedProfile: ProfileState = {
        ...profile,
        id: profileId,
        company: form.company.trim(),
        location: form.location.trim(),
        portfolio: form.portfolio.trim(),
        phone: form.phone.trim(),
        about: form.about.trim(),
        companySize: form.companySize.trim(),
        industry: form.industry.trim(),
        website: form.website.trim(),
        headquarters: form.headquarters.trim(),
        specialties: form.specialties,
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
        <Button loading={saving} disabled={!profile?.id} color="brightSun.4" variant="light" leftSection={<IconCheck size={16} />} onClick={handleSave}>
          Save Details
        </Button>
      </div>

      {/* ── Banner Preview ── */}
      <div className="relative mb-8 h-44 overflow-hidden rounded-md border border-mine-shaft-800 bg-cover bg-center shadow-[0_18px_60px_-48px_rgba(255,189,32,0.8)] sm:h-52" style={{ backgroundImage: `url('${bannerUrl}')` }}>
        <LoadingOverlay visible={savingImage} zIndex={30} overlayProps={{ radius: "md", blur: 2 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
        <FileButton onChange={(file) => saveImage(file, "banner")} accept="image/png,image/jpeg">
          {(props) => (
            <button {...props} type="button" className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:border-bright-sun-400 hover:text-bright-sun-400">
              <IconPhotoEdit size={16} stroke={1.7} />
              Cover
            </button>
          )}
        </FileButton>
      </div>

      {/* ── Logo Preview ── */}
      <div className="group relative -mt-20 mb-8 ml-4 inline-block">
        <Avatar
          className="h-28! w-28! rounded-xl border-4 border-mine-shaft-950 bg-mine-shaft-900 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.9)]"
          src={logoUrl}
          alt="Company logo"
        />
        <FileButton onChange={(file) => saveImage(file, "picture")} accept="image/png,image/jpeg">
          {(props) => (
            <button {...props} type="button" className="absolute inset-1 z-20 flex items-center justify-center rounded-xl bg-black/70 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <IconCamera size={28} stroke={1.6} />
            </button>
          )}
        </FileButton>
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
          label="Company Size"
          placeholder="e.g. 1000-5000 employees"
          value={form.companySize}
          leftSection={<IconUsers size={18} />}
          onChange={(event) => updateField("companySize", event.currentTarget.value)}
        />
        <TextInput
          label="Industry"
          placeholder="e.g. Internet, Software & Technology"
          value={form.industry}
          leftSection={<IconBriefcase size={18} />}
          onChange={(event) => updateField("industry", event.currentTarget.value)}
        />
        <TextInput
          label="Website / Portfolio"
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
        <TextInput
          label="Headquarters"
          placeholder="e.g. Mountain View, California"
          value={form.headquarters}
          leftSection={<IconBuildingStore size={18} />}
          onChange={(event) => updateField("headquarters", event.currentTarget.value)}
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

      <TagsInput
        className="mt-5"
        label="Specialties"
        placeholder="Type a specialty and press Enter"
        value={form.specialties}
        onChange={(specialties) => setForm((current) => ({ ...current, specialties }))}
        splitChars={[",", "|"]}
        clearable
      />
    </div>
  );
};

export default CompanyProfileDetails;
