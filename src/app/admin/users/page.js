"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HR_USERS } from "@/lib/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Users, Activity, Building2, Settings,
  LogOut, Shield, Search, Plus,
  Edit, Trash2, Eye, X, Check, Menu
} from "lucide-react";

// ─── SIDEBAR ─────────────────────────────────────
const NAV = [
  { label:"Dashboard",     icon: Activity,  href:"/admin/dashboard" },
  { label:"HR Users",      icon: Users,     href:"/admin/users"     },
  { label:"Organizations", icon: Building2, href:"/admin/orgs"      },
  { label:"Settings",      icon: Settings,  href:"/admin/settings"  },
];

export default function AdminUsers() {
  const router = useRouter();
  const [admin, setAdmin]                 = useState(null);
  const [users, setUsers]                 = useState(HR_USERS);
  const [search, setSearch]               = useState("");
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [successMsg, setSuccessMsg]       = useState("");
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const [newUser, setNewUser] = useState({
    name: "", email: "", userId: "",
    role: "HR Viewer", org: "ASSISTLANA", status: "Active"
  });

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) router.push("/admin/login");
    else setAdmin(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.userId.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.userId) return;
    const created = {
      ...newUser,
      id: users.length + 1,
      lastLogin: "Never"
    };
    setUsers(prev => [...prev, created]);
    setShowAddModal(false);
    setNewUser({ name:"", email:"", userId:"", role:"HR Viewer", org:"ASSISTLANA", status:"Active" });
    setSuccessMsg("✅ User added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setSuccessMsg("✅ User deleted successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleToggleStatus = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id
        ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
        : u
    ));
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">

      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-[#0B1D3A] rounded-xl flex items-center justify-center text-white shadow-lg">
        <Menu size={20}/>
      </button>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-30"/>
      )}

      {/* ── SIDEBAR ── */}
      <div className={`w-64 md:w-56 bg-[#0B1D3A] min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0EA5C9] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
              A
            </div>
            <div>
              <div className="text-white font-bold text-sm">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs">Admin Portal</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/60 hover:text-white">
            <X size={18}/>
          </button>
        </div>
        <nav className="flex-1 p-4">
          <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-3 px-2">
            Main Menu
          </div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === "HR Users";
            return (
              <button
                key={item.label}
                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0EA5C9]/20 text-[#0EA5C9] border border-[#0EA5C9]/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16}/>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#1253A4] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {admin?.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{admin?.name}</div>
              <div className="text-white/40 text-xs truncate">{admin?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
          >
            <LogOut size={14}/>
            Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-0">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="text-base md:text-lg font-bold text-[#1E293B] truncate">HR Users Management</div>
              <div className="text-xs text-slate-400 hidden sm:block">Add, edit and manage all HR team members</div>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 md:justify-end">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-3 py-2 flex-shrink-0">
              <Search size={14} className="text-slate-400"/>
              <input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none text-slate-600 w-28 md:w-40"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#1253A4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all flex-shrink-0 whitespace-nowrap"
            >
              <Plus size={16}/>
              Add User
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <Check size={16}/>
              {successMsg}
            </div>
          )}

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              { label:"Total Users",    value: users.length,                                color:"#1253A4", bg:"#EFF6FF" },
              { label:"Active Users",   value: users.filter(u=>u.status==="Active").length,  color:"#10B981", bg:"#F0FDF4" },
              { label:"HR Managers",    value: users.filter(u=>u.role==="HR Manager").length, color:"#8B5CF6", bg:"#F5F3FF" },
              { label:"Inactive Users", value: users.filter(u=>u.status==="Inactive").length, color:"#EF4444", bg:"#FFF1F2" },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 md:p-5">
                <div className="text-xs md:text-sm text-slate-500 mb-1 md:mb-2">{s.label}</div>
                <div className="text-xl md:text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── MOBILE: User Cards ── */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-[#1E293B] text-sm">👥 All HR Users</div>
              <span className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-full font-semibold">
                {filtered.length} users
              </span>
            </div>
            {filtered.map((user, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#1253A4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1E293B] truncate">{user.name}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-mono bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg">
                    {user.userId}
                  </span>
                  <span className="text-xs text-slate-500">{user.org}</span>
                  <StatusBadge status={user.role}/>
                  <StatusBadge status={user.status}/>
                </div>
                <div className="text-xs text-slate-400 mb-3">Last login: {user.lastLogin}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 p-2 bg-[#EFF6FF] text-[#1253A4] rounded-lg text-xs font-semibold">
                    <Eye size={13}/> View
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-lg text-xs font-semibold ${
                      user.status === "Active"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-green-50 text-green-600"
                    }`}>
                    <Edit size={13}/> {user.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-[#E2E8F0]">
                <Users size={40} className="mx-auto mb-3 opacity-30"/>
                <div className="font-semibold">No users found</div>
                <div className="text-sm">Try a different search term</div>
              </div>
            )}
          </div>

          {/* ── DESKTOP: Table ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="font-bold text-[#1E293B]">
                👥 All HR Users
                <span className="ml-2 text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-full font-semibold">
                  {filtered.length} users
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {["User","User ID","Organization","Role","Status","Last Login","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => (
                    <tr key={i} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC] transition-all">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1253A4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1E293B]">{user.name}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-mono bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg whitespace-nowrap">
                          {user.userId}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">{user.org}</td>
                      <td className="py-4 px-4"><StatusBadge status={user.role}/></td>
                      <td className="py-4 px-4"><StatusBadge status={user.status}/></td>
                      <td className="py-4 px-4 text-xs text-slate-400">{user.lastLogin}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                            className="p-1.5 bg-[#EFF6FF] text-[#1253A4] rounded-lg hover:bg-[#DBEAFE] transition-all"
                            title="View">
                            <Eye size={14}/>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-all ${
                              user.status === "Active"
                                ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                            title={user.status === "Active" ? "Deactivate" : "Activate"}>
                            <Edit size={14}/>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                            title="Delete">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Users size={40} className="mx-auto mb-3 opacity-30"/>
                <div className="font-semibold">No users found</div>
                <div className="text-sm">Try a different search term</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ADD USER MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg font-bold text-[#1E293B]">Add New HR User</div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20}/>
              </button>
            </div>

            {[
              { label:"Full Name",  key:"name",   type:"text",  placeholder:"e.g. Kavitha Nair"          },
              { label:"Email",      key:"email",  type:"email", placeholder:"e.g. kavitha@assistlana.com" },
              { label:"User ID",    key:"userId", type:"text",  placeholder:"e.g. hr006"                 },
            ].map(field => (
              <div key={field.key} className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-2">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={newUser[field.key]}
                  onChange={e => setNewUser(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all outline-none"
                />
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Role</label>
              <select
                value={newUser.role}
                onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] outline-none"
              >
                <option>HR Manager</option>
                <option>HR Viewer</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Organization</label>
              <select
                value={newUser.org}
                onChange={e => setNewUser(prev => ({ ...prev, org: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] outline-none"
              >
                <option>ASSISTLANA</option>
                <option>TechCorp</option>
                <option>StartupX</option>
                <option>HireHub</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-slate-600 hover:bg-[#F1F5F9] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 py-3 rounded-xl bg-[#1253A4] text-white text-sm font-semibold hover:bg-[#0d47a1] transition-all"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW USER MODAL ── */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg font-bold text-[#1E293B]">User Details</div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20}/>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-[#F8FAFC] rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#1253A4] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {selectedUser.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-[#1E293B] truncate">{selectedUser.name}</div>
                <div className="text-sm text-slate-400 truncate">{selectedUser.email}</div>
              </div>
            </div>

            {[
              { label:"User ID",      value: selectedUser.userId    },
              { label:"Organization", value: selectedUser.org       },
              { label:"Role",         value: selectedUser.role      },
              { label:"Status",       value: selectedUser.status    },
              { label:"Last Login",   value: selectedUser.lastLogin },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[#F1F5F9] last:border-0 gap-2">
                <span className="text-sm text-slate-500">{item.label}</span>
                {item.label === "Role" || item.label === "Status"
                  ? <StatusBadge status={item.value}/>
                  : <span className="text-sm font-semibold text-[#1E293B] text-right truncate">{item.value}</span>
                }
              </div>
            ))}

            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-6 py-3 rounded-xl bg-[#1253A4] text-white text-sm font-semibold hover:bg-[#0d47a1] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}