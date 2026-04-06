import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Search, MoreVertical, Phone, Video, Info, 
    Image as ImageIcon, Smile, Paperclip, MessageSquare, 
    Calendar, MapPin, Clock, X, Loader2, ShieldCheck, ShoppingCart 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { conversationApi, bookApi, transactionApi } from '../../api/client';
import { useAuth } from '../auth/useAuth';
import { getFullImageUrl } from '../../utils/imageHandler';
import styles from './ChatWindow.module.css';

const CAMPUS_LOCATIONS = ['Bibliothèque (BU)', 'Cafétéria Centrale', 'Entrée Fac', 'Jardin des Sciences', 'Parking Étudiants'];

export default function ChatWindow() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userBooks, setUserBooks] = useState([]);
    
    const [isLoadingConvs, setIsLoadingConvs] = useState(true);
    const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
    const [inputText, setInputText] = useState('');
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [meetingData, setMeetingData] = useState({ book: '', location: CAMPUS_LOCATIONS[0], time: 'Demain, 10:00' });
    
    // COD Transaction Modal
    const [showCodModal, setShowCodModal] = useState(false);
    const [codData, setCodData] = useState({ meeting_point: '', meeting_date: '' });
    const [isCodLoading, setIsCodLoading] = useState(false);

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
                // Ensure unique messages only
                setMessages(prev => {
                    const newMessages = response.data;
                    const combined = [...prev, ...newMessages];
                    const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                    return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                });
                
                // Also refresh conversations to update last message snippets and book info
                const convRes = await conversationApi.getConversations();
                setConversations(convRes.data);
                const updated = convRes.data.find(c => c.id === selectedConversation.id);
                if (updated) setSelectedConversation(updated);
            } catch (error) {
                console.error('Failed to load messages:', error);
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
            setMessages(prev => {
                const newMessages = response.data;
                const combined = [...prev, ...newMessages];
                const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
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
            
            // Refresh messages immediately
            const response = await conversationApi.getMessages(selectedConversation.id);
            // Ensure unique messages only
            setMessages(prev => {
                const newMessages = response.data;
                const combined = [...prev, ...newMessages];
                const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
        } catch (error) {
            console.error('Failed to propose meeting:', error);
            toast.error('Erreur lors de la proposition');
        }
    };

    const handleInitiateCodFromChat = async () => {
        if (!codData.meeting_point || !codData.meeting_date || !selectedConversation.annonce_id) {
            toast.error('Veuillez remplir tous les champs.');
            return;
        }

        try {
            setIsCodLoading(true);
            const partner = getPartner(selectedConversation);
            
            const isLoan = selectedConversation.annonce_type === 'PRET';
            
            await transactionApi.create({
                annonce_id: selectedConversation.annonce_id,
                seller_id: partner.id,
                amount: isLoan ? 0 : selectedConversation.annonce_prix,
                meeting_point: codData.meeting_point,
                meeting_date: codData.meeting_date,
                return_date: isLoan ? codData.return_date : null
            });

            toast.success('Demande d\'achat envoyée !');
            setShowCodModal(false);
            
            // Also notify in chat with specialized type
            await conversationApi.sendMessage(selectedConversation.id, {
                text: isLoan 
                    ? `J'ai envoyé une proposition d'emprunt officielle pour "${selectedConversation.book_title}".`
                    : `J'ai envoyé une proposition d'achat officielle pour "${selectedConversation.book_title}".`,
                type: 'transaction_proposal',
                appointmentDetails: {
                    book_title: selectedConversation.book_title,
                    amount: isLoan ? 0 : selectedConversation.annonce_prix,
                    meeting_point: codData.meeting_point,
                    meeting_date: codData.meeting_date,
                    isLoan: isLoan
                }
            });
            
            const response = await conversationApi.getMessages(selectedConversation.id);
            setMessages(prev => {
                const newMessages = response.data;
                const combined = [...prev, ...newMessages];
                const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
        } catch (error) {
            console.error('Failed to initiate COD from chat:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la demande d\'achat');
        } finally {
            setIsCodLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Envoi de l\'image...', { id: 'image-upload' });
            await conversationApi.sendImage(selectedConversation.id, formData);
            toast.success('Image envoyée !', { id: 'image-upload' });
            
            // Refresh messages
            const response = await conversationApi.getMessages(selectedConversation.id);
            setMessages(prev => {
                const newMessages = response.data;
                const combined = [...prev, ...newMessages];
                const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
        } catch (error) {
            console.error('Failed to upload image:', error);
            toast.error('Erreur lors de l\'envoi de l\'image', { id: 'image-upload' });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUpdateAppointmentStatus = async (msgId, currentMetadata, newStatus) => {
        try {
            const updatedMetadata = { ...currentMetadata, status: newStatus };
            await conversationApi.updateMessage(msgId, { metadata: updatedMetadata });
            
            toast.success(newStatus === 'ACCEPTED' ? 'Rencontre acceptée !' : 'Rencontre déclinée');
            
            // Refresh messages to show the update on both sides
            const response = await conversationApi.getMessages(selectedConversation.id);
            setMessages(prev => {
                const newMessages = response.data;
                const combined = [...prev, ...newMessages];
                const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    // Helper to get partner info
    const getPartner = (conv) => {
        const isUser1 = conv.user1_id === user?.id;
        const p_nom = isUser1 ? conv.user2_nom : conv.user1_nom;
        const p_prenom = isUser1 ? conv.user2_prenom : conv.user1_prenom;
        const p_id = isUser1 ? conv.user2_id : conv.user1_id;
        
        return {
            id: p_id,
            nom: p_nom || '',
            prenom: p_prenom || '',
            display: (p_prenom && p_nom) ? `${p_prenom} ${p_nom}` : (p_prenom || p_nom || 'Utilisateur'),
            avatar: (p_prenom || p_nom || '?').charAt(0).toUpperCase()
        };
    };

    const getAvatarLetter = (nom, prenom) => {
        return (prenom || nom || '?').charAt(0).toUpperCase();
    };

    // Determine if current user is the buyer for this conversation
    const isBuyer = selectedConversation?.user1_id === user?.id; // In our startConversation logic, emetteur is user1

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
                                        <strong>{partner.display}</strong>
                                        <span>{c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                                    </div>
                                    <div className={styles.contactBottom}>
                                        <p>{c.last_message || 'Cliquer pour voir la discussion'}</p>
                                    </div>
                                    {c.book_title && <div className={styles.bookTag}>📖 {c.book_title}</div>}
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
                                    <strong>{getPartner(selectedConversation).display}</strong>
                                    <span>Discussion sécurisée</span>
                                </div>
                            </div>
                            <div className={styles.chatHeaderActions}>
                                <button title="Informations"><Info size={18} /></button>
                            </div>
                        </div>

                        {/* Linked Annonce Banner */}
                        {selectedConversation.book_title && (
                            <div className={styles.linkedAnnonce}>
                                <img src={getFullImageUrl(selectedConversation.book_photo)} alt="" className={styles.annonceThumb} />
                                <div className={styles.annonceDetails}>
                                    <h4>Discussion sur : {selectedConversation.book_title}</h4>
                                    <p>{selectedConversation.annonce_prix} DH</p>
                                </div>
                                {isBuyer && (
                                    <button className={styles.btnCodAction} onClick={() => setShowCodModal(true)} style={{ background: selectedConversation.annonce_type === 'PRET' ? 'var(--gradient-pret)' : 'var(--gradient-vente)' }}>
                                        {selectedConversation.annonce_type === 'PRET' ? <Clock size={14} /> : <ShoppingCart size={14} />}
                                        {selectedConversation.annonce_type === 'PRET' ? 'Emprunter (Prêt)' : 'Acheter (COD)'}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className={styles.chatMessages}>
                            {isLoadingMsgs && messages.length === 0 ? (
                                <div className={styles.loadingMsgs}><Loader2 className={styles.spin} /></div>
                            ) : (
                                <AnimatePresence mode="popLayout" key={`conversation-${selectedConversation.id}`}>
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === user?.id;
                                        const isAppointment = msg.message_type === 'APPOINTMENT';
                                        const isTransaction = msg.message_type === 'TRANSACTION_PROPOSAL';
                                        
                                        let metadata = null;
                                        if ((isAppointment || isTransaction) && msg.metadata) {
                                            try { metadata = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata; } catch(e) { console.error(e); }
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
                                                    <div className={styles.msgAvatar} style={{ background: getAvatarBg(msg.sender_id) }} title={`${msg.sender_prenom || ''} ${msg.sender_nom || ''}`}>
                                                        {getAvatarLetter(msg.sender_nom, msg.sender_prenom)}
                                                    </div>
                                                )}
                                                
                                                {isAppointment && metadata ? (
                                                    <div className={`${styles.appointmentCardMsg} ${isMe ? styles.apMe : styles.apThem}`}>
                                                        <div className={styles.apHeader}>
                                                            {metadata.isLoan ? <Clock size={18} /> : <ShoppingCart size={18} />}
                                                            <span>{metadata.isLoan ? "Proposition d'emprunt" : "Proposition d'achat (COD)"}</span>
                                                        </div>
                                                        <div className={styles.apBody}>
                                                            <p className={styles.apTargetBook}><strong>{metadata.book}</strong></p>
                                                            <div className={styles.apDetails}>
                                                                <span><Clock size={14} /> {metadata.time}</span>
                                                                <span><MapPin size={14} /> {metadata.location}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.apFooter}>
                                                            {metadata.status === 'ACCEPTED' ? (
                                                                <span className={styles.apStatusInfo} style={{ background: '#ecfdf5', color: '#059669' }}>Rencontre acceptée</span>
                                                            ) : metadata.status === 'DECLINED' ? (
                                                                <span className={styles.apStatusInfo} style={{ background: '#fef2f2', color: '#dc2626' }}>Rencontre déclinée</span>
                                                            ) : isMe ? (
                                                                <span className={styles.apStatusWaiting}>En attente de réponse...</span>
                                                            ) : (
                                                                <div className={styles.apActions}>
                                                                    <button className={styles.btnConfirmAp} onClick={() => handleUpdateAppointmentStatus(msg.id, metadata, 'ACCEPTED')}>Accepter</button>
                                                                    <button className={styles.btnRefuseAp} onClick={() => handleUpdateAppointmentStatus(msg.id, metadata, 'DECLINED')}>Décliner</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : isTransaction && metadata ? (
                                                    <div className={`${styles.transactionCardMsg} ${isMe ? styles.trMe : styles.trThem}`}>
                                                        <div className={styles.trHeader}>
                                                            <ShieldCheck size={16} />
                                                            <span>{metadata.isLoan ? 'Emprunt Officiel' : 'Transaction Officielle (COD)'}</span>
                                                        </div>
                                                        <div className={styles.trBody}>
                                                            <div className={styles.trTargetBook}>{metadata.isLoan ? "PROPOSITION D'EMPRUNT POUR :" : "PROPOSITION D'ACHAT POUR :"}</div>
                                                            <div className={styles.trBookTitle}>{metadata.book_title || metadata.book}</div>
                                                            <div className={styles.trPrice}>
                                                                {metadata.isLoan ? 'Prêt Gratuit' : <>{metadata.amount || selectedConversation.annonce_prix} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>DH</span></>}
                                                            </div>
                                                            <div className={styles.apDetails}>
                                                                <span><Calendar size={14} /> {new Date(metadata.meeting_date).toLocaleString()}</span>
                                                                <span><MapPin size={14} /> {metadata.meeting_point}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.trFooter}>
                                                            {msg.transaction_status === 'ACCEPTED' ? (
                                                                <span className={styles.trStatusInfo} style={{ background: '#ecfdf5', color: '#059669' }}>Demande Acceptée</span>
                                                            ) : msg.transaction_status === 'MEETING_SCHEDULED' ? (
                                                                <span className={styles.trStatusInfo} style={{ background: '#f0f9ff', color: '#0284c7' }}>Rencontre Programmée</span>
                                                            ) : msg.transaction_status === 'COMPLETED' ? (
                                                                <span className={styles.trStatusInfo} style={{ background: '#ecfdf5', color: '#059669' }}>Transaction Terminée</span>
                                                            ) : msg.transaction_status === 'CANCELLED' ? (
                                                                <span className={styles.trStatusInfo} style={{ background: '#fef2f2', color: '#dc2626' }}>Transaction Annulée</span>
                                                            ) : isMe ? (
                                                                <span className={styles.trStatusWaiting}>En attente de validation officielle</span>
                                                            ) : (
                                                                <div className={styles.trActions}>
                                                                    <button className={styles.btnGoToDashboard} onClick={() => navigate('/student-dashboard/dashboard')}>
                                                                        Gérer dans le Dashboard
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem} ${msg.message_type === 'IMAGE' ? styles.bubbleImage : ''}`}>
                                                        {msg.message_type === 'IMAGE' ? (
                                                            <img 
                                                                src={getFullImageUrl(msg.message_text)} 
                                                                alt="Image partagée" 
                                                                className={styles.chatImage}
                                                                onClick={() => window.open(getFullImageUrl(msg.message_text), '_blank')}
                                                            />
                                                        ) : (
                                                            msg.message_text
                                                        )}
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
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleImageUpload}
                                accept="image/*"
                            />
                            
                            <button 
                                type="button" 
                                className={styles.attachBtn} 
                                onClick={() => fileInputRef.current?.click()}
                                title="Envoyer une image"
                            >
                                <ImageIcon size={20} />
                            </button>

                            {isBuyer && selectedConversation.book_title && (
                                <button type="button" className={`${styles.attachBtn} ${styles.btnCodActionInput}`} 
                                    onClick={() => setShowCodModal(true)}
                                    style={{ background: selectedConversation.annonce_type === 'PRET' ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)', color: selectedConversation.annonce_type === 'PRET' ? '#2563eb' : '#ca8a04' }}
                                >
                                    {selectedConversation.annonce_type === 'PRET' ? <Clock size={20} /> : <ShoppingCart size={20} />}
                                    <span>{selectedConversation.annonce_type === 'PRET' ? 'Emprunter' : 'Acheter'}</span>
                                </button>
                            )}

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

                        {/* ====== COD PURCHASE MODAL ====== */}
                        <AnimatePresence>
                            {showCodModal && (
                                <div className={styles.modalOverlay} onClick={() => setShowCodModal(false)}>
                                    <motion.div className={styles.codModal} onClick={e => e.stopPropagation()}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}>
                                        <button className={styles.modalClose} onClick={() => setShowCodModal(false)}><X size={20} /></button>
                                        <div className={styles.modalBody}>
                                            <div className={styles.modalIcon} style={{ background: selectedConversation.annonce_type === 'PRET' ? 'var(--gradient-pret)' : 'var(--gradient-vente)', width: 60, height: 60, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
                                                {selectedConversation.annonce_type === 'PRET' ? <Clock size={32} /> : <ShieldCheck size={32} />}
                                            </div>
                                            <h3 style={{ textAlign:'center', marginBottom:'0.5rem' }}>{selectedConversation.annonce_type === 'PRET' ? 'Emprunter ce manuel' : 'Acheter ce manuel'}</h3>
                                            <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
                                                {selectedConversation.annonce_type === 'PRET' 
                                                    ? <>Vous allez proposer d'emprunter <strong>"{selectedConversation.book_title}"</strong>.</>
                                                    : <>Vous allez proposer un achat en espèces de <strong>{selectedConversation.annonce_prix} DH</strong> pour <strong>"{selectedConversation.book_title}"</strong>.</>
                                                }
                                            </p>

                                            <div className={styles.formGroup}>
                                                <label><MapPin size={14} /> Lieu de rencontre souhaité</label>
                                                <input type="text" placeholder="Ex: Bibliothèque Centrale"
                                                    value={codData.meeting_point} onChange={e => setCodData({ ...codData, meeting_point: e.target.value })} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label><Calendar size={14} /> Date & Heure proposées</label>
                                                <input type="datetime-local"
                                                    value={codData.meeting_date} onChange={e => setCodData({ ...codData, meeting_date: e.target.value })} />
                                            </div>
                                            {selectedConversation.annonce_type === 'PRET' && (
                                                <div className={styles.formGroup}>
                                                    <label><Calendar size={14} /> Date de retour prévue</label>
                                                    <input type="date"
                                                        value={codData.return_date} onChange={e => setCodData({ ...codData, return_date: e.target.value })} />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.modalFooter}>
                                            <button className={styles.btnCancel} onClick={() => setShowCodModal(false)}>Annuler</button>
                                            <button className={styles.btnSubmit} onClick={handleInitiateCodFromChat} disabled={isCodLoading}>
                                                {isCodLoading ? <Loader2 size={18} className={styles.spin} /> : (selectedConversation.annonce_type === 'PRET' ? 'Confirmer l\'emprunt' : 'Confirmer l\'achat')}
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

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
                                            <h3>🤝 Planifier un achat COD</h3>
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
                                            <button className={styles.btnSubmit} onClick={handleProposeMeeting}>Confirmer COD</button>
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
