import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from 'react-icons/fa';
import { useProducts } from '../../products/context/ProductContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useOrders } from '../../orders/context/OrderContext';
import { useNavigate } from 'react-router-dom';
import './AiChatbot.css';

const AiChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hi! I'm KH Assistant. Looking for something specific or need help with an order?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const { products } = useProducts();
    const { user } = useAuth();
    const { orders } = useOrders();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const findRecommendations = (query) => {
        const keywords = query.toLowerCase().split(' ');
        return products.filter(p =>
            keywords.some(k =>
                p.name.toLowerCase().includes(k) ||
                p.category.toLowerCase().includes(k)
            )
        ).slice(0, 3);
    };

    const processMessage = async (userText) => {
        setIsTyping(true);
        const lowerText = userText.toLowerCase();

        let response = { id: Date.now(), type: 'bot', text: '' };

        // Check for product recommendations locally first
        if (lowerText.includes('recommend') || lowerText.includes('want') || lowerText.includes('buy') || lowerText.includes('looking for')) {
            const recommended = findRecommendations(userText);
            if (recommended.length > 0) {
                response.text = "I found some great products for you! Check these out:";
                response.products = recommended;
                setIsTyping(false);
                setMessages(prev => [...prev, response]);
                return;
            }
        }

        // Use OpenRouter API for intelligent responses
        try {
            const systemPrompt = `You are KH Electronics AI Assistant, a helpful shopping assistant for an electronics e-commerce store called KH Electronics. 
You help customers with:
- Product recommendations (we sell gimbals, gaming controllers, smartwatches, drones, RC toys, earbuds, speakers)
- Order inquiries
- Shipping info (free shipping over ₹5,000, 3-5 business days)
- Returns policy (30 days no-questions-asked for unopened items)
Keep responses concise, friendly, and helpful. Use emojis sparingly. The user's name is ${user ? user.name : 'Guest'}.`;

            const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'KH Electronics Assistant'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userText }
                    ],
                    max_tokens: 150
                })
            });

            const data = await apiResponse.json();
            if (data.choices && data.choices[0]?.message?.content) {
                response.text = data.choices[0].message.content;
            } else {
                response.text = "I'm having trouble connecting right now. Try asking about products, orders, or shipping!";
            }
        } catch (error) {
            console.error('AI API Error:', error);
            // Fallback to simple responses
            if (lowerText.includes('order') || lowerText.includes('status')) {
                if (!user) {
                    response.text = "Please log in to check your order status. You can do that in the profile menu!";
                } else {
                    const latestOrder = orders ? orders.find(o => o.customer?.email === user.email) : null;
                    if (latestOrder && latestOrder.id) {
                        response.text = `Found your latest order #${latestOrder.id}! Current status: ${latestOrder.status}.`;
                    } else {
                        response.text = "I couldn't find any recent orders for your account.";
                    }
                }
            } else if (lowerText.includes('shipping') || lowerText.includes('delivery')) {
                response.text = "We offer free standard shipping on orders over ₹5,000. Most deliveries arrive in 3-5 business days.";
            } else if (lowerText.includes('return') || lowerText.includes('refund')) {
                response.text = "Our return policy is simple: 30 days no-questions-asked for unopened items.";
            } else if (lowerText.includes('hi') || lowerText.includes('hello')) {
                response.text = `Hello ${user ? user.name.split(' ')[0] : ''}! How can I help you today?`;
            } else {
                response.text = "I'm still learning! You can ask about product recommendations, check order status, or shipping/returns info.";
            }
        }

        setIsTyping(false);
        setMessages(prev => [...prev, response]);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        processMessage(input);
    };

    return (
        <div className="chatbot-container">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    >
                        <div className="chat-header">
                            <div className="bot-info">
                                <div className="bot-avatar"><FaRobot /></div>
                                <div>
                                    <h3>KH Assistant</h3>
                                    <span className="bot-status">● Online</span>
                                </div>
                            </div>
                            <button className="close-chat" onClick={() => setIsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {messages.map(msg => (
                                <div key={msg.id} className="message-wrapper">
                                    <div className={`message ${msg.type}`}>
                                        {msg.text}
                                    </div>
                                    {msg.products && (
                                        <div className="chat-recommendations">
                                            {msg.products.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="mini-product-card"
                                                    onClick={() => navigate(`/product/${p.id}`)}
                                                >
                                                    <img src={p.image} alt={p.name} />
                                                    <h4>{p.name}</h4>
                                                    <p>₹{p.price.toLocaleString('en-IN')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="typing-indicator">
                                    <span>KH Assistant is thinking</span>
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >...</motion.span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Ask me something..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" className="send-btn">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="chat-bubble"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FaTimes /> : <FaCommentDots />}
            </motion.div>
        </div>
    );
};

export default AiChatbot;
