'use client';

import React, { useState } from 'react';
import { Send, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SupportChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className={cn(
      "fixed bottom-4 right-4 w-[350px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 z-50",
      isOpen ? "h-[500px]" : "h-[40px] cursor-pointer"
    )}>
      {/* Header */}
      <button 
        type="button"
        className="chatbotHeader flex items-center justify-between w-full text-left cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle Support Chat"
      >
        <span className="Title text-white">Support Chat</span>
        {isOpen && (
          <button 
            type="button"
            className="down_arrow flex items-center justify-center p-1 rounded hover:bg-white/20 cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            aria-label="Minimize Chat"
          >
            <ChevronDown className="w-4 h-4 text-white/80 hover:text-white" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="chatbox__support">
          {/* Messages Area */}
          <div className="chatbox__messages flex-1 p-4 bg-gray-50">
            <div className="initial__msg">
              Hello! How can we help you today?
            </div>

            {/* Operator Message */}
            <div className="messages__item messages__item--operator">
              <div className="chatbotContiner flex gap-2">
                <div className="botImage bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-xs" role="img" aria-label="Bot">🤖</span>
                </div>
                <div className="answersDiv bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  Please select an option below or type your question.
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="messages__item messages__item--visitor">
              <div className="userMessage">
                <div className="usersDiv">
                  <div className="shortname">ME</div>
                  <span className="userName">My Account</span>
                </div>
                <div className="newansDiv">
                  <div className="answerDiv bg-blue-50 p-3 rounded-lg shadow-sm border border-blue-100">
                    I need help configuring my notification providers.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="helpMsg bg-white border-t border-gray-100 py-2">
            <span className="text-xs mb-2">Suggested Topics</span>
            <div className="askQuestions flex flex-wrap gap-2 justify-center">
              <button 
                type="button" 
                className="questions bg-gray-50 hover:bg-gray-100 flex items-center px-2 rounded text-xs py-1 border border-gray-200"
                onClick={() => setMessage('Setup WhatsApp')}
              >
                <span className="questionText">Setup WhatsApp</span>
              </button>
              <button 
                type="button" 
                className="questions bg-gray-50 hover:bg-gray-100 flex items-center px-2 rounded text-xs py-1 border border-gray-200"
                onClick={() => setMessage('Telegram Bot Integration')}
              >
                <span className="questionText">Telegram Bot Integration</span>
              </button>
            </div>
          </div>

          {/* Footer Input */}
          <div className="chatbox__footer bg-white p-2 flex items-center gap-2">
            <input 
              type="text" 
              className="input__box focus:outline-none flex-1 px-2 py-1 text-sm border border-gray-200 rounded" 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-label="Support chat message input"
            />
            <button 
              type="button" 
              aria-label="Send message"
              className="send__button bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
