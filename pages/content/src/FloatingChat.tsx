import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './FloatingChat.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface FloatingChatProps {
  activationButtonPosition: { x: number; y: number };
  onClose: () => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ activationButtonPosition, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [showTools, setShowTools] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'navigate', icon: '🧭', label: 'Navigate' },
    { id: 'click', icon: '👆', label: 'Click' },
    { id: 'type', icon: '⌨️', label: 'Type' },
  ];

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputValue('');

      // Simulate assistant response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I received your message: ' + inputValue,
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTool = (toolId: string) => {
    const newSelectedTools = new Set(selectedTools);
    if (newSelectedTools.has(toolId)) {
      newSelectedTools.delete(toolId);
    } else {
      newSelectedTools.add(toolId);
    }
    setSelectedTools(newSelectedTools);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  // Determine animation direction based on button position
  const isRightSide = activationButtonPosition.x > window.innerWidth / 2;
  const animationClass = isRightSide ? 'slide-from-right' : 'slide-from-left';

  return createPortal(
    <div className={`floating-chat-glass-panel ${isOpen ? 'open' : ''} ${animationClass}`} ref={chatRef}>
      <div className="floating-chat-header">
        <h3>Assistant</h3>
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
      </div>

      <div className="floating-chat-messages">
        <div className="messages-scroll-container">
          {messages.map(message => (
            <div key={message.id} className={`message-bubble ${message.sender}`}>
              <div className="message-glass-backing">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="floating-chat-input-container">
        {selectedTools.size > 0 && (
          <div className="selected-tools-display">
            {Array.from(selectedTools).map(toolId => {
              const tool = tools.find(t => t.id === toolId);
              return tool ? (
                <span key={toolId} className="selected-tool-chip">
                  {tool.icon} {tool.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        <div className="input-row">
          <button className="tools-toggle-button" onClick={() => setShowTools(!showTools)}>
            +
          </button>

          <textarea
            className="chat-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
          />

          <button className="send-button" onClick={handleSendMessage} disabled={!inputValue.trim()}>
            Send
          </button>
        </div>

        {showTools && (
          <div className="tools-popup">
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`tool-button ${selectedTools.has(tool.id) ? 'selected' : ''}`}
                onClick={() => toggleTool(tool.id)}>
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label">{tool.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
