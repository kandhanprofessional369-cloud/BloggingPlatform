import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api, { fileUrl } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const CommentItem = ({ comment, onUpdated, onDeleted, isPostAuthor }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);

  const canEdit = user && user._id === comment.author?._id;
  const canDelete = canEdit || isPostAuthor || user?.role === 'admin';

  const saveEdit = async () => {
    if (!content.trim()) return;
    try {
      const { data } = await api.put(`/comments/${comment._id}`, { content });
      onUpdated(data);
      setEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${comment._id}`);
      onDeleted(comment._id);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      <Link to={`/author/${comment.author?.username}`} className="shrink-0">
        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center overflow-hidden">
          {comment.author?.avatar ? (
            <img src={fileUrl(comment.author.avatar)} alt="" className="w-full h-full object-cover" />
          ) : (
            comment.author?.name?.[0]?.toUpperCase()
          )}
        </div>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Link to={`/author/${comment.author?.username}`} className="text-sm font-semibold text-gray-800 hover:text-brand-600">
            {comment.author?.name}
          </Link>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            {comment.edited && ' (edited)'}
          </span>
        </div>

        {editing ? (
          <div className="mt-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[80px]"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={saveEdit} className="btn-primary text-xs py-1 px-3">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1 px-3">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
        )}

        {!editing && (canEdit || canDelete) && (
          <div className="flex gap-3 mt-2">
            {canEdit && (
              <button onClick={() => setEditing(true)} className="text-xs text-gray-500 hover:text-brand-600">
                Edit
              </button>
            )}
            {canDelete && (
              <button onClick={remove} className="text-xs text-gray-500 hover:text-red-600">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection = ({ postId, postAuthorId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/comments/post/${postId}`);
      setComments(data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/comments/post/${postId}`, { content: text });
      setComments((prev) => [...prev, data]);
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const isPostAuthor = user && user._id === postAuthorId;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={submit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            className="input min-h-[90px]"
          />
          <button disabled={submitting} className="btn-primary mt-2 text-sm">
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-6">
          <Link to="/login" className="text-brand-600 font-medium">
            Log in
          </Link>{' '}
          to join the conversation.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div>
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              isPostAuthor={isPostAuthor}
              onUpdated={(updated) => setComments((prev) => prev.map((c2) => (c2._id === updated._id ? updated : c2)))}
              onDeleted={(id) => setComments((prev) => prev.filter((c2) => c2._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
