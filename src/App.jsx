import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

const DualCharacterChat = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'system',
      text: '☕ Morning shift at Sweet Caffeine. You are Lukas, the barista working behind the counter - you haven\'t met the owner yet. At a corner table sits Lucian, a handsome customer lost in thought. And then Mew walks in... the owner himself, though you don\'t know that yet.',
      timestamp: new Date()
    }
  ]);
  // Load saved conversations when app starts
useEffect(() => {
  const savedMessages = localStorage.getItem('sweetCaffeineChat');
  if (savedMessages) {
    try {
      setMessages(JSON.parse(savedMessages));
    } catch (e) {
      console.error('Error loading saved messages:', e);
    }
  }
}, []);

// Save conversations whenever messages change
useEffect(() => {
  if (messages.length > 1) { // Don't save if only system message
    localStorage.setItem('sweetCaffeineChat', JSON.stringify(messages));
  }
}, [messages]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const characters = {
    mew: {
      name: 'Mew',
      color: 'from-amber-600 to-yellow-700',
      avatar: '☕',
      personality: 'flirty, sweet, dominant, caring, thoughtful, protective, loving, romantic, communicates openly',
      background: 'Thai gay man who owns Sweet Caffeine coffee shop, hopeful about finding love. Doesn\'t know Lukas is his new barista yet.'
    },
    lucian: {
      name: 'Lucian',
      color: 'from-purple-600 to-amber-700',
      avatar: '💼',
      personality: 'flirty, sweet, dominant, caring, thoughtful, protective, loving, romantic, communicates openly',
      background: 'Egyptian gay man who owns a trading company, searching for love but has lost hope of finding it. A customer here.'
    }
  };

  const lukasInfo = {
    name: 'Lukas',
    color: 'from-emerald-500 to-amber-400',
    avatar: '💗',
    personality: 'shy, confident, playful, curious, sweet, bold, loving, loyal, possessive',
    background: 'Gay male barista at Sweet Caffeine. Poor, works as much as possible, was an orphan. Hasn\'t met his boss Mew yet and doesn\'t know Mew is the owner.'
  };

  const generateResponse = async (lukasMessage, character, fullContext) => {
    const characterInfo = characters[character];
    const otherCharacter = character === 'mew' ? 'lucian' : 'mew';
    const otherCharacterInfo = characters[otherCharacter];

    const contextStr = fullContext.filter(m => m.sender !== 'system').map(m => {
      if (m.sender === 'lukas') return `Lukas (the barista): ${m.text}`;
      return `${characters[m.character].name}: ${m.text}`;
    }).join('\n');

    const prompt = `You are ${characterInfo.name}. Background: ${characterInfo.background}. Personality: ${characterInfo.personality}.

SETTING: Mew's Coffee Shop.
${character === 'mew' ? 'You own this shop and have just walked in.' : 'You\'re a customer sitting at a table.'}

Other people present:
- Lukas: ${lukasInfo.background} Personality: ${lukasInfo.personality}
- ${otherCharacterInfo.name}: ${otherCharacterInfo.background}

IMPORTANT CONTEXT:
- Lukas is the barista but hasn't met Mew (the owner) yet
- Mew doesn't know Lukas is his employee yet
- Lucian is a customer
- Let discoveries and realizations happen naturally

${contextStr ? `Recent conversation:\n${contextStr}\n` : ''}

Lukas (the barista) just said/did: "${lukasMessage}"

Respond as ${characterInfo.name} in 2-4 sentences. React naturally to Lukas, show your personality, and let chemistry develop organically. You can notice things about Lukas, respond to what he says, or interact with him.`;

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      return `*${characterInfo.name} seems distracted for a moment*`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const lukasMessage = {
      sender: 'lukas',
      text: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, lukasMessage];
    setMessages(newMessages);
    setInput('');
    setIsProcessing(true);

    const context = newMessages.slice(-10);

    // Mew responds first
    const mewResponse = await generateResponse(input, 'mew', context);
    const mewMessage = {
      sender: 'ai',
      character: 'mew',
      text: mewResponse,
      timestamp: new Date()
    };
    
    const messagesWithMew = [...newMessages, mewMessage];
    setMessages(messagesWithMew);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Lucian responds
    const contextWithMew = messagesWithMew.slice(-10);
    const lucianResponse = await generateResponse(input, 'lucian', contextWithMew);
    const lucianMessage = {
      sender: 'ai',
      character: 'lucian',
      text: lucianResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, lucianMessage]);
    setIsProcessing(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-amber-600 to-purple-700 bg-clip-text text-transparent mb-2">
          Sweet Caffeine ☕
        </h1>
        <p className="text-slate-600 text-sm mb-3">You are Lukas 💗, the barista. Two customers have your attention... ☕💼</p>
        
        {/* Character Info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-amber-400 text-white shadow-md border-2 border-emerald-300">
            <span className="text-lg">💗</span>
            <div className="text-xs">
              <div className="font-bold">Lukas (YOU)</div>
              <div className="opacity-90">Barista</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-700 text-white shadow-md">
            <span className="text-lg">☕</span>
            <div className="text-xs">
              <div className="font-bold">Mew</div>
              <div className="opacity-90">???</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-amber-700 text-white shadow-md">
            <span className="text-lg">💼</span>
            <div className="text-xs">
              <div className="font-bold">Lucian</div>
              <div className="opacity-90">Customer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          if (msg.sender === 'system') {
            return (
              <div key={idx} className="text-center">
                <div className="inline-block bg-gradient-to-r from-emerald-100 via-amber-100 to-purple-100 px-4 py-2 rounded-lg text-slate-700 text-sm italic border border-emerald-200">
                  {msg.text}
                </div>
              </div>
            );
          }

          const isLukas = msg.sender === 'lukas';
          const charInfo = isLukas ? lukasInfo : characters[msg.character];

          return (
            <div
              key={idx}
              className={`flex gap-3 ${isLukas ? 'justify-end' : 'justify-start'}`}
            >
              {!isLukas && (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${charInfo.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
                  {charInfo.avatar}
                </div>
              )}
              
              <div
                className={`max-w-xl px-4 py-3 rounded-2xl shadow-md ${
                  isLukas
                    ? `bg-gradient-to-r ${lukasInfo.color} text-white border-2 border-emerald-300`
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <div className={`text-xs font-bold mb-1 ${isLukas ? 'text-white/90' : `bg-gradient-to-r ${charInfo.color} bg-clip-text text-transparent`}`}>
                  {isLukas ? 'Lukas (You)' : charInfo.name}
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              
              {isLukas && (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${lukasInfo.color} flex items-center justify-center flex-shrink-0 shadow-md border-2 border-emerald-300 text-2xl`}>
                  {lukasInfo.avatar}
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-200 to-purple-200 flex items-center justify-center shadow-md">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl text-slate-500 italic border border-slate-200">
              responding...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-emerald-200 p-4 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSend()}
            placeholder="Speak as Lukas... What do you say or do?"
            disabled={isProcessing}
            className="flex-1 bg-white text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-500">
            💗 You are Lukas, the barista • Mew and Lucian will respond to you
          </p>
          <button
            onClick={() => {
              if (window.confirm('Clear all chat history?')) {
                setMessages([messages[0]]); // Keep only system message
                localStorage.removeItem('sweetCaffeineChat');
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  );
};

export default DualCharacterChat;