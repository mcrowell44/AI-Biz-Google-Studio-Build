
import React, { useState } from 'react';
import { View } from './types';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AgentBuilder from './components/AgentBuilder';
import BusinessSearch from './components/BusinessSearch';
import CalendarView from './components/CalendarView';
import Integrations from './components/Integrations';
import Toast from './components/Toast'; // Import the new Toast component
import VoiceAssistant from './components/VoiceAssistant'; // Import VoiceAssistant to pass showToast

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; id: number } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type, id: Date.now() });
  };

  if (currentView === View.LANDING) {
    // Pass showToast to LandingPage so it can pass to VoiceAssistant
    return <LandingPage onGoToAdmin={() => setCurrentView(View.DASHBOARD)} showToast={showToast} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.AGENT_BUILDER:
        return <AgentBuilder />;
      case View.BUSINESS_SEARCH:
        // Pass the showToast function to BusinessSearch
        return <BusinessSearch showToast={showToast} />;
      case View.CALENDAR:
        return <CalendarView />;
      case View.INTEGRATIONS:
        return <Integrations />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderContent()}
      {toast && (
        <Toast 
          key={toast.id} // Use id to force re-render and re-start animation for each new toast
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </Layout>
  );
};

export default App;