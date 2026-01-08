
import React, { useState } from 'react';
import VoiceAssistant from './VoiceAssistant';
import { TrendingUp, PhoneCall, Calendar as CalendarIcon, ShieldCheck, Zap, X, BrainCircuit } from 'lucide-react';

interface LandingPageProps {
  onGoToAdmin: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void; // Added showToast prop
}

const Logo = ({ size = "md", showBorder = true, className = "" }: { size?: "sm" | "md" | "lg", showBorder?: boolean, className?: string }) => {
  const sizes = {
    sm: { text: "text-lg", icon: 16, tagline: "text-[5px]", padding: "px-3 py-1.5", gap: "gap-1" },
    md: { text: "text-3xl", icon: 28, tagline: "text-[7px]", padding: "px-6 py-3", gap: "gap-2" },
    lg: { text: "text-5xl", icon: 42, tagline: "text-[10px]", padding: "px-10 py-6", gap: "gap-3" }
  };
  
  const current = sizes[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className={`relative flex flex-col items-center ${showBorder ? `border border-transparent bg-slate-950 rounded-sm ${current.padding}` : ''}`}>
        {/* Glowing Border effect if requested */}
        {showBorder && (
          <div className="absolute inset-0 border border-yellow-500/50 rounded-sm pointer-events-none shadow-[0_0_15px_rgba(234,179,8,0.15)]" />
        )}
        
        <div className={`flex items-center ${current.gap} leading-none relative z-10`}>
          <span className={`font-black text-yellow-400 ${current.text}`}>Ai</span>
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-md rounded-full" />
            <BrainCircuit className="text-yellow-100/90 relative z-10" size={current.icon} strokeWidth={1.5} />
          </div>
          <span className={`font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-600 bg-clip-text text-transparent ${current.text}`}>Biz Pro</span>
        </div>
        
        <div className={`mt-1 font-bold tracking-[0.15em] text-slate-100 uppercase ${current.tagline} whitespace-nowrap relative z-10`}>
          YOUR AI BUSINESS PARTNER | INTELLIGENT BUSINESS SOLUTIONS
        </div>
      </div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto text-slate-300 space-y-4 text-sm leading-relaxed">
          {children}
        </div>
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-yellow-500 text-slate-950 px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGoToAdmin, showToast }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Simple Header - Focused on Brand */}
      <header className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo size="sm" showBorder={false} className="items-start" />
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-slate-700" />
              Secured Platform
            </div>
            <button 
              onClick={onGoToAdmin}
              className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Partner Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - The Main Feature */}
      <section className="pt-16 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap size={14} /> Next-Gen Business Intelligence
            </div>
            <h1 className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tight">
              NEVER MISS A <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                REVENUE OPPORTUNITY
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              AI Biz Pro handles inbound/outbound calls, creates contacts in CRM, handles booking, answers questions, even can close deals and take payments all with 100% human-like accuracy.
            </p>
          </div>

          {/* Featured Voice Assistant - Front and Center */}
          <div id="demo" className="max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-[2.5rem] p-12 border border-slate-800 shadow-2xl relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-[2.5rem] opacity-10 group-hover:opacity-20 transition duration-1000 blur"></div>
              
              <div className="relative space-y-10 text-center">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-white">Try our business voice assistant now</h2>
                  <p className="text-slate-400 text-lg">Talk to our assistant now to see how we can scale your business operations.</p>
                </div>
                
                <div className="py-10 bg-slate-950/50 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
                  <VoiceAssistant showToast={showToast} /> {/* Pass showToast here */}
                </div>
                
                <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Low Latency Response
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Native Voice Synthesis
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Context Aware
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-inner">
                <PhoneCall size={28} />
              </div>
              <h3 className="text-2xl font-bold">Inbound & Outbound</h3>
              <p className="text-slate-400 leading-relaxed text-lg">Seamlessly manage high-volume calls with an AI that sounds exactly like your best employee.</p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-2xl font-bold">Revenue Recovery</h3>
              <p className="text-slate-400 leading-relaxed text-lg">Instant auto-text back for missed calls ensures that every prospect feels heard immediately.</p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                <CalendarIcon size={28} />
              </div>
              <h3 className="text-2xl font-bold">Booking Automation</h3>
              <p className="text-slate-400 leading-relaxed text-lg">Direct integration with your calendar to book qualified appointments without manual entry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-950 border-t border-slate-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <Logo size="md" />
          
          <div className="flex flex-wrap justify-center gap-12 text-slate-500 text-sm font-medium">
            <button 
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setActiveModal('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <a href="https://digitalmp.store" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors">Contact Support</a>
          </div>
          
          <div className="text-center space-y-2 pt-8 border-t border-slate-900 w-full">
            <p className="text-slate-500 text-xs font-medium">Developed by Crowell Digital Marketplace <a href="https://cdmweb.store" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors">cdmweb.store</a></p>
            <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">© 2026 Ai Biz Pro • Intelligent Business Solutions</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="Privacy Policy"
      >
        <p className="font-bold text-white">Last Updated: May 2024</p>
        <p>At AIBiz Pro, operated by Crowell Digital Marketplace, we take your privacy seriously. This policy describes how we collect, use, and handle your data.</p>
        
        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">1. Information We Collect</h4>
        <p>When you interact with our Voice AI Demo, we may collect information you voluntarily provide, including your Name, Business Name, Phone Number, and Email Address. We also process audio data in real-time to facilitate the voice interaction.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">2. How We Use Data</h4>
        <p>We use your information to facilitate the demonstration, schedule requested appointments, send confirmation emails, and improve our AI models. Audio data is processed via Google Gemini API and is not stored permanently by AIBiz Pro after the session concludes unless specifically required for lead capture.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">3. Data Security</h4>
        <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">4. Third-Party Services</h4>
        <p>Our platform utilizes Google Gemini API for natural language processing and voice synthesis. Your interactions are subject to Google's privacy protocols during the processing phase.</p>

        <p className="mt-6 italic">For questions, contact us at cdmweb.store</p>
      </Modal>

      <Modal 
        isOpen={activeModal === 'terms'} 
        onClose={() => setActiveModal(null)} 
        title="Terms of Service"
      >
        <p className="font-bold text-white">Agreement to Terms</p>
        <p>By accessing AIBiz Pro, you agree to be bound by these Terms of Service provided by Crowell Digital Marketplace.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">1. Use of Service</h4>
        <p>AIBiz Pro is provided as an AI-powered business tool. You agree to use this service only for lawful purposes and in accordance with the rules of your local jurisdiction regarding telecommunications and automated voice interactions.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">2. AI Disclaimer</h4>
        <p>Our voice agents use advanced Large Language Models. While highly accurate, the AI may occasionally provide information that is inaccurate or incomplete. Crowell Digital Marketplace is not liable for actions taken based on AI-generated responses.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">3. Intellectual Property</h4>
        <p>The AIBiz Pro brand, interface, and underlying logic are the property of Crowell Digital Marketplace. No portion of this service may be reproduced or exploited without express written consent.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">4. Limitation of Liability</h4>
        <p>Crowell Digital Marketplace shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our AI services.</p>

        <h4 className="font-bold text-white mt-4 uppercase text-xs tracking-widest">5. Governing Law</h4>
        <p>These terms are governed by and construed in accordance with the laws of the jurisdiction in which Crowell Digital Marketplace operates.</p>
      </Modal>
    </div>
  );
};

export default LandingPage;