
import React, { useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Mic, MicOff, Calendar as CalendarIcon, CheckCircle, Mail } from 'lucide-react';
import { encode, decode, decodeAudioData } from '../services/audioUtils';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [status, setStatus] = useState<string>("Click to start demo");
  const [bookingStatus, setBookingStatus] = useState<{ step: string; details?: any } | null>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null); // New ref for input audio context
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null); // New ref for microphone stream
  const sessionRef = useRef<any>(null); // The actual Live API session object
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null); // Ref to hold ScriptProcessorNode

  // Mock Calendar Data
  const availableSlots = ["Tomorrow at 10:00 AM", "Tomorrow at 2:00 PM", "Wednesday at 11:30 AM", "Friday at 9:00 AM"];

  const getAvailableSlotsDeclaration: FunctionDeclaration = {
    name: 'getAvailableSlots',
    description: 'Retrieves available time slots for a demo appointment.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  };

  const scheduleDemoDeclaration: FunctionDeclaration = {
    name: 'scheduleDemo',
    description: 'Schedules a demo appointment after collecting user details.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING, description: 'The customer\'s full name' },
        phone: { type: Type.STRING, description: 'The customer\'s phone number' },
        email: { type: Type.STRING, description: 'The customer\'s email address' },
        dateTime: { type: Type.STRING, description: 'The chosen date and time slot' }
      },
      required: ['fullName', 'phone', 'email', 'dateTime']
    }
  };

  const stopSession = () => {
    // 1. Close the Live API session
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    // 2. Stop all playing output audio sources
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // 3. Stop microphone stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // 4. Disconnect script processor if exists
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    // 5. Close audio contexts
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    
    // 6. Reset component state
    setIsActive(false);
    setStatus("Click to start demo");
    setTranscription("");
    setBookingStatus(null);
  };

  const startSession = async () => {
    // Ensure any previous session is fully stopped before starting a new one
    stopSession(); 

    try {
      setStatus("Connecting...");
      setBookingStatus(null);
      setTranscription(""); // Clear transcription on start

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store the media stream

      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor; // Store the script processor

      scriptProcessor.onaudioprocess = (e) => {
        // CRITICAL FIX: Only send audio if the sessionRef.current is assigned (meaning session is active)
        // Removed `!isActive` check to avoid stale closure issues and rely directly on sessionRef.current.
        if (!sessionRef.current) return; 

        const inputData = e.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const pcmBlob = {
          data: encode(new Uint8Array(int16.buffer)),
          mimeType: 'audio/pcm;rate=16000',
        };
        
        sessionRef.current.sendRealtimeInput({ media: pcmBlob });
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            // Status update on open, but initial trigger and setIsActive come after sessionPromise resolves
            setStatus("Assistant Ready (Waiting for voice)"); 
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => (prev + " " + message.serverContent?.outputTranscription?.text).trim());
            }

            // Handle Tool Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'getAvailableSlots') {
                  setBookingStatus({ step: 'Checking availability...' });
                  sessionRef.current?.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { slots: availableSlots }
                    }
                  });
                } else if (fc.name === 'scheduleDemo') {
                  const args = fc.args as any;
                  setBookingStatus({ step: 'Confirmed!', details: args });
                  // Simulate sending email to bookee and admin
                  console.log(`Email sent to ${args.email} and admin@aibizpro.ai`);
                  
                  sessionRef.current?.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result: "Success. Appointment booked and confirmation emails sent to both user and admin." }
                    }
                  });
                }
              }
            }

            // Handle Audio
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContextRef.current.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              setStatus("Assistant Speaking...");
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus("Assistant Ready (Interrupted)"); // Reset status
            }
            
            if (message.serverContent?.turnComplete) {
              setStatus("Listening...");
            }
          },
          onerror: (e) => {
            console.error("AI Error:", e);
            setStatus("Error encountered. Please try again.");
            stopSession(); // Clean up on error
          },
          onclose: (e) => {
            console.debug('Session closed:', e);
            stopSession(); // Clean up on close
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {}, // Enable model output transcription
          inputAudioTranscription: {}, // Enable user input transcription
          tools: [{ functionDeclarations: [getAvailableSlotsDeclaration, scheduleDemoDeclaration] }],
          // CRITICAL FIX: Set thinkingBudget to 0 for real-time responsiveness
          thinkingConfig: { thinkingBudget: 0 },
          systemInstruction: `
            You are the AIBiz Pro demonstration assistant. You must be extremely human-like, professional, and helpful.
            
            PHASE 1 (Initiation):
            When the user starts (triggered by 'START_CONVERSATION_TRIGGER'), you MUST speak first with exactly:
            "Hi there, I'm here to give you details on ai biz pro. Would That be ok?"

            PHASE 2 (Response Logic):
            - If they say YES to the initial question: Ask exactly "What's your name and business?"
              * After they provide their name and business, immediately transition to showcasing benefits and offering a demo. Say:
                "Great to meet you, [User's Name]. AIBiz Pro offers 24/7 call handling, missed call text-back, and auto-booking. How do you currently handle missed calls or new client scheduling?"
                Then, if they show any interest in a demo or scheduling, move to the booking flow.
            - If they say NO to the initial question: Ask exactly "Ok, no problem, what can i help you with?"
              * After this, listen for their request. If it aligns with AIBiz Pro features, explain the feature and offer a demo. If not, politely redirect to AIBiz Pro's capabilities.

            PHASE 3 (Value Discovery & Booking Flow):
            - Proactively showcase benefits: 24/7 call handling, missed call text-back, auto-booking.
            - Ask discovery questions to raise value (e.g., "How do you handle missed calls currently?", "Are you looking for ways to streamline client intake?").
            - BOOKING FLOW:
              1. If the user expresses interest in a demo or appointment, you MUST offer to schedule it.
              2. Use 'getAvailableSlots' to see when the team is free.
              3. Present the options to the user.
              4. To complete the booking, you MUST collect: Full Name, Phone Number, and Email.
              5. Once you have all details and a chosen time slot, call 'scheduleDemo'.
              6. Inform the user that a confirmation email has been sent to them and to the admin.
            - Do NOT dominate. Be concise, warm, and use natural pauses.
          `,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });

      sessionRef.current = await sessionPromise; // Store the resolved session object
      setIsActive(true); // Now the UI state correctly reflects the active session
      
      // CRITICAL: Send the initial trigger AFTER the sessionRef.current is guaranteed to be set.
      sessionRef.current.sendRealtimeInput({ text: "START_CONVERSATION_TRIGGER" });

    } catch (err) {
      console.error("Failed to start session:", err);
      setStatus("Microphone access denied or error. Please allow microphone permissions and try again.");
      stopSession(); // Clean up on initial error
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className={`relative group transition-all duration-700 ${isActive ? 'scale-110' : ''}`}>
        <div className={`absolute -inset-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-full opacity-20 blur-2xl group-hover:opacity-50 transition-opacity ${isActive ? 'animate-pulse' : ''}`} />
        <button
          onClick={isActive ? stopSession : startSession}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(234,179,8,0.3)] transition-all active:scale-95 z-10 ${
            isActive ? 'bg-red-500 shadow-red-500/20' : 'bg-yellow-500 shadow-yellow-500/40'
          }`}
        >
          {isActive ? <MicOff size={44} /> : <Mic size={44} />}
        </button>
      </div>

      <div className="text-center space-y-4 px-6 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-ping' : 'bg-slate-700'}`} />
          <span className="text-xl font-bold tracking-tight text-white uppercase">{status}</span>
        </div>
        
        {isActive && (
          <div className="space-y-4">
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner backdrop-blur-md">
              <div className="flex justify-center gap-1.5 h-10 items-end mb-4">
                {isActive && [...Array(20)].map((_, i) => ( // Only animate if active
                  <div 
                    key={i} 
                    className="w-1.5 bg-yellow-500/80 rounded-full animate-wave" 
                    style={{ 
                      animationDelay: `${i * 0.05}s`, 
                      animationDuration: '1s', // Adjusted duration for smoother wave
                      height: `${20 + Math.random() * 80}%` 
                    }}
                  />
                ))}
              </div>
              {transcription ? (
                <p className="text-slate-300 text-sm italic leading-relaxed">
                  "{transcription.length > 150 ? '...' + transcription.slice(-150) : transcription}"
                </p>
              ) : (
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Waiting for speech...</p>
              )}
            </div>

            {bookingStatus && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3 text-yellow-500">
                  {bookingStatus.step.includes('Confirmed') ? <CheckCircle size={20} /> : <CalendarIcon size={20} className="animate-pulse" />}
                  <span className="font-bold text-sm uppercase tracking-wider">{bookingStatus.step}</span>
                </div>
                {bookingStatus.details && (
                  <div className="text-right text-[10px] text-slate-400 font-medium">
                    <p>{bookingStatus.details.fullName} • {bookingStatus.details.dateTime}</p>
                    <p className="flex items-center justify-end gap-1"><Mail size={10} /> {bookingStatus.details.email}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Add a global wave animation for visual appeal */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        .animate-wave {
          animation: wave var(--animation-duration) ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;