import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { QRScanner } from './components/QRScanner';
import { SessionManager } from './components/SessionManager';
import { UserManager } from './components/UserManager';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'scanner':
        return <QRScanner />;
      case 'sessions':
        return currentUser?.role === 'admin' ? <SessionManager /> : <Dashboard />;
      case 'users':
        return currentUser?.role === 'admin' ? <UserManager /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <div className="App">
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </div>
    </AppProvider>
  );
}

export default App;