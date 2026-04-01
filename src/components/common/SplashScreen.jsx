import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import YTeraLogo from './YTeraLogo';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
    return (
        <div className={styles.splashContainer}>
            
            <motion.div 
                className={styles.centerStage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.logoWrapper}>
                    <YTeraLogo size={64} vertical={true} />
                </div>

                <div className={styles.loaderContainer}>
                    <div className={styles.progressBar}>
                        <motion.div 
                            className={styles.progressFill}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ 
                                duration: 2.5, 
                                ease: "easeInOut",
                                repeat: Infinity 
                            }}
                        />
                    </div>
                    <motion.div 
                        className={styles.statusText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Chargement en cours...
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
