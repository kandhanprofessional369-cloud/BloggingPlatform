import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { fileUrl } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const AuthorPage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${username}`);
      setData(data);
    } catch (err) {
      toast.error('Author not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const toggleSubscribe = async () => {
    if (!user) {
      toast.error('Log in to subscribe');
      return;
    }
    try {
      const { data: res } = await api.put(`/users/subscribe/author/${data.author._id}`);
      setSubscribed(res.subscribed);
      toast.success(res.subscribed ? `Subscribed to ${data.author.name}` : 'Unsubscribed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subscription');
    }
  };

  if (loading) return <LoadingSpinner full />;
  if (!data) return null;

  const { author, posts } = data;
  const isSelf = user && user._id === author._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="card p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
        <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 text-3xl font-bold flex items-center justify-center overflow-hidden shrink-0">
          {author.avatar ? <img src={fileUrl(author.avatar)} alt="" className="w-full h-full object-cover" /> : author.name?.[0]?.toUpperCase()}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
          <p className="text-sm text-gray-400">@{author.username}</p>
          {author.bio && <p className="text-gray-600 mt-2">{author.bio}</p>}
          <div className="flex gap-3 mt-3 justify-center sm:justify-start text-sm text-brand-600">
            {author.socialLinks?.twitter && <a href={author.socialLinks.twitter} target="_blank" rel="noreferrer">Twitter</a>}
            {author.socialLinks?.linkedin && <a href={author.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            {author.socialLinks?.github && <a href={author.socialLinks.github} target="_blank" rel="noreferrer">GitHub</a>}
            {author.socialLinks?.website && <a href={author.socialLinks.website} target="_blank" rel="noreferrer">Website</a>}
          </div>
        </div>
        {!isSelf && (
          <button onClick={toggleSubscribe} className={subscribed ? 'btn-secondary' : 'btn-primary'}>
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Posts by {author.name} ({posts.length})</h2>
      {posts.length === 0 ? (
        <p className="text-gray-400">No published posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={{ ...post, author }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorPage;
