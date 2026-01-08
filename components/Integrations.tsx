
import React from 'react';
import { Database, FileText, Calendar, Mail, Check, ExternalLink } from 'lucide-react';

const IntegrationCard = ({ name, description, icon, connected }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 hover:border-slate-700 transition-colors relative group">
    {connected && (
      <div className="absolute top-6 right-6 bg-green-500/10 text-green-500 p-1.5 rounded-full border border-green-500/20">
        <Check size={16} />
      </div>
    )}
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
    <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${connected ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400'}`}>
      {connected ? 'Connected' : 'Connect Account'}
      {!connected && <ExternalLink size={16} />}
    </button>
  </div>
);

const Integrations: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Integrations</h2>
        <p className="text-slate-400">Connect your business tools to sync leads, calendars, and documentation.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <IntegrationCard 
          name="Google Calendar" 
          description="Sync AI-booked appointments directly to your main schedule." 
          icon={<Calendar className="text-blue-500" />} 
          connected={true} 
        />
        <IntegrationCard 
          name="Google Sheets" 
          description="Automate lead capture and track metrics in real-time spreadsheets." 
          icon={<FileText className="text-green-500" />} 
          connected={true} 
        />
        <IntegrationCard 
          name="Google Drive" 
          description="Store voice recording logs and meeting transcripts securely." 
          icon={<Database className="text-yellow-500" />} 
          connected={false} 
        />
        <IntegrationCard 
          name="Gmail / SMTP" 
          description="Allow agents to send follow-up emails and nurture sequences." 
          icon={<Mail className="text-red-500" />} 
          connected={false} 
        />
      </div>
    </div>
  );
};

export default Integrations;
