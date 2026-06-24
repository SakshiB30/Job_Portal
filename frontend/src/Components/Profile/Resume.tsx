import { ActionIcon, Collapse, FileButton, Loader, Modal, Tooltip } from "@mantine/core"
import { IconCheck, IconDownload, IconFile, IconPencil, IconTrash, IconUpload, IconX, IconEye, IconEyeOff, IconArrowsMaximize } from "@tabler/icons-react"
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
  const [showPreview, setShowPreview] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [modalBlobUrl, setModalBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isPdfPreview, setIsPdfPreview] = useState(false);
  const [isPdfModal, setIsPdfModal] = useState(false);
  const profile = useSelector((state: RootState) => state.profile);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const resetRef = useRef<() => void>(null);

  const hasResume = !!profile?.resume;

  const decodeBase64ToBytes = (base64: string): Uint8Array => {
    const raw = base64.startsWith("data:") ? base64.split(",")[1] : base64;
    const byteChars = atob(raw);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      bytes[i] = byteChars.charCodeAt(i);
    }
    return bytes;
  };

  const detectMimeType = (bytes: Uint8Array): { mime: string; ext: string } => {
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { mime: "application/pdf", ext: "pdf" };
    }
    if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
      return { mime: "application/msword", ext: "doc" };
    }
    if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
      return { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" };
    }
    return { mime: "application/pdf", ext: "pdf" };
  };

  const getResumeBlobUrl = (base64: string): string => {
    const bytes = decodeBase64ToBytes(base64);
    const { mime } = detectMimeType(bytes);
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  };

  const togglePreview = () => {
    if (showPreview) {
      if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); setPreviewBlobUrl(null); }
      setShowPreview(false);
    } else {
      if (profile?.resume) {
        const bytes = decodeBase64ToBytes(profile.resume);
        const { mime } = detectMimeType(bytes);
        const pdf = mime === "application/pdf";
        if (pdf) {
          setPreviewBlobUrl(getResumeBlobUrl(profile.resume));
          setPreviewLoading(true);
        }
        setIsPdfPreview(pdf);
        setShowPreview(true);
      }
    }
  };

  const openModal = () => {
    if (profile?.resume) {
      const bytes = decodeBase64ToBytes(profile.resume);
      const { mime } = detectMimeType(bytes);        const pdf = mime === "application/pdf";
        if (pdf) {
          setModalBlobUrl(getResumeBlobUrl(profile.resume));
          setModalLoading(true);
        }
        setIsPdfModal(pdf);
        setModalOpen(true);
    }
  };

  const closeModal = () => {
    if (modalBlobUrl) { URL.revokeObjectURL(modalBlobUrl); setModalBlobUrl(null); }
    setModalOpen(false);
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
    const bytes = decodeBase64ToBytes(profile.resume);
    const { mime, ext } = detectMimeType(bytes);
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${user?.name || "resume"}_Resume.${ext}`;
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
                accept="application/pdf"
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
            </p>                <p className="text-xs text-mine-shaft-500">PDF format only</p>
          </div>
          <FileButton
            onChange={handleSaveResume}
            accept="application/pdf"
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
            <div>
              {/* Header bar */}
              <div className="flex items-center gap-3 rounded-t-lg border border-mine-shaft-700 bg-mine-shaft-900/60 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bright-sun-400/15 text-bright-sun-400">
                  <IconFile size={22} stroke={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-mine-shaft-200 truncate">
                    {user?.name || "Your"}_Resume
                  </p>
                  <p className="text-xs text-mine-shaft-400">PDF</p>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip label={showPreview ? "Hide preview" : "Show preview"} withArrow>
                    <ActionIcon onClick={togglePreview} variant="subtle" color="brightSun.4" size="md">
                      {showPreview ? <IconEyeOff size={18} stroke={1.5} /> : <IconEye size={18} stroke={1.5} />}
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Fullscreen view" withArrow>
                    <ActionIcon onClick={openModal} variant="subtle" color="brightSun.4" size="md">
                      <IconArrowsMaximize size={18} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
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
              </div>

              {/* Collapsible iframe preview */}
              <Collapse in={showPreview}>
                <div className="relative rounded-b-lg border-x border-b border-mine-shaft-700 overflow-hidden bg-mine-shaft-950">
                  {previewLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-mine-shaft-950 z-10">
                      <Loader color="brightSun.4" size="lg" />
                    </div>
                  )}
                  {isPdfPreview && previewBlobUrl && (
                    <iframe
                      src={previewBlobUrl}
                      onLoad={() => setPreviewLoading(false)}
                      className="w-full h-[500px] sm:h-[600px]"
                      title="Resume preview"
                    />
                  )}
                  {!isPdfPreview && !previewLoading && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                      <IconFile size={48} className="text-mine-shaft-500" stroke={1} />
                      <p className="text-sm text-mine-shaft-400">
                        Preview not available for this file format.
                      </p>
                      <p className="text-xs text-mine-shaft-500">
                        Use the download button or fullscreen view to open it.
                      </p>
                    </div>
                  )}
                </div>
              </Collapse>
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

      {/* ── Fullscreen resume modal ── */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={`Resume — ${user?.name || "Your"}`}
        fullScreen
        styles={{ body: { height: "calc(100vh - 80px)" } }}
      >
        <div className="relative w-full h-full">
          {modalLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader color="brightSun.4" size="lg" />
            </div>
          )}
          {isPdfModal && modalBlobUrl && (
            <iframe src={modalBlobUrl} onLoad={() => setModalLoading(false)} className="w-full h-full rounded-md" title="Resume fullscreen" />
          )}
          {!isPdfModal && !modalLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <IconFile size={64} className="text-mine-shaft-500" stroke={1} />
              <p className="text-lg text-mine-shaft-400">
                Preview not available for this file format.
              </p>
              <p className="text-sm text-mine-shaft-500">
                Download the file to view it.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Resume;
