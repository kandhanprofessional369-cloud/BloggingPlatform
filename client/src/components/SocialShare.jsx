import React from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const platforms = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: 'bg-[#1877F2]',
    urlFn: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    color: 'bg-black',
    urlFn: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: 'bg-[#0A66C2]',
    urlFn: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    color: 'bg-[#25D366]',
    urlFn: (url, title) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  {
    key: 'email',
    label: 'Email',
    color: 'bg-gray-600',
    urlFn: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
];

const SocialShare = ({ postId, title }) => {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async (platform) => {
    window.open(platform.urlFn(url, title), '_blank', 'noopener,noreferrer,width=600,height=500');
    try {
      await api.put(`/posts/${postId}/share`, { platform: platform.key });
    } catch (e) {
      // non-blocking
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 mr-1">Share:</span>
      {platforms.map((p) => (
        <button
          key={p.key}
          onClick={() => handleShare(p)}
          title={`Share on ${p.label}`}
          className={`${p.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}
        >
          {p.label}
        </button>
      ))}
      <button onClick={copyLink} className="btn-secondary text-xs py-1.5 px-3">
        Copy Link
      </button>
    </div>
  );
};

export default SocialShare;
