import userRepository from '../repositories/userRepository.js';

class UserService {
    async getAllUsers() {
        return await userRepository.findAll();
    }

    async getUserById(id) {
        return await userRepository.findById(id);
    }

    async getOrCreateUser(userData) {
        // Business logic: if email exists, return user, else create
        if (userData.email) {
            const existing = await userRepository.findByEmail(userData.email);
            if (existing) return existing;
        }
        const id = await userRepository.create(userData);
        return await userRepository.findById(id);
    }
}

export default new UserService();
