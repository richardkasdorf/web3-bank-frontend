import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function CryptoChat() {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'bot',
      text: 'Hello there! I am Satoshi and from now on, im your pritave investment advisor. How can i help you?',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage || !inputMessage.trim()) return;
    handleSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    setIsProcessing(true);
    
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${baseUrl}/api/chatbot-text`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message: userText }),
      });
      
      if (response.status === 401) throw new Error("Session expired. Please log in again..");
      if (!response.ok) throw new Error("Communication error with the assistant.");
      
      const data = await response.json();
      const botText = data.response || '';
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: botText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (error) {
      console.error("Requisition error:", error);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: '⚠️ A failure occurred while connecting to the chatbot server..',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#000000' }}>
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} style={{ alignSelf: isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
              <div
                style={{
                  backgroundColor: isBot ? '#121418' : '#ffffff',
                  color: isBot ? '#ffffff' : '#000000',
                  padding: '10px 14px',
                  borderRadius: isBot ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  border: isBot ? '1px solid #1c1e24' : 'none',
                  whiteSpace: 'pre-wrap',
                  fontWeight: isBot ? '400' : '500'
                }}
              >
                {msg.text}
              </div>
              <span style={{ fontSize: '10px', color: '#4a5568', marginTop: '4px', display: 'block', textAlign: isBot ? 'left' : 'right' }}>
                {msg.time}
              </span>
            </div>
          );
        })}
        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: '#121418', color: '#a0aec0', padding: '10px 14px', borderRadius: '12px 12px 12px 4px', fontSize: '13px', border: '1px solid #1c1e24' }}>
            Satoshi is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmitForm} style={{ padding: '16px', backgroundColor: '#090a0f', borderTop: '1px solid #1c1e24' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Pergunte sobre investimentos ou envie comandos..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', backgroundColor: '#121418', border: '1px solid #22252e', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#ffffff', border: 'none', borderRadius: '8px', color: '#000000', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
