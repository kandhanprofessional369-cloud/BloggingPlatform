import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const CategoryPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/categories/${slug}/posts`)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Category not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleSubscribe = async () => {
    if (!user) {
      toast.error('Log in to subscribe');
      return;
    }
    const { data: res } = await api.put(`/users/subscribe/category/${data.category._id}`);
    setSubscribed(res.subscribed);
    toast.success(res.subscribed ? 'Subscribed to category' : 'Unsubscribed');
  };

  if (loading) return <LoadingSpinner full />;
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.category.name}</h1>
          {data.category.description && <p className="text-gray-500 mt-1">{data.category.description}</p>}
        </div>
        <button onClick={toggleSubscribe} className={subscribed ? 'btn-secondary' : 'btn-primary'}>
          {subscribed ? 'Subscribed' : 'Subscribe to category'}
        </button>
      </div>

      {data.posts.length === 0 ? (
        <p className="text-gray-400">No posts in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
