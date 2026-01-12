import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store';
import Layout from './components/Layout';
import OriginalArticle from './pages/OriginalArticle';
import EditText from './pages/EditText';
import ImagesPage from './pages/ImagesPage';
import Sounds from './pages/Sounds';
import ConfigPage from './pages/ConfigPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<OriginalArticle />} />
            <Route path="/edit" element={<EditText />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/sounds" element={<Sounds />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
