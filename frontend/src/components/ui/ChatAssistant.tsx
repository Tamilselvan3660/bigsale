import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useCartStore } from '../../stores/cartStore';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendations?: any[];
  category?: string;
}

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm BIGSALE's AI Shopping Assistant. Looking for a powerful laptop for coding, a high-res camera phone, or checking accessory compatibility? Ask me anything!",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await api.post('/ai/chat', { query });
      if (resp.data.success) {
        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: resp.data.data.reply,
          recommendations: resp.data.data.recommendations,
          category: resp.data.data.category,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          text: "I'm having trouble accessing the catalog right now. Please try again or browse our Shop page directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      await addItem(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      toast.error('Could not add to cart');
    }
  };

  const samplePrompts = [
    'Laptops under $2000 for coding',
    'Best camera smartphone',
    'Noise cancelling headphones',
    'Charger compatibility',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-tr from-blue-700 via-accent-600 to-cyan-500 text-white rounded-full shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title="BIGSALE AI Shopping Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 border-2 border-white rounded-full animate-ping" />
        )}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <aside
          aria-label="AI Shopping Assistant"
          className="fixed bottom-20 right-4 sm:right-6 z-40 w-[92vw] sm:w-96 max-h-[580px] h-[550px] bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-500/20 border border-accent-400/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5">
                  <span>BIGSALE AI Assistant</span>
                  <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[9px] font-bold rounded">Live Catalog</span>
                </h3>
                <p className="text-[10px] text-slate-400">Grounded in verified electronics inventory</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-accent-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                  }`}
                >
                  <p>{m.text}</p>
                </div>

                {/* Grounded Product Recommendations Cards */}
                {m.recommendations && m.recommendations.length > 0 && (
                  <div className="w-full mt-2 space-y-2">
                    {m.recommendations.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:border-accent-300 transition-all"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${prod.slug || prod.id}`}
                            onClick={() => setIsOpen(false)}
                            className="font-bold text-slate-900 truncate block hover:text-accent-600 text-[11px]"
                          >
                            {prod.name}
                          </Link>
                          <p className="text-xs font-black text-navy-900 mt-0.5">
                            ${prod.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(prod)}
                          className="p-2 rounded-lg bg-accent-50 text-accent-600 hover:bg-accent-600 hover:text-white transition-colors"
                          title="Add to cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 bg-slate-50 p-3 rounded-2xl max-w-[80%] border border-slate-200/60">
                <span className="w-3.5 h-3.5 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px]">Searching active inventory...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto text-[10px]">
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about specs, budget, compatibility..."
              className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-accent-600 hover:bg-accent-700 active:scale-95 disabled:opacity-50 text-white rounded-xl shadow-md transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
};

export default ChatAssistant;

