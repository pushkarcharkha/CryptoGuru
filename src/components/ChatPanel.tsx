import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Bot, User, BarChart2, Flame, ShieldAlert, Zap, Send, Mic, MicOff } from 'lucide-react';
import type { Message } from '../types';

interface ChatPanelProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (content: string) => void;
    onClearChat: () => void;
    placeholder?: string;
    language?: 'english' | 'hindi';
    activeFeature?: string | null;
}

// Simple markdown renderer for bold and links
function renderMarkdown(text: string): React.ReactNode[] {
    const lines = text.split('\n');
    return lines.map((line, li) => {
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let key = 0;

        // Combined regex for bold (**text**) and links ([text](url))
        // We'll process them in order of appearance
        while (remaining.length > 0) {
            const boldMatch = /\*\*([^*]+)\*\*/.exec(remaining);
            const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(remaining);

            const boldIndex = boldMatch ? boldMatch.index : Infinity;
            const linkIndex = linkMatch ? linkMatch.index : Infinity;

            if (!boldMatch && !linkMatch) {
                parts.push(<span key={key++}>{remaining}</span>);
                break;
            }

            if (boldIndex < linkIndex) {
                // Handle bold
                if (boldIndex > 0) parts.push(<span key={key++}>{remaining.slice(0, boldIndex)}</span>);
                parts.push(<strong key={key++} style={{ color: '#00d4ff' }}>{boldMatch![1]}</strong>);
                remaining = remaining.slice(boldIndex + boldMatch![0].length);
            } else {
                // Handle link
                if (linkIndex > 0) parts.push(<span key={key++}>{remaining.slice(0, linkIndex)}</span>);
                parts.push(
                    <a
                        key={key++}
                        href={linkMatch![2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#00ff88', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        {linkMatch![1]}
                    </a>
                );
                remaining = remaining.slice(linkIndex + linkMatch![0].length);
            }
        }

        return (
            <React.Fragment key={li}>
                {li > 0 && <br />}
                {parts}
            </React.Fragment>
        );
    });
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Track which messages have been animated so they don't re-animate on re-render / tab switch
const animatedMessageIds = new Set<string>();

const TypewriterMessage = ({ messageId, content }: { messageId: string, content: string }) => {
    const isNew = !animatedMessageIds.has(messageId);
    const [displayed, setDisplayed] = useState(isNew ? '' : content);

    useEffect(() => {
        if (!isNew) {
            setDisplayed(content);
            return;
        }

        animatedMessageIds.add(messageId);
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(content.slice(0, i));
            i++;
            if (i > content.length) clearInterval(interval);
        }, 15);
        return () => clearInterval(interval);
    }, [content, isNew, messageId]);

    return <>{renderMarkdown(displayed)}</>;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onSendMessage, onClearChat, placeholder, language = 'english', activeFeature }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = (textOverride?: string) => {
        const textToSend = textOverride !== undefined ? textOverride : input;
        if (!textToSend.trim() || isLoading) return;
        onSendMessage(textToSend);
        if (textOverride === undefined) setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                handleSend(transcript);
            }
        };

        recognitionRef.current.start();
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const FEATURE_QUICK_ACTIONS: Record<string, { label: string; icon: React.ReactNode; msg: string }[]> = {
        portfolio: [
            { label: 'Portfolio Health', icon: <ShieldAlert size={14} />, msg: 'Give me a full portfolio health check — risk score, PnL, and what I should rebalance.' },
            { label: 'Top Performer', icon: <Flame size={14} />, msg: 'Which of my holdings has performed best recently?' },
            { label: 'Risk Score', icon: <BarChart2 size={14} />, msg: 'What is my current portfolio risk score and how can I reduce it?' },
            { label: 'Rebalance Tips', icon: <Zap size={14} />, msg: 'Should I rebalance my portfolio right now based on current market conditions?' },
        ],
        journal: [
            { label: 'Trade Summary', icon: <BarChart2 size={14} />, msg: 'Summarize my recent trading history and identify patterns.' },
            { label: 'Win Rate', icon: <Zap size={14} />, msg: 'What is my win rate and average PnL from my closed trades?' },
            { label: 'Mistakes', icon: <ShieldAlert size={14} />, msg: 'What trading mistakes am I repeating based on my history?' },
            { label: 'Best Trade', icon: <Flame size={14} />, msg: 'What was my best trade and what made it successful?' },
        ],
        futures: [
            { label: 'Long BTC 10x', icon: <Zap size={14} />, msg: 'Open a long BTC position with 10x leverage for $100' },
            { label: 'Short ETH 5x', icon: <BarChart2 size={14} />, msg: 'Open a short ETH position with 5x leverage for $50' },
            { label: 'My Positions', icon: <ShieldAlert size={14} />, msg: 'Show me my open futures positions and their current PnL' },
            { label: 'Close All', icon: <Flame size={14} />, msg: 'What are my open futures positions right now?' },
        ],
        wallet: [
            { label: 'My Contacts', icon: <BarChart2 size={14} />, msg: 'Show me all my saved contacts' },
            { label: 'Add Contact', icon: <Zap size={14} />, msg: 'How do I add a new contact to my address book?' },
            { label: 'Send Crypto', icon: <Flame size={14} />, msg: 'I want to send crypto to one of my contacts' },
            { label: 'Check Balance', icon: <ShieldAlert size={14} />, msg: 'What is my current wallet balance?' },
        ],
        chart: [
            { label: 'Analyze BTC', icon: <BarChart2 size={14} />, msg: 'Analyze the BTC chart and identify the current pattern' },
            { label: 'ETH Setup', icon: <Zap size={14} />, msg: 'Show me the ETH chart setup and key levels to watch' },
            { label: 'SOL Trend', icon: <Flame size={14} />, msg: 'What is the current SOL trend and support resistance levels?' },
            { label: 'BNB Analysis', icon: <ShieldAlert size={14} />, msg: 'Analyze BNB chart pattern and give me the trade setup' },
        ],
        watchlist: [
            { label: 'Add Bitcoin', icon: <Zap size={14} />, msg: 'Add Bitcoin to my watchlist' },
            { label: 'Add Ethereum', icon: <BarChart2 size={14} />, msg: 'Add Ethereum to my watchlist' },
            { label: 'Watchlist Update', icon: <Flame size={14} />, msg: 'How are my watchlisted coins performing today?' },
            { label: 'Top Picks', icon: <ShieldAlert size={14} />, msg: 'Which coins should I add to my watchlist right now based on momentum?' },
        ],
        learn: [
            { label: 'What is RSI?', icon: <BarChart2 size={14} />, msg: 'Explain RSI to me in simple terms and how to use it' },
            { label: 'Support & Resistance', icon: <Zap size={14} />, msg: 'How do I identify support and resistance levels on a chart?' },
            { label: 'Leverage Risk', icon: <ShieldAlert size={14} />, msg: 'Explain leverage in futures trading and the risks involved' },
            { label: 'Chart Patterns', icon: <Flame size={14} />, msg: 'What are the most important chart patterns I should learn?' },
        ],
    };

    const defaultActions = language === 'hindi' ? [
        { label: 'BTC विश्लेषण', icon: <BarChart2 size={14} />, msg: 'बीटीसी का चार्ट विश्लेषण करें — वर्तमान ट्रेंड, सपोर्ट/रेसिस्टेंस और ध्यान देने योग्य बातें।' },
        { label: 'टॉप मूवर्स', icon: <Flame size={14} />, msg: 'आज के टॉप क्रिप्टो मूवर्स कौन से हैं और क्या मुझे उनमें से किसी पर ध्यान देना चाहिए?' },
        { label: 'जोखिम जांच', icon: <ShieldAlert size={14} />, msg: 'क्रिप्टो मार्केट में इस समय कौन से बड़े जोखिम हैं जिनके बारे में मुझे पता होना चाहिए?' },
        { label: 'अवसर', icon: <Zap size={14} />, msg: 'क्रिप्टो में इस समय सबसे अच्छा रिस्क/रिवॉर्ड अवसर क्या है?' },
    ] : [
        { label: 'BTC Analysis', icon: <BarChart2 size={14} />, msg: 'Give me a quick BTC analysis — current trend, support/resistance, and what to watch.' },
        { label: 'Top Movers', icon: <Flame size={14} />, msg: 'What are the top crypto movers today and should I be paying attention to any of them?' },
        { label: 'Risk Check', icon: <ShieldAlert size={14} />, msg: 'What are the biggest risks in the crypto market right now I should know about?' },
        { label: 'Opportunity', icon: <Zap size={14} />, msg: 'What\'s the best risk/reward opportunity in crypto right now?' },
    ];

    const QUICK_ACTIONS = (activeFeature && FEATURE_QUICK_ACTIONS[activeFeature]) || defaultActions;


    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-primary)',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Chat Header */}
            <div
                style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#00ff88',
                            boxShadow: '0 0 10px #00ff88',
                        }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Cryptoguru AI — {language === 'hindi' ? 'llama-3.3-70b-सक्षम' : 'llama-3.3-70b-versatile'}
                    </span>
                </div>
                <button
                    id="clear-chat-btn"
                    onClick={onClearChat}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        transition: 'all 0.2s',
                        fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ff4466';
                        e.currentTarget.style.background = 'rgba(255,68,102,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'none';
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={14} /> {language === 'hindi' ? 'हटाएं' : 'Clear'}
                    </span>
                </button>
            </div>

            {/* Messages */}
            <div
                id="chat-messages"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    scrollBehavior: 'smooth',
                    overscrollBehaviorY: 'contain',
                    touchAction: 'pan-y',
                    willChange: 'transform',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className="message-enter"
                        style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            gap: '10px',
                            alignItems: 'flex-start',
                        }}
                    >
                        {/* Avatar */}
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                flexShrink: 0,
                                background:
                                    msg.role === 'assistant'
                                        ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(112,0,255,0.2))'
                                        : 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.1))',
                                border: `1px solid ${msg.role === 'assistant' ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.2)'}`,
                            }}
                        >
                            {msg.role === 'assistant' ? <Bot size={18} color="#00d4ff" /> : <User size={18} color="#00ff88" />}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '82%' }}>
                            <div className={msg.role === 'assistant' ? 'msg-ai' : 'msg-user'}>
                                {msg.role === 'assistant'
                                    ? <TypewriterMessage messageId={msg.id} content={msg.content} />
                                    : renderMarkdown(msg.content)}
                            </div>
                            <div
                                style={{
                                    fontSize: '10px',
                                    color: 'var(--text-muted)',
                                    textAlign: msg.role === 'user' ? 'right' : 'left',
                                    fontFamily: 'JetBrains Mono, monospace',
                                }}
                            >
                                {formatTime(msg.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                    <div className="message-enter" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                flexShrink: 0,
                                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(112,0,255,0.2))',
                                border: '1px solid rgba(0,212,255,0.3)',
                            }}
                        >
                            <Bot size={18} color="#00d4ff" />
                        </div>
                        <div
                            className="msg-ai"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '14px 16px' }}
                        >
                            <div className="dot-pulse" style={{ display: 'flex', gap: '4px' }}>
                                <span />
                                <span />
                                <span />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                {language === 'hindi' ? 'विश्लेषण कर रहा हूँ...' : 'Analyzing...'}
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions - always show when 2 or fewer messages or on a feature section */}
            {(messages.length <= 2 || (activeFeature && FEATURE_QUICK_ACTIONS[activeFeature])) && (
                <div
                    className="fade-in"
                    style={{
                        padding: '0 20px 12px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        flexShrink: 0,
                    }}
                >
                    {QUICK_ACTIONS.map((qa) => (
                        <button
                            key={qa.label}
                            onClick={() => onSendMessage(qa.msg)}
                            style={{
                                background: 'rgba(0,212,255,0.06)',
                                border: '1px solid rgba(0,212,255,0.15)',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Inter, sans-serif',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0,212,255,0.15)';
                                e.currentTarget.style.color = '#00d4ff';
                                e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0,212,255,0.06)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)';
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {qa.icon} {qa.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div
                style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <textarea
                        ref={textareaRef}
                        id="chat-input"
                        className="chat-input"
                        value={input}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || "Ask about crypto..."}
                        rows={1}
                        style={{ flex: 1, minHeight: '44px' }}
                        disabled={isLoading}
                    />
                    <button
                        id="voice-btn"
                        type="button"
                        onClick={toggleListening}
                        disabled={isLoading}
                        className={isListening ? 'listening-pulse' : ''}
                        style={{
                            height: '44px',
                            width: '46px',
                            flexShrink: 0,
                            borderRadius: '10px',
                            border: isListening ? '1px solid #ff4466' : '1px solid var(--border-subtle)',
                            background: isListening ? 'rgba(255,68,102,0.1)' : 'rgba(255,255,255,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {isListening ? <MicOff size={18} color="#ff4466" /> : <Mic size={18} color="var(--text-muted)" />}
                    </button>
                    <button
                        id="send-btn"
                        className="send-btn"
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        style={{ height: '44px', width: '46px', flexShrink: 0 }}
                    >
                        <Send size={18} color="white" />
                    </button>

                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', opacity: 0.8, fontStyle: 'italic' }}>
                    {language === 'hindi' ? 'हम एक को-पायलट की तरह हैं, पायलट नहीं।' : 'We are like a co-pilot, not the pilot.'}
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
