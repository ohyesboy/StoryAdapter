import React from 'react';
import { useAppStore } from '../store';
import { Save, Trash2 } from 'lucide-react';

const Start: React.FC = () => {
  const { article, setArticleTitle, setArticleContent, resetArticle } = useAppStore();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Start</h2>
        <button
            onClick={() => {
              if (confirm('Are you sure you want to reset the article? This will clear the current content, translations and images.')) {
                resetArticle();
              }
            }}
            className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
            <Trash2 size={16} />
            Reset Article
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
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
