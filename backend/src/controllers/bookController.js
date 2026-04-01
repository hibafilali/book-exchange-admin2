import bookService from '../services/bookService.js';

class BookController {
    async getAll(req, res) {
        try {
            const books = await bookService.getAllBooks();
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const book = await bookService.getBookById(req.params.id);
            res.json(book);
        } catch (error) {
            const status = error.message === 'Book not found' ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const newBook = await bookService.createBook(req.body);
            res.status(201).json(newBook);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new BookController();
