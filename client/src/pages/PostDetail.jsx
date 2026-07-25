import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import api, { fileUrl } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import SocialShare from '../components/SocialShare.jsx';
import CommentSection from '../components/CommentSection.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const PostDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts/${slug}`);
      setPost(data);
      setLikeCount(data.likes?.length || 0);
      if (user) setLiked(data.likes?.includes(user._id));
    } catch (err) {
      toast.error('Post not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Log in to like posts');
      return;
    }
    try {
      const { data } = await api.put(`/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <LoadingSpinner full />;
  if (!post) return null;

  const isOwner = user && post.author && user._id === post.author._id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Helmet>
        <title>{post.title} | InkWell</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      {post.status === 'draft' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-lg">
          This post is a draft and is only visible to you.
        </div>
      )}

      {post.category && (
        <Link to={`/category/${post.category.slug}`} className="text-sm font-semibold text-brand-600 uppercase tracking-wide">
          {post.category.name}
        </Link>
      )}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">{post.title}</h1>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <Link to={`/author/${post.author?.username}`} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center overflow-hidden">
            {post.author?.avatar ? (
              <img src={fileUrl(post.author.avatar)} alt="" className="w-full h-full object-cover" />
            ) : (
              post.author?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{post.author?.name}</p>
            <p className="text-xs text-gray-400">
              {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : 'Not published'}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="flex gap-2">
            <Link to={`/edit-post/${post._id}`} className="btn-secondary text-xs py-1.5 px-3">
              Edit
            </Link>
            <Link to={`/analytics/${post._id}`} className="btn-secondary text-xs py-1.5 px-3">
              Analytics
            </Link>
            <button onClick={handleDelete} className="btn-danger text-xs py-1.5 px-3">
              Delete
            </button>
          </div>
        )}
      </div>

      {post.coverImage && (
        <img src={fileUrl(post.coverImage)} alt={post.title} className="w-full rounded-xl mb-8 object-cover max-h-[420px]" />
      )}

      <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-brand-600" dangerouslySetInnerHTML={{ __html: post.content }} />

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {post.tags.map((t) => (
            <Link key={t._id} to={`/tag/${t.slug}`} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200">
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4 mt-8 py-6 border-y border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${
              liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-600'
            }`}
          >
            {liked ? '❤' : '🤍'} {likeCount}
          </button>
          <span className="text-sm text-gray-400">👁 {post.views} views</span>
        </div>
        <SocialShare postId={post._id} title={post.title} />
      </div>

      <CommentSection postId={post._id} postAuthorId={post.author?._id} />
    </div>
  );
};

export default PostDetail;
