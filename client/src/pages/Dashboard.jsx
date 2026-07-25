import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const StatusBadge = ({ status }) => (
  <span
    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
      status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {status}
  </span>
);

const Dashboard = () => {
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    const { data } = await api.get('/posts/mine/all');
    setPosts(data);
  };

  const loadQueue = async () => {
    const { data } = await api.get('/comments/moderation');
    setQueue(data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPosts(), loadQueue()]).finally(() => setLoading(false));
  }, []);

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const moderate = async (id, status) => {
    try {
      await api.put(`/comments/${id}/moderate`, { status });
      setQueue((prev) => prev.filter((c) => c._id !== id));
      toast.success(`Comment marked as ${status}`);
    } catch (err) {
      toast.error('Failed to moderate comment');
    }
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/create-post" className="btn-primary text-sm">
          + New Post
        </Link>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('posts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 'posts' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500'
          }`}
        >
          My Posts ({posts.length})
        </button>
        <button
          onClick={() => setTab('moderation')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 'moderation' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500'
          }`}
        >
          Comment Moderation ({queue.length})
        </button>
      </div>

      {tab === 'posts' && (
        <div className="card divide-y divide-gray-100">
          {posts.length === 0 && <p className="p-6 text-sm text-gray-400">You haven't written any posts yet.</p>}
          {posts.map((post) => (
            <div key={post._id} className="flex items-center justify-between p-4 gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={post.status} />
                  <Link to={`/post/${post.slug}`} className="font-medium text-gray-800 hover:text-brand-600 truncate">
                    {post.title}
                  </Link>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Updated {format(new Date(post.updatedAt), 'MMM d, yyyy')} · 👁 {post.views} · ❤ {post.likes?.length || 0}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/analytics/${post._id}`} className="btn-secondary text-xs py-1.5 px-3">
                  Analytics
                </Link>
                <Link to={`/edit-post/${post._id}`} className="btn-secondary text-xs py-1.5 px-3">
                  Edit
                </Link>
                <button onClick={() => deletePost(post._id)} className="btn-danger text-xs py-1.5 px-3">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'moderation' && (
        <div className="card divide-y divide-gray-100">
          {queue.length === 0 && <p className="p-6 text-sm text-gray-400">No comments awaiting moderation.</p>}
          {queue.map((c) => (
            <div key={c._id} className="p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {c.author?.name} on <span className="text-brand-600">{c.post?.title}</span>
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.status === 'spam' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => moderate(c._id, 'approved')} className="btn-secondary text-xs py-1 px-3">
                    Approve
                  </button>
                  <button onClick={() => moderate(c._id, 'spam')} className="btn-danger text-xs py-1 px-3">
                    Mark Spam
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
