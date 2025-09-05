import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Listing } from '../../types';
import { formatPriceInLakhsCrores } from '../../utils/formatters';

// Placeholder for full listing type with translations
type ListingWithTitle = Listing & { title: string };

const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<ListingWithTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      // 1. Fetch all listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (listingsError) {
        setError(listingsError.message);
        setLoading(false);
        return;
      }
      if (!listingsData) {
        setListings([]);
        setLoading(false);
        return;
      }

      // 2. Fetch all English translations for these listings
      const listingIds = listingsData.map(l => l.id);
      const { data: translationsData } = await supabase
        .from('listing_translations')
        .select('listing_id, title')
        .in('listing_id', listingIds);

      // 3. Create a map for quick lookup
      const translationMap = new Map<number, string>();
      if (translationsData) {
        translationsData.forEach(t => {
          translationMap.set(t.listing_id, t.title);
        });
      }
      
      // 4. Join them
      const formattedData = listingsData.map((item) => ({
        ...item,
        title: translationMap.get(item.id) || 'No Title'
      }));

      setListings(formattedData);
      setLoading(false);
    };

    fetchListings();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
        const { error } = await supabase.from('listings').delete().match({ id });
        if (error) {
            alert('Error deleting listing: ' + error.message);
        } else {
            setListings(listings.filter(l => l.id !== id));
        }
    }
  }

  if (loading) return <div>Loading listings...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Property Listings</h1>
        <Link to="/listings/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
           <span className="material-icons mr-2">add</span>
          Add New Listing
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm divide-y-2 divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">Title</th>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">Type</th>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">Location</th>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">Price</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{listing.title}</td>
                <td className="px-4 py-2 text-gray-700 capitalize whitespace-nowrap">{listing.type}</td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{listing.location}</td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{formatPriceInLakhsCrores(listing.price)}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                   <Link to={`/listings/edit/${listing.id}`} className="inline-block p-1 text-gray-700 rounded hover:bg-gray-100">
                      <span className="material-icons text-base">edit</span>
                    </Link>
                    <button onClick={() => handleDelete(listing.id)} className="inline-block p-1 ml-2 text-red-700 rounded hover:bg-red-100">
                       <span className="material-icons text-base">delete</span>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListingsPage;