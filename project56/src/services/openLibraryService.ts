import axios from 'axios';

const OPEN_LIBRARY_API = 'https://openlibrary.org';
const COVERS_API = 'https://covers.openlibrary.org';

export interface OpenLibraryBook {
  isbn: string;
  title: string;
  author?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  coverUrl?: string;
  pageCount?: number;
}

export const getBookByISBN = async (isbn: string): Promise<OpenLibraryBook | null> => {
  try {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    const response = await axios.get(`${OPEN_LIBRARY_API}/api/books`, {
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
      author: bookData.authors?.map((a: any) => a.name).join(', '),
      publisher: bookData.publishers?.[0]?.name,
      publishedDate: bookData.publish_date,
      description: typeof bookData.description === 'string' 
        ? bookData.description 
        : bookData.description?.value,
      coverUrl,
      pageCount: bookData.number_of_pages
    };
  } catch (error) {
    console.error('Error fetching book from Open Library:', error);
    return null;
  }
};

export const searchBooks = async (query: string): Promise<OpenLibraryBook[]> => {
  try {
    const response = await axios.get(`${OPEN_LIBRARY_API}/search.json`, {
      params: {
        q: query,
        limit: 20
      }
    });

    return response.data.docs.map((doc: any) => ({
      isbn: doc.isbn?.[0] || '',
      title: doc.title,
      author: doc.author_name?.join(', '),
      publishedDate: doc.first_publish_year?.toString(),
      coverUrl: doc.cover_i 
        ? `${COVERS_API}/b/id/${doc.cover_i}-M.jpg`
        : undefined
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

export const getSimilarBooks = async (isbn: string): Promise<OpenLibraryBook[]> => {
  try {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    const bookResponse = await axios.get(`${OPEN_LIBRARY_API}/api/books`, {
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

    const subjects = bookData.subjects.slice(0, 3).map((s: any) => s.name.toLowerCase());
    const searchQuery = subjects.join(' OR ');

    const searchResponse = await axios.get(`${OPEN_LIBRARY_API}/search.json`, {
      params: {
        q: searchQuery,
        limit: 10
      }
    });

    return searchResponse.data.docs
      .filter((doc: any) => doc.isbn?.[0] !== cleanIsbn)
      .slice(0, 5)
      .map((doc: any) => ({
        isbn: doc.isbn?.[0] || '',
        title: doc.title,
        author: doc.author_name?.join(', '),
        publishedDate: doc.first_publish_year?.toString(),
        coverUrl: doc.cover_i 
          ? `${COVERS_API}/b/id/${doc.cover_i}-M.jpg`
          : undefined
      }));
  } catch (error) {
    console.error('Error fetching similar books:', error);
    return [];
  }
};
