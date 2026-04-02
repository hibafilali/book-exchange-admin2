import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Info, Image as ImageIcon, Smile, Paperclip, MessageSquare, Calendar, MapPin, Clock, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { conversationApi, bookApi } from '../../api/client';
import { useAuth } from '../auth/useAuth';
import styles from './ChatWindow.module.css';

const CAMPUS_LOCATIONS = ['Bibliothèque (BU)', 'Cafétéria Centrale', 'Entrée Fac', 'Jardin des Sciences', 'Parking Étudiants'];

export default function ChatWindow() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userBooks, setUserBooks] = useState([]);
    
    const [isLoadingConvs, setIsLoadingConvs] = useState(true);
    const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
    const [inputText, setInputText] = useState('');
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [meetingData, setMeetingData] = useState({ book: '', location: CAMPUS_LOCATIONS[0], time: 'Demain, 10:00' });
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Pastels for avatars
    const AVATAR_COLORS = ['#fecdd3', '#fed7aa', '#fef08a', '#d9f99d', '#bbf7d0', '#bfdbfe', '#e9d5ff'];
    const getAvatarBg = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

    // Initial Load: Conversations & User Books (for meeting proposal)
    useEffect(() => {
        const initChat = async () => {
            try {
                setIsLoadingConvs(true);
                const [convRes, booksRes] = await Promise.all([
                    conversationApi.getConversations(),
                    bookApi.getAll() // In real app, would be getMyBooks
                ]);
                setConversations(convRes.data);
                
                // Filter books belonging to me (simplified for demo)
                setUserBooks(booksRes.data.filter(b => b.exemplaire?.proprietaire_id === user?.id).slice(0, 5));
                
                if (convRes.data.length > 0) {
                    setSelectedConversation(convRes.data[0]);
                }
            } catch (error) {
                console.error('Failed to init chat:', error);
                toast.error('Erreur lors du chargement des conversations');
            } finally {
                setIsLoadingConvs(false);
            }
        };
        initChat();
    }, [user?.id]);

    // Load Messages when selection changes
    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            try {
                setIsLoadingMsgs(true);
                const response = await conversationApi.getMessages(selectedConversation.id);
                setMessages(response.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoadingMsgs(false);
            }
        };
        fetchMessages();

        // Optional: Polling for new messages (every 5 seconds)
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [selectedConversation?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || !selectedConversation) return;

        const textToSend = inputText;
        setInputText('');

        try {
            await conversationApi.sendMessage(selectedConversation.id, {
                text: textToSend,
                type: 'text'
            });
            // Refresh messages immediately
            const response = await conversationApi.getMessages(selectedConversation.id);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Échec de l\'envoi');
            setInputText(textToSend); // Restore text on failure
        }
    };

    const handleProposeMeeting = async () => {
        if (!selectedConversation) return;

        try {
            await conversationApi.sendMessage(selectedConversation.id, {
                text: `Proposition de RDV : ${meetingData.book}`,
                type: 'appointment',
                appointmentDetails: meetingData
            });
            setShowMeetingModal(false);
            toast.success('Rendez-vous proposé !');
            
            // Refresh
            const response = await conversationApi.getMessages(selectedConversation.id);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to propose meeting:', error);
            toast.error('Erreur lors de la proposition');
        }
    };

    // Helper to get partner info
    const getPartner = (conv) => {
        const isUser1 = conv.user1_id === user?.id;
        return {
            id: isUser1 ? conv.user2_id : conv.user1_id,
            nom: isUser1 ? conv.user2_nom : conv.user1_nom,
            prenom: isUser1 ? conv.user2_prenom : conv.user1_prenom,
            avatar: isUser1 ? conv.user2_prenom?.charAt(0) : conv.user1_prenom?.charAt(0)
        };
    };

    return (
        <div className={styles.chatContainer}>
            {/* ====== LEFT: CONVERSATIONS LIST ====== */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Messages</h2>
                    <div className={styles.searchWrap}>
                        <Search size={16} />
                        <input type="text" placeholder="Rechercher..." />
                    </div>
                </div>

                <div className={styles.contactList}>
                    {isLoadingConvs ? (
                        <div className={styles.loadingSide}><Loader2 className={styles.spin} /></div>
                    ) : conversations.length === 0 ? (
                        <div className={styles.emptySide}>Aucune conversation</div>
                    ) : conversations.map(c => {
                        const partner = getPartner(c);
                        return (
                            <div 
                                key={c.id} 
                                className={`${styles.contactCard} ${selectedConversation?.id === c.id ? styles.activeContact : ''}`}
                                onClick={() => setSelectedConversation(c)}
                            >
                                <div className={styles.avatarWrap}>
                                    <div className={styles.avatar} style={{ background: getAvatarBg(partner.id) }}>{partner.avatar}</div>
                                </div>
                                <div className={styles.contactInfo}>
                                    <div className={styles.contactTop}>
                                        <strong>{partner.prenom} {partner.nom}</strong>
                                        <span>{c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                                    </div>
                                    <div className={styles.contactBottom}>
                                        <p>Cliquer pour voir la discussion</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ====== RIGHT: CHAT AREA ====== */}
            <div className={styles.chatArea}>
                {selectedConversation ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderInfo}>
                                <div className={styles.avatarWrap}>
                                    <div className={styles.avatar} style={{ background: getAvatarBg(getPartner(selectedConversation).id) }}>
                                        {getPartner(selectedConversation).avatar}
                                    </div>
                                </div>
                                <div>
                                    <strong>{getPartner(selectedConversation).prenom} {getPartner(selectedConversation).nom}</strong>
                                    <span>Discussion sécurisée</span>
                                </div>
                            </div>
                            <div className={styles.chatHeaderActions}>
                                <button title="Informations"><Info size={18} /></button>
                            </div>
                        </div>

                        <div className={styles.chatMessages}>
                            {isLoadingMsgs && messages.length === 0 ? (
                                <div className={styles.loadingMsgs}><Loader2 className={styles.spin} /></div>
                            ) : (
                                <AnimatePresence mode="popLayout" key={`conversation-${selectedConversation.id}`}>
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === user?.id;
                                        const isAppointment = msg.message_type === 'APPOINTMENT';
                                        let appDetails = null;
                                        if (isAppointment && msg.metadata) {
                                            try { appDetails = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata; } catch(e) { console.error(e); }
                                        }

                                        return (
                                            <motion.div 
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`${styles.messageRow} ${isMe ? styles.messageMe : styles.messageThem}`}
                                            >
                                                {!isMe && (
                                                    <div className={styles.msgAvatar} style={{ background: getAvatarBg(getPartner(selectedConversation).id) }}>
                                                        {getPartner(selectedConversation).avatar}
                                                    </div>
                                                )}
                                                
                                                {isAppointment && appDetails ? (
                                                    <div className={`${styles.appointmentCardMsg} ${isMe ? styles.apMe : styles.apThem}`}>
                                                        <div className={styles.apHeader}>
                                                            <Calendar size={18} />
                                                            <span>Proposition de RDV</span>
                                                        </div>
                                                        <div className={styles.apBody}>
                                                            <p className={styles.apTargetBook}><strong>{appDetails.book}</strong></p>
                                                            <div className={styles.apDetails}>
                                                                <span><Clock size={14} /> {appDetails.time}</span>
                                                                <span><MapPin size={14} /> {appDetails.location}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.apFooter}>
                                                            {isMe ? (
                                                                <span className={styles.apStatusWaiting}>En attente de confirmation...</span>
                                                            ) : (
                                                                <div className={styles.apActions}>
                                                                    <button className={styles.btnConfirmAp} onClick={() => toast.success('RDV Confirmé !')}>Confirmer</button>
                                                                    <button className={styles.btnRefuseAp}>Refuser</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                                                        {msg.message_text}
                                                        <span className={styles.msgTime}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className={styles.chatInputArea} onSubmit={handleSendMessage}>
                            <button type="button" className={`${styles.attachBtn} ${styles.btnRdv}`} onClick={() => setShowMeetingModal(true)}>
                                <Calendar size={20} />
                                <span>Fixer RDV</span>
                            </button>

                            <input 
                                type="text" 
                                placeholder="Écrivez votre message..." 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            
                            <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
                                <Send size={18} />
                            </button>
                        </form>

                        {/* ====== MEETING PROPOSAL MODAL ====== */}
                        <AnimatePresence>
                            {showMeetingModal && (
                                <div className={styles.modalOverlay}>
                                    <motion.div 
                                        className={styles.meetingModal}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <div className={styles.modalHeader}>
                                            <h3>🤝 Planifier une remise</h3>
                                            <button onClick={() => setShowMeetingModal(false)}><X size={20} /></button>
                                        </div>
                                        
                                        <div className={styles.modalBody}>
                                            <div className={styles.formGroup}>
                                                <label>Quel livre ?</label>
                                                <select 
                                                    value={meetingData.book} 
                                                    onChange={(e) => setMeetingData({...meetingData, book: e.target.value})}
                                                >
                                                    <option value="">Sélectionnez un livre...</option>
                                                    {userBooks.map(b => (
                                                        <option key={b.id} value={b.exemplaire?.ouvrage?.titre || b.titreAnnonce}>
                                                            {b.exemplaire?.ouvrage?.titre || b.titreAnnonce}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>Quand ?</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="ex: Demain, 14:00"
                                                    value={meetingData.time}
                                                    onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>Où sur le campus ?</label>
                                                <select 
                                                    value={meetingData.location}
                                                    onChange={(e) => setMeetingData({...meetingData, location: e.target.value})}
                                                >
                                                    {CAMPUS_LOCATIONS.map(loc => (
                                                        <option key={loc} value={loc}>{loc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.modalFooter}>
                                            <button className={styles.btnCancel} onClick={() => setShowMeetingModal(false)}>Annuler</button>
                                            <button className={styles.btnSubmit} onClick={handleProposeMeeting}>Proposer le RDV</button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className={styles.emptyChat}>
                        <div className={styles.emptyIcon}><MessageSquare size={40} /></div>
                        <h3>Sélectionnez une conversation</h3>
                        <p>Partagez vos manuels et discutez avec d'autres étudiants pour économiser ensemble.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
