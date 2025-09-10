import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Blog } from '../../types';

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      // Again, a real implementation would handle translations
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setBlogs(data || []);
        setFilteredBlogs(data || []);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);
  
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = blogs.filter(blog =>
      blog.title.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredBlogs(filtered);
  }, [searchQuery, blogs]);

    const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
        const { error } = await supabase.from('blogs').delete().match({ id });
        if (error) {
            alert('Error deleting blog post: ' + error.message);
        } else {
            setBlogs(blogs.filter(b => b.id !== id));
        }
    }
  }


  if (loading) return <div>Loading blog posts...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Blog Posts</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <span className="material-icons absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">search</span>
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    aria-label="Search blog posts by title"
                />
            </div>
            <Link to="/blogs/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shrink-0">
              <span className="material-icons mr-2">add</span>
              Add New Post
            </Link>
        </div>
      </div>

       <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
        <table className="min-w-full text-sm divide-y-2 divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap dark:text-gray-200">Title</th>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap dark:text-gray-200">Created At</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-gray-200">{blog.title}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap dark:text-gray-300">{new Date(blog.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                       <Link to={`/blogs/edit/${blog.id}`} className="inline-block p-1 text-gray-700 rounded hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                          <span className="material-icons text-base">edit</span>
                        </Link>
                        <button onClick={() => handleDelete(blog.id)} className="inline-block p-1 ml-2 text-red-700 rounded hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700">
                           <span className="material-icons text-base">delete</span>
                        </button>
                    </td>
                  </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No blog posts found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogsPage;