
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Blog } from '../../types';

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
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
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Blog Posts</h1>
        <Link to="/blogs/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="material-icons mr-2">add</span>
          Add New Post
        </Link>
      </div>

       <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm divide-y-2 divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">Title</th>
              <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">Created At</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{blog.title}</td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{new Date(blog.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                   <Link to={`/blogs/edit/${blog.id}`} className="inline-block p-1 text-gray-700 rounded hover:bg-gray-100">
                      <span className="material-icons text-base">edit</span>
                    </Link>
                    <button onClick={() => handleDelete(blog.id)} className="inline-block p-1 ml-2 text-red-700 rounded hover:bg-red-100">
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

export default BlogsPage;
