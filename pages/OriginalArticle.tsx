import React from 'react';
import { useAppStore } from '../store';
import { Globe, Save, Trash2 } from 'lucide-react';

const OriginalArticle: React.FC = () => {
  const { article, setArticleTitle, setArticleContent, setArticleUrl, resetArticle } = useAppStore();

  const handleCrawl = async () => {
     if (!article.url) return;
     // Mock crawl behavior since client-side crawling is restricted
     try {
         // In a real app, this would hit a backend proxy
         const response = await fetch(article.url); 
         // Most likely to fail due to CORS
         const text = await response.text();
         // Very rough extraction for demo purposes if CORS allows (e.g. same origin or permissible)
         const parser = new DOMParser();
         const doc = parser.parseFromString(text, 'text/html');
         const title = doc.querySelector('title')?.innerText || 'Extracted Title';
         const content = doc.querySelector('body')?.innerText || 'Extracted content...';
         
         setArticleTitle(title);
         setArticleContent(content.substring(0, 5000)); // Limit length
     } catch (e) {
         alert("Could not crawl URL directly due to browser security restrictions (CORS). Please paste content manually.");
     }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Original Article</h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Import from URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/news/article"
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={article.url || ''}
              onChange={(e) => setArticleUrl(e.target.value)}
            />
            <button 
                onClick={handleCrawl}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 flex items-center gap-2 font-medium"
            >
              <Globe size={18} />
              Crawl
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Note: Crawling may fail due to CORS. Manual paste recommended.</p>
        </div>

        <div className="border-t pt-4">
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

export default OriginalArticle;
