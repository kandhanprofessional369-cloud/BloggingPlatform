import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import PostCard from '../components/PostCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (search) params.search = search;
    if (category) params.category = category;

    api
      .get('/posts', { params })
      .then(({ data }) => {
        setPosts(data.posts);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [page, search, category]);

  useEffect(() => setPage(1), [search, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl px-8 py-14 text-white">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Ideas worth sharing.</h1>
        <p className="text-brand-100 max-w-xl">
          Discover stories, thinking, and expertise from writers on any topic. Write yours today.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSearchParams(search ? { search } : {})}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
            !category ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setSearchParams({ ...(search ? { search } : {}), category: c._id })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
              category === c._id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {c.name} <span className="opacity-60">({c.postCount})</span>
          </button>
        ))}
      </div>

      {search && (
        <p className="text-sm text-gray-500 mb-4">
          Showing results for <span className="font-semibold">"{search}"</span>
        </p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No posts found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${
                    p === page ? 'bg-brand-600 text-white' : 'bg-white border border-gray-300 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
