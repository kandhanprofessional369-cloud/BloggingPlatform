import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { fileUrl } from '../api/axios.js';
import RichTextEditor from '../components/RichTextEditor.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const PostEditor = ({ editMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    if (editMode && id) {
      api.get(`/posts/id/${id}`).then(({ data }) => {
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt || '');
        setCategory(data.category?._id || '');
        setSelectedTags(data.tags?.map((t) => t.name) || []);
        if (data.coverImage) setCoverPreview(fileUrl(data.coverImage));
        setLoading(false);
      });
    }
  }, [editMode, id]);

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags([...selectedTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setSelectedTags(selectedTags.filter((t) => t !== tag));

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const { data } = await api.post('/categories', { name: newCategory.trim() });
      setCategories((prev) => [...prev, data]);
      setCategory(data._id);
      setNewCategory('');
      toast.success('Category created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Tags are stored as ObjectId refs, so each typed tag name must be created
  // (or looked up if it already exists) via the tags API before we submit the post.
  const resolveTagIds = async () => {
    const ids = [];
    for (const name of selectedTags) {
      const { data } = await api.post('/tags', { name });
      ids.push(data._id);
    }
    return ids;
  };

  const buildFormData = (status, tagIds) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('excerpt', excerpt);
    if (category) formData.append('category', category);
    formData.append('tags', tagIds.join(','));
    formData.append('status', status);
    if (coverImageFile) formData.append('coverImage', coverImageFile);
    return formData;
  };

  const handleSave = async (status) => {
    if (!title.trim() || !content.trim() || content === '<p><br></p>') {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const tagIds = await resolveTagIds();
      const formData = buildFormData(status, tagIds);
      let res;
      if (editMode) {
        res = await api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(status === 'published' ? 'Post published!' : 'Draft saved');
      navigate(`/post/${res.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{editMode ? 'Edit Post' : 'Write a new post'}</h1>

      <div className="space-y-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full text-2xl font-bold border-0 border-b border-gray-200 focus:ring-0 focus:border-brand-500 px-0 py-2 bg-transparent"
        />

        <div>
          <label className="label">Cover Image</label>
          {coverPreview && <img src={coverPreview} alt="cover" className="w-full max-h-64 object-cover rounded-lg mb-2" />}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setCoverImageFile(file);
                setCoverPreview(URL.createObjectURL(file));
              }
            }}
            className="text-sm"
          />
        </div>

        <div>
          <label className="label">Content</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <div>
          <label className="label">Excerpt (optional short summary)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} className="input" rows={2} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="input text-sm"
              />
              <button type="button" onClick={createCategory} className="btn-secondary text-sm shrink-0">
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="label">Tags</label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Type a tag and press Enter"
              className="input"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((t) => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                  #{t}
                  <button onClick={() => removeTag(t)} className="text-gray-400 hover:text-red-500">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button disabled={saving} onClick={() => handleSave('draft')} className="btn-secondary">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button disabled={saving} onClick={() => handleSave('published')} className="btn-primary">
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
