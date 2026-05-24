import { Button, FileButton, LoadingOverlay, TagsInput, TextInput, Textarea } from "@mantine/core";
import { IconBriefcase, IconBuilding, IconBuildingStore, IconCamera, IconCheck, IconEdit, IconMapPin, IconPhone, IconPhotoEdit, IconUsers, IconWorld } from "@tabler/icons-react";
import CompanyLogo from "../CompanyLogo";
import { useCallback, useEffect, useState } from "react";
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
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingImages, setPendingImages] = useState<Partial<Pick<ProfileState, "companyLogo" | "picture" | "banner">>>({});
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

  const getProfileForm = useCallback(() => ({
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
  }), [profile, user?.name]);

  useEffect(() => {
    if (profile?.id) {
      setForm(getProfileForm());
    }
  }, [getProfileForm, profile?.id]);

  const banner = pendingImages.banner || profile?.banner;
  const bannerUrl = banner ? `data:image/jpeg;base64,${banner}` : "/Profile/banner1.jpg";

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectImage = async (image: File | null, field: "companyLogo" | "picture" | "banner") => {
    if (!image) return;
    try {
      const encoded = await getBase64(image);
      if (!encoded) return;
      setPendingImages((current) => ({ ...current, [field]: encoded.split(",")[1] }));
    } catch (error) {
      console.error(error);
      errorNotification("Error", "Unable to select image.");
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
        ...pendingImages,
      };
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      setPendingImages({});
      setEdit(false);
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
          <div className="mt-1 text-sm text-mine-shaft-300">These details are shown to students when they review your jobs.</div>
        </div>
        {edit ? (
          <div className="flex gap-2">
            <Button color="red.8" variant="subtle" onClick={() => { setForm(getProfileForm()); setPendingImages({}); setEdit(false); }}>
              Cancel
            </Button>
            <Button loading={saving} disabled={!profile?.id} color="brightSun.4" variant="light" leftSection={<IconCheck size={16} />} onClick={handleSave}>
              Save
            </Button>
          </div>
        ) : (
          <Button color="brightSun.4" variant="light" leftSection={<IconEdit size={16} />} onClick={() => setEdit(true)}>
            Edit
          </Button>
        )}
      </div>

      <div className="relative mb-8 h-44 overflow-hidden rounded-md border border-mine-shaft-800 bg-cover bg-center shadow-[0_18px_60px_-48px_rgba(255,189,32,0.8)] sm:h-52" style={{ backgroundImage: `url('${bannerUrl}')` }}>
        <LoadingOverlay visible={saving} zIndex={30} overlayProps={{ radius: "md", blur: 2 }} />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/25 to-transparent" />
        {edit && (
          <FileButton onChange={(file) => selectImage(file, "banner")} accept="image/png,image/jpeg">
            {(props) => (
              <button {...props} type="button" className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:border-bright-sun-400 hover:text-bright-sun-400">
                <IconPhotoEdit size={16} stroke={1.7} />
                Cover
              </button>
            )}
          </FileButton>
        )}
      </div>

      <div className="group relative -mt-20 mb-8 ml-4 inline-block">
        <div className="h-28 w-28 rounded-xl border-4 border-mine-shaft-950 overflow-hidden">
          <CompanyLogo logo={pendingImages.companyLogo || profile?.companyLogo} picture={pendingImages.picture || profile?.picture} company={form.company} className="h-full w-full" />
        </div>
        {edit && (
          <FileButton onChange={(file) => selectImage(file, "companyLogo")} accept="image/png,image/jpeg">
            {(props) => (
              <button {...props} type="button" className="absolute inset-1 z-20 flex items-center justify-center rounded-xl bg-black/70 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                <IconCamera size={28} stroke={1.6} />
              </button>
            )}
          </FileButton>
        )}
      </div>

      {edit ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextInput label="Company Name" placeholder="Enter company name" withAsterisk value={form.company} leftSection={<IconBuilding size={18} />} onChange={(event) => updateField("company", event.currentTarget.value)} />
            <TextInput label="Location" placeholder="Enter company location" withAsterisk value={form.location} leftSection={<IconMapPin size={18} />} onChange={(event) => updateField("location", event.currentTarget.value)} />
            <TextInput label="Company Size" placeholder="e.g. 1000-5000 employees" value={form.companySize} leftSection={<IconUsers size={18} />} onChange={(event) => updateField("companySize", event.currentTarget.value)} />
            <TextInput label="Industry" placeholder="e.g. Internet, Software & Technology" value={form.industry} leftSection={<IconBriefcase size={18} />} onChange={(event) => updateField("industry", event.currentTarget.value)} />
            <TextInput label="Website / Portfolio" placeholder="https://company.com" value={form.portfolio} leftSection={<IconWorld size={18} />} onChange={(event) => updateField("portfolio", event.currentTarget.value)} />
            <TextInput label="Contact Phone" placeholder="Enter contact number" value={form.phone} leftSection={<IconPhone size={18} />} onChange={(event) => updateField("phone", event.currentTarget.value)} />
            <TextInput label="Headquarters" placeholder="e.g. Mountain View, California" value={form.headquarters} leftSection={<IconBuildingStore size={18} />} onChange={(event) => updateField("headquarters", event.currentTarget.value)} />
          </div>

          <Textarea className="mt-5" label="Company Overview" placeholder="Describe your company, team, culture, and hiring focus" withAsterisk autosize minRows={5} value={form.about} onChange={(event) => updateField("about", event.currentTarget.value)} />

          <TagsInput className="mt-5" label="Specialties" placeholder="Type a specialty and press Enter" value={form.specialties} onChange={(specialties) => setForm((current) => ({ ...current, specialties }))} splitChars={[",", "|"]} clearable />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PreviewField icon={<IconBuilding size={18} />} label="Company Name" value={form.company} />
            <PreviewField icon={<IconMapPin size={18} />} label="Location" value={form.location} />
            <PreviewField icon={<IconUsers size={18} />} label="Company Size" value={form.companySize} />
            <PreviewField icon={<IconBriefcase size={18} />} label="Industry" value={form.industry} />
            <PreviewField icon={<IconWorld size={18} />} label="Website / Portfolio" value={form.portfolio} />
            <PreviewField icon={<IconPhone size={18} />} label="Contact Phone" value={form.phone} />
            <PreviewField icon={<IconBuildingStore size={18} />} label="Headquarters" value={form.headquarters} />
          </div>

          <div className="mt-5 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/50 p-4">
            <div className="text-sm font-medium text-mine-shaft-300">Company Overview</div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-mine-shaft-100">{form.about || "No company overview added yet."}</div>
          </div>

          <div className="mt-5 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/50 p-4">
            <div className="text-sm font-medium text-mine-shaft-300">Specialties</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.specialties.length ? form.specialties.map((specialty) => (
                <span key={specialty} className="rounded-full bg-bright-sun-400/10 px-3 py-1 text-sm font-medium text-bright-sun-300">
                  {specialty}
                </span>
              )) : (
                <span className="text-sm text-mine-shaft-400">No specialties added yet.</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PreviewField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
  <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900/50 p-4">
    <div className="flex items-center gap-2 text-sm font-medium text-mine-shaft-300">
      {icon}
      {label}
    </div>
    <div className="mt-2 break-words text-mine-shaft-100">{value || "Not added yet"}</div>
  </div>
);

export default CompanyProfileDetails;
