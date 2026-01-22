import { useState, useEffect } from 'react'
import VoiceInput from './VoiceInput'
import './index.css'

function App() {
    const [chatStarted, setChatStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [voiceVariant, setVoiceVariant] = useState('waveform'); // 'waveform' | 'glow'

    const generalResponses = [
        "That's interesting! Tell me more.",
        "I understand. How else can I assist you?",
        "Could you elaborate on that?",
        "I'm here to listen and help.",
        "That's a great point.",
        "I see. Please go on.",
        "Interesting perspective.",
        "Is there anything specific you'd like to discuss?",
        "I'm ready to help with whatever is on your mind.",
        "Okay, I'm listening."
    ];

    const getSimulatedResponse = () => {
        const randomIndex = Math.floor(Math.random() * generalResponses.length);
        return generalResponses[randomIndex];
    };

    const handleSend = (text) => {
        // 1. Add User Message
        const newUserMsg = { text, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setChatStarted(true);

        // 2. Simulate AI Response after delay
        setTimeout(() => {
            const aiMsg = {
                text: getSimulatedResponse(),
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    useEffect(() => {
        if (chatStarted) {
            document.documentElement.style.backgroundImage = 'none';
            document.documentElement.style.backgroundColor = '#ffffff';
            document.documentElement.style.alignItems = 'flex-start';
        }
    }, [chatStarted]);

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: chatStarted ? 'space-between' : 'center',
            alignItems: 'center',
            padding: chatStarted ? '40px 0 40px 0' : '0',
            boxSizing: 'border-box'
        }}>
            {/* Top Right Toggle */}
            <div style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                zIndex: 200,
                backgroundColor: 'white',
                padding: '4px',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: '4px'
            }}>
                <button
                    onClick={() => setVoiceVariant('waveform')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: voiceVariant === 'waveform' ? '#1a1a1a' : 'transparent',
                        color: voiceVariant === 'waveform' ? 'white' : '#666',
                        cursor: 'pointer',
                        fontFamily: 'Fira Sans',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    Waveform
                </button>
                <button
                    onClick={() => setVoiceVariant('glow')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: voiceVariant === 'glow' ? '#1a1a1a' : 'transparent',
                        color: voiceVariant === 'glow' ? 'white' : '#666',
                        cursor: 'pointer',
                        fontFamily: 'Fira Sans',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    Glow
                </button>
            </div>


            {/* Chat Area - Messages scroll with the page */}
            {chatStarted && (
                <div style={{
                    width: '100%',
                    maxWidth: '600px', /* Kept at 600px */
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '40px 0 120px 0',
                    boxSizing: 'border-box'
                }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.sender === 'user' ? '#f3f4f6' : '#ffffff',
                            border: msg.sender === 'ai' ? '1px solid #e5e5e5' : 'none',
                            padding: '12px 20px',
                            borderRadius: '24px',
                            borderBottomRightRadius: msg.sender === 'user' ? '4px' : '24px',
                            borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '24px',
                            fontFamily: 'Fira Sans',
                            fontSize: '16px',
                            lineHeight: '1.5',
                            color: '#1a1a1a',
                            maxWidth: '80%',
                            wordBreak: 'break-word',
                            animation: 'msgFloatUp 0.3s ease-out'
                        }}>
                            {msg.text}
                        </div>
                    ))}
                </div>
            )}

            {/* Input Footer / Splash Area */}
            <div style={{
                position: chatStarted ? 'fixed' : 'absolute',
                top: chatStarted ? 'auto' : 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                height: chatStarted ? 'auto' : '100%',
                backgroundColor: chatStarted ? '#ffffff' : 'transparent',
                paddingBottom: chatStarted ? '16px' : '0',
                paddingTop: 0,
                pointerEvents: 'auto',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 'auto',
                    marginTop: 'auto',
                    width: '100%'
                }}>
                    {!chatStarted && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img
                                src="../img/expert-ai-spark.svg"
                                alt=""
                                style={{
                                    marginBottom: '24px',
                                    width: '60px',
                                    height: '60px'
                                }}
                            />
                            <h1 style={{
                                fontFamily: 'Fira Sans, sans-serif',
                                fontWeight: 500,
                                fontSize: '28px',
                                lineHeight: '36px',
                                letterSpacing: '0px',
                                color: '#000000',
                                marginBottom: '40px',
                                textAlign: 'center',
                                margin: '0 0 40px 0'
                            }}>
                                How can I help you?
                            </h1>
                        </div>
                    )}
                    <VoiceInput onSend={handleSend} variant={voiceVariant} />
                </div>
            </div>
            <style>{`
                @keyframes msgFloatUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default App
