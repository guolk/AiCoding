"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarBooks = exports.searchBooks = exports.getBookByISBN = void 0;
const axios_1 = __importDefault(require("axios"));
const OPEN_LIBRARY_API = 'https://openlibrary.org';
const COVERS_API = 'https://covers.openlibrary.org';
const getBookByISBN = async (isbn) => {
    try {
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        const response = await axios_1.default.get(`${OPEN_LIBRARY_API}/api/books`, {
            params: {
                bibkeys: `ISBN:${cleanIsbn}`,
                format: 'json',
                jscmd: 'data'
            }
        });
        const key = `ISBN:${cleanIsbn}`;
        const bookData = response.data[key];
        if (!bookData) {
            return null;
        }
        const coverUrl = bookData.cover?.medium ||
            (bookData.identifiers?.isbn_13?.[0]
                ? `${COVERS_API}/b/isbn/${bookData.identifiers.isbn_13[0]}-M.jpg`
                : bookData.identifiers?.isbn_10?.[0]
                    ? `${COVERS_API}/b/isbn/${bookData.identifiers.isbn_10[0]}-M.jpg`
                    : undefined);
        return {
            isbn: cleanIsbn,
            title: bookData.title || 'Unknown Title',
            author: bookData.authors?.map((a) => a.name).join(', '),
            publisher: bookData.publishers?.[0]?.name,
            publishedDate: bookData.publish_date,
            description: typeof bookData.description === 'string'
                ? bookData.description
                : bookData.description?.value,
            coverUrl,
            pageCount: bookData.number_of_pages
        };
    }
    catch (error) {
        console.error('Error fetching book from Open Library:', error);
        return null;
    }
};
exports.getBookByISBN = getBookByISBN;
const searchBooks = async (query) => {
    try {
        const response = await axios_1.default.get(`${OPEN_LIBRARY_API}/search.json`, {
            params: {
                q: query,
                limit: 20
            }
        });
        return response.data.docs.map((doc) => ({
            isbn: doc.isbn?.[0] || '',
            title: doc.title,
            author: doc.author_name?.join(', '),
            publishedDate: doc.first_publish_year?.toString(),
            coverUrl: doc.cover_i
                ? `${COVERS_API}/b/id/${doc.cover_i}-M.jpg`
                : undefined
        }));
    }
    catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
};
exports.searchBooks = searchBooks;
const getSimilarBooks = async (isbn) => {
    try {
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        const bookResponse = await axios_1.default.get(`${OPEN_LIBRARY_API}/api/books`, {
            params: {
                bibkeys: `ISBN:${cleanIsbn}`,
                format: 'json',
                jscmd: 'data'
            }
        });
        const key = `ISBN:${cleanIsbn}`;
        const bookData = bookResponse.data[key];
        if (!bookData?.subjects) {
            return [];
        }
        const subjects = bookData.subjects.slice(0, 3).map((s) => s.name.toLowerCase());
        const searchQuery = subjects.join(' OR ');
        const searchResponse = await axios_1.default.get(`${OPEN_LIBRARY_API}/search.json`, {
            params: {
                q: searchQuery,
                limit: 10
            }
        });
        return searchResponse.data.docs
            .filter((doc) => doc.isbn?.[0] !== cleanIsbn)
            .slice(0, 5)
            .map((doc) => ({
            isbn: doc.isbn?.[0] || '',
            title: doc.title,
            author: doc.author_name?.join(', '),
            publishedDate: doc.first_publish_year?.toString(),
            coverUrl: doc.cover_i
                ? `${COVERS_API}/b/id/${doc.cover_i}-M.jpg`
                : undefined
        }));
    }
    catch (error) {
        console.error('Error fetching similar books:', error);
        return [];
    }
};
exports.getSimilarBooks = getSimilarBooks;
