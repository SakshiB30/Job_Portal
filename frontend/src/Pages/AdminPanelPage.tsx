import { Button, Loader, PasswordInput, TextInput } from "@mantine/core";
import { IconActivity, IconBriefcase, IconBuilding, IconChartBar, IconLayoutDashboard, IconLogout, IconSearch, IconShieldCheck, IconUser, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getAdminCompanies, getAdminProfile, getAdminStats, getAdminUsers, setCompanyBlocked, setUserBlocked, updateAdminProfile } from "../Services/AdminService";
import { errorNotification, successNotification } from "../Services/NotificationService";
import { removeUser, setUser } from "../Slices/UserSlice";
import type { RootState } from "../Types";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: IconLayoutDashboard },
  { label: "Users", path: "/admin/users", icon: IconUsers },
  { label: "Companies", path: "/admin/companies", icon: IconBuilding },
  { label: "Profile", path: "/admin/profile", icon: IconUser },
];

const AdminPanelPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const section = location.pathname.split("/")[2] || "dashboard";

  if (!user || user.accountType !== "ADMIN") return <Navigate to="/admin-login" replace />;

  const logout = () => {
    localStorage.removeItem("token");
    dispatch(removeUser());
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-mine-shaft-950 px-4 py-5 font-['poppins'] text-mine-shaft-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[17rem_1fr]">
        <aside className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-4 shadow-2xl shadow-black/20 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <div className="mb-7 flex items-center gap-3 rounded-md bg-mine-shaft-950 p-3 text-bright-sun-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bright-sun-400 text-mine-shaft-950">
              <IconShieldCheck size={24} />
            </div>
            <div>
              <div className="text-lg font-semibold text-mine-shaft-50">JobNexus</div>
              <div className="text-xs text-mine-shaft-400">Admin Console</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return <Link key={item.path} to={item.path} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${active ? "bg-bright-sun-400 text-mine-shaft-950" : "text-mine-shaft-200 hover:bg-mine-shaft-800"}`}><Icon size={18} />{item.label}</Link>;
            })}
          </div>
        </aside>
        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-4 shadow-xl shadow-black/10">
            <div>
              <div className="text-sm text-mine-shaft-400">Admin workspace</div>
              <div className="text-xl font-semibold text-mine-shaft-50">{user.name || user.email}</div>
            </div>
            <Button leftSection={<IconLogout size={16} />} variant="light" color="red" onClick={logout}>Logout</Button>
          </div>
          {section === "users" ? <AdminUsers /> : section === "companies" ? <AdminCompanies /> : section === "profile" ? <AdminProfile /> : <AdminDashboard />}
        </main>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => errorNotification("Unable to load dashboard", "Please try again.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <CenteredLoader />;
  const cards = [
    ["Job Seekers", stats?.totalUsers, IconUsers, "Registered candidates"],
    ["Companies", stats?.totalCompanies, IconBuilding, "Hiring accounts"],
    ["Jobs Posted", stats?.totalJobs, IconBriefcase, "Total job listings"],
    ["Applications", stats?.totalApplications, IconChartBar, "Submitted applications"],
  ];
  const totalJobStates = Math.max((stats?.activeJobs || 0) + (stats?.inactiveJobs || 0), 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-lg border border-mine-shaft-800 bg-mine-shaft-900">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-mine-shaft-950 p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-bright-sun-400/30 bg-bright-sun-400/10 px-3 py-1 text-xs font-semibold text-bright-sun-400">
              <IconActivity size={14} />
              Live platform overview
            </div>
            <div className="mt-4 text-3xl font-semibold text-mine-shaft-50">Admin Dashboard</div>
            <div className="mt-2 max-w-2xl text-sm leading-6 text-mine-shaft-300">Monitor users, companies, jobs, and applications from one protected workspace.</div>
          </div>
          <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 px-5 py-4 text-right">
            <div className="text-xs uppercase tracking-wider text-mine-shaft-400">Active job ratio</div>
            <div className="mt-1 text-3xl font-semibold text-bright-sun-400">{Math.round(((stats?.activeJobs || 0) / totalJobStates) * 100)}%</div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, hint]: any) => (
          <div key={label} className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 shadow-xl shadow-black/10 transition hover:border-bright-sun-400/40">
            <div className="flex items-center justify-between">
              <div className="text-sm text-mine-shaft-400">{label}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bright-sun-400/10 text-bright-sun-400">
                <Icon size={22} />
              </div>
            </div>
            <div className="mt-4 text-4xl font-semibold text-mine-shaft-50">{value ?? 0}</div>
            <div className="mt-2 text-xs text-mine-shaft-400">{hint}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-mine-shaft-50">Job Health</div>
              <div className="text-sm text-mine-shaft-400">Active vs inactive listings</div>
            </div>
            <IconBriefcase className="text-bright-sun-400" size={24} />
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-mine-shaft-800">
            <div className="h-full rounded-full bg-bright-sun-400" style={{ width: `${((stats?.activeJobs || 0) / totalJobStates) * 100}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-mine-shaft-950 p-4"><div className="text-2xl font-semibold text-green-300">{stats?.activeJobs || 0}</div><div className="text-xs text-mine-shaft-400">Active jobs</div></div>
            <div className="rounded-md bg-mine-shaft-950 p-4"><div className="text-2xl font-semibold text-red-300">{stats?.inactiveJobs || 0}</div><div className="text-xs text-mine-shaft-400">Inactive jobs</div></div>
          </div>
        </div>
        <div className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 shadow-xl shadow-black/10">
          <div className="mb-4 font-semibold text-mine-shaft-50">Recent Registrations</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <RecentList title="Job seekers" rows={stats?.recentUsers || []} empty="No recent users" />
            <RecentList title="Companies" rows={stats?.recentCompanies || []} empty="No recent companies" />
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentList = ({ title, rows, empty }: { title: string; rows: any[]; empty: string }) => (
  <div className="rounded-md bg-mine-shaft-950 p-3">
    <div className="mb-2 text-sm font-semibold text-mine-shaft-200">{title}</div>
    <div className="flex flex-col gap-2">
      {rows.length ? rows.slice(0, 4).map((row) => (
        <div key={row.id || row.email} className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-3">
          <div className="truncate text-sm font-medium text-mine-shaft-50">{row.company || row.name || "Unnamed"}</div>
          <div className="truncate text-xs text-mine-shaft-400">{row.email}</div>
        </div>
      )) : <div className="py-6 text-center text-sm text-mine-shaft-400">{empty}</div>}
    </div>
  </div>
);

const AdminUsers = () => <AdminTable type="users" />;
const AdminCompanies = () => <AdminTable type="companies" />;

const AdminTable = ({ type }: { type: "users" | "companies" }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const isCompany = type === "companies";
  const load = () => {
    setLoading(true);
    (isCompany ? getAdminCompanies(search) : getAdminUsers(search)).then(setRows).catch(() => errorNotification("Load failed", "Could not fetch records.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggle = async (row: any) => {
    const blocked = !row.blocked;
    if (!window.confirm(`${blocked ? "Block" : "Unblock"} ${row.name || row.email}?`)) return;
    const updated = isCompany ? await setCompanyBlocked(row.id, blocked) : await setUserBlocked(row.id, blocked);
    setRows((current) => current.map((item) => item.id === updated.id ? updated : item));
    successNotification(blocked ? "Account blocked" : "Account unblocked", "The change is active immediately.");
  };

  const filteredTitle = isCompany ? "Manage Companies" : "Manage Job Seekers";
  return (
    <div className="rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xl font-semibold">{filteredTitle}</div>
        <div className="flex gap-2"><TextInput placeholder="Search" leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} /><Button onClick={load}>Search</Button></div>
      </div>
      {loading ? <CenteredLoader /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-mine-shaft-400"><tr><th className="p-3">Name</th><th className="p-3">Email</th>{isCompany && <th className="p-3">Company</th>}<th className="p-3">{isCompany ? "Jobs" : "Applications"}</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-mine-shaft-800"><td className="p-3 font-medium">{row.name}</td><td className="p-3 text-mine-shaft-300">{row.email}</td>{isCompany && <td className="p-3 text-mine-shaft-300">{row.company || "-"}</td>}<td className="p-3">{isCompany ? row.jobsPostedCount : row.appliedJobsCount}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${row.blocked ? "bg-red-500/15 text-red-300" : "bg-green-500/15 text-green-300"}`}>{row.blocked ? "Blocked" : "Active"}</span></td><td className="p-3 text-right"><Button size="xs" variant="light" color={row.blocked ? "green" : "red"} onClick={() => toggle(row)}>{row.blocked ? "Unblock" : "Block"}</Button></td></tr>)}</tbody></table>{!rows.length && <div className="py-8 text-center text-mine-shaft-400">No records found.</div>}</div>}
    </div>
  );
};

const AdminProfile = () => {
  const dispatch = useDispatch();
  const [profile, setProfileData] = useState<any>({});
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminProfile().then(setProfileData).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const updated = await updateAdminProfile({ ...profile, password });
    dispatch(setUser(updated));
    setPassword("");
    successNotification("Profile updated", "Admin details saved.");
  };

  if (loading) return <CenteredLoader />;
  return <div className="max-w-2xl rounded-md border border-mine-shaft-800 bg-mine-shaft-900 p-5"><div className="mb-4 text-xl font-semibold">Admin Profile</div><div className="grid gap-4"><TextInput label="Name" value={profile.name || ""} onChange={(e) => setProfileData({ ...profile, name: e.target.value })} /><TextInput label="Email" value={profile.email || ""} disabled /><PasswordInput label="New password" value={password} onChange={(e) => setPassword(e.target.value)} /><Button className="w-fit" onClick={save}>Save Changes</Button></div></div>;
};

const CenteredLoader = () => <div className="flex min-h-60 items-center justify-center"><Loader color="brightSun.4" /></div>;

export default AdminPanelPage;
