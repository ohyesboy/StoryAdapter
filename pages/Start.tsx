import React from 'react';
import { useAppStore } from '../store';
import { Trash2, Calendar } from 'lucide-react';
import { AppState } from '../types';

const Start: React.FC = () => {
  const { 
    article, 
    setArticleId, 
    setArticleTitle, 
    setArticleContent, 
    resetArticle
  } = useAppStore();

  const handleUseDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setArticleId(`${year}_${month}_${day}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Start</h2>
        <div className="flex gap-2">
            <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset the article? This will clear the current content, translations and images.')) {
                    resetArticle();
                  }
                }}
                className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-200"
            >
                <Trash2 size={16} />
                Reset Article
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article ID</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="e.g. 2023_10_27"
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={article.id || ''}
                    onChange={(e) => setArticleId(e.target.value)}
                />
                <button
                    onClick={handleUseDate}
                    className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 flex items-center gap-2 font-medium text-sm"
                    title="Use current date as ID"
                >
                    <Calendar size={18} />
                    Use Date
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for file naming (e.g. ID_config.txt).</p>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article Title</label>
            <input
                type="text"
                placeholder="Enter article title..."
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold"
                value={article.title}
                onChange={(e) => setArticleTitle(e.target.value)}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article Content</label>
            <textarea
                placeholder="Paste original article content here..."
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-96 resize-y"
                value={article.content}
                onChange={(e) => setArticleContent(e.target.value)}
            />
        </div>
      </div>
    </div>
  );
};

export default Start;
