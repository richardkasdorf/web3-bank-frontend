import React, { useState, useRef, useEffect } from 'react';

// Interface interna para estruturar o histórico de mensagens
interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function CryptoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Histórico de mensagens inicial com saudação do bot
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'bot',
      text: 'Olá! Sou o seu assistente de IA - versão teste -. Digite uma das opções: - Saldo - Extrato - Sair',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Rolagem automática das msg
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  // Função para enviar o texto para o backend 
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userText = inputMessage;
    setInputMessage('');

    // 1. Adiciona a mensagem do usuário na tela
    const newUserMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsProcessing(true);

    try {
      // 2. Requisição para o Backend 
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/chatbot-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) throw new Error("Erro de comunicação com o assistente.");
      
      const data = await response.json();
      
      // 3. Adiciona a resposta do ChatGPT no chatBot
      const newBotMessage: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.reply || 'Desculpe, não consegui processar sua resposta.',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newBotMessage]);

    } catch (error) {
      console.error("Erro na requisição do Chatbot:", error);
      // Feedback de erro mostrado no chat
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: '⚠️ Ocorreu uma falha ao conectar com o servidor do chatbot.',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Botão Flutuante (quando o chat está minimizado)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          color: '#000000',
          border: 'none',
          boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 9999,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </button>
    );
  }

  // Caixa do Chat Aberta
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '360px',
        height: '500px',
        backgroundColor: '#000000',
        border: '1px solid #22252e',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.2)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Topo do Chat */}
      <div style={{ padding: '16px', borderBottom: '1px solid #1c1e24', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#090a0f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#00ff66', borderRadius: '50%', boxShadow: '0 0 8px #00ff66' }} />
          <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>Assistente Circle</span>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#a0aec0', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>✕</button>
      </div>

      {/* Janela de Mensagens com Rolagem */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#020203' }}>
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} style={{ alignSelf: isBot ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
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
              <span style={{ fontSize: '10px', color: '#4a5568', marginTop: '4px', display: 'block', textTransform: 'lowercase', textAlign: isBot ? 'left' : 'right' }}>
                {msg.time}
              </span>
            </div>
          );
        })}

        {/* Indicador visual de digitação ("Pensando...") */}
        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '10px 14px', backgroundColor: '#121418', border: '1px solid #1c1e24', borderRadius: '12px 12px 12px 4px' }}>
            <span className="dot" style={{ width: '6px', height: '6px', background: '#a0aec0', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
            <span className="dot" style={{ width: '6px', height: '6px', background: '#a0aec0', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
            <span className="dot" style={{ width: '6px', height: '6px', background: '#a0aec0', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
            <style>{`
              @keyframes bounce { 
                0%, 80%, 100% { transform: scale(0); } 
                40% { transform: scale(1.0); } 
              }
            `}</style>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Caixa de Texto Inferior */}
      <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid #1c1e24', backgroundColor: '#090a0f' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#121418', border: '1px solid #22252e', borderRadius: '24px', padding: '4px 6px 4px 16px', gap: '8px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isProcessing ? "Aguardando resposta..." : "Escreva uma mensagem..."}
            disabled={isProcessing}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              outline: 'none',
              padding: '8px 0',
            }}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isProcessing}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: inputMessage.trim() && !isProcessing ? '#ffffff' : '#1c1e24',
              color: inputMessage.trim() && !isProcessing ? '#000000' : '#4a5568',
              border: 'none',
              cursor: inputMessage.trim() && !isProcessing ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            ➔
          </button>
        </div>
      </form>
    </div>
  );
}
