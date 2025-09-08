// This is a simplified component. A full implementation would be more extensive.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ListingFormData, PropertyType, Amenity } from '../../types';
import { PROPERTY_TYPES, AMENITIES_BY_TYPE } from '../../constants';

interface CustomDetail {
  key: string;
  value: string;
}

const initialFormData: ListingFormData = {
  type: 'plot',
  location: '',
  price: '',
  image_urls: [],
  new_images: [],
  map_embed: '',
  details: {
    amenities: [],
    brochure_url: '',
    youtube_embed_url: '',
    note_en: '',
    note_te: '',
  },
  en_title: '',
  en_description: '',
  te_title: '',
  te_description: '',
};

const ListingForm: React.FC = () => {
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [customDetails, setCustomDetails] = useState<CustomDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]);
  const [newBrochure, setNewBrochure] = useState<File | null>(null);
  const [originalBrochureUrl, setOriginalBrochureUrl] = useState<string>('');
  const [customAmenities, setCustomAmenities] = useState<Amenity[]>([]);
  const [newAmenityName, setNewAmenityName] = useState<string>('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch data for editing
  useEffect(() => {
    if (id) {
        setIsEditMode(true);
        const fetchListing = async () => {
            setLoading(true);
            
            // Fetch all three data points in parallel for robustness and performance
            const [listingRes, enTranslationRes, teTranslationRes] = await Promise.all([
                supabase.from('listings').select('*').eq('id', id).single(),
                supabase.from('listing_translations').select('*').eq('listing_id', id).single(),
                supabase.from('listing_translations_telugu').select('*').eq('listing_id', id).single()
            ]);

            const { data: listingData, error: listingError } = listingRes;

            if (listingError || !listingData) {
                alert('Error fetching listing data: ' + (listingError?.message || 'Listing not found'));
                navigate('/listings');
                return;
            }

            if (enTranslationRes.error && enTranslationRes.error.code !== 'PGRST116') {
                alert('Error fetching English translation: ' + enTranslationRes.error.message);
            }
            if (teTranslationRes.error && teTranslationRes.error.code !== 'PGRST116') {
                alert('Error fetching Telugu translation: ' + teTranslationRes.error.message);
            }

            const enTranslation = enTranslationRes.data;
            const teTranslation = teTranslationRes.data;
            
            // Separate standard fields from custom fields in the 'details' JSONB
            const standardKeys = new Set([
                'area_sq_yards', 'plot_number', 'road_facing', 'survey_no', 'gated_community',
                'amenities', 'investment_features', 'connectivity', 'brochure_url', 'bhk', 'floor',
                'total_floors', 'sq_ft', 'car_parking', 'furnishing', 'private_pool',
                'property_type', 'acres', 'water_source', 'area', 'youtube_embed_url', 'note_en', 'note_te'
            ]);

            const fetchedDetails = listingData.details || {};
            const standardDetails: any = { amenities: [] }; // Start with a clean slate
            const loadedCustomDetails: CustomDetail[] = [];

            for (const key in fetchedDetails) {
                if (standardKeys.has(key)) {
                    standardDetails[key] = fetchedDetails[key];
                } else {
                    const value = fetchedDetails[key];
                    loadedCustomDetails.push({ key, value: value !== null && value !== undefined ? String(value) : '' });
                }
            }
            
            // Separate amenities into predefined and custom
            const allPredefinedAmenities = Object.values(AMENITIES_BY_TYPE[listingData.type] || {})
                .flat()
                // FIX: Add explicit type `Amenity` to parameter `a` to prevent it from being inferred as `unknown`.
                .map((a: Amenity) => a.name);
            const predefinedAmenitySet = new Set(allPredefinedAmenities);
            const loadedCustomAmenities: Amenity[] = [];
            const savedAmenities: Amenity[] = fetchedDetails.amenities || [];

            savedAmenities.forEach(amenity => {
                if (!predefinedAmenitySet.has(amenity.name)) {
                    loadedCustomAmenities.push({ ...amenity, icon: amenity.icon || 'star' });
                }
            });
            setCustomAmenities(loadedCustomAmenities);

            setFormData({
                id: listingData.id,
                type: listingData.type,
                location: listingData.location,
                price: String(listingData.price),
                image_urls: listingData.image_urls || [],
                new_images: [],
                map_embed: listingData.map_embed || '',
                details: { ...standardDetails, amenities: savedAmenities },
                en_title: enTranslation?.title || '',
                en_description: enTranslation?.description || '',
                te_title: teTranslation?.title || '',
                te_description: teTranslation?.description || '',
            });
            setCustomDetails(loadedCustomDetails);
            setOriginalImageUrls(listingData.image_urls || []);
            setOriginalBrochureUrl(standardDetails.brochure_url || '');
            setLoading(false);
        };
        fetchListing();
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'map_embed') {
        // If the user pastes a full iframe, extract the src. Otherwise, use the value as is.
        const match = value.match(/src="([^"]+)"/);
        const url = match ? match[1] : value.trim();
        setFormData(prev => ({ ...prev, map_embed: url }));
        return;
    }

    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value as PropertyType,
        details: { amenities: [], brochure_url: '', youtube_embed_url: '', note_en: '', note_te: '' } // Reset details and amenities on type change
      }));
      setCustomDetails([]); // Also reset custom details
      setCustomAmenities([]); // Also reset custom amenities
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;
    
    const val = isCheckbox ? checked : value;
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, [name]: val }
    }));
  };

  const handleAmenityToggle = (amenity: Amenity) => {
    setFormData(prev => {
      const currentAmenities: Amenity[] = prev.details.amenities || [];
      const isSelected = currentAmenities.some(a => a.name === amenity.name);
  
      const newAmenities = isSelected
        ? currentAmenities.filter(a => a.name !== amenity.name)
        : [...currentAmenities, amenity];
  
      return {
        ...prev,
        details: {
          ...prev.details,
          amenities: newAmenities
        }
      };
    });
  };
  
  const handleAddAmenity = () => {
    const trimmedName = newAmenityName.trim();
    if (trimmedName) {
        const newAmenity: Amenity = { name: trimmedName, icon: 'star' };

        const allPredefinedAmenities = Object.values(AMENITIES_BY_TYPE[formData.type] || {}).flat();
        const isPredefined = allPredefinedAmenities.some(a => a.name.toLowerCase() === trimmedName.toLowerCase());

        const isAlreadyCustom = customAmenities.some(a => a.name.toLowerCase() === trimmedName.toLowerCase());

        if (isPredefined) {
            alert(`'${trimmedName}' is already a predefined amenity.`);
            return;
        }

        if (isAlreadyCustom) {
            alert(`'${trimmedName}' has already been added as a custom amenity.`);
            return;
        }

        setCustomAmenities(prev => [...prev, newAmenity]);
        handleAmenityToggle(newAmenity); // This will also select it
        setNewAmenityName('');
    }
  };

  const handleAddCustomDetail = () => {
    setCustomDetails(prev => [...prev, { key: '', value: '' }]);
  };

  const handleCustomDetailChange = (index: number, field: 'key' | 'value', value: string) => {
    const newCustomDetails = [...customDetails];
    newCustomDetails[index][field] = value;
    setCustomDetails(newCustomDetails);
  };

  const handleRemoveCustomDetail = (index: number) => {
    setCustomDetails(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        new_images: [...(prev.new_images || []), ...files]
      }));
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      new_images: (prev.new_images || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleBrochureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setNewBrochure(e.target.files[0]);
    }
  };

  const handleRemoveBrochure = () => {
      setNewBrochure(null);
      setFormData(prev => ({ ...prev, details: { ...prev.details, brochure_url: '' }}));
  };

  const getProcessedDetails = () => {
    const details = { ...formData.details };
    const numericFieldsMap: Partial<Record<PropertyType, string[]>> = {
      plot: ['area_sq_yards'],
      flat: ['bhk', 'floor', 'total_floors', 'sq_ft'],
      villa: ['bhk', 'sq_ft'],
      commercial: ['sq_ft', 'floor'],
      agricultural: ['acres'],
    };
  
    const fieldsToProcess = numericFieldsMap[formData.type];
    if (fieldsToProcess) {
      for (const field of fieldsToProcess) {
        if (details[field] && typeof details[field] === 'string') {
          const num = parseFloat(details[field]);
          details[field] = isNaN(num) ? null : num;
        } else if (details[field] === undefined) {
           details[field] = null;
        }
      }
    }
    
    // Merge custom details, converting keys to snake_case
    customDetails.forEach(detail => {
        const key = detail.key.trim().replace(/\s+/g, '_').toLowerCase();
        if (key) { // Only add if key is not empty
            details[key] = detail.value;
        }
    });

    return details;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Handle image deletions from storage
    const imagesToDelete = originalImageUrls.filter(url => !formData.image_urls.includes(url));
    if (imagesToDelete.length > 0) {
        const filePaths = imagesToDelete.map(url => url.substring(url.lastIndexOf('/listing-images/') + 16));
        await supabase.storage.from('listing-images').remove(filePaths);
    }

    // 2. Handle new image uploads
    const newImageUrls: string[] = [];
    if (formData.new_images && formData.new_images.length > 0) {
        for (const file of formData.new_images) {
            const filePath = `public/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const { error: uploadError } = await supabase.storage
                .from('listing-images')
                .upload(filePath, file);

            if (uploadError) {
                alert(`Error uploading ${file.name}: ${uploadError.message}`);
                setLoading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('listing-images')
                .getPublicUrl(filePath);
            newImageUrls.push(publicUrl);
        }
    }
    
    // 3. Handle brochure upload/deletion
    let brochureUrl = formData.details.brochure_url || '';

    if (newBrochure) {
        if (originalBrochureUrl) {
            const oldFilePath = originalBrochureUrl.substring(originalBrochureUrl.lastIndexOf('/listing-documents/') + 20);
            await supabase.storage.from('listing-documents').remove([oldFilePath]);
        }
        const filePath = `public/${Date.now()}-${newBrochure.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('listing-documents').upload(filePath, newBrochure);
        if (uploadError) {
            alert(`Error uploading brochure: ${uploadError.message}`);
            setLoading(false);
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('listing-documents').getPublicUrl(filePath);
        brochureUrl = publicUrl;
    } else if (isEditMode && originalBrochureUrl && !formData.details.brochure_url) {
        const oldFilePath = originalBrochureUrl.substring(originalBrochureUrl.lastIndexOf('/listing-documents/') + 20);
        await supabase.storage.from('listing-documents').remove([oldFilePath]);
        brochureUrl = '';
    }

    const finalImageUrls = [...formData.image_urls, ...newImageUrls];
    const processedDetails = getProcessedDetails();
    processedDetails.brochure_url = brochureUrl;

    const dataForSupabase = {
        type: formData.type,
        location: formData.location,
        price: Number(formData.price),
        image_urls: finalImageUrls,
        map_embed: formData.map_embed,
        details: processedDetails,
    };

    let savedListing, listingError;

    if (isEditMode) {
        // UPDATE operation
        const { data, error } = await supabase
            .from('listings')
            .update(dataForSupabase)
            .eq('id', formData.id!)
            .select()
            .single();
        savedListing = data;
        listingError = error;
    } else {
        // INSERT operation
        const { data, error } = await supabase
            .from('listings')
            .insert(dataForSupabase)
            .select()
            .single();
        savedListing = data;
        listingError = error;
    }
    
    if (listingError || !savedListing) {
      alert('Error saving listing: ' + listingError?.message);
      setLoading(false);
      return;
    }

    // 2. Upsert English translation (required)
    const enTranslationData = {
        listing_id: savedListing.id,
        title: formData.en_title,
        description: formData.en_description,
    };
    const { error: enError } = await supabase
        .from('listing_translations')
        .upsert(enTranslationData, { onConflict: 'listing_id' });

    if (enError) {
        alert('Error saving English translation: ' + enError.message);
        setLoading(false);
        return;
    }

    // 3. Upsert or Delete Telugu translation (optional)
    if (formData.te_title) {
        // If there's a title, upsert the translation
        const teTranslationData = {
            listing_id: savedListing.id,
            title: formData.te_title,
            description: formData.te_description,
        };
        const { error: teError } = await supabase
            .from('listing_translations_telugu')
            .upsert(teTranslationData, { onConflict: 'listing_id' });

        if (teError) {
            alert('Error saving Telugu translation: ' + teError.message);
            setLoading(false);
            return;
        }
    } else {
        // If there's no title, delete any existing translation
        const { error: teDeleteError } = await supabase
            .from('listing_translations_telugu')
            .delete()
            .match({ listing_id: savedListing.id });

        if (teDeleteError) {
            alert('Error updating Telugu translation: ' + teDeleteError.message);
            setLoading(false);
            return;
        }
    }


    alert('Listing saved successfully!');
    navigate('/listings');
    setLoading(false);
  };
  
  const getFileNameFromUrl = (url: string) => {
    if (!url) return '';
    try {
        const decodedUrl = decodeURIComponent(url);
        return decodedUrl.substring(decodedUrl.lastIndexOf('/') + 15);
    } catch (e) {
        return 'Invalid file name';
    }
  };

  const renderDetailsForm = () => {
    const commonInputClass = "w-full p-2 border rounded bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const commonCheckboxClass = "h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800";
    const commonLabelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";
    const availableAmenities = AMENITIES_BY_TYPE[formData.type];
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            switch(formData.type) {
              case 'plot':
                return (
                  <>
                    <input name="area_sq_yards" placeholder="Area (Sq. Yards)" value={formData.details.area_sq_yards || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <input name="plot_number" placeholder="Plot Number" value={formData.details.plot_number || ''} onChange={handleDetailsChange} className={commonInputClass} />
                    <input name="road_facing" placeholder="Road Facing (e.g., East)" value={formData.details.road_facing || ''} onChange={handleDetailsChange} className={commonInputClass} />
                    <input name="survey_no" placeholder="Survey Number" value={formData.details.survey_no || ''} onChange={handleDetailsChange} className={commonInputClass} />
                    <div className="flex items-center gap-2">
                        <input id="gated_community" name="gated_community" checked={formData.details.gated_community || false} onChange={handleDetailsChange} type="checkbox" className={commonCheckboxClass} />
                        <label htmlFor="gated_community" className={commonLabelClass}>Gated Community</label>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="investment_features_plot" className={`block mb-1 ${commonLabelClass}`}>Investment Features</label>
                        <textarea
                            id="investment_features_plot"
                            name="investment_features"
                            placeholder="e.g., 250 sq-yards for 10 lacs, 300 sq-yards for 12 lacs"
                            value={formData.details.investment_features || ''}
                            onChange={handleDetailsChange}
                            className={commonInputClass}
                            rows={3}
                        />
                    </div>
                  </>
                );
              case 'flat':
                return (
                  <>
                    <input name="bhk" placeholder="BHK" value={formData.details.bhk || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <input name="floor" placeholder="Floor" value={formData.details.floor || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <input name="total_floors" placeholder="Total Floors" value={formData.details.total_floors || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <input name="sq_ft" placeholder="Area (Sq. Ft)" value={formData.details.sq_ft || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <select name="furnishing" value={formData.details.furnishing || 'None'} onChange={handleDetailsChange} className={commonInputClass}>
                        <option value="None">None</option>
                        <option value="Semi">Semi-Furnished</option>
                        <option value="Full">Fully-Furnished</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <input id="car_parking" name="car_parking" checked={formData.details.car_parking || false} onChange={handleDetailsChange} type="checkbox" className={commonCheckboxClass} />
                        <label htmlFor="car_parking" className={commonLabelClass}>Car Parking Available</label>
                    </div>
                  </>
                );
              case 'villa':
                return (
                  <>
                    <input name="bhk" placeholder="BHK" value={formData.details.bhk || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <input name="sq_ft" placeholder="Area (Sq. Ft)" value={formData.details.sq_ft || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <select name="furnishing" value={formData.details.furnishing || 'None'} onChange={handleDetailsChange} className={commonInputClass}>
                        <option value="None">None</option>
                        <option value="Semi">Semi-Furnished</option>
                        <option value="Full">Fully-Furnished</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <input id="private_pool" name="private_pool" checked={formData.details.private_pool || false} onChange={handleDetailsChange} type="checkbox" className={commonCheckboxClass} />
                        <label htmlFor="private_pool" className={commonLabelClass}>Private Pool</label>
                    </div>
                  </>
                );
              case 'commercial':
                return (
                  <>
                    <input name="sq_ft" placeholder="Area (Sq. Ft)" value={formData.details.sq_ft || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <select name="property_type" value={formData.details.property_type || 'Office'} onChange={handleDetailsChange} className={commonInputClass}>
                        <option value="Office">Office</option>
                        <option value="Shop">Shop</option>
                        <option value="Showroom">Showroom</option>
                    </select>
                    <input name="floor" placeholder="Floor" value={formData.details.floor || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" />
                  </>
                );
              case 'agricultural':
                return (
                  <>
                    <input name="acres" placeholder="Acres" value={formData.details.acres || ''} onChange={handleDetailsChange} className={commonInputClass} type="number" required />
                    <input name="survey_no" placeholder="Survey Number" value={formData.details.survey_no || ''} onChange={handleDetailsChange} className={commonInputClass} />
                    <select name="water_source" value={formData.details.water_source || ''} onChange={handleDetailsChange} className={commonInputClass}>
                        <option value="">Select Water Source</option>
                        <option value="Borewell">Borewell</option>
                        <option value="Canal">Canal</option>
                        <option value="River">River</option>
                    </select>
                    <div className="md:col-span-2">
                        <label htmlFor="investment_features_agri" className={`block mb-1 ${commonLabelClass}`}>Investment Features</label>
                        <textarea
                            id="investment_features_agri"
                            name="investment_features"
                            placeholder="e.g., 5 acres for 50 lacs, 10 acres for 90 lacs"
                            value={formData.details.investment_features || ''}
                            onChange={handleDetailsChange}
                            className={commonInputClass}
                            rows={3}
                        />
                    </div>
                  </>
                );
              case 'others':
                return (
                  <>
                    <div className="md:col-span-2">
                        <label htmlFor="area_others" className={`block mb-1 ${commonLabelClass}`}>Area</label>
                        <input id="area_others" name="area" placeholder="e.g., 1200 sq.ft., 2 acres" value={formData.details.area || ''} onChange={handleDetailsChange} className={commonInputClass} required />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="investment_features_others" className={`block mb-1 ${commonLabelClass}`}>Investment Features</label>
                        <textarea
                            id="investment_features_others"
                            name="investment_features"
                            placeholder="Describe investment benefits or pricing structure"
                            value={formData.details.investment_features || ''}
                            onChange={handleDetailsChange}
                            className={commonInputClass}
                            rows={3}
                        />
                    </div>
                  </>
                );
              default:
                return <p className="text-gray-500 dark:text-gray-400 col-span-2">Select a property type to see its specific fields.</p>;
            }
          })()}
          <div className="md:col-span-2">
            <label htmlFor="connectivity" className={`block mb-1 ${commonLabelClass}`}>Connectivity</label>
            <textarea
                id="connectivity"
                name="connectivity"
                placeholder="e.g., 10 mins from ORR, 20 mins from Airport"
                value={formData.details.connectivity || ''}
                onChange={handleDetailsChange}
                className={commonInputClass}
                rows={3}
            />
          </div>
        </div>

        {/* Custom Details Section */}
        <div className="md:col-span-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Custom Details</h3>
                <button
                    type="button"
                    onClick={handleAddCustomDetail}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                >
                    <span className="material-icons text-base mr-1 -ml-1">add_circle</span>
                    Add New Custom Details
                </button>
            </div>
            <div className="space-y-3">
                {customDetails.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            name={`custom_key_${index}`}
                            placeholder="Key (e.g., Facing Direction)"
                            value={detail.key}
                            onChange={(e) => handleCustomDetailChange(index, 'key', e.target.value)}
                            className={`${commonInputClass} flex-1`}
                        />
                        <input
                            name={`custom_value_${index}`}
                            placeholder="Value (e.g., North-East)"
                            value={detail.value}
                            onChange={(e) => handleCustomDetailChange(index, 'value', e.target.value)}
                            className={`${commonInputClass} flex-1`}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveCustomDetail(index)}
                            className="p-2 text-red-600 rounded-md hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                            aria-label="Remove custom detail"
                        >
                            <span className="material-icons text-base">remove_circle_outline</span>
                        </button>
                    </div>
                ))}
                {customDetails.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No custom details added. Click 'Add' to include more information.</p>
                )}
            </div>
        </div>


        {/* Amenity Selector */}
        {(availableAmenities || customAmenities.length > 0) && (
            <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Amenities</h3>

                 {/* Add Custom Amenity UI */}
                <div className="flex items-center gap-2 mb-4 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    <input 
                        type="text"
                        placeholder="Enter new amenity name..."
                        value={newAmenityName}
                        onChange={(e) => setNewAmenityName(e.target.value)}
                        className={`${commonInputClass} flex-grow`}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); }}}
                    />
                    <button
                        type="button"
                        onClick={handleAddAmenity}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                    >
                        <span className="material-icons text-base mr-1 -ml-1">add</span>
                        Add
                    </button>
                </div>

                {availableAmenities && Object.entries(availableAmenities).map(([category, amenities]) => (
                    <div key={category} className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 capitalize mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {amenities.map(amenity => {
                                const isSelected = formData.details.amenities?.some((a: any) => a.name === amenity.name);
                                return (
                                    <button
                                        type="button"
                                        key={amenity.name}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
                                        }`}
                                    >
                                        <span className="material-icons text-base">{amenity.icon}</span>
                                        <span>{amenity.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {customAmenities.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Custom Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                            {customAmenities.map(amenity => {
                                const isSelected = formData.details.amenities?.some((a: any) => a.name === amenity.name);
                                return (
                                    <button
                                        type="button"
                                        key={amenity.name}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
                                        }`}
                                    >
                                        <span className="material-icons text-base">{amenity.icon}</span>
                                        <span>{amenity.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        )}
      </>
    );
  }

  const inputStyles = "w-full p-2 border rounded bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const textAreaStyles = `${inputStyles} h-32`;
  const sectionContainerStyles = "p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-2";
  const sectionTitleStyles = "font-semibold text-gray-900 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'Edit Listing' : 'Create New Listing'}</h1>
      
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select name="type" value={formData.type} onChange={handleChange} className={inputStyles}>
          {PROPERTY_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
        </select>
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} className={inputStyles} required />
        <input name="price" placeholder="Price" value={formData.price} onChange={handleChange} className={inputStyles} type="number" required />
      </div>

      {/* Dynamic Details */}
      <div className={`${sectionContainerStyles} space-y-4`}>
        <h2 className={sectionTitleStyles}>Property Details</h2>
        {renderDetailsForm()}
      </div>
      
      {/* Translations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={sectionContainerStyles}>
            <h2 className={sectionTitleStyles}>English Content</h2>
            <input name="en_title" placeholder="Title (English)" value={formData.en_title} onChange={handleChange} className={inputStyles} required />
            <textarea name="en_description" placeholder="Description (English)" value={formData.en_description} onChange={handleChange} className={textAreaStyles} />
        </div>
        <div className={sectionContainerStyles}>
            <h2 className={sectionTitleStyles}>Telugu Content</h2>
            <input name="te_title" placeholder="Title (Telugu)" value={formData.te_title} onChange={handleChange} className={inputStyles} />
            <textarea name="te_description" placeholder="Description (Telugu)" value={formData.te_description} onChange={handleChange} className={textAreaStyles} />
        </div>
      </div>
      
       {/* Admin Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={sectionContainerStyles}>
            <h2 className={sectionTitleStyles}>Admin Note (English)</h2>
            <textarea 
                name="note_en" 
                placeholder="Internal note for this property (English)..." 
                value={formData.details.note_en || ''} 
                onChange={handleDetailsChange} 
                className={textAreaStyles} 
            />
        </div>
        <div className={sectionContainerStyles}>
            <h2 className={sectionTitleStyles}>Admin Note (Telugu)</h2>
            <textarea 
                name="note_te" 
                placeholder="Internal note for this property (Telugu)..." 
                value={formData.details.note_te || ''} 
                onChange={handleDetailsChange} 
                className={textAreaStyles} 
            />
        </div>
      </div>

       {/* Map Embed URL */}
       <div>
        <label htmlFor="map_embed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Embed URL</label>
        <input 
            id="map_embed" 
            name="map_embed" 
            placeholder="Paste Google Maps URL or full <iframe> code" 
            value={formData.map_embed} 
            onChange={handleChange} 
            className={`${inputStyles} font-mono text-sm`} 
        />
      </div>
      
      {/* YouTube Embed URL */}
      <div>
        <label htmlFor="youtube_embed_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">YouTube Video Embed URL</label>
        <input 
            id="youtube_embed_url"
            name="youtube_embed_url" 
            placeholder="https://www.youtube.com/embed/VIDEO_ID" 
            value={formData.details.youtube_embed_url || ''} 
            onChange={handleDetailsChange} 
            className={`${inputStyles} font-mono text-sm`} 
        />
      </div>

      {/* Brochure Uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brochure / Document</label>
        <div className="mt-1 flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
            <span className="material-icons text-gray-500">description</span>
            <div className="flex-grow">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                    {newBrochure ? newBrochure.name : getFileNameFromUrl(formData.details.brochure_url) || 'No file selected.'}
                </p>
            </div>
            {(newBrochure || formData.details.brochure_url) && (
                <button type="button" onClick={handleRemoveBrochure} className="text-sm font-medium text-red-600 hover:text-red-800">Remove</button>
            )}
            <label htmlFor="brochure-upload" className="cursor-pointer px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span>{formData.details.brochure_url || newBrochure ? 'Change' : 'Upload'}</span>
                <input id="brochure-upload" name="brochure-upload" type="file" className="sr-only" onChange={handleBrochureSelect} accept=".pdf,.doc,.docx" />
            </label>
        </div>
      </div>

      {/* Image Uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Images</label>
        <div className="mt-1 p-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                 <span className="material-icons mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 text-5xl">cloud_upload</span>
                <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                        <span>Upload files</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleImageSelect} accept="image/png, image/jpeg, image/webp" />
                    </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP</p>
            </div>
        </div>
        
        {/* Image Previews */}
        {(formData.image_urls.length > 0 || (formData.new_images && formData.new_images.length > 0)) && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Existing Images */}
                {formData.image_urls.map((url, index) => (
                    <div key={url} className="relative group rounded-md overflow-hidden">
                        <img src={url} alt={`Property image ${index + 1}`} className="h-32 w-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => handleRemoveExistingImage(index)} className="p-1.5 bg-red-600 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span className="material-icons text-base">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
                {/* New Images */}
                {(formData.new_images || []).map((file, index) => (
                    <div key={file.name + index} className="relative group rounded-md overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt={`New upload preview ${index + 1}`} className="h-32 w-full object-cover" />
                         <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button type="button" onClick={() => handleRemoveNewImage(index)} className="p-1.5 bg-red-600 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span className="material-icons text-base">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
        {loading ? 'Saving...' : (isEditMode ? 'Update Listing' : 'Save Listing')}
      </button>
    </form>
  );
};

export default ListingForm;