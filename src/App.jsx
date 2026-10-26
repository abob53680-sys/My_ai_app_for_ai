import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Plus, Settings, Sparkles, MessageSquare, 
  BookOpen, Layers, Smartphone, RefreshCw, Trash2, 
  CheckCircle, ChevronRight, User, Cpu, ShieldCheck
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  
  // Хранилище агентов
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'Кодер Брат',
      role: 'Опытный ментор по программированию на Python и JavaScript',
      systemInstruction: 'Ты дружелюбный и крутой IT-наставник. Объясняй код просто, с примерами, поддерживай новичка.',
      temperature: 0.7,
      version: '1.0',
      knowledge: ['Python основы', 'Pygame', 'Telegram Bots'],
      avatar: '💻'
    },
    {
      id: '2',
      name: 'Креативный Писатель',
      role: 'Генератор идей, сюжетов и увлекательных историй',
      systemInstruction: 'Ты креативный сценарист. Помогай придумывать сюжеты для игр, персонажей и интересные тексты.',
      temperature: 1.0,
      version: '1.0',
      knowledge: ['Minecraft mods', 'WorldBox lore', 'Brawl Stars concepts'],
      avatar: '✨'
    }
  ]);

  const [selectedAgentId, setSelectedAgentId] = useState('1');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [tempKeyInput, setTempKeyInput] = useState('');
  
  // Чат
  const [chats, setChats] = useState({}); // { agentId: [ {sender, text} ] }
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedAgentId]);

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', tempKeyInput);
    setApiKey(tempKeyInput);
    alert('API ключ успешно сохранен!');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!apiKey) {
      alert('Пожалуйста, введите ваш Gemini API ключ в настройках!');
      setActiveTab('settings');
      return;
    }

    const userMsg = inputMessage;
    setInputMessage('');

    const currentAgentChats = chats[selectedAgentId] || [];
    const updatedChats = {
      ...chats,
      [selectedAgentId]: [...currentAgentChats, { sender: 'user', text: userMsg }]
    };
    setChats(updatedChats);
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const chatHistory = updatedChats[selectedAgentId].map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Используем актуальную модель gemini-2.5-flash
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatHistory,
        config: {
          systemInstruction: `${activeAgent.systemInstruction}. База знаний агента: ${activeAgent.knowledge.join(', ')}`,
          temperature: activeAgent.temperature,
        }
      });

      const aiResponseText = response.text || 'Нет ответа от модели.';

      setChats({
        ...updatedChats,
        [selectedAgentId]: [
          ...updatedChats[selectedAgentId],
          { sender: 'ai', text: aiResponseText }
        ]
      });
    } catch (error) {
      console.error(error);
      setChats({
        ...updatedChats,
        [selectedAgentId]: [
          ...updatedChats[selectedAgentId],
          { sender: 'ai', text: `⚠️ Ошибка при обращении к Gemini API: ${error.message}` }
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans max-w-md mx-auto shadow-2xl border-x border-slate-800">
      
      {/* Шапка */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">AI Builder Studio</h1>
            <span className="text-xs text-indigo-400 font-medium">Мобильная ИИ-студия v1.1</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            Online
          </span>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 overflow-y-auto pb-20">
        
        {/* ВКЛАДКА СТУДИЯ И СПИСОК АГЕНТОВ */}
        {activeTab === 'studio' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Ваши ИИ Агенты</h2>
              <button 
                onClick={() => {
                  const newId = Date.now().toString();
                  const newAgent = {
                    id: newId,
                    name: `ИИ Агент #${agents.length + 1}`,
                    role: 'Универсальный помощник',
                    systemInstruction: 'Ты полезный ИИ ассистент.',
                    temperature: 0.7,
                    version: '1.0',
                    knowledge: ['Общие знания'],
                    avatar: '🤖'
                  };
                  setAgents([...agents, newAgent]);
                  setSelectedAgentId(newId);
                }}
                className="flex items-center space-x-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition shadow-md shadow-indigo-600/20"
              >
                <Plus size={14} />
                <span>Создать ИИ</span>
              </button>
            </div>

            {/* Карточки агентов */}
            <div className="grid grid-cols-1 gap-3">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedAgentId === agent.id 
                      ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl bg-slate-800 p-2 rounded-xl border border-slate-700">
                      {agent.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-white">{agent.name}</h3>
                        <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono">v{agent.version}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{agent.role}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className={selectedAgentId === agent.id ? 'text-indigo-400' : 'text-slate-600'} />
                </div>
              ))}
            </div>

            {/* Быстрое управление выбранным агентом */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Настройка персонажа</span>
                <span className="text-xs text-slate-500">ID: {activeAgent.id}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Имя агента</label>
                <input 
                  type="text" 
                  value={activeAgent.name}
                  onChange={(e) => {
                    const updated = agents.map(a => a.id === activeAgent.id ? { ...a, name: e.target.value } : a);
                    setAgents(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Системная инструкция (Характер)</label>
                <textarea 
                  rows="3"
                  value={activeAgent.systemInstruction}
                  onChange={(e) => {
                    const updated = agents.map(a => a.id === activeAgent.id ? { ...a, systemInstruction: e.target.value } : a);
                    setAgents(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button 
                  onClick={() => {
                    const updated = agents.map(a => {
                      if (a.id === activeAgent.id) {
                        const nextVer = (parseFloat(a.version) + 0.1).toFixed(1);
                        return { ...a, version: nextVer };
                      }
                      return a;
                    });
                    setAgents(updated);
                    alert(`Агент обновлен до версии ${parseFloat(activeAgent.version) + 0.1}!`);
                  }}
                  className="flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-medium transition"
                >
                  <RefreshCw size={14} />
                  <span>Повысить версию ИИ</span>
                </button>

                <button 
                  onClick={() => setActiveTab('chat')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition shadow-lg shadow-indigo-600/20"
                >
                  Перейти в чат ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА ЧАТ С ИИ */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-130px)]">
            {/* Плашка активного агента в чате */}
            <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{activeAgent.avatar}</span>
                <div>
                  <h3 className="text-xs font-bold text-white">{activeAgent.name}</h3>
                  <p className="text-[10px] text-slate-400">Версия {activeAgent.version}</p>
                </div>
              </div>
              <button 
                onClick={() => setChats({...chats, [selectedAgentId]: []})}
                className="text-slate-500 hover:text-red-400 p-1 transition"
                title="Очистить чат"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(!chats[selectedAgentId] || chats[selectedAgentId].length === 0) && (
                <div className="text-center py-12 space-y-2">
                  <div className="text-4xl">{activeAgent.avatar}</div>
                  <p className="text-sm font-medium text-white">Начните диалог с {activeAgent.name}</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Этот ИИ настроен как: «{activeAgent.role}». Задайте ему вопрос!</p>
                </div>
              )}

              {chats[selectedAgentId]?.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="ml-1">ИИ думает...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода сообщения */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Спросить ${activeAgent.name}...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ВКЛАДКА НАСТРОЙКИ (API КЛЮЧ И УСТАНОВКА НА ТЕЛЕФОН) */}
        {activeTab === 'settings' && (
          <div className="p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Настройки системы</h2>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Cpu size={18} />
                <h3 className="font-bold text-sm text-white">Gemini API Ключ</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Чтобы ИИ отвечал в реальном времени, нужен бесплатный API-ключ от Google AI Studio.
              </p>
              <div className="space-y-2">
                <input 
                  type="password" 
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder={apiKey ? "Ключ установлен (скрыт)" : "Вставьте ваш AIzaSy..."}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button 
                  onClick={saveApiKey}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-medium transition shadow-md shadow-indigo-600/20"
                >
                  Сохранить ключ
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Smartphone size={18} />
                <h3 className="font-bold text-sm text-white">Как открыть на телефоне</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                После того как проект загрузится на Vercel, откройте полученную ссылку в браузере телефона:
              </p>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                <li><strong className="text-white">iPhone (Safari):</strong> Нажмите кнопку «Поделиться» ➔ «На экран "Домой"».</li>
                <li><strong className="text-white">Android (Chrome):</strong> Нажмите три точки ➔ «Добавить на главный экран».</li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* Нижняя навигация */}
      <nav className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur border-t border-slate-800 grid grid-cols-3 py-2 px-4">
        <button 
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center space-y-1 py-1 transition ${activeTab === 'studio' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Layers size={20} />
          <span className="text-[10px] font-medium">Студия</span>
        </button>

        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center space-y-1 py-1 transition ${activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium">Чат с ИИ</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center space-y-1 py-1 transition ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Settings size={20} />
          <span className="text-[10px] font-medium">Настройки</span>
        </button>
      </nav>

    </div>
  );
}
