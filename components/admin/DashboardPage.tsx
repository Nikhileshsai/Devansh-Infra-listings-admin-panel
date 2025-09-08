
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Welcome to the Devansh Infra Admin Panel.</p>

      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
        <Card
          title="Manage Listings"
          description="Add, edit, and manage all property listings."
          link="/listings"
          icon="business"
        />
        <Card
          title="Manage Blogs"
          description="Create and update blog posts for your audience."
          link="/blogs"
          icon="article"
        />
        <Card
          title="Manage Hero Content"
          description="Update the main hero section of the homepage."
          link="/hero"
          icon="view_carousel"
        />
        <Card
          title="Manage Footer Content"
          description="Edit contact details, social links, and copyrights."
          link="/footer"
          icon="info"
        />
        <Card
          title="Deploy Website"
          description="Push all saved changes to the live website."
          link="/deployment"
          icon="cloud_upload"
        />
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  description: string;
  link: string;
  icon: string;
}

const Card: React.FC<CardProps> = ({ title, description, link, icon }) => (
  <Link to={link} className="block p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
    <div className="flex items-center">
      <span className="p-3 mr-4 text-white bg-indigo-500 rounded-full material-icons">{icon}</span>
      <div>
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </Link>
);


export default DashboardPage;
