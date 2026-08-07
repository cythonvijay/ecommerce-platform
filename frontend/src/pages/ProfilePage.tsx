import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getApiErrorMessage } from "@/lib/format";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuthStore();
  const { updateProfile, isUpdating, changePassword, isChangingPassword } = useProfile();

  const [profileForm, setProfileForm] = useState({ full_name: user?.full_name || "", phone: user?.phone || "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErr(""); setProfileMsg("");
    try {
      await updateProfile(profileForm);
      await refreshProfile();
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileErr(getApiErrorMessage(err));
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    try {
      await changePassword(pwForm);
      setPwMsg("Password changed.");
      setPwForm({ current_password: "", new_password: "" });
    } catch (err) {
      setPwErr(getApiErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Your Profile</h1>

      <form onSubmit={submitProfile} className="card space-y-4 p-6">
        <h2 className="font-display font-semibold text-ink-900 dark:text-white">Personal details</h2>
        <Input label="Email" value={user?.email || ""} disabled className="opacity-60" />
        <Input label="Full name" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
        <Input label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
        {profileMsg && <p className="text-sm text-green-600 dark:text-green-400">{profileMsg}</p>}
        {profileErr && <p className="text-sm text-red-600 dark:text-red-400">{profileErr}</p>}
        <Button type="submit" isLoading={isUpdating}>Save changes</Button>
      </form>

      <form onSubmit={submitPassword} className="card space-y-4 p-6">
        <h2 className="font-display font-semibold text-ink-900 dark:text-white">Change password</h2>
        <Input label="Current password" type="password" required value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
        <Input label="New password" type="password" required minLength={8} value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
        {pwMsg && <p className="text-sm text-green-600 dark:text-green-400">{pwMsg}</p>}
        {pwErr && <p className="text-sm text-red-600 dark:text-red-400">{pwErr}</p>}
        <Button type="submit" isLoading={isChangingPassword} variant="secondary">Update password</Button>
      </form>
    </div>
  );
}
