
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        if (auth) {
            await auth.signOut();
            navigate('/login');
        }
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
      `flex items-center w-full px-4 py-2.5 text-sm font-medium transition-colors duration-150 rounded-lg ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`;

    return (
        <aside className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full text-gray-500 dark:text-gray-400">
                {/* Top part with logo and nav */}
                <div>
                    <div className="flex items-center justify-between px-6 py-4">
                        <a className="text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
                            Devansh Infra
                        </a>
                        <button 
                            className="md:hidden p-1 -mr-2 text-gray-500 rounded-md focus:outline-none focus:bg-gray-200 dark:focus:bg-gray-700"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close menu"
                        >
                            <span className="material-icons">close</span>
                        </button>
                    </div>

                    <ul className="mt-2 space-y-2">
                        <li className="relative px-6">
                            <NavLink to="/" className={navLinkClasses} onClick={handleLinkClick} end>
                                 <span className="material-icons mr-4" aria-hidden="true">dashboard</span>
                                Dashboard
                            </NavLink>
                        </li>
                        <li className="relative px-6">
                            <NavLink to="/hero" className={navLinkClasses} onClick={handleLinkClick}>
                                <span className="material-icons mr-4" aria-hidden="true">view_carousel</span>
                                Hero Content
                            </NavLink>
                        </li>
                        <li className="relative px-6">
                            <NavLink to="/listings" className={navLinkClasses} onClick={handleLinkClick}>
                                <span className="material-icons mr-4" aria-hidden="true">business</span>
                                Listings
                            </NavLink>
                        </li>
                        <li className="relative px-6">
                             <NavLink to="/blogs" className={navLinkClasses} onClick={handleLinkClick}>
                                <span className="material-icons mr-4" aria-hidden="true">article</span>
                                Blogs
                            </NavLink>
                        </li>
                         <li className="relative px-6">
                             <NavLink to="/footer" className={navLinkClasses} onClick={handleLinkClick}>
                                <span className="material-icons mr-4" aria-hidden="true">info</span>
                                Footer Content
                            </NavLink>
                        </li>
                         <li className="relative px-6">
                             <NavLink to="/deployment" className={navLinkClasses} onClick={handleLinkClick}>
                                <span className="material-icons mr-4" aria-hidden="true">cloud_upload</span>
                                Deployment
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
