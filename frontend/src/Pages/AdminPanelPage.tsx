import { Button, Loader, PasswordInput, TextInput } from "@mantine/core";
import { IconActivity, IconBriefcase, IconBuilding, IconChartBar, IconLayoutDashboard, IconLogout, IconSearch, IconShieldCheck, IconUser, IconUsers, IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getAdminCompanies, getAdminProfile, getAdminStats, getAdminUsers, setCompanyBlocked, setUserBlocked, updateAdminProfile, getVerificationRequests, approveCompany, rejectCompany } from "../Services/AdminService";
import { errorNotification, successNotification } from "../Services/NotificationService";
import { removeUser, setUser } from "../Slices/UserSlice";
import type { RootState } from "../Types";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: IconLayoutDashboard },
  { label: "Users", path: "/admin/users", icon: IconUsers },
  { label: "Companies", path: "/admin/companies", icon: IconBuilding },
  { label: "Verifications", path: "/admin/verifications", icon: IconShieldCheck },
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
          {section === "users" ? <AdminUsers /> : section === "companies" ? <AdminCompanies /> : section === "verifications" ? <AdminVerifications /> : section === "profile" ? <AdminProfile /> : <AdminDashboard />}
        </main>
      </div>
    </div>
  );
};

const CenteredLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <Loader size="lg" color="bright-sun.4" />
  </div>
);

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
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getAdminUsers(search).then(setUsers).catch(() => errorNotification("Error", "Failed to load users")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleBlock = (id: number, blocked: boolean) => {
    setUserBlocked(id, blocked).then(load).catch(() => errorNotification("Error", "Failed to update user"));
  };

  return (
    <div className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-semibold text-mine-shaft-50">User Management</div>
        <TextInput placeholder="Search users..." value={search} onChange={(e) => setSearch(e.currentTarget.value)} leftSection={<IconSearch size={16} />} className="w-64" />
      </div>
      {loading ? <CenteredLoader /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-mine-shaft-700 text-mine-shaft-400">
                <th className="py-3 pr-4">ID</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-mine-shaft-800">
                  <td className="py-3 pr-4 text-mine-shaft-300">{u.id}</td>
                  <td className="py-3 pr-4 font-medium text-mine-shaft-50">{u.name}</td>
                  <td className="py-3 pr-4 text-mine-shaft-300">{u.email}</td>
                  <td className="py-3 pr-4"><span className="rounded-full bg-bright-sun-400/10 px-2.5 py-0.5 text-xs font-medium text-bright-sun-400">{u.accountType}</span></td>
                  <td className="py-3 pr-4">{u.blocked ? <span className="text-red-400">Blocked</span> : <span className="text-green-400">Active</span>}</td>
                  <td className="py-3">
                    <Button size="xs" color={u.blocked ? "green" : "red"} variant="light" onClick={() => handleBlock(u.id, !u.blocked)}>
                      {u.blocked ? "Unblock" : "Block"}
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-mine-shaft-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getAdminCompanies(search).then(setCompanies).catch(() => errorNotification("Error", "Failed to load companies")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleBlock = (id: number, blocked: boolean) => {
    setCompanyBlocked(id, blocked).then(load).catch(() => errorNotification("Error", "Failed to update company"));
  };

  return (
    <div className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-semibold text-mine-shaft-50">Company Management</div>
        <TextInput placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.currentTarget.value)} leftSection={<IconSearch size={16} />} className="w-64" />
      </div>
      {loading ? <CenteredLoader /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-mine-shaft-700 text-mine-shaft-400">
                <th className="py-3 pr-4">ID</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Company</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c: any) => (
                <tr key={c.id} className="border-b border-mine-shaft-800">
                  <td className="py-3 pr-4 text-mine-shaft-300">{c.id}</td>
                  <td className="py-3 pr-4 font-medium text-mine-shaft-50">{c.name}</td>
                  <td className="py-3 pr-4 text-mine-shaft-300">{c.email}</td>
                  <td className="py-3 pr-4 text-mine-shaft-300">{c.company || "-"}</td>
                  <td className="py-3 pr-4">{c.blocked ? <span className="text-red-400">Blocked</span> : <span className="text-green-400">Active</span>}</td>
                  <td className="py-3">
                    <Button size="xs" color={c.blocked ? "green" : "red"} variant="light" onClick={() => handleBlock(c.id, !c.blocked)}>
                      {c.blocked ? "Unblock" : "Block"}
                    </Button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-mine-shaft-500">No companies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminVerifications = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  const load = () => {
    setLoading(true);
    getVerificationRequests(filter).then(setRequests).catch(() => errorNotification("Error", "Failed to load verification requests")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = (id: number) => {
    approveCompany(id).then(() => { successNotification("Approved", "Company has been approved."); load(); }).catch(() => errorNotification("Error", "Failed to approve company"));
  };

  const handleReject = (id: number) => {
    rejectCompany(id).then(() => { successNotification("Rejected", "Company has been rejected."); load(); }).catch(() => errorNotification("Error", "Failed to reject company"));
  };

  const tabs = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-semibold text-mine-shaft-50">Company Verification Requests</div>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button key={tab.value} size="xs" variant={filter === tab.value ? "filled" : "outline"} color="bright-sun.4" onClick={() => setFilter(tab.value)}>
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      {loading ? <CenteredLoader /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-mine-shaft-700 text-mine-shaft-400">
                <th className="py-3 pr-4">ID</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Company</th>
                <th className="py-3 pr-4">Industry</th>
                <th className="py-3 pr-4">Location</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r: any) => (
                <tr key={r.id} className="border-b border-mine-shaft-800">
                  <td className="py-3 pr-4 text-mine-shaft-300">{r.id}</td>
                  <td className="py-3 pr-4 font-medium text-mine-shaft-50">{r.name}</td>
                  <td className="py-3 pr-4 text-mine-shaft-300">{r.email}</td>
                  <td className="py-3 pr-4 text-mine-shaft-300">{r.company || "-"}</td>
                  <td className="py-3 pr-4 text-mine-shaft-300">{r.industry || "-"}</td>
                  <td className="py-3 pr-4 text-mine-shaft-300">{r.location || "-"}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.companyStatus === "APPROVED" ? "bg-green-400/10 text-green-400" :
                      r.companyStatus === "REJECTED" ? "bg-red-400/10 text-red-400" :
                      "bg-yellow-400/10 text-yellow-400"
                    }`}>
                      {r.companyStatus || "PENDING"}
                    </span>
                  </td>
                  <td className="py-3">
                    {r.companyStatus === "PENDING" ? (
                      <div className="flex gap-2">
                        <Button size="xs" color="green" variant="light" leftSection={<IconCheck size={14} />} onClick={() => handleApprove(r.id)}>Approve</Button>
                        <Button size="xs" color="red" variant="light" leftSection={<IconX size={14} />} onClick={() => handleReject(r.id)}>Reject</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-mine-shaft-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-mine-shaft-500">No {filter.toLowerCase()} verification requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminProfile = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    getAdminProfile().then((data: any) => { setProfile(data); setName(data.name || ""); }).catch(() => errorNotification("Error", "Failed to load profile"));
  }, []);

  const handleSave = () => {
    if (!profile) return;
    updateAdminProfile({ ...profile, name, password: password || undefined }).then(() => {
      successNotification("Profile updated", "Your admin profile has been saved.");
      dispatch(setUser({ ...user, name }));
      setEdit(false);
      setPassword("");
    }).catch(() => errorNotification("Error", "Failed to update profile"));
  };

  return (
    <div className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-semibold text-mine-shaft-50">Admin Profile</div>
        {!edit && <Button size="xs" variant="light" onClick={() => setEdit(true)} leftSection={<IconUser size={14} />}>Edit</Button>}
      </div>
      {edit ? (
        <div className="flex max-w-md flex-col gap-4">
          <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <PasswordInput label="New Password (leave blank to keep current)" value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
          <div className="flex gap-3">
            <Button onClick={handleSave} color="bright-sun.4">Save</Button>
            <Button variant="light" color="gray" onClick={() => { setEdit(false); setName(profile?.name || ""); setPassword(""); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex max-w-md flex-col gap-3">
          <div><span className="text-sm text-mine-shaft-400">Name:</span> <span className="text-mine-shaft-50">{profile?.name || "-"}</span></div>
          <div><span className="text-sm text-mine-shaft-400">Email:</span> <span className="text-mine-shaft-50">{profile?.email || "-"}</span></div>
          <div><span className="text-sm text-mine-shaft-400">Role:</span> <span className="rounded-full bg-bright-sun-400/10 px-2.5 py-0.5 text-xs font-medium text-bright-sun-400">ADMIN</span></div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
