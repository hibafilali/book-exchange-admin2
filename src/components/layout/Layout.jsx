import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

export default function Layout() {
    return (
        <div className={styles.appContainer}>
            <Sidebar />
            <div className={styles.mainWrapper}>
                <Header />
                <main className={styles.contentArea}>
                    <div className={styles.contentContainer}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
