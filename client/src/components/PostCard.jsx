import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fileUrl } from '../api/axios.js';

const PostCard = ({ post }) => {
  return (
    <article className="card overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <Link to={`/post/${post.slug}`} className="block aspect-[16/9] bg-gray-100 overflow-hidden">
        {post.coverImage ? (
          <img
            src={fileUrl(post.coverImage)}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-brand-400 text-4xl font-bold">
            {post.title?.[0]}
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        {post.category && (
          <Link
            to={`/category/${post.category.slug}`}
            className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-2"
          >
            {post.category.name}
          </Link>
        )}
        <Link to={`/post/${post.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 leading-snug hover:text-brand-700 line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{post.excerpt}</p>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <Link to={`/author/${post.author?.username}`} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center overflow-hidden">
              {post.author?.avatar ? (
                <img src={fileUrl(post.author.avatar)} alt="" className="w-full h-full object-cover" />
              ) : (
                post.author?.name?.[0]?.toUpperCase()
              )}
            </div>
            <span className="text-xs font-medium text-gray-600">{post.author?.name}</span>
          </Link>
          <span className="text-xs text-gray-400">
            {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span>👁 {post.views ?? 0}</span>
          <span>❤ {post.likes?.length ?? 0}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
