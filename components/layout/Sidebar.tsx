
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        if (auth) {
            await auth.signOut();
            navigate('/login');
        }
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
      `flex items-center w-full px-4 py-2.5 text-sm font-medium transition-colors duration-150 rounded-lg ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`;

    return (
        // Added sticky positioning to keep the sidebar visible and full-height on scroll
        <aside className="sticky top-0 h-screen z-20 flex-shrink-0 hidden w-64 bg-white dark:bg-gray-900 md:block shadow-lg">
            <div className="flex flex-col h-full text-gray-500 dark:text-gray-400">
                {/* Top part with logo and nav */}
                <div>
                    <a className="block px-6 py-4 text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
                        Devansh Infra
                    </a>
                    <ul className="mt-2 space-y-2">
                        <li className="relative px-6">
                            <NavLink to="/" className={navLinkClasses} end>
                                 <span className="material-icons mr-4" aria-hidden="true">dashboard</span>
                                Dashboard
                            </NavLink>
                        </li>
                        <li className="relative px-6">
                            <NavLink to="/hero" className={navLinkClasses}>
                                <span className="material-icons mr-4" aria-hidden="true">view_carousel</span>
                                Hero Content
                            </NavLink>
                        </li>
                        <li className="relative px-6">
                            <NavLink to="/listings" className={navLinkClasses}>
                                <span className="material-icons mr-4" aria-hidden="true">business</span>
                                Listings
                            </NavLink>
                        </li>
                        <li className="relative px-6">
                             <NavLink to="/blogs" className={navLinkClasses}>
                                <span className="material-icons mr-4" aria-hidden="true">article</span>
                                Blogs
                            </NavLink>
                        </li>
                         <li className="relative px-6">
                             <NavLink to="/footer" className={navLinkClasses}>
                                <span className="material-icons mr-4" aria-hidden="true">info</span>
                                Footer Content
                            </NavLink>
                        </li>
                    </ul>
                </div>
                
                {/* Spacer to push logout to the bottom */}
                <div className="flex-grow"></div>

                {/* Bottom part with logout */}
                <div className="px-6 py-4">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red"
                    >
                         <span className="material-icons mr-2" aria-hidden="true">logout</span>
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;