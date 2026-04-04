import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Share2, Copy, Check, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './ShareMenu.module.css';

// Custom Brand SVGs
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const ShareMenu = ({ title, url }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareData = {
        title: `Check out "${title}" on yTera`,
        text: `I found this book "${title}" on yTera - The student book exchange platform!`,
        url: url ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : window.location.href
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Partagé avec succès !');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setIsOpen(true);
                }
            }
        } else {
            setIsOpen(true);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareData.url);
            setCopied(true);
            toast.success('Lien copié !');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Erreur lors de la copie');
        }
    };

    const socialPlatforms = [
        {
            name: 'WhatsApp',
            icon: <WhatsAppIcon />,
            color: '#25D366',
            action: () => {
                const waUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
                window.open(waUrl, '_blank');
            }
        },
        {
            name: 'Facebook',
            icon: <FacebookIcon />,
            color: '#1877F2',
            action: () => {
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
                window.open(fbUrl, '_blank');
            }
        },
        {
            name: 'Instagram',
            icon: <InstagramIcon />,
            color: '#E4405F',
            action: () => {
                copyToClipboard();
                toast.success('Lien copié pour Instagram 📸', { duration: 4000 });
            }
        },
        {
            name: 'Lien',
            icon: copied ? <Check size={20} /> : <Copy size={20} />,
            color: 'var(--accent-primary)',
            action: copyToClipboard
        }
    ];

    return (
        <div className={styles.shareContainer}>
            <motion.button 
                className={styles.triggerBtn}
                onClick={handleNativeShare}
                whileHover={{ scale: 1.1, backgroundColor: 'var(--bg-primary)' }}
                whileTap={{ scale: 0.95 }}
            >
                <Share2 size={18} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div 
                            className={styles.menu}
                            initial={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
                        >
                            <div className={styles.header}>
                                <h3>Partager ce livre</h3>
                                <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={18} /></button>
                            </div>
                            
                            <div className={styles.grid}>
                                {socialPlatforms.map((platform) => (
                                    <motion.button
                                        key={platform.name}
                                        className={styles.platformBtn}
                                        onClick={() => {
                                            platform.action();
                                            if (platform.name !== 'Lien' && platform.name !== 'Instagram') setIsOpen(false);
                                        }}
                                    >
                                        <div className={styles.iconWrapper} style={{ '--brand-color': platform.color }}>
                                            {platform.icon}
                                        </div>
                                        <span>{platform.name}</span>
                                    </motion.button>
                                ))}
                            </div>

                            <div className={styles.urlDisplay}>
                                <input type="text" readOnly value={shareData.url} />
                                <button onClick={copyToClipboard}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareMenu;
