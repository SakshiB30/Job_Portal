import { Avatar, Divider, FileButton, LoadingOverlay } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import Info from "./Info";
import { changeProfile } from "../../Slices/ProfileSlice";
import About from "./About";
import Skills from "./Skills";
import Experiences from "./Experiences";
import Certificates from "./Certificates";
import CompanyProfileDetails from "./CompanyProfileDetails";
import Following from "./Following";
import ResumeSection from "./Resume";
import { IconCamera, IconPhotoEdit } from "@tabler/icons-react";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { getBase64 } from "../../Services/Utilities";
import type { RootState } from "../../Types";
import { isCompany } from "../../Services/RoleService";
import { updateProfile } from "../../Services/ProfileService";
import { useState } from "react";
import AnimatedSection from "../AnimatedSection";


const Profile = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const user = useSelector((state: RootState) => state.user);
  const companyProfile = isCompany(user);
  const [savingImage, setSavingImage] = useState(false);
  const bannerUrl = profile?.banner ? `data:image/jpeg;base64,${profile.banner}` : "/Profile/banner1.jpg";
  const profileUrl = profile?.picture ? `data:image/jpeg;base64,${profile.picture}` : companyProfile ? "/Icons/Google.png" : "/A3.png";

  const saveProfileImage = async (image: File | null, field: "picture" | "banner") => {
    if (!image) return;
    try {
      setSavingImage(true);
      const encodedImage = await getBase64(image);
      if (!encodedImage) return;
      const updatedProfile = { ...profile, id: profile?.id || user?.profileId, [field]: encodedImage.split(",")[1] };
      const savedProfile = profile?.id ? await updateProfile(updatedProfile) : updatedProfile;
      dispatch(changeProfile(savedProfile));
      successNotification("Success", `${field === "banner" ? "Background" : "Profile"} image updated successfully`);
    } catch (error) {
      errorNotification("Error", "Unable to update image. Please try again.");
    } finally {
      setSavingImage(false);
    }
  }

  return (
    <div className="site-container">
      {/* ── Cover image + avatar hero section (student profiles only) ── */}
      {!companyProfile && (
        <div className="relative pb-20 sm:pb-24">
          <div className="relative h-64 overflow-hidden rounded-md border border-mine-shaft-800 bg-cover bg-center shadow-[0_24px_80px_-48px_rgba(255,189,32,0.8)] sm:h-72 lg:h-80" style={{ backgroundImage: `url('${bannerUrl}')` }}>
            <LoadingOverlay visible={savingImage} zIndex={30} overlayProps={{ radius: "md", blur: 2 }} />
            <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/35 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-mine-shaft-950/80 to-transparent" />
            <FileButton onChange={(file) => saveProfileImage(file, "banner")} accept="image/png,image/jpeg">
              {(props) => (
                <button {...props} type="button" className="absolute right-2 sm:right-4 top-2 sm:top-4 z-20 flex items-center gap-1.5 sm:gap-2 rounded-md border border-white/20 bg-black/55 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white backdrop-blur transition hover:border-bright-sun-400 hover:text-bright-sun-400">
                  <IconPhotoEdit size={18} stroke={1.7} />
                  Change Cover
                </button>
              )}
            </FileButton>
          </div>
          <div className="absolute bottom-0 left-4 z-20 sm:left-6">
            <div className="group relative">
              <Avatar
                className="h-36! w-36! border-mine-shaft-950 border-8 bg-mine-shaft-900 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.9)] sm:h-48! sm:w-48! rounded-full"
                src={profileUrl}
                alt=""
              />
              <FileButton onChange={(file) => saveProfileImage(file, "picture")} accept="image/png,image/jpeg">
                {(props) => (
                  <button {...props} type="button" className="absolute inset-2 z-20 flex flex-col items-center justify-center gap-2 bg-black/70 text-sm font-semibold text-white opacity-100 backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100 rounded-full">
                    <IconCamera size={34} stroke={1.6} />
                    Change Photo
                  </button>
                )}
              </FileButton>
            </div>
          </div>
        </div>
      )}

      <div className={`rounded-md border border-mine-shaft-800 bg-mine-shaft-900/30 px-4 py-6 pb-10 sm:px-6 ${!companyProfile ? '' : 'mt-0'}`}>
        {companyProfile ? (
          <CompanyProfileDetails />
        ) : (
          <>
            <AnimatedSection animation="slide-up"><Info /></AnimatedSection>
            <Divider my="xl" />
            <AnimatedSection animation="fade-in"><About /></AnimatedSection>
            <Divider my="xl" />
            <AnimatedSection animation="fade-in"><Skills /></AnimatedSection>
            <Divider my="xl" />
            <AnimatedSection animation="fade-in"><Experiences /></AnimatedSection>
            <Divider my="xl" />
            <AnimatedSection animation="fade-in"><Certificates/></AnimatedSection>
            <Divider my="xl" />
            <AnimatedSection animation="fade-in"><ResumeSection /></AnimatedSection>
            <Divider my="xl" />
            <AnimatedSection animation="fade-in"><Following/></AnimatedSection>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
