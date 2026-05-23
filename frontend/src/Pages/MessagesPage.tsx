import { ActionIcon, Avatar, Badge, TextInput } from "@mantine/core";
import {
  IconArchive,
  IconBriefcase,
  IconCheck,
  IconMailCheck,
  IconMessageCircle,
  IconSearch,
  IconUserCircle,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getItem, setItem } from "../Services/LocalStorageService";
import { isCompany } from "../Services/RoleService";
import type { RootState } from "../Types";

type NotificationItem = {
  id: string;
  from: "system" | "company" | "student";
  text: string;
  time: string;
};

type NotificationThread = {
  id: string;
  participant: string;
  role: string;
  subject: string;
  status: "unread" | "read" | "archived";
  avatar: string;
  items: NotificationItem[];
};

const getStorageKey = (userId?: string | number, role?: string) => `messageThreads:${role || "guest"}:${userId || "guest"}`;

const normalizeSavedThreads = (threads: any[]): NotificationThread[] =>
  threads.map((thread) => ({
    id: thread.id,
    participant: thread.participant,
    role: thread.role,
    subject: thread.subject,
    status: thread.status,
    avatar: thread.avatar,
    items: thread.items || (thread.messages || []).map((message: any) => ({
      id: message.id,
      from: message.from === "me" ? "company" : "system",
      text: message.text,
      time: message.time,
    })),
  }));

const createSeeds = (companyRole: boolean, displayName: string): NotificationThread[] => companyRole ? [
  {
    id: "process-jarrod",
    participant: "Jarrod Wood",
    role: "Software Engineer",
    subject: "Selection email sent",
    status: "unread",
    avatar: "/A1.png",
    items: [
      { id: "1", from: "company", text: "Technical interview selection email was sent to Jarrod Wood.", time: "Today, 10:36 AM" },
      { id: "2", from: "system", text: "Use Find Students cards to send process emails. Direct chat is disabled.", time: "Today, 10:37 AM" },
    ],
  },
  {
    id: "process-alice",
    participant: "Alice Johnson",
    role: "Frontend Developer",
    subject: "Application reviewed",
    status: "read",
    avatar: "/A2.png",
    items: [
      { id: "1", from: "system", text: "Alice Johnson was shortlisted for review. Send a next-round email from the student card when ready.", time: "Yesterday, 4:18 PM" },
    ],
  },
] : [
  {
    id: "update-google",
    participant: "Google Hiring Team",
    role: "Company",
    subject: "Selected for next round",
    status: "unread",
    avatar: "/Icons/Google.png",
    items: [
      { id: "1", from: "company", text: `Hi ${displayName}, congratulations. You are selected for the technical interview round.`, time: "Today, 9:15 AM" },
      { id: "2", from: "system", text: "This is a process update. Direct replies to companies are disabled in JobHook.", time: "Today, 9:16 AM" },
    ],
  },
  {
    id: "update-microsoft",
    participant: "Microsoft Careers",
    role: "Company",
    subject: "Application received",
    status: "read",
    avatar: "/Icons/Microsoft.png",
    items: [
      { id: "1", from: "company", text: "Your application has been received. You will be notified when the hiring team has an update.", time: "Mon, 2:05 PM" },
    ],
  },
];

const MessagesPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const companyRole = isCompany(user);
  const displayName = companyRole ? profile?.company || user?.name || "Company" : user?.name || "Student";
  const storageKey = getStorageKey(user?.id, user?.accountType);
  const initialThreads = useMemo(() => {
    const saved = getItem(storageKey);
    return Array.isArray(saved) && saved.length ? normalizeSavedThreads(saved) : createSeeds(companyRole, displayName);
  }, [companyRole, displayName, storageKey]);
  const [threads, setThreads] = useState<NotificationThread[]>(initialThreads);
  const [activeId, setActiveId] = useState(initialThreads[0]?.id || "");
  const [query, setQuery] = useState("");

  if (!user) return <Navigate to="/login" replace />;

  const persist = (nextThreads: NotificationThread[]) => {
    setThreads(nextThreads);
    setItem(storageKey, nextThreads);
  };

  const activeThread = threads.find((thread) => thread.id === activeId) || threads[0];
  const visibleThreads = threads.filter((thread) => {
    const search = query.toLowerCase();
    return thread.status !== "archived" && (
      thread.participant.toLowerCase().includes(search) ||
      thread.subject.toLowerCase().includes(search) ||
      thread.role.toLowerCase().includes(search)
    );
  });
  const unreadCount = threads.filter((thread) => thread.status === "unread").length;

  const selectThread = (id: string) => {
    setActiveId(id);
    persist(threads.map((thread) => thread.id === id ? { ...thread, status: "read" } : thread));
  };

  const archiveThread = () => {
    if (!activeThread) return;
    const nextThreads = threads.map((thread) => thread.id === activeThread.id ? { ...thread, status: "archived" as const } : thread);
    persist(nextThreads);
    setActiveId(nextThreads.find((thread) => thread.status !== "archived")?.id || "");
  };

  return (
    <div className="min-h-screen bg-mine-shaft-950 px-4 py-6 font-['poppins'] text-mine-shaft-100 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="flex flex-col justify-between gap-4 border-b border-mine-shaft-800 pb-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-3xl font-semibold">
              <IconMessageCircle className="text-bright-sun-400" />
              Messages
            </div>
            <div className="mt-1 text-sm text-mine-shaft-300">
              {companyRole ? "Process email history and candidate status notifications. Direct student chat is disabled." : "Company process updates and application notifications. Direct company chat is disabled."}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 px-4 py-3">
              <div className="text-lg font-semibold text-bright-sun-400">{threads.filter((thread) => thread.status !== "archived").length}</div>
              <div className="text-xs text-mine-shaft-300">Updates</div>
            </div>
            <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 px-4 py-3">
              <div className="text-lg font-semibold text-bright-sun-400">{unreadCount}</div>
              <div className="text-xs text-mine-shaft-300">Unread</div>
            </div>
          </div>
        </div>

        <div className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-md border border-mine-shaft-800 bg-mine-shaft-900/40 lg:grid-cols-[360px_1fr]">
          <aside className="border-b border-mine-shaft-800 bg-mine-shaft-900/60 p-4 lg:border-b-0 lg:border-r">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              placeholder="Search updates"
            />
            <div className="mt-4 flex flex-col gap-2">
              {visibleThreads.length ? visibleThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => selectThread(thread.id)}
                  className={`w-full rounded-md border p-3 text-left transition ${activeThread?.id === thread.id ? "border-bright-sun-400 bg-bright-sun-400/10" : "border-mine-shaft-800 bg-mine-shaft-950/50 hover:border-mine-shaft-700"}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={thread.avatar} radius="xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate font-semibold">{thread.participant}</div>
                        {thread.status === "unread" && <Badge size="xs" color="brightSun.4">New</Badge>}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-mine-shaft-300">
                        {companyRole ? <IconUserCircle size={14} /> : <IconBriefcase size={14} />}
                        {thread.role}
                      </div>
                      <div className="mt-2 truncate text-sm text-mine-shaft-200">{thread.subject}</div>
                      <div className="mt-1 truncate text-xs text-mine-shaft-400">{thread.items.at(-1)?.text}</div>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="rounded-md border border-dashed border-mine-shaft-700 p-6 text-center text-sm text-mine-shaft-300">No updates found.</div>
              )}
            </div>
          </aside>

          <section className="flex min-h-[620px] flex-col">
            {activeThread ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-mine-shaft-800 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={activeThread.avatar} radius="xl" size="lg" />
                    <div className="min-w-0">
                      <div className="truncate text-xl font-semibold">{activeThread.participant}</div>
                      <div className="truncate text-sm text-mine-shaft-300">{activeThread.subject}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ActionIcon variant="light" color="brightSun.4" onClick={() => selectThread(activeThread.id)} aria-label="Mark as read">
                      <IconCheck size={18} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red.7" onClick={archiveThread} aria-label="Archive">
                      <IconArchive size={18} />
                    </ActionIcon>
                  </div>
                </div>
                <div className="border-b border-mine-shaft-800 bg-mine-shaft-950/40 px-4 py-3 text-sm text-mine-shaft-300">
                  <IconMailCheck className="mr-2 inline-block text-bright-sun-400" size={18} />
                  {companyRole ? "To contact students, use process emails from Find Students or applicant pipeline actions." : "Students receive process updates here. Direct replies to companies are not available."}
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                  {activeThread.items.map((item) => (
                    <div key={item.id} className="flex justify-start">
                      <div className="max-w-[82%] rounded-md border border-mine-shaft-800 bg-mine-shaft-900 px-4 py-3">
                        <div className="mb-2 text-xs font-semibold uppercase text-bright-sun-400">
                          {item.from === "company" ? "Process Email" : item.from === "student" ? "Student Update" : "System Update"}
                        </div>
                        <div className="text-sm text-mine-shaft-100">{item.text}</div>
                        <div className="mt-2 text-right text-[11px] text-mine-shaft-400">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-mine-shaft-300">
                Select an update to view details.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
