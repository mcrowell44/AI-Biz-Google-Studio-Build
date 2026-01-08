
import React, { useState } from 'react';
import { Search, MapPin, Building2, Phone, Mail, Globe, CheckCircle, Save, ExternalLink, Clock, Lightbulb, AlertCircle, Info, Star } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { BusinessAnalysis } from '../types'; // Import the updated BusinessAnalysis interface

interface GroundingSource {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

interface BusinessResult extends BusinessAnalysis { // Extend from BusinessAnalysis
  id: string;
  groundingSources: GroundingSource[];
  rawText: string; // Store raw text for detailed display and debugging
  savedToCRM: boolean;
}

interface BusinessSearchProps {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const BusinessSearch: React.FC<BusinessSearchProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ industry: '', area: '' });
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Default coordinates for a central point near Little Elm, TX (e.g., Dallas area) for Maps grounding
  // In a real app, this would come from navigator.geolocation
  const defaultLatLng = {
    latitude: 33.0524, // Approx. Little Elm
    longitude: -96.9450, // Approx. Little Elm
  };

  const parseBusinessResults = (markdownText: string, groundingSources: GroundingSource[]): BusinessResult[] => {
    const businesses: BusinessResult[] = [];
    const sections = markdownText.split(/(?=^##\s)/gm);

    for (const section of sections) {
      if (!section.trim()) continue;

      const nameMatch = section.match(/^##\s*(.*)/m);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Business';

      const phoneMatch = section.match(/- \*\*Phone:\*\*\s*(.*)/i);
      const emailMatch = section.match(/- \*\*Email:\*\*\s*(.*)/i);
      const websiteMatch = section.match(/- \*\*Website:\*\*\s*(.*)/i);
      const websitePresenceMatch = section.match(/- \*\*Website Presence:\*\*\s*(.*)/i);


      const contactInfo = {
        phone: phoneMatch ? phoneMatch[1].trim() : undefined,
        email: emailMatch ? emailMatch[1].trim() : undefined,
        website: websiteMatch ? websiteMatch[1].trim() : undefined,
      };
      
      // Determine hasWebsite based on websiteMatch or explicit "No website found" in websitePresenceMatch
      const hasWebsite = !!contactInfo.website || (websitePresenceMatch && websitePresenceMatch[1].toLowerCase() !== 'no website found');
      
      const painPointsMatch = section.match(/Key pain points from Google reviews:\s*(\n(\s*-.+)+)/im);
      const painPoints = painPointsMatch ? painPointsMatch[1].split('\n').map(p => p.replace(/^- /, '').trim()).filter(Boolean) : [];

      const bestTimeCallMatch = section.match(/Best suggested time to call this business:\s*(.*)/im);
      const bestTimeCall = bestTimeCallMatch ? bestTimeCallMatch[1].trim() : 'Unspecified';

      const salesStrategyMatch = section.match(/A concise sales strategy for AI Biz Pro solutions:\s*((.|\n)*?)(?=(AI Biz Pro Priority:|$))/im);
      const salesStrategy = salesStrategyMatch ? salesStrategyMatch[1].trim() : 'No strategy provided.';

      const priorityMatch = section.match(/AI Biz Pro Priority \((High|Standard)\):\s*(.*)/i);
      const priority: 'High' | 'Standard' | 'Unknown' = priorityMatch ? (priorityMatch[1].trim() as 'High' | 'Standard') : 'Unknown';
      const priorityReason = priorityMatch ? priorityMatch[2].trim() : undefined;
      
      businesses.push({
        id: `biz-${Date.now()}-${businesses.length}`,
        name,
        contactInfo,
        hasWebsite,
        painPoints,
        bestTimeCall,
        salesStrategy,
        priority,
        priorityReason,
        groundingSources, 
        rawText: section, 
        savedToCRM: false,
      });
    }
    return businesses;
  };

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    setApiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Find 8 to 10 real ${query.industry} businesses in ${query.area}. For each business, provide the following details in a clear, structured Markdown format:
      
      ## [Business Name]
      - **Contact Information:**
        - Phone: [Phone Number if found, or 'Not available']
        - Email: [Email if found, or 'Not available']
        - Website: [Website URL if found, or 'No website found']
      - **Key pain points from Google reviews:** (specifically mention if you find evidence of: missed calls, bad customer retention, long waits, canceled jobs, low star rating, or very low Google Business Profile activity)
        - [Pain point 1]
        - [Pain point 2]
      - **Best suggested time to call this business:** [e.g., Weekdays 9 AM - 12 PM]
      - **A concise sales strategy for AI Biz Pro solutions:** [How AI Biz Pro directly addresses their pain points and improves their business operations, e.g., "Implement AI-driven missed call text-back to recover lost leads instantly and automate appointment booking."]
      - **AI Biz Pro Priority (High/Standard):** [Reason for priority based on website presence, severe pain points like missed calls/bad retention, or low Google activity.]

      Prioritize real-world, verifiable data and insights from both web search and maps. Ensure all contact details and pain points are explicit.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {}, googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: defaultLatLng,
            }
          }
        }
      });

      const textResponse = response.text || "No detailed text response from AI.";
      const groundingChunks: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const parsedBusinesses = parseBusinessResults(textResponse, groundingChunks);
      setResults(parsedBusinesses);

      if (parsedBusinesses.length > 0 && parsedBusinesses.length < 5) {
        showToast(`Found ${parsedBusinesses.length} results. You may get more by broadening your search area.`, 'info');
      } else if (parsedBusinesses.length === 0) {
        showToast("No businesses found for your search. Try broadening your criteria or location.", 'warning');
      }

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      console.error("Error response:", err.response);
      setApiError(
        `Error: Could not connect to Gemini API. Please ensure your 'process.env.API_KEY' is correctly configured, ` +
        `valid, and has billing enabled for 'gemini-2.5-flash' model usage. ` +
        `Details: ${err.message || "Unknown error"}`
      );

      setResults(getFallbackBusinessData()); 
      showToast("API error occurred. Displaying sample data.", 'error');

    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCRM = (businessId: string) => {
    setResults(prevResults =>
      prevResults.map(biz =>
        biz.id === businessId ? { ...biz, savedToCRM: true } : biz
      )
    );
    const businessToSave = results.find(biz => biz.id === businessId);
    if (businessToSave) {
      console.log("Simulating save to CRM:", businessToSave);
      showToast(`'${businessToSave.name}' saved to CRM!`, 'success');
    }
  };

  const getFallbackBusinessData = () => {
    return [
      {
        id: 'fallback-1',
        name: 'Elite Hoops Little Elm',
        contactInfo: {
          phone: '(214) 555-1234',
          email: 'info@elitehoops.com',
          website: 'https://www.elitehoops.com'
        },
        hasWebsite: true,
        painPoints: [
          'Inconsistent lead follow-up after calls (missed calls).',
          'Manual scheduling causes delays and errors (waits).',
          'Limited 24/7 client support.',
          'Low Google Business Profile activity.'
        ],
        bestTimeCall: 'Weekdays, 10 AM - 1 PM (after morning rush)',
        salesStrategy: 'Highlight AI Biz Pro\'s ability to instantly text back missed calls, automate scheduling for trial sessions, and provide 24/7 FAQs via AI voice agent, converting more prospects.',
        priority: 'High',
        priorityReason: 'Missed calls, manual scheduling (waits), and low Google activity detected.',
        groundingSources: [
            { web: { uri: "https://www.google.com/search?q=Elite+Hoops+Little+Elm", title: "Google Search: Elite Hoops Little Elm" } },
            { maps: { uri: "https://www.google.com/maps/place/Elite+Hoops+Little+Elm", title: "Elite Hoops Little Elm on Google Maps" } }
        ],
        rawText: `## Elite Hoops Little Elm\n- **Contact Information:**\n  - Phone: (214) 555-1234\n  - Email: info@elitehoops.com\n  - Website: https://www.elitehoops.com\n- **Key pain points from Google reviews:**\n  - Inconsistent lead follow-up after calls (missed calls).\n  - Manual scheduling causes delays and errors (waits).\n  - Limited 24/7 client support.\n  - Low Google Business Profile activity.\n- **Best suggested time to call this business:** Weekdays, 10 AM - 1 PM (after morning rush)\n- **A concise sales strategy for AI Biz Pro solutions:** Highlight AI Biz Pro\'s ability to instantly text back missed calls, automate scheduling for trial sessions, and provide 24/7 FAQs via AI voice agent, converting more prospects.\n- **AI Biz Pro Priority (High):** Missed calls, manual scheduling (waits), and low Google activity detected.`,
        savedToCRM: false,
      },
      {
        id: 'fallback-2',
        name: 'North Dallas Elite Basketball',
        contactInfo: {
          phone: '(972) 555-5678',
          email: 'contact@ndelite.org',
          website: 'https://www.ndelite.org'
        },
        hasWebsite: true,
        painPoints: [
          'High call volume during peak enrollment periods (missed calls).',
          'Website inquiries sometimes go unanswered (bad customer retention).',
          'Difficulty providing instant class schedule updates.'
        ],
        bestTimeCall: 'Afternoons, 2 PM - 5 PM (before evening practices)',
        salesStrategy: 'Showcase AI Biz Pro\'s inbound call assistant to handle peak loads, automated email responses for web forms, and instant voice-guided access to class schedules, enhancing customer service.',
        priority: 'High',
        priorityReason: 'High call volume leading to missed calls, and inconsistent follow-up (bad retention).',
        groundingSources: [
            { web: { uri: "https://www.google.com/search?q=North+Dallas+Elite+Basketball", title: "Google Search: North Dallas Elite Basketball" } },
            { maps: { uri: "https://www.google.com/maps/place/North+Dallas+Elite+Basketball", title: "North Dallas Elite Basketball on Google Maps" } }
        ],
        rawText: `## North Dallas Elite Basketball\n- **Contact Information:**\n  - Phone: (972) 555-5678\n  - Email: contact@ndelite.org\n  - Website: https://www.ndelite.org\n- **Key pain points from Google reviews:**\n  - High call volume during peak enrollment periods (missed calls).\n  - Website inquiries sometimes go unanswered (bad customer retention).\n  - Difficulty providing instant class schedule updates.\n- **Best suggested time to call this business:** Afternoons, 2 PM - 5 PM (before evening practices)\n- **A concise sales strategy for AI Biz Pro solutions:** Showcase AI Biz Pro\'s inbound call assistant to handle peak loads, automated email responses for web forms, and instant voice-guided access to class schedules, enhancing customer service.\n- **AI Biz Pro Priority (High):** High call volume leading to missed calls, and inconsistent follow-up (bad retention).`,
        savedToCRM: false,
      },
      {
        id: 'fallback-3',
        name: 'Local Dentist Pro',
        contactInfo: {
          phone: '(469) 123-4567',
          email: 'smile@localdentist.com',
          website: 'No website found' // Explicitly no website
        },
        hasWebsite: false,
        painPoints: [
          'Clients often complain about long wait times in the office (waits).',
          'Missed calls during busy hours affect new patient acquisition.',
          'Difficulty retaining new patients due to poor follow-up (bad customer retention).'
        ],
        bestTimeCall: 'Late mornings, 10:30 AM - 12:00 PM (between patient surges)',
        salesStrategy: 'Focus on AI Biz Pro\'s ability to manage inbound calls, automatically schedule appointments, and send automated follow-ups to improve patient retention and reduce wait times.',
        priority: 'High',
        priorityReason: 'No website found, long wait times, missed calls, and bad customer retention identified.',
        groundingSources: [
          { web: { uri: "https://www.google.com/search?q=Local+Dentist+Pro+Frisco", title: "Google Search: Local Dentist Pro Frisco" } },
          { maps: { uri: "https://www.google.com/maps/place/Local+Dentist+Pro+Frisco", title: "Local Dentist Pro Frisco on Google Maps" } }
        ],
        rawText: `## Local Dentist Pro\n- **Contact Information:**\n  - Phone: (469) 123-4567\n  - Email: smile@localdentist.com\n  - Website: No website found\n- **Key pain points from Google reviews:**\n  - Clients often complain about long wait times in the office (waits).\n  - Missed calls during busy hours affect new patient acquisition.\n  - Difficulty retaining new patients due to poor follow-up (bad customer retention).\n- **Best suggested time to call this business:** Late mornings, 10:30 AM - 12:00 PM (between patient surges)\n- **A concise sales strategy for AI Biz Pro solutions:** Focus on AI Biz Pro\'s ability to manage inbound calls, automatically schedule appointments, and send automated follow-ups to improve patient retention and reduce wait times.\n- **AI Biz Pro Priority (High):** No website found, long wait times, missed calls, and bad customer retention identified.`,
        savedToCRM: false,
      }
    ];
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-bold">Business Prospector</h2>
        <p className="text-slate-400">Search industries, analyze local competition, and generate pitch strategies.</p>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label htmlFor="industry-input" className="text-sm font-medium text-slate-400">Industry</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                id="industry-input"
                value={query.industry}
                onChange={e => setQuery({...query, industry: e.target.value})}
                placeholder="e.g. Plumbing, HVAC, Dentists"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-yellow-500" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="location-input" className="text-sm font-medium text-slate-400">Location (Town, Zip, State)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                id="location-input"
                value={query.area}
                onChange={e => setQuery({...query, area: e.target.value})}
                placeholder="e.g. Frisco, 75068, TX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-yellow-500" 
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading || !query.industry || !query.area}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 text-slate-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Search size={20} />}
            {loading ? "Analyzing Leads..." : "Search & Analyze"}
          </button>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      {results.length > 0 && results.length < 5 && (
         <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
           <Info size={20} className="shrink-0" />
           <p className="text-sm font-medium">Only {results.length} results found. Try broadening your search area (e.g., a larger city or zip code) for more businesses.</p>
         </div>
      )}

      <div className="grid gap-8">
        {results.map((biz, idx) => (
          <div key={biz.id || idx} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{biz.name}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2">
                  {biz.contactInfo.phone && (
                    <span className="flex items-center gap-1 text-white">
                      <Phone size={16} className="text-yellow-500" /> {biz.contactInfo.phone}
                    </span>
                  )}
                  {biz.contactInfo.email && (
                    <span className="flex items-center gap-1 text-white">
                      <Mail size={16} className="text-blue-500" /> {biz.contactInfo.email}
                    </span>
                  )}
                  {biz.contactInfo.website && (
                    <a href={biz.contactInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white hover:text-yellow-400 transition-colors">
                      <Globe size={16} className="text-orange-500" /> Website <ExternalLink size={12} />
                    </a>
                  )}
                  {!biz.hasWebsite && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
                      <Globe size={12} /> No Website
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                {biz.priority === 'High' && (
                  <span className="flex items-center gap-1 px-4 py-2 rounded-xl font-bold uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20 text-sm shrink-0">
                    <Star size={16} /> High Priority
                  </span>
                )}
                <button 
                  onClick={() => handleSaveToCRM(biz.id)}
                  disabled={biz.savedToCRM}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
                    ${biz.savedToCRM 
                      ? 'bg-green-600 text-white cursor-not-allowed' 
                      : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400'
                    }`}
                >
                  {biz.savedToCRM ? (
                    <>
                      <CheckCircle size={18} /> Saved!
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save to CRM
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <h4 className="text-xl font-bold text-white">AI-Generated Analysis:</h4>
              
              {biz.priorityReason && biz.priority === 'High' && (
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-300 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <Star size={20} className="shrink-0 text-orange-400 mt-0.5" />
                  <p className="text-sm font-medium">
                    <strong className="text-white">High Priority Reason:</strong> {biz.priorityReason}
                  </p>
                </div>
              )}

              {/* Pain Points */}
              {biz.painPoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-400" /> Key Pain Points (from Google Reviews)
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1 marker:text-red-400">
                    {biz.painPoints.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Best Time to Call */}
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" /> Best Suggested Time to Call
                </p>
                <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {biz.bestTimeCall}
                </p>
              </div>

              {/* Sales Strategy */}
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Lightbulb size={14} className="text-yellow-400" /> AI Biz Pro Sales Strategy
                </p>
                <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {biz.salesStrategy}
                </p>
              </div>

              {biz.groundingSources && biz.groundingSources.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Globe size={14} /> Grounding Sources (from Google Search & Maps)
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                    {biz.groundingSources.map((source: GroundingSource, sIdx: number) => (
                      source.web ? (
                        <li key={`web-${sIdx}`} className="flex items-start gap-2">
                          <ExternalLink size={14} className="text-blue-400 mt-1 shrink-0" />
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {source.web.title || source.web.uri}
                          </a>
                        </li>
                      ) : source.maps ? (
                        <li key={`maps-${sIdx}`} className="flex items-start gap-2">
                          <MapPin size={14} className="text-red-400 mt-1 shrink-0" />
                          <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                            {source.maps.title || source.maps.uri} (Maps)
                          </a>
                        </li>
                      ) : null
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {!results.length && !loading && !apiError && (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
            <Search className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500">Enter an industry and location above to start generating leads.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessSearch;