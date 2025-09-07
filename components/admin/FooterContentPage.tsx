import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FooterContent } from '../../types';

const initialFooterData: Partial<FooterContent> = {
    company_name: '',
    hero_subtitle_en: '',
    hero_subtitle_te: '',
    contact_us_title_en: '',
    contact_us_title_te: '',
    phone_number: '',
    email: '',
    company_address: '',
    follow_us_title_en: '',
    follow_us_title_te: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    copyright_notice_en: '',
    copyright_notice_te: '',
};

const FooterContentPage: React.FC = () => {
    const [formData, setFormData] = useState<Partial<FooterContent>>(initialFooterData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFooterContent = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('footer_content')
                .select('*')
                .eq('id', 1)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine on first load.
                alert('Error fetching footer content: ' + error.message);
            } else if (data) {
                setFormData(data);
            }
            setLoading(false);
        };
        fetchFooterContent();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('footer_content')
            .upsert({ id: 1, ...formData }); // Use upsert to create if not exists, or update if it does.

        if (error) {
            alert('Error updating footer content: ' + error.message);
        } else {
            alert('Footer content updated successfully!');
        }
        setLoading(false);
    };

    const inputStyles = "w-full p-2 border rounded bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const textAreaStyles = `${inputStyles} h-24`;
    const sectionContainerStyles = "p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-4";
    const sectionTitleStyles = "font-semibold text-gray-900 dark:text-white text-lg";
    const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    if (loading && !formData.company_name) {
        return <div>Loading footer content...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Footer Content</h1>
            
            {/* Company Info */}
            <div className={sectionContainerStyles}>
                <h2 className={sectionTitleStyles}>Company Info</h2>
                <div>
                    <label htmlFor="company_name" className={labelStyles}>Company Name</label>
                    <input id="company_name" name="company_name" value={formData.company_name || ''} onChange={handleChange} className={inputStyles} required/>
                </div>
            </div>
            
            {/* Hero Subtitle */}
            <div className={`${sectionContainerStyles} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                <div className="col-span-1 md:col-span-2">
                    <h2 className={sectionTitleStyles}>Hero Subtitle</h2>
                </div>
                <div>
                    <label htmlFor="hero_subtitle_en" className={labelStyles}>Hero Subtitle (English)</label>
                    <textarea id="hero_subtitle_en" name="hero_subtitle_en" value={formData.hero_subtitle_en || ''} onChange={handleChange} className={textAreaStyles} />
                </div>
                 <div>
                    <label htmlFor="hero_subtitle_te" className={labelStyles}>Hero Subtitle (Telugu)</label>
                    <textarea id="hero_subtitle_te" name="hero_subtitle_te" value={formData.hero_subtitle_te || ''} onChange={handleChange} className={textAreaStyles} />
                </div>
            </div>

            {/* Contact Us */}
            <div className={sectionContainerStyles}>
                <h2 className={sectionTitleStyles}>Contact Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="contact_us_title_en" className={labelStyles}>Section Title (English)</label>
                        <input id="contact_us_title_en" name="contact_us_title_en" value={formData.contact_us_title_en || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="contact_us_title_te" className={labelStyles}>Section Title (Telugu)</label>
                        <input id="contact_us_title_te" name="contact_us_title_te" value={formData.contact_us_title_te || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="phone_number" className={labelStyles}>Phone Number</label>
                        <input id="phone_number" name="phone_number" type="tel" value={formData.phone_number || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="email" className={labelStyles}>Email</label>
                        <input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="company_address" className={labelStyles}>Company Address</label>
                        <textarea id="company_address" name="company_address" value={formData.company_address || ''} onChange={handleChange} className={textAreaStyles} />
                    </div>
                </div>
            </div>

            {/* Follow Us */}
            <div className={sectionContainerStyles}>
                <h2 className={sectionTitleStyles}>Follow Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="follow_us_title_en" className={labelStyles}>Section Title (English)</label>
                        <input id="follow_us_title_en" name="follow_us_title_en" value={formData.follow_us_title_en || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label htmlFor="follow_us_title_te" className={labelStyles}>Section Title (Telugu)</label>
                        <input id="follow_us_title_te" name="follow_us_title_te" value={formData.follow_us_title_te || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                     <div>
                        <label htmlFor="instagram_url" className={labelStyles}>Instagram URL</label>
                        <input id="instagram_url" name="instagram_url" type="url" value={formData.instagram_url || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label htmlFor="facebook_url" className={labelStyles}>Facebook URL</label>
                        <input id="facebook_url" name="facebook_url" type="url" value={formData.facebook_url || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="youtube_url" className={labelStyles}>YouTube URL</label>
                        <input id="youtube_url" name="youtube_url" type="url" value={formData.youtube_url || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                </div>
            </div>
            
            {/* Copyright */}
             <div className={`${sectionContainerStyles} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                <div className="col-span-1 md:col-span-2">
                    <h2 className={sectionTitleStyles}>Copyright Notice</h2>
                </div>
                <div>
                    <label htmlFor="copyright_notice_en" className={labelStyles}>Copyright Notice (English)</label>
                    <input id="copyright_notice_en" name="copyright_notice_en" value={formData.copyright_notice_en || ''} onChange={handleChange} className={inputStyles} />
                </div>
                 <div>
                    <label htmlFor="copyright_notice_te" className={labelStyles}>Copyright Notice (Telugu)</label>
                    <input id="copyright_notice_te" name="copyright_notice_te" value={formData.copyright_notice_te || ''} onChange={handleChange} className={inputStyles} />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
};

export default FooterContentPage;
