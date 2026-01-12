import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store';
import { FileText, Edit3, Image as ImageIcon, Volume2, Settings, LogOut } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAppStore();
  const navItems = [
    { to: "/", icon: FileText, label: "Start" },
    { to: "/edit", icon: Edit3, label: "Edit Text" },
    { to: "/images", icon: ImageIcon, label: "Images" },
    { to: "/sounds", icon: Volume2, label: "Sounds" },
    { to: "/config", icon: Settings, label: "Config" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-indigo-600">Adapter AI</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-red-600 mt-auto"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
        <div className="p-4 border-t text-xs text-gray-400 text-center">
           Powered by Gemini & ElevenLabs
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow p-4 flex items-center justify-between">
            <span className="font-bold text-indigo-600">Adapter AI</span>
             <div className="flex space-x-4">
                 {navItems.map(item => (
                     <NavLink key={item.to} to={item.to} className={({isActive}) => isActive ? "text-indigo-600" : "text-gray-500"}>
                         <item.icon size={20} />
                     </NavLink>
                 ))}
             </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
