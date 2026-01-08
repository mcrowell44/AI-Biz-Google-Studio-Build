
import React, { useState } from 'react';
import { Settings, Save, Code, Copy, Eye, Zap, Sliders, Globe, Key, Mic } from 'lucide-react';

const AgentBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'embed'>('config');

  const embedCode = `<script src="https://cdn.aibizpro.ai/widget.js"></script>
<script>
  window.AIBizPro.init({
    agentId: 'agent_928347',
    theme: 'dark',
    position: 'bottom-right'
  });
</script>`;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Agent Deployment</h2>
          <p className="text-slate-400">Configure AI personality and get embed codes.</p>
        </div>
        <button className="bg-yellow-500 text-slate-950 px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 w-fit rounded-xl border border-slate-800">
        <button 
          onClick={() => setActiveTab('config')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'config' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Configuration
        </button>
        <button 
          onClick={() => setActiveTab('embed')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'embed' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Embed Code
        </button>
      </div>

      {activeTab === 'config' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - General Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-xl font-bold">
                <Zap className="text-yellow-500" />
                AI Logic & Attributes
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Primary Model Engine</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-yellow-500/50"
                    defaultValue="Gemini 2.5 Flash (Legacy/Stable)" // Set default to Gemini 2.5 for voice/deployment
                  >
                    <option>Gemini 3 Flash Preview (Standard)</option>
                    <option>Gemini 3 Pro Preview (Advanced Reasoning)</option>
                    <option>Gemini 2.5 Flash (Legacy/Stable)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Voice Synthesis Provider</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-yellow-500/50">
                    <option>Gemini Native (Multimodal Audio)</option>
                    <option>Eleven Labs (Premium Voice Clone)</option>
                    <option>Play.ht (Ultra-Realistic)</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Key size={14} className="text-slate-500" /> Model API Key (Optional)
                  </label>
                  <input 
                    type="password"
                    placeholder="sk-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-yellow-500/50"
                  />
                  <p className="text-[10px] text-slate-500">Leave blank to use system default keys.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Mic size={14} className="text-slate-500" /> Eleven Labs API Key
                  </label>
                  <input 
                    type="password"
                    placeholder="Enter Eleven Labs Key"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-yellow-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">System Instruction / Personality</label>
                <textarea 
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-yellow-500/50 resize-none text-sm"
                  placeholder="Example: You are a professional receptionist for Little Elm Basketball Training. Your goal is to capture parent leads and book evaluations..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-800 bg-slate-950 accent-yellow-500" />
                  <span className="text-sm text-slate-300">Inbound Support</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-800 bg-slate-950 accent-yellow-500" />
                  <span className="text-sm text-slate-300">Outbound Dialing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-800 bg-slate-950 accent-yellow-500" />
                  <span className="text-sm text-slate-300">Auto-Text Missed Calls</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Attributes & Integrations */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-xl font-bold">
                <Sliders className="text-orange-500" />
                Vocal Attributes
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 uppercase font-bold tracking-wider">
                    <span>Stability</span>
                    <span>75%</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-yellow-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 uppercase font-bold tracking-wider">
                    <span>Similarity Boost</span>
                    <span>82%</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-yellow-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 uppercase font-bold tracking-wider">
                    <span>Temperature (Creativity)</span>
                    <span>0.7</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-yellow-500" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-xl font-bold">
                <Globe className="text-blue-500" />
                Agent Identity
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Assigned Business Line</p>
                  <p className="text-lg font-semibold text-white">+1 (214) 555-0192</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Notification Email</p>
                  <p className="text-sm font-semibold text-white">reception@trainingbiz.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Code className="text-green-500" />
            Integration Snippets
          </div>
          <p className="text-slate-400">Copy and paste these codes into your website's header or before the closing body tag.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-300">Global Chat & Voice Bridge Script</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(embedCode)}
                  className="text-yellow-500 hover:text-yellow-400 flex items-center gap-1 transition-colors"
                >
                  <Copy size={14} /> Copy Code
                </button>
              </div>
              <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-sm text-yellow-500 font-mono leading-relaxed">
                {embedCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentBuilder;