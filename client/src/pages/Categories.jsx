import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Browse Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Link key={c._id} to={`/category/${c.slug}`} className="card p-5 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-800">{c.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{c.postCount} posts</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
