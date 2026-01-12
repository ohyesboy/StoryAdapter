import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store';
import { FileText, Edit3, Image as ImageIcon, Volume2, Settings, LogOut, Save, Upload } from 'lucide-react';
import { AppState } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    logout,
    article, 
    translations,
    textConfigs,
    imageConfig,
    srtConfig,
    voiceSettings,
    loadProject
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = () => {
    const projectData: Partial<AppState> = {
      article,
      translations: translations.map(t => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { voiceFile, ...rest } = t;
        return rest;
      })
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.id || 'article'}_project.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        loadProject(data);
      } catch (error) {
        console.error('Failed to load project:', error);
        alert('Failed to load project file');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const navItems = [
    { to: "/", icon: FileText, label: "Start" },
    { to: "/edit", icon: Edit3, label: "Edit Text" },
    { to: "/images", icon: ImageIcon, label: "Images" },
    { to: "/sounds", icon: Volume2, label: "Sounds" },
    { to: "/config", icon: Settings, label: "Config" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
      />
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-indigo-600">Adapter AI</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 flex flex-col">
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
          
          <div className="mt-auto space-y-2 pt-4 border-t">
            <button
              onClick={handleSaveProject}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-indigo-600 hover:bg-indigo-50 font-medium"
            >
              <Save size={20} />
              <span>Save Project</span>
            </button>
            <button
              onClick={handleLoadProject}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Upload size={20} />
              <span>Load Project</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-red-600"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
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
                 <button onClick={handleSaveProject} className="text-indigo-600"><Save size={20} /></button>
                 <button onClick={handleLoadProject} className="text-gray-500"><Upload size={20} /></button>
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
