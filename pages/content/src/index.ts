import React from 'react';
import { createRoot } from 'react-dom/client';
import { FloatingChat } from './FloatingChat';

console.log('content script loaded');

// Create floating chat activation button
function createActivationButton() {
  const button = document.createElement('button');
  button.id = 'nanobrowser-floating-chat-activation';
  button.innerHTML = '💬';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.9);
    border: none;
    cursor: pointer;
    font-size: 24px;
    z-index: 2147483646;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
  });

  return button;
}

// Initialize floating chat
function initFloatingChat() {
  // Don't inject on certain pages
  const blockedUrls = ['chrome://', 'chrome-extension://', 'about:', 'file://'];

  if (blockedUrls.some(url => window.location.href.startsWith(url))) {
    return;
  }

  // Create activation button
  const activationButton = createActivationButton();
  document.body.appendChild(activationButton);

  let chatContainer: HTMLDivElement | null = null;
  let chatRoot: ReturnType<typeof createRoot> | null = null;

  activationButton.addEventListener('click', () => {
    const rect = activationButton.getBoundingClientRect();
    const buttonPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    if (!chatContainer) {
      // Create container for React app
      chatContainer = document.createElement('div');
      chatContainer.id = 'nanobrowser-floating-chat-root';
      document.body.appendChild(chatContainer);

      // Create shadow DOM for style isolation
      const shadowRoot = chatContainer.attachShadow({ mode: 'open' });

      // Create a div inside shadow DOM for React
      const reactContainer = document.createElement('div');
      shadowRoot.appendChild(reactContainer);

      // Import styles into shadow DOM
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = chrome.runtime.getURL('content/FloatingChat.css');
      shadowRoot.appendChild(styleLink);

      // Create React root and render
      chatRoot = createRoot(reactContainer);
      chatRoot.render(
        React.createElement(FloatingChat, {
          activationButtonPosition: buttonPosition,
          onClose: () => {
            if (chatRoot) {
              chatRoot.unmount();
              chatRoot = null;
            }
            if (chatContainer) {
              chatContainer.remove();
              chatContainer = null;
            }
            activationButton.style.display = 'flex';
          },
        }),
      );

      // Hide activation button
      activationButton.style.display = 'none';
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFloatingChat);
} else {
  initFloatingChat();
}
