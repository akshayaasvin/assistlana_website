"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HR_USERS } from "@/lib/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Users, Activity, Building2, Settings,
  LogOut, Shield, Search, Plus,
  Edit, Trash2, Eye, X, Check
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
  const [admin, setAdmin]           = useState(null);
  const [users, setUsers]           = useState(HR_USERS);
  const [search, setSearch]         = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser]  = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // New user form state
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

  // Filter users by search
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.userId.toLowerCase().includes(search.toLowerCase())
  );

  // Add new user
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

  // Delete user
  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setSuccessMsg("✅ User deleted successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Toggle status
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

      {/* ── SIDEBAR ── */}
      <div className="w-56 bg-[#0B1D3A] min-h-screen flex flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0EA5C9] rounded-xl flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <div className="text-white font-bold text-sm">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs">Admin Portal</div>
            </div>
          </div>
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
                onClick={() => router.push(item.href)}
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
            <div className="w-8 h-8 bg-[#1253A4] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {admin?.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div className="text-white text-xs font-semibold">{admin?.name}</div>
              <div className="text-white/40 text-xs">{admin?.role}</div>
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
      <div className="ml-56 flex-1">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-lg font-bold text-[#1E293B]">HR Users Management</div>
            <div className="text-xs text-slate-400">Add, edit and manage all HR team members</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-4 py-2">
              <Search size={14} className="text-slate-400"/>
              <input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none text-slate-600 w-40"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#1253A4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all"
            >
              <Plus size={16}/>
              Add User
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <Check size={16}/>
              {successMsg}
            </div>
          )}

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label:"Total Users",    value: users.length,                                color:"#1253A4", bg:"#EFF6FF" },
              { label:"Active Users",   value: users.filter(u=>u.status==="Active").length,  color:"#10B981", bg:"#F0FDF4" },
              { label:"HR Managers",    value: users.filter(u=>u.role==="HR Manager").length, color:"#8B5CF6", bg:"#F5F3FF" },
              { label:"Inactive Users", value: users.filter(u=>u.status==="Inactive").length, color:"#EF4444", bg:"#FFF1F2" },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <div className="text-sm text-slate-500 mb-2">{s.label}</div>
                <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── USERS TABLE ── */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="font-bold text-[#1E293B]">
                👥 All HR Users
                <span className="ml-2 text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-full font-semibold">
                  {filtered.length} users
                </span>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  {["User","User ID","Organization","Role","Status","Last Login","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={i} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC] transition-all">

                    {/* Name + Email */}
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

                    {/* User ID */}
                    <td className="py-4 px-4">
                      <span className="text-xs font-mono bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg">
                        {user.userId}
                      </span>
                    </td>

                    {/* Org */}
                    <td className="py-4 px-4 text-sm text-slate-600">{user.org}</td>

                    {/* Role */}
                    <td className="py-4 px-4"><StatusBadge status={user.role}/></td>

                    {/* Status */}
                    <td className="py-4 px-4"><StatusBadge status={user.status}/></td>

                    {/* Last Login */}
                    <td className="py-4 px-4 text-xs text-slate-400">{user.lastLogin}</td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">

                        {/* View */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                          className="p-1.5 bg-[#EFF6FF] text-[#1253A4] rounded-lg hover:bg-[#DBEAFE] transition-all"
                          title="View"
                        >
                          <Eye size={14}/>
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            user.status === "Active"
                              ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                          title={user.status === "Active" ? "Deactivate" : "Activate"}
                        >
                          <Edit size={14}/>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14}/>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg font-bold text-[#1E293B]">Add New HR User</div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20}/>
              </button>
            </div>

            {/* Form Fields */}
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

            {/* Role Select */}
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

            {/* Organization Select */}
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

            {/* Buttons */}
            <div className="flex gap-3">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg font-bold text-[#1E293B]">User Details</div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20}/>
              </button>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-[#F8FAFC] rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#1253A4] flex items-center justify-center text-white text-lg font-bold">
                {selectedUser.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div className="text-lg font-bold text-[#1E293B]">{selectedUser.name}</div>
                <div className="text-sm text-slate-400">{selectedUser.email}</div>
              </div>
            </div>

            {/* Details */}
            {[
              { label:"User ID",      value: selectedUser.userId    },
              { label:"Organization", value: selectedUser.org       },
              { label:"Role",         value: selectedUser.role      },
              { label:"Status",       value: selectedUser.status    },
              { label:"Last Login",   value: selectedUser.lastLogin },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[#F1F5F9] last:border-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                {item.label === "Role" || item.label === "Status"
                  ? <StatusBadge status={item.value}/>
                  : <span className="text-sm font-semibold text-[#1E293B]">{item.value}</span>
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