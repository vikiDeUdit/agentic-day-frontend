import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './second.scss';
import Header from '../components/Header';

type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;
type RecognitionInstance = InstanceType<NonNullable<SpeechRecognitionType>> | null;

const LANGUAGE_TO_LOCALE: Record<string, string> = {
  Hindi: 'hi-IN',
  Bengali: 'bn-IN',
  Telugu: 'te-IN',
  Marathi: 'mr-IN',
  Tamil: 'ta-IN',
  Urdu: 'ur-IN',
  Gujarati: 'gu-IN',
  Kannada: 'kn-IN',
  Odia: 'or-IN',
  Malayalam: 'ml-IN',
  Punjabi: 'pa-IN',
  Assamese: 'as-IN',
  Maithili: 'mai-IN',
  Santali: 'sat-IN',
  Kashmiri: 'ks-IN',
  Nepali: 'ne-IN',
  Konkani: 'kok-IN',
  Sindhi: 'sd-IN',
  Dogri: 'doi-IN',
  Manipuri: 'mni-IN',
  Bodo: 'brx-IN',
  Santhali: 'sat-IN',
  Kokborok: 'trp-IN',
  Tulu: 'tcy-IN',
  Khasi: 'kha-IN',
  Garo: 'grt-IN',
  Mizo: 'lus-IN',
  English: 'en-IN',
};

export default function SecondPage() {
  const location = useLocation();
  const selectedLanguage = (location.state as any)?.language || 'Hindi';
  const recognitionLang = LANGUAGE_TO_LOCALE[selectedLanguage] || 'hi-IN';

  // Start with two empty cards for AI data
  const [messages, setMessages] = useState<string[]>(['', '']);
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<RecognitionInstance>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Simulate backend fetch for AI data (replace with real API call)
  useEffect(() => {
    // Simulate fetching AI data
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      setMessages(['', '']);
    }, 1000);
  }, []);

  // File upload handler
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // Mic (speech-to-text) handler
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setListening(false);
      };
      recognitionRef.current.onerror = () => setListening(false);
      recognitionRef.current.onend = () => setListening(false);
    }
    recognitionRef.current.lang = recognitionLang;
    setListening(true);
    recognitionRef.current.start();
  };

  // Chat send handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() !== '') {
      setMessages([...messages, input]);
      setInput('');
    }
  };

  return (
    <div className="kb-root-two">
      {/* <header className="kb-header">
        <span className="kb-title">KrishiBandhu</span>
        <span className="kb-user-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M16 16a4 4 0 0 0-8 0"/><rect x="2" y="2" width="20" height="20" rx="5" fill="#fff3"/></svg>
        </span>
      </header> */}
      <Header/>
      <main className="kb-chat-main">
        {/* Two empty cards for AI data */}
        <div className="kb-chat-bubble kb-chat-placeholder">
          Placeholder for AI data 1
        </div>
        <div className="kb-chat-bubble kb-chat-placeholder">
          Placeholder for AI data 2
        </div>
        {fileName && (
          <div className="kb-chat-bubble kb-chat-file">📎 {fileName}</div>
        )}
        <div className='kb-chat-content'>
          {messages.slice(2).map((msg, idx) => (
            <div className="kb-chat-bubble kb-user kb-user-bubble" key={idx + 2} ref={messagesEndRef}>{msg}</div>
          ))}
        </div>
        <form className="kb-chat-input-bar" onSubmit={handleSend}>
          <input
            type="file"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <span className="kb-chat-icon" onClick={handleFileClick} title="Attach file">
            <svg width="24" height="24" fill="none" stroke="#5ca945" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="8" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </span>
          <span className={`kb-chat-icon${listening ? ' kb-mic-listening' : ''}`} onClick={handleMicClick} title="Speak">
            <svg width="24" height="24" fill="none" stroke="#5ca945" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><rect x="10" y="8" width="4" height="8" rx="2"/></svg>
          </span>
          <input
            className="kb-chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            autoFocus
          />
          <button className="kb-chat-send" type="submit" disabled={input.trim() === '' && !fileName}>
            <svg width="28" height="28" fill="none" stroke="#388e2b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,22 22,14 6,6"/></svg>
          </button>
        </form>
      </main>
    </div>
  );
}
