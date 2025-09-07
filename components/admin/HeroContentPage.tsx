import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { HeroContent } from '../../types';

const initialHeroData: Partial<HeroContent> = {
    background_image_url: '',
    hero_title_en: '',
    hero_title_te: '',
    hero_subtitle_en: '',
    hero_subtitle_te: '',
};

const HeroContentPage: React.FC = () => {
    const [formData, setFormData] = useState<Partial<HeroContent>>(initialHeroData);
    const [newBackgroundImage, setNewBackgroundImage] = useState<File | null>(null);
    const [originalBackgroundImageUrl, setOriginalBackgroundImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHeroContent = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('hero_content')
                .select('*')
                .eq('id', 1)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                alert('Error fetching hero content: ' + error.message);
            } else if (data) {
                setFormData(data);
                setOriginalBackgroundImageUrl(data.background_image_url || '');
            }
            setLoading(false);
        };
        fetchHeroContent();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setNewBackgroundImage(file);
          setFormData(prev => ({ ...prev, background_image_url: '' }));
        }
    };
    
    const handleRemoveImage = () => {
        setNewBackgroundImage(null);
        setFormData(prev => ({ ...prev, background_image_url: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let backgroundImageUrl = formData.background_image_url || '';

        // Handle image upload/deletion
        if (newBackgroundImage) {
            if (originalBackgroundImageUrl) {
                const oldFilePath = originalBackgroundImageUrl.substring(originalBackgroundImageUrl.lastIndexOf('/hero-image/') + 12);
                await supabase.storage.from('hero-image').remove([oldFilePath]);
            }
            const filePath = `private/${Date.now()}-${newBackgroundImage.name.replace(/\s/g, '_')}`;
            const { error: uploadError } = await supabase.storage.from('hero-image').upload(filePath, newBackgroundImage);

            if (uploadError) {
                alert('Error uploading background image: ' + uploadError.message);
                setLoading(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('hero-image').getPublicUrl(filePath);
            backgroundImageUrl = publicUrl;
        } else if (originalBackgroundImageUrl && !formData.background_image_url) {
            const oldFilePath = originalBackgroundImageUrl.substring(originalBackgroundImageUrl.lastIndexOf('/hero-image/') + 12);
            await supabase.storage.from('hero-image').remove([oldFilePath]);
            backgroundImageUrl = '';
        }

        const dataToSave = { ...formData, background_image_url: backgroundImageUrl };

        const { error } = await supabase
            .from('hero_content')
            .upsert({ id: 1, ...dataToSave });

        if (error) {
            alert('Error updating hero content: ' + error.message);
        } else {
            alert('Hero content updated successfully!');
            setOriginalBackgroundImageUrl(backgroundImageUrl);
        }
        setLoading(false);
    };

    const backgroundImagePreview = newBackgroundImage
        ? URL.createObjectURL(newBackgroundImage)
        : formData.background_image_url;

    const inputStyles = "w-full p-2 border rounded bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const textAreaStyles = `${inputStyles} h-32`;
    const sectionContainerStyles = "p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-4";
    const sectionTitleStyles = "font-semibold text-gray-900 dark:text-white text-lg";
    const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    if (loading && !formData.hero_title_en) {
        return <div>Loading hero content...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Hero Content</h1>
            
            {/* Background Image */}
            <div className={sectionContainerStyles}>
                <h2 className={sectionTitleStyles}>Background Image</h2>
                <div className="mt-2 flex items-center gap-4">
                    <div className="w-64 h-36 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                        {backgroundImagePreview ? (
                            <img src={backgroundImagePreview} alt="Background preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-icons text-5xl text-gray-400 dark:text-gray-500">photo_size_select_actual</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="background-image-upload" className="cursor-pointer px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span>Change</span>
                            <input id="background-image-upload" name="background-image-upload" type="file" className="sr-only" onChange={handleImageSelect} accept="image/png, image/jpeg, image/webp" />
                        </label>
                        {backgroundImagePreview && (
                            <button type="button" onClick={handleRemoveImage} className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50">
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Content */}
            <div className={`${sectionContainerStyles} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                <div className="col-span-1 md:col-span-2">
                    <h2 className={sectionTitleStyles}>Hero Text</h2>
                </div>
                {/* Titles */}
                <div>
                    <label htmlFor="hero_title_en" className={labelStyles}>Title (.envglish)</label>
                    <input id="hero_title_en" name="hero_title_en" value={formData.hero_title_en || ''} onChange={handleChange} className={inputStyles} />
                </div>
                <div>
                    <label htmlFor="hero_title_te" className={labelStyles}>Title (Telugu)</label>
                    <input id="hero_title_te" name="hero_title_te" value={formData.hero_title_te || ''} onChange={handleChange} className={inputStyles} />
                </div>
                {/* Subtitles */}
                <div>
                    <label htmlFor="hero_subtitle_en" className={labelStyles}>Subtitle (English)</label>
                    <textarea id="hero_subtitle_en" name="hero_subtitle_en" value={formData.hero_subtitle_en || ''} onChange={handleChange} className={textAreaStyles} />
                </div>
                <div>
                    <label htmlFor="hero_subtitle_te" className={labelStyles}>Subtitle (Telugu)</label>
                    <textarea id="hero_subtitle_te" name="hero_subtitle_te" value={formData.hero_subtitle_te || ''} onChange={handleChange} className={textAreaStyles} />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
};

export default HeroContentPage;