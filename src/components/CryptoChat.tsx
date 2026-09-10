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

  const [isWaitingPassword, setIsWaitingPassword] = useState<boolean>(false);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita que a página recarregue ao apertar Enter

    if (isWaitingPassword) {
      // Se o chat estiver travado esperando a senha, envia o comando que ficou guardado
      handleSendMessage(pendingMessage);
    } else {
      // Se for uma conversa normal, verifica se o usuário digitou algo
      if (!inputMessage || !inputMessage.trim()) return;

      // Envia o texto que está salvo no seu estado 'inputMessage'
      handleSendMessage(inputMessage);

      // Limpa a caixinha de texto do chat imediatamente após o envio
      setInputMessage('');
    }
  };
  
  // Histórico de mensagens inicial com saudação do bot
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'bot',
      text: 'Olá! Me chamo Satoshi e sou seu assessor de investimentos. Como posso lhe ajudar?',
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
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() && !passwordInput) return;

    setIsProcessing(true);
    
    // Se for uma mensagem normal, adiciona o balão do usuário na tela
    if (!isWaitingPassword) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      // MONTAGEM DO CORPO DO CORREIO (JSON)
      // Se o sistema estava esperando a senha, nós enviamos a mensagem antiga original 
      // e preenchemos o campo 'password' que o FastAPI vai receber.
      const requestBody = isWaitingPassword 
        ? { message: pendingMessage, password: passwordInput }
        : { message: userText };

      const response = await fetch(`${baseUrl}/api/chatbot-text`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
      if (!response.ok) throw new Error("Erro de comunicação com o assistente.");
      
      const data = await response.json();
      const botText = data.response || '';

      // INTERCEPTAÇÃO DE SEGURANÇA:
      // Se a IA respondeu pedindo a senha (checando o texto que configuramos no prompt do sistema)
      if (botText.includes("por favor informe sua senha") || botText.includes("Senha requerida")) {
        setIsWaitingPassword(true);      // Ativa o modo de senha na tela
        setPendingMessage(userText);     // Salva o comando de transferência ("manda 10 usdc...") para usar depois
      } else {
        // Se for uma resposta comum ou sucesso da transferência, desativa o modo senha
        setIsWaitingPassword(false);
        setPendingMessage('');
        setPasswordInput('');
      }
      
      // Adiciona a resposta do Bot na tela
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: botText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (error) {
      console.error("Erro na requisição:", error);
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
          <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>Assistente virtual.</span>
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
      <form onSubmit={handleSubmitForm} style={{ padding: '16px', borderTop: '1px solid #1c1e24', backgroundColor: '#090a0f' }}>
        {isWaitingPassword ? (
          // SE ESTIVER ESPERANDO A SENHA: Abre o input seguro de senha
          <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
            <input 
              type="password" 
              placeholder="Digite sua senha Neon para confirmar..." 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ff4a4a', backgroundColor: '#13151a', color: '#fff' }}
            />
            <button 
              type="submit"
              style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
            >
              Confirmar Transferência
            </button>
            <button 
              type="button" // IMPORTANTE: tipo 'button' para não disparar o onSubmit do formulário
              onClick={() => {
                setIsWaitingPassword(false);
                setPasswordInput('');
                setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'bot', text: 'Operação cancelada.', time: new Date().toLocaleTimeString() }]);
              }}
              style={{ backgroundColor: '#dc3545', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          // CASO CONTRÁRIO: Mostra o input de texto de conversa normal do seu Chat
          <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Converse com o assistente..." 
              value={inputMessage} // CORRIGIDO: Agora bate com o seu useState do topo do arquivo
              onChange={(e) => setInputMessage(e.target.value)} // CORRIGIDO: Agora usa o set correto
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #1c1e24', backgroundColor: '#13151a', color: '#fff' }}
            />
            <button 
              type="submit"
              style={{ backgroundColor: '#0070f3', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
            >
              Enviar
            </button>
          </div>
        )}
      </form>

    </div>
  );
}
