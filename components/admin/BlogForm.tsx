

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { BlogFormData } from '../../types';

const initialFormData: BlogFormData = {
  cover_image: '',
  en_title: '',
  en_description: '',
  te_title: '',
  te_description: '',
};

const BlogForm: React.FC = () => {
  const [formData, setFormData] = useState<BlogFormData>(initialFormData);
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
  const [originalCoverImageUrl, setOriginalCoverImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch data for editing
  useEffect(() => {
    if (id) {
        setIsEditMode(true);
        const fetchBlog = async () => {
            setLoading(true);
            
            // Fetch blog and its Telugu translation in parallel for robustness
            const [blogRes, teTranslationRes] = await Promise.all([
                supabase.from('blogs').select('*').eq('id', id).single(),
                supabase.from('blog_translations').select('*').eq('blog_id', id).single()
            ]);

            const { data: blogData, error: blogError } = blogRes;

            if (blogError || !blogData) {
                alert('Error fetching blog data: ' + (blogError?.message || 'Blog not found'));
                navigate('/blogs');
                return;
            }

            // A missing translation is not a critical error, so we check for the specific code
            if (teTranslationRes.error && teTranslationRes.error.code !== 'PGRST116') {
                alert('Error fetching Telugu translation: ' + teTranslationRes.error.message);
            }

            const teTranslation = teTranslationRes.data;
            
            setFormData({
                id: blogData.id,
                cover_image: blogData.cover_image || '',
                en_title: blogData.title,
                en_description: blogData.description,
                te_title: teTranslation?.title || '',
                te_description: teTranslation?.description || '',
                te_translation_id: teTranslation?.id,
            });
            setOriginalCoverImageUrl(blogData.cover_image || '');
            setLoading(false);
        };
        fetchBlog();
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCoverImage(file);
      // For instant preview, we also clear the old URL from formData
      // The preview will now be generated from `newCoverImage`
      setFormData(prev => ({ ...prev, cover_image: '' }));
    }
  };

  const handleRemoveCoverImage = () => {
    setNewCoverImage(null);
    setFormData(prev => ({ ...prev, cover_image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let coverImageUrl = formData.cover_image || '';

    // If there's a new image, upload it
    if (newCoverImage) {
        // If there was an old image, delete it from storage
        if (isEditMode && originalCoverImageUrl) {
            const oldFilePath = originalCoverImageUrl.substring(originalCoverImageUrl.lastIndexOf('/blog-images/') + 13);
            await supabase.storage.from('blog-images').remove([oldFilePath]);
        }

        const filePath = `public/${Date.now()}-${newCoverImage.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, newCoverImage);

        if (uploadError) {
            alert('Error uploading cover image: ' + uploadError.message);
            setLoading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);
        coverImageUrl = publicUrl;
    } 
    // If there's no new image, and the original URL was cleared, it means deletion
    else if (isEditMode && originalCoverImageUrl && !formData.cover_image) {
        const oldFilePath = originalCoverImageUrl.substring(originalCoverImageUrl.lastIndexOf('/blog-images/') + 13);
        await supabase.storage.from('blog-images').remove([oldFilePath]);
        coverImageUrl = '';
    }

    const dataForSupabase = {
      title: formData.en_title,
      description: formData.en_description,
      cover_image: coverImageUrl || null,
      // `updated_at` is now handled automatically by the database trigger.
    };
    
    let savedBlog, blogError;

    if (isEditMode) {
        const { data, error } = await supabase
            .from('blogs')
            .update(dataForSupabase)
            .eq('id', formData.id!)
            .select()
            .single();
        savedBlog = data;
        blogError = error;
    } else {
        const { data, error } = await supabase
            .from('blogs')
            .insert(dataForSupabase)
            .select()
            .single();
        savedBlog = data;
        blogError = error;
    }


    if (blogError || !savedBlog) {
      alert('Error saving blog post: ' + blogError?.message);
      setLoading(false);
      return;
    }

    if (formData.te_title || formData.te_description) {
        const translationData = { 
            blog_id: savedBlog.id, 
            title: formData.te_title, 
            description: formData.te_description 
        };

        let translationError;

        if (formData.te_translation_id) {
            // We have a translation ID, so UPDATE the existing record.
            const { error } = await supabase
                .from('blog_translations')
                .update(translationData)
                .eq('id', formData.te_translation_id);
            translationError = error;
        } else {
            // No translation ID, so INSERT a new record.
            const { error } = await supabase
                .from('blog_translations')
                .insert(translationData);
            translationError = error;
        }
            
        if (translationError) {
            alert('Error saving Telugu translation: ' + translationError.message);
            setLoading(false);
            return;
        }
    } else if (isEditMode && formData.te_translation_id) {
        // If fields are empty and we are editing an existing translation, delete it
        const { error: deleteError } = await supabase
            .from('blog_translations')
            .delete()
            .match({ id: formData.te_translation_id });

        if (deleteError) {
            alert('Error deleting Telugu translation: ' + deleteError.message);
            // Non-critical, so we can continue
        }
    }

    alert('Blog post saved successfully!');
    navigate('/blogs');
    setLoading(false);
  };
  
  const coverImagePreview = newCoverImage
    ? URL.createObjectURL(newCoverImage)
    : formData.cover_image;

  const inputStyles = "w-full p-2 border rounded bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const textAreaStyles = `${inputStyles} h-48`;
  const sectionContainerStyles = "p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-2";
  const sectionTitleStyles = "font-semibold text-gray-900 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      
      {/* Cover Image Uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
        <div className="mt-2 flex items-center gap-4">
            <div className="w-48 h-28 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                {coverImagePreview ? (
                    <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                    <span className="material-icons text-4xl text-gray-400 dark:text-gray-500">image</span>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="cover-image-upload" className="cursor-pointer px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span>Change</span>
                    <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" onChange={handleCoverImageSelect} accept="image/png, image/jpeg, image/webp" />
                </label>
                {coverImagePreview && (
                    <button type="button" onClick={handleRemoveCoverImage} className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50">
                        Remove
                    </button>
                )}
            </div>
        </div>
      </div>
      
      {/* Translations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={sectionContainerStyles}>
            <h2 className={sectionTitleStyles}>English Content</h2>
            <input name="en_title" placeholder="Title (English)" value={formData.en_title} onChange={handleChange} className={inputStyles} required />
            <textarea name="en_description" placeholder="Description (English)" value={formData.en_description} onChange={handleChange} className={textAreaStyles} required />
        </div>
        <div className={sectionContainerStyles}>
            <h2 className={sectionTitleStyles}>Telugu Content</h2>
            <input name="te_title" placeholder="Title (Telugu)" value={formData.te_title} onChange={handleChange} className={inputStyles} />
            <textarea name="te_description" placeholder="Description (Telugu)" value={formData.te_description} onChange={handleChange} className={textAreaStyles} />
        </div>
      </div>
      
      <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
        {loading ? 'Saving...' : (isEditMode ? 'Update Blog Post' : 'Save Blog Post')}
      </button>
    </form>
  );
};

export default BlogForm;
