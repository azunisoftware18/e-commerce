"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  LogOut,
  Lock,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import AuthGuard from "@/components/common/AuthGuard";
import {
  useChangePassword,
  useLogout,
  useUpdateProfile,
} from "@/lib/mutations/useAuth";
import { useMe } from "@/lib/queries/useUsers";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: changePassword } = useChangePassword();
  const { mutate: logoutUser } = useLogout();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateProfile(form, {
      onSuccess: () => alert("Profile updated successfully"),
      onError: (err) => alert(err?.response?.data?.message || "Update failed"),
    });
  };

  const handlePasswordUpdate = () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      alert("New passwords do not match");
      return;
    }
    changePassword(passwords, {
      onSuccess: () => {
        alert("Password updated successfully");
        setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      },
      onError: (err) => alert(err?.response?.data?.message || "Error"),
    });
  };

  const handleLogout = () => {
    logoutUser(undefined, { onSuccess: () => router.replace("/login") });
  };

  if (isLoading) return <div className="p-10 text-center min-h-screen font-medium">Loading Dashboard...</div>;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <header className="bg-[#F8FAFC] backdrop-blur-md sticky top-0 z-30 px-6 py-4 ">
          <div className="w-full mx-auto flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-slate-600"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Account Settings</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Personal Dashboard</p>
            </div>
          </div>
        </header>

        <main className="w-full mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT SIDEBAR (Sticky Added Here) --- */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-24 bg-[#2A4150]"></div>
                <div className="px-8 pb-8 -mt-12 text-center">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-white p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-[1.2rem] bg-[#2A4150] text-white flex items-center justify-center text-2xl font-bold shadow-inner">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <h2 className="text-xl font-bold text-slate-800 capitalize">{user?.name}</h2>
                    <div className="flex flex-col items-center gap-1.5 pt-2">
                      <p className="text-sm text-slate-500 flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {user?.email}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {user?.phone || "No Phone Number"}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2 font-medium"><MapPin size={14} className="text-slate-400" /> {user?.location || "Location not set"}</p>
                    </div>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100/50">
                    <ShieldCheck size={14} /> Verified Member
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 p-4 text-slate-400 font-bold text-[11px] bg-white rounded-2xl border border-slate-100 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all uppercase tracking-widest shadow-sm"
              >
                <LogOut size={16} /> Sign Out from Account
              </button>
            </aside>

            {/* --- RIGHT CONTENT AREA --- */}
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                  <p className="text-sm text-slate-400 mt-1">Manage your identity and contact details across the platform.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Full Name</label>
                    <InputField 
                      type="text" name="name" value={form.name} onChange={handleChange} icon={User} 
                      className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:border-[#2A4150] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
                    <InputField 
                      type="email" name="email" value={form.email} onChange={handleChange} icon={Mail} 
                      className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:border-[#2A4150] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Phone Number</label>
                    <InputField 
                      type="tel" name="phone" value={form.phone} onChange={handleChange} icon={Phone} 
                      className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:border-[#2A4150] transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Current Location</label>
                    <InputField 
                      type="text" name="location" value={form.location} onChange={handleChange} icon={MapPin} 
                      className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:border-[#2A4150] transition-all" 
                    />
                  </div>
                </div>

                <div className="mt-12 flex items-center justify-end border-t border-slate-50 pt-8">
                  <Button
                    text={isPending ? "Updating..." : "Save Profile Changes"}
                    onClick={handleSave}
                    className="px-10 py-4 bg-[#2A4150] text-white rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95 transition-all"
                  />
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-50 rounded-2xl text-[#2A4150]"><ShieldAlert size={24} /></div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Security & Privacy</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Regularly updating your password helps keep your account safe.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Current Password</label>
                    <div className="relative group">
                      <InputField
                        type={showCurrent ? "text" : "password"} name="currentPassword" value={passwords.currentPassword}
                        onChange={handlePasswordChange} icon={Lock} placeholder="••••••••"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 w-full pr-12"
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">New Password</label>
                    <div className="relative group">
                      <InputField
                        type={showNew ? "text" : "password"} name="newPassword" value={passwords.newPassword}
                        onChange={handlePasswordChange} icon={Lock} placeholder="Min. 8 characters"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 w-full pr-12"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Confirm New Password</label>
                    <div className="relative group">
                      <InputField
                        type={showConfirm ? "text" : "password"} name="confirmNewPassword" value={passwords.confirmNewPassword}
                        onChange={handlePasswordChange} icon={Lock} placeholder="Repeat new password"
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/30 w-full pr-12"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end border-t border-slate-50 pt-8">
                  <Button 
                    text="Update Password" onClick={handlePasswordUpdate} 
                    className="px-8 py-4 bg-[#2A4150] text-white rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all" 
                  />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}