import './second.scss';
import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import volume from '../assets/volume.svg';
import Header from '../components/Header';
import i18n from '../i18n';

type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;
type RecognitionInstance = InstanceType<NonNullable<SpeechRecognitionType>> | null;

interface msgListType {
  role: 'user' | 'bot';
  content: string;
}

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
  const { t } = useTranslation();
  const selectedLanguage = (location.state as any)?.language || 'Hindi';
  const recognitionLang = LANGUAGE_TO_LOCALE[selectedLanguage] || 'hi-IN';

  // Start with two empty cards for AI data
  const [messages, setMessages] = useState<msgListType[]>();
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileImageUrl, setFileImageUrl] = useState<string | null>(null); // NEW: image preview
  const [listening, setListening] = useState(false);
  const [botmsg, setBotmsg] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<RecognitionInstance>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
  const initialize = async () => {
    const savedLang = localStorage.getItem('appLanguage');

    const initialBotMessage = 'hey there! I am your AI assistant. how can I help you?';
    setBotmsg(initialBotMessage);
    setMessages([{ role: 'bot', content: initialBotMessage }]);
    console.log(messages)

    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }

  };

  initialize();
}, []);

  // File upload handler
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);

      // NEW: Read image and set preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFileImageUrl(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFileImageUrl(null);
      }
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
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (input.trim() !== '') {
      await setMessages(prev => [...(prev || []), { role: 'user', content: input }, { role: 'bot', content: botmsg || '' }]);
      setInput('');
    }
  };

  return (
    <div className="kb-root-two">
      <Header/>
      <main className="kb-chat-main">
        {/* Two empty cards for AI data */}
        {/* <div className="kb-chat-bubble kb-chat-placeholder">
          Placeholder for AI data 1
        </div> */}
        {/* <div className="kb-chat-bubble kb-chat-placeholder">
          Placeholder for AI data 2
        </div> */}
        {fileName && (
          <div className="kb-chat-bubble kb-chat-file kb-chat-file-right">
            {fileImageUrl && (
              <div className="kb-chat-image-container">
                <img
                  src={fileImageUrl}
                  alt={fileName}
                  style={{ maxWidth: '200px', borderRadius: '8px', boxShadow: '0 2px 8px #0002' }}
                />
              </div>
            )}
          </div>
        )}
        <div className='kb-chat-content'>
          {messages && messages.map((msg, idx) => {
            if(msg.role === 'user')
              return (
                <div key={idx} ref={messagesEndRef} className={`kb-chat-bubble kb-chat-${msg.role}`}>
                  {msg.content}
                </div>
              );
            else
              return (
                <div key={idx} ref={messagesEndRef} className={`kb-chat-bubble kb-chat-${msg.role}`}>
                  {msg.content}
                  <span>
                    <img src={volume} className='kb-chat-img'/>
                  </span>
                </div>
              );
          })}
        </div>
        <form className="kb-chat-input-bar" onSubmit={handleSend}>
          <input
            type="file"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
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
            placeholder={t('instructions') + "..."}
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