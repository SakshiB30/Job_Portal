import { ActionIcon, FileButton, Tooltip } from "@mantine/core"
import { IconCheck, IconDownload, IconFile, IconPencil, IconTrash, IconUpload, IconX } from "@tabler/icons-react"
import { useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { successNotification } from "../../Services/NotificationService"
import { changeProfile } from "../../Slices/ProfileSlice"
import type { RootState } from "../../Types"
import { updateProfile } from "../../Services/ProfileService"
import { getBase64 } from "../../Services/Utilities"

const Resume = () => {
  const [edit, setEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const profile = useSelector((state: RootState) => state.profile);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const resetRef = useRef<() => void>(null);

  const hasResume = !!profile?.resume;

  const getResumeDataUri = (base64: string): string => {
    if (base64.startsWith("data:")) return base64;
    return `data:application/pdf;base64,${base64}`;
  };

  const handleSaveResume = async (file: File | null) => {
    if (!file) return;

    try {
      setUploading(true);
      const base64DataUri = await getBase64(file);
      if (!base64DataUri) return;

      const rawBase64 = base64DataUri.includes(",")
        ? base64DataUri.split(",")[1]
        : base64DataUri;

      const updatedProfile = {
        ...profile,
        id: profile?.id || user?.profileId,
        resume: rawBase64,
      };
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile({ ...savedProfile, resume: base64DataUri }));
      successNotification("Success", "Resume uploaded successfully");
      setEdit(false);
      resetRef.current?.();
    } catch (error) {
      // silent upload failure
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      setUploading(true);
      const updatedProfile = {
        ...profile,
        id: profile?.id || user?.profileId,
        resume: "",
      };
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      successNotification("Success", "Resume removed successfully");
      setEdit(false);
    } catch (error) {
      // silent delete failure
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (!profile?.resume) return;

    const dataUri = getResumeDataUri(profile.resume);
    const mimeMatch = dataUri.match(/^data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/pdf";
    const extension = mimeType === "application/pdf" ? "pdf"
      : mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? "docx"
      : mimeType === "application/msword" ? "doc"
      : "pdf";

    const rawData = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;

    const byteCharacters = atob(rawData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${user?.name || "resume"}_Resume.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="text-2xl font-semibold mb-3 flex justify-between items-center">
        Resume
        <div className="flex items-center gap-1">
          {edit && (
            <>
              <Tooltip label="Remove resume" withArrow>
                <ActionIcon
                  onClick={handleDeleteResume}
                  variant="subtle"
                  color="red.8"
                  size="lg"
                  loading={uploading}
                >
                  <IconTrash className="h-4/5 w-4/5" stroke={1.5} />
                </ActionIcon>
              </Tooltip>
              <FileButton
                onChange={handleSaveResume}
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                resetRef={resetRef}
              >
                {(props) => (
                  <ActionIcon
                    {...props}
                    variant="subtle"
                    color="green.8"
                    size="lg"
                    loading={uploading}
                  >
                    <IconCheck className="h-4/5 w-4/5" stroke={1.5} />
                  </ActionIcon>
                )}
              </FileButton>
            </>
          )}
          <ActionIcon
            onClick={() => { if (!edit) setEdit(true); else setEdit(false); }}
            variant="subtle"
            color={edit ? "red.8" : "brightSun.4"}
            size="lg"
          >
            {edit ? (
              <IconX className="h-4/5 w-4/5" />
            ) : (
              <IconPencil className="h-4/5 w-4/5" />
            )}
          </ActionIcon>
        </div>
      </div>

      {edit ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-mine-shaft-600 bg-mine-shaft-900/40 px-6 py-8 transition hover:border-bright-sun-400/50">
          <IconUpload size={40} className="text-mine-shaft-400" stroke={1.5} />
          <div className="text-center">
            <p className="text-sm text-mine-shaft-300 mb-1">
              {hasResume ? "Replace your existing resume" : "Upload your resume"}
            </p>
            <p className="text-xs text-mine-shaft-500">PDF, DOC, or DOCX format</p>
          </div>
          <FileButton
            onChange={handleSaveResume}
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            resetRef={resetRef}
          >
            {(props) => (
              <button
                {...props}
                type="button"
                className="flex items-center gap-2 rounded-md bg-bright-sun-400/15 px-4 py-2 text-sm font-medium text-bright-sun-400 hover:bg-bright-sun-400/25 transition-colors"
              >
                <IconUpload size={16} stroke={1.5} />
                {hasResume ? "Choose New File" : "Choose File"}
              </button>
            )}
          </FileButton>
          {hasResume && (
            <button
              type="button"
              onClick={handleDeleteResume}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Remove current resume
            </button>
          )}
        </div>
      ) : (
        <div>
          {hasResume ? (
            <div className="flex items-center gap-3 rounded-lg border border-mine-shaft-700 bg-mine-shaft-900/60 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bright-sun-400/15 text-bright-sun-400">
                <IconFile size={22} stroke={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-mine-shaft-200 truncate">
                  {user?.name || "Your"}_Resume
                </p>
                <p className="text-xs text-mine-shaft-400">PDF / DOC</p>
              </div>
              <Tooltip label="Download resume" withArrow>
                <ActionIcon
                  onClick={handleDownload}
                  variant="subtle"
                  color="brightSun.4"
                  size="md"
                >
                  <IconDownload size={18} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-mine-shaft-700 bg-mine-shaft-900/30 px-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mine-shaft-800 text-mine-shaft-500">
                <IconFile size={22} stroke={1.5} />
              </div>
              <p className="text-sm text-mine-shaft-400">
                No resume uploaded.{" "}
                <span className="text-bright-sun-400">Click the edit button</span> to upload one.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Resume;
