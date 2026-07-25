import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const COLORS = ['#1877F2', '#000000', '#0A66C2', '#25D366', '#6B7280'];

const StatCard = ({ label, value }) => (
  <div className="card p-5 text-center">
    <p className="text-3xl font-extrabold text-brand-600">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

// Single-post analytics view (when :id is present) OR aggregate dashboard view
const Analytics = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [single, setSingle] = useState(null);
  const [aggregate, setAggregate] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (id) {
      api
        .get(`/posts/${id}/analytics`)
        .then(({ data }) => setSingle(data))
        .finally(() => setLoading(false));
    } else {
      api
        .get('/posts/mine/analytics')
        .then(({ data }) => setAggregate(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingSpinner full />;

  if (id && single) {
    const shareData = Object.entries(single.shares).map(([platform, count]) => ({ platform, count }));
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/dashboard" className="text-sm text-brand-600">
          &larr; Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">Analytics: {single.title}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Views" value={single.views} />
          <StatCard label="Likes" value={single.likes} />
          <StatCard label="Comments" value={single.comments} />
          <StatCard label="Total Shares" value={single.totalShares} />
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Shares by platform</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={shareData} dataKey="count" nameKey="platform" outerRadius={100} label>
                {shareData.map((entry, i) => (
                  <Cell key={entry.platform} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (aggregate) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Analytics Overview</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Views" value={aggregate.totals.views} />
          <StatCard label="Total Likes" value={aggregate.totals.likes} />
          <StatCard label="Total Comments" value={aggregate.totals.comments} />
          <StatCard label="Total Shares" value={aggregate.totals.shares} />
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Views per post</h2>
          {aggregate.posts.length === 0 ? (
            <p className="text-sm text-gray-400">Publish a post to see analytics.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(300, aggregate.posts.length * 40)}>
              <BarChart data={aggregate.posts} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="title" width={160} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6 mt-6 overflow-x-auto">
          <h2 className="font-semibold text-gray-800 mb-4">Post performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Views</th>
                <th className="py-2 pr-4">Likes</th>
                <th className="py-2 pr-4">Comments</th>
                <th className="py-2 pr-4">Shares</th>
              </tr>
            </thead>
            <tbody>
              {aggregate.posts.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4">
                    <Link to={`/analytics/${p.id}`} className="text-brand-600 hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{p.views}</td>
                  <td className="py-2 pr-4">{p.likes}</td>
                  <td className="py-2 pr-4">{p.comments}</td>
                  <td className="py-2 pr-4">{p.totalShares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

export default Analytics;
