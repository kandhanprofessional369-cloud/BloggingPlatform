import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import PostCard from '../components/PostCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const TagPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/tags/${slug}/posts`)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Tag not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner full />;
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">#{data.tag.name}</h1>
      {data.posts.length === 0 ? (
        <p className="text-gray-400">No posts with this tag yet.</p>
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

export default TagPage;
