import notificationRepository from '../repositories/notificationRepository.js';
import userRepository from '../repositories/userRepository.js';

class NotificationService {
    async notifyAdmins(titre, message, type = 'INFO') {
        try {
            const admins = await userRepository.findByRole('ADMIN');
            
            const promises = admins.map(admin => 
                notificationRepository.create(admin.id, titre, message, type)
            );
            
            await Promise.all(promises);
            console.log(`--- NOTIFIED ${admins.length} ADMINS: ${titre} ---`);
        } catch (error) {
            console.error('FAILED TO NOTIFY ADMINS:', error);
        }
    }

    async getUserNotifications(userId) {
        return await notificationRepository.getByUserId(userId);
    }

    async markRead(id) {
        return await notificationRepository.markAsRead(id);
    }
}

export default new NotificationService();
