import bookRepository from '../repositories/bookRepository.js';

class BookService {
    async getAllBooks() {
        return await bookRepository.findAll();
    }

    async getBookById(id) {
        const book = await bookRepository.findById(id);
        if (!book) throw new Error('Book not found');
        return book;
    }

    async createBook(bookData) {
        // Business logic validations - e.g., price > 0 for VENTE
        if (bookData.typeEchange === 'VENTE' && (!bookData.prixVente || bookData.prixVente <= 0)) {
            throw new Error('Price must be greater than 0 for VENTE type');
        }
        
        const id = await bookRepository.create(bookData);
        return await bookRepository.findById(id);
    }
}

export default new BookService();
