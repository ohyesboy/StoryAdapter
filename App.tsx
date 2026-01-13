import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppStore } from './store';
import Layout from './components/Layout';
import Start from './pages/Start';
import EditText from './pages/EditText';
import ImagesPage from './pages/ImagesPage';
import Sounds from './pages/Sounds';
import ConfigPage from './pages/ConfigPage';
import LoginPage from './pages/LoginPage';
import YoutubeTitle from './pages/YoutubeTitle';
import ErrorBoundary from './components/ErrorBoundary';

const MainContent: React.FC = () => {
    const { isAuthenticated } = useAppStore();

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <Layout>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/edit" element={<EditText />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/sounds" element={<Sounds />} />
            <Route path="/youtube" element={<YoutubeTitle />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <MainContent />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
