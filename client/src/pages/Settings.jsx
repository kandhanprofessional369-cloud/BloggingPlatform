import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api, { fileUrl } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [socialLinks, setSocialLinks] = useState(
    user.socialLinks || { twitter: '', linkedin: '', github: '', website: '' }
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ? fileUrl(user.avatar) : '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('socialLinks', JSON.stringify(socialLinks));
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ name: data.name, bio: data.bio, avatar: data.avatar, socialLinks: data.socialLinks });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <form onSubmit={saveProfile} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Profile</h2>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center overflow-hidden text-xl">
            {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : name?.[0]?.toUpperCase()}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }
            }}
            className="text-sm"
          />
        </div>

        <div>
          <label className="label">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input" rows={3} maxLength={500} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['twitter', 'linkedin', 'github', 'website'].map((platform) => (
            <div key={platform}>
              <label className="label capitalize">{platform}</label>
              <input
                value={socialLinks[platform] || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                className="input"
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>

        <button disabled={savingProfile} className="btn-primary">
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <form onSubmit={changePassword} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Change Password</h2>
        <div>
          <label className="label">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
          />
        </div>
        <button disabled={savingPassword} className="btn-primary">
          {savingPassword ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
