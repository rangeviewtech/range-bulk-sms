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
      <div 
        className="chatbotHeader flex items-center justify-between" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="Title text-white">Support Chat</span>
        {isOpen && (
          <div className="down_arrow" style={{ display: 'flex' }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
            <ChevronDown className="w-4 h-4 text-white/80 hover:text-white" />
          </div>
        )}
      </div>

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
                  <span className="text-xs">🤖</span>
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

          {/* Quick Questions (optional based on CSS) */}
          <div className="helpMsg bg-white border-t border-gray-100 py-2">
            <span className="text-xs mb-2">Suggested Topics</span>
            <div className="askQuestions flex flex-wrap gap-2 justify-center">
              <div className="questions bg-gray-50 hover:bg-gray-100 flex items-center px-2">
                <span className="questionText">Setup WhatsApp</span>
              </div>
              <div className="questions bg-gray-50 hover:bg-gray-100 flex items-center px-2">
                <span className="questionText">Telegram Bot Integration</span>
              </div>
            </div>
          </div>

          {/* Footer Input */}
          <div className="chatbox__footer bg-white p-2">
            <input 
              type="text" 
              className="input__box focus:outline-none" 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="send__button bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
