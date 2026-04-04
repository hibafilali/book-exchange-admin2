import conversationRepository from '../repositories/conversationRepository.js';

async function debug() {
    try {
        const convs = await conversationRepository.findByUserId(1); // Assuming user 1
        if (convs.length > 0) {
            console.log('--- CONVERSATION 0 ---', convs[0].id);
            const msgs = await conversationRepository.findMessagesByConversationId(convs[0].id);
            console.log('--- MESSAGES (Last 2) ---');
            console.log(JSON.stringify(msgs.slice(-2), null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debug();
