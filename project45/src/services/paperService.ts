import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type {
  Paper,
  Author,
  Annotation,
  Note,
  CitationGraph,
  CitationNode,
  CitationLink,
  PaginatedResponse,
  CitationStyle,
  CustomCitationStyle,
  Timeline,
  TimelineEvent,
  MindMapNode,
} from '@/types';

const CROSSREF_API = 'https://api.crossref.org';
const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1';
const PUBMED_API = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const mockPapers: Paper[] = [
  {
    id: uuidv4(),
    title: 'Attention Is All You Need',
    authors: [
      { id: '1', name: 'Ashish Vaswani', givenName: 'Ashish', familyName: 'Vaswani' },
      { id: '2', name: 'Noam Shazeer', givenName: 'Noam', familyName: 'Shazeer' },
      { id: '3', name: 'Niki Parmar', givenName: 'Niki', familyName: 'Parmar' },
    ],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
    keywords: ['transformer', 'attention', 'machine translation', 'deep learning'],
    doi: '10.48550/arXiv.1706.03762',
    arxivId: '1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    journal: 'Advances in Neural Information Processing Systems',
    volume: '30',
    year: 2017,
    tags: ['transformer', 'foundation'],
    readStatus: 'read',
    rating: 5,
    addedBy: 1,
    addedAt: '2024-01-15T10:00:00Z',
    references: ['paper1', 'paper2'],
    citations: ['paper3', 'paper4'],
  },
  {
    id: uuidv4(),
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: [
      { id: '4', name: 'Jacob Devlin', givenName: 'Jacob', familyName: 'Devlin' },
      { id: '5', name: 'Ming-Wei Chang', givenName: 'Ming-Wei', familyName: 'Chang' },
      { id: '6', name: 'Kenton Lee', givenName: 'Kenton', familyName: 'Lee' },
    ],
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers...',
    keywords: ['BERT', 'pretraining', 'NLP', 'transformer'],
    doi: '10.48550/arXiv.1810.04805',
    arxivId: '1810.04805',
    url: 'https://arxiv.org/abs/1810.04805',
    journal: 'arXiv preprint',
    year: 2018,
    tags: ['BERT', 'pretraining'],
    readStatus: 'reading',
    rating: 4,
    addedBy: 1,
    addedAt: '2024-02-20T14:30:00Z',
    references: ['paper1'],
    citations: ['paper5'],
  },
  {
    id: uuidv4(),
    title: 'Language Models are Unsupervised Multitask Learners',
    authors: [
      { id: '7', name: 'Alec Radford', givenName: 'Alec', familyName: 'Radford' },
      { id: '8', name: 'Jeffrey Wu', givenName: 'Jeffrey', familyName: 'Wu' },
    ],
    abstract: 'Natural language processing has recently experienced a paradigm shift, with pre-trained language representations...',
    keywords: ['GPT', 'language model', 'unsupervised learning'],
    doi: '10.48550/arXiv.1902.00183',
    arxivId: '1902.00183',
    url: 'https://arxiv.org/abs/1902.00183',
    journal: 'OpenAI Technical Report',
    year: 2019,
    tags: ['GPT', 'foundation'],
    readStatus: 'unread',
    addedBy: 1,
    addedAt: '2024-03-10T09:15:00Z',
    references: ['paper1', 'paper2'],
    citations: [],
  },
];

const mockAnnotations: Annotation[] = [
  {
    id: uuidv4(),
    paperId: mockPapers[0].id,
    pageNumber: 3,
    type: 'highlight',
    color: '#ffeb3b',
    content: 'The multi-head attention mechanism allows the model to attend to different positions simultaneously.',
    authorId: 1,
    createdAt: '2024-01-16T11:00:00Z',
  },
  {
    id: uuidv4(),
    paperId: mockPapers[0].id,
    pageNumber: 5,
    type: 'note',
    color: '#4caf50',
    content: 'This section describes the positional encoding which is crucial for maintaining sequence order.',
    authorId: 1,
    createdAt: '2024-01-17T09:30:00Z',
  },
];

const mockNotes: Note[] = [
  {
    id: uuidv4(),
    title: 'Transformer Architecture Overview',
    content: `The Transformer architecture introduced in "Attention Is All You Need" revolutionized sequence modeling.

Key components:
- Multi-head attention mechanism
- Positional encoding
- Encoder-decoder structure
- Feed-forward networks

[[Attention Is All You Need]] discusses the details of the attention mechanism.

Related concepts:
- Self-attention allows the model to look at different positions of the input sequence
- Multi-head attention provides multiple representation subspaces`,
    authorId: 1,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T14:30:00Z',
    tags: ['transformer', 'architecture'],
    linkedPapers: [mockPapers[0].id],
    linkedAnnotations: [mockAnnotations[0].id],
    outgoingLinks: ['note2'],
    incomingLinks: ['note3'],
  },
  {
    id: uuidv4(),
    title: 'BERT vs GPT Comparison',
    content: `BERT and GPT represent two different approaches to language model pretraining.

BERT uses bidirectional attention, while GPT uses causal (left-to-right) attention.

[[Transformer Architecture Overview]] provides the foundation for both models.

Key differences:
1. Training objective: MLM vs autoregressive
2. Attention masking: bidirectional vs causal
3. Architecture: encoder-only vs decoder-only`,
    authorId: 1,
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-15T16:45:00Z',
    tags: ['comparison', 'LLM'],
    linkedPapers: [mockPapers[0].id, mockPapers[1].id, mockPapers[2].id],
    incomingLinks: ['note1'],
    outgoingLinks: [],
  },
];

let mutablePapers = JSON.parse(JSON.stringify(mockPapers)) as Paper[];
let mutableAnnotations = JSON.parse(JSON.stringify(mockAnnotations)) as Annotation[];
let mutableNotes = JSON.parse(JSON.stringify(mockNotes)) as Note[];

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const crossrefApi = {
  async fetchByDOI(doi: string): Promise<Paper | null> {
    try {
      await delay(500);
      const response = await fetch(`${CROSSREF_API}/works/${encodeURIComponent(doi)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return this.parseCrossrefWork(data.message);
    } catch {
      return null;
    }
  },

  parseCrossrefWork(work: Record<string, unknown>): Paper {
    const authors = (work.author as Array<{ family?: string; given?: string; name?: string }> || []).map((a, i) => ({
      id: uuidv4(),
      name: a.name || `${a.given || ''} ${a.family || ''}`.trim(),
      givenName: a.given,
      familyName: a.family,
    }));

    const issued = work.issued as { 'date-parts': number[][] };
    const year = issued?.['date-parts']?.[0]?.[0];

    return {
      id: uuidv4(),
      title: (work.title as string[] | undefined)?.[0] || 'Unknown Title',
      authors,
      abstract: work.abstract as string | undefined,
      doi: work.DOI as string,
      url: work.URL as string | undefined,
      journal: (work['container-title'] as string[] | undefined)?.[0],
      volume: work.volume as string | undefined,
      issue: work.issue as string | undefined,
      pages: work.page as string | undefined,
      year,
      publisher: work.publisher as string | undefined,
      issn: (work.ISSN as string[] | undefined)?.[0],
      isbn: (work.ISBN as string[] | undefined)?.[0],
      tags: (work.subject as string[] | undefined) || [],
      readStatus: 'unread',
      addedBy: 1,
      addedAt: new Date().toISOString(),
    };
  },

  async search(query: string, limit = 10): Promise<Paper[]> {
    try {
      await delay(500);
      const response = await fetch(
        `${CROSSREF_API}/works?query=${encodeURIComponent(query)}&rows=${limit}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return (data.message.items as Array<Record<string, unknown>> || []).map((item) =>
        this.parseCrossrefWork(item)
      );
    } catch {
      return [];
    }
  },
};

export const semanticScholarApi = {
  async fetchByDOI(doi: string): Promise<Paper | null> {
    try {
      await delay(500);
      const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/DOI:${encodeURIComponent(doi)}?fields=title,authors,abstract,year,venue,publicationVenue,referenceCount,citationCount,influentialCitationCount,openAccessPdf,fieldsOfStudy`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return this.parseSemanticScholarPaper(data);
    } catch {
      return null;
    }
  },

  async fetchByArXivId(arxivId: string): Promise<Paper | null> {
    try {
      await delay(500);
      const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/ARXIV:${encodeURIComponent(arxivId)}?fields=title,authors,abstract,year,venue,publicationVenue,referenceCount,citationCount,influentialCitationCount,openAccessPdf,fieldsOfStudy`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return this.parseSemanticScholarPaper(data);
    } catch {
      return null;
    }
  },

  async fetchCitations(paperId: string): Promise<CitationLink[]> {
    try {
      await delay(300);
      const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/${encodeURIComponent(paperId)}/citations?limit=100`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return (data.data as Array<{ citingPaper: { paperId: string } }> || []).map((item) => ({
        source: item.citingPaper.paperId,
        target: paperId,
        type: 'cited-by' as const,
      }));
    } catch {
      return [];
    }
  },

  async fetchReferences(paperId: string): Promise<CitationLink[]> {
    try {
      await delay(300);
      const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/${encodeURIComponent(paperId)}/references?limit=100`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return (data.data as Array<{ citedPaper: { paperId: string } }> || []).map((item) => ({
        source: paperId,
        target: item.citedPaper.paperId,
        type: 'cites' as const,
      }));
    } catch {
      return [];
    }
  },

  parseSemanticScholarPaper(paper: Record<string, unknown>): Paper {
    const authors = (paper.authors as Array<{ name: string; authorId?: string }> || []).map((a) => ({
      id: a.authorId || uuidv4(),
      name: a.name,
    }));

    const openAccessPdf = paper.openAccessPdf as { url?: string };

    return {
      id: paper.paperId as string || uuidv4(),
      title: (paper.title as string) || 'Unknown Title',
      authors,
      abstract: paper.abstract as string | undefined,
      year: paper.year as number | undefined,
      journal: (paper.venue as string) || (paper.publicationVenue as { name?: string })?.name,
      pdfUrl: openAccessPdf?.url,
      tags: (paper.fieldsOfStudy as string[] | undefined) || [],
      readStatus: 'unread',
      addedBy: 1,
      addedAt: new Date().toISOString(),
    };
  },

  async search(query: string, limit = 10): Promise<Paper[]> {
    try {
      await delay(500);
      const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,abstract,year,venue`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return (data.data as Array<Record<string, unknown>> || []).map((item) =>
        this.parseSemanticScholarPaper(item)
      );
    } catch {
      return [];
    }
  },
};

export const pubmedApi = {
  async fetchByPMID(pmid: string): Promise<Paper | null> {
    try {
      await delay(500);
      const searchResponse = await fetch(
        `${PUBMED_API}/esearch.fcgi?db=pubmed&term=${pmid}&retmode=json`
      );
      if (!searchResponse.ok) return null;
      const searchData = await searchResponse.json();

      const idList = searchData.esearchresult?.idlist as string[];
      if (!idList?.length) return null;

      const fetchResponse = await fetch(
        `${PUBMED_API}/efetch.fcgi?db=pubmed&id=${idList[0]}&retmode=xml`
      );
      if (!fetchResponse.ok) return null;

      return this.parsePubMedXML(await fetchResponse.text(), pmid);
    } catch {
      return null;
    }
  },

  parsePubMedXML(xml: string, pmid: string): Paper {
    const getText = (tag: string): string | undefined => {
      const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 's'));
      return match?.[1];
    };

    const getAuthors = (): Author[] => {
      const authorMatches = xml.matchAll(/<Author[^>]*>(.*?)<\/Author>/gs);
      const authors: Author[] = [];
      for (const match of authorMatches) {
        const lastName = match[1].match(/<LastName>(.*?)<\/LastName>/)?.[1];
        const foreName = match[1].match(/<ForeName>(.*?)<\/ForeName>/)?.[1];
        if (lastName) {
          authors.push({
            id: uuidv4(),
            name: foreName ? `${foreName} ${lastName}` : lastName,
            givenName: foreName,
            familyName: lastName,
          });
        }
      }
      return authors;
    };

    const pubDateMatch = xml.match(/<PubDate>(.*?)<\/PubDate>/s);
    let year: number | undefined;
    if (pubDateMatch) {
      const yearMatch = pubDateMatch[1].match(/<Year>(\d{4})<\/Year>/);
      if (yearMatch) year = parseInt(yearMatch[1], 10);
    }

    return {
      id: uuidv4(),
      title: getText('ArticleTitle') || 'Unknown Title',
      authors: getAuthors(),
      abstract: getText('AbstractText'),
      pmid,
      journal: getText('Title'),
      volume: getText('Volume'),
      issue: getText('Issue'),
      pages: getText('MedlinePgn'),
      year,
      doi: getText('ELocationID')?.includes('doi') ? getText('ELocationID') : undefined,
      readStatus: 'unread',
      addedBy: 1,
      addedAt: new Date().toISOString(),
    };
  },
};

export const paperService = {
  async getPapers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    tags?: string[];
    readStatus?: Paper['readStatus'];
  } = {}): Promise<PaginatedResponse<Paper>> {
    await delay(300);

    let papers = [...mutablePapers];

    if (params.search) {
      const search = params.search.toLowerCase();
      papers = papers.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.authors.some((a) => a.name.toLowerCase().includes(search)) ||
          p.abstract?.toLowerCase().includes(search)
      );
    }

    if (params.tags?.length) {
      papers = papers.filter((p) => params.tags!.some((tag) => p.tags?.includes(tag)));
    }

    if (params.readStatus) {
      papers = papers.filter((p) => p.readStatus === params.readStatus);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = papers.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: papers.length,
      page,
      pageSize,
      totalPages: Math.ceil(papers.length / pageSize),
    };
  },

  async getPaper(id: string): Promise<Paper | null> {
    await delay(200);
    return mutablePapers.find((p) => p.id === id) || null;
  },

  async addPaper(paper: Omit<Paper, 'id' | 'addedBy' | 'addedAt' | 'readStatus'>): Promise<Paper> {
    await delay(300);
    const newPaper: Paper = {
      ...paper,
      id: uuidv4(),
      addedBy: 1,
      addedAt: new Date().toISOString(),
      readStatus: 'unread',
    };
    mutablePapers.unshift(newPaper);
    return newPaper;
  },

  async updatePaper(id: string, data: Partial<Paper>): Promise<Paper | null> {
    await delay(200);
    const index = mutablePapers.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mutablePapers[index] = {
      ...mutablePapers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mutablePapers[index];
  },

  async deletePaper(id: string): Promise<boolean> {
    await delay(200);
    const index = mutablePapers.findIndex((p) => p.id === id);
    if (index === -1) return false;
    mutablePapers.splice(index, 1);
    return true;
  },

  async updateReadStatus(id: string, status: Paper['readStatus']): Promise<Paper | null> {
    return this.updatePaper(id, { readStatus: status });
  },

  async addTag(id: string, tag: string): Promise<Paper | null> {
    const paper = await this.getPaper(id);
    if (!paper) return null;
    const newTags = paper.tags ? [...paper.tags] : [];
    if (!newTags.includes(tag)) {
      newTags.push(tag);
    }
    return this.updatePaper(id, { tags: newTags });
  },

  async removeTag(id: string, tag: string): Promise<Paper | null> {
    const paper = await this.getPaper(id);
    if (!paper) return null;
    const newTags = paper.tags?.filter((t) => t !== tag);
    return this.updatePaper(id, { tags: newTags });
  },

  async getAnnotations(paperId: string): Promise<Annotation[]> {
    await delay(200);
    return mutableAnnotations.filter((a) => a.paperId === paperId);
  },

  async addAnnotation(annotation: Omit<Annotation, 'id' | 'authorId' | 'createdAt'>): Promise<Annotation> {
    await delay(200);
    const newAnnotation: Annotation = {
      ...annotation,
      id: uuidv4(),
      authorId: 1,
      createdAt: new Date().toISOString(),
    };
    mutableAnnotations.push(newAnnotation);
    return newAnnotation;
  },

  async updateAnnotation(id: string, data: Partial<Annotation>): Promise<Annotation | null> {
    await delay(200);
    const index = mutableAnnotations.findIndex((a) => a.id === id);
    if (index === -1) return null;
    mutableAnnotations[index] = {
      ...mutableAnnotations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mutableAnnotations[index];
  },

  async deleteAnnotation(id: string): Promise<boolean> {
    await delay(200);
    const index = mutableAnnotations.findIndex((a) => a.id === id);
    if (index === -1) return false;
    mutableAnnotations.splice(index, 1);
    return true;
  },

  async getCitationGraph(paperId: string): Promise<CitationGraph> {
    await delay(500);
    const paper = await this.getPaper(paperId);
    if (!paper) {
      return { nodes: [], links: [] };
    }

    const nodes: CitationNode[] = [{ id: paperId, paper }];
    const links: CitationLink[] = [];

    if (paper.references) {
      paper.references.forEach((refId, index) => {
        const refPaper: Paper = {
          id: refId,
          title: `Reference Paper ${index + 1}`,
          authors: [{ id: uuidv4(), name: 'Author' }],
          readStatus: 'unread',
          addedBy: 1,
          addedAt: new Date().toISOString(),
        };
        nodes.push({ id: refId, paper: refPaper });
        links.push({ source: paperId, target: refId, type: 'cites' });
      });
    }

    if (paper.citations) {
      paper.citations.forEach((citId, index) => {
        const citPaper: Paper = {
          id: citId,
          title: `Citing Paper ${index + 1}`,
          authors: [{ id: uuidv4(), name: 'Author' }],
          readStatus: 'unread',
          addedBy: 1,
          addedAt: new Date().toISOString(),
        };
        nodes.push({ id: citId, paper: citPaper });
        links.push({ source: citId, target: paperId, type: 'cited-by' });
      });
    }

    return { nodes, links };
  },

  async searchExternal(query: string, source: 'crossref' | 'semantic' = 'semantic'): Promise<Paper[]> {
    if (source === 'crossref') {
      return crossrefApi.search(query);
    }
    return semanticScholarApi.search(query);
  },

  async fetchByExternalId(
    id: string,
    type: 'doi' | 'pmid' | 'arxiv'
  ): Promise<Paper | null> {
    switch (type) {
      case 'doi':
        return (await semanticScholarApi.fetchByDOI(id)) || (await crossrefApi.fetchByDOI(id));
      case 'pmid':
        return pubmedApi.fetchByPMID(id);
      case 'arxiv':
        return semanticScholarApi.fetchByArXivId(id);
      default:
        return null;
    }
  },
};

export const noteService = {
  async getNotes(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    tags?: string[];
  } = {}): Promise<PaginatedResponse<Note>> {
    await delay(300);

    let notes = [...mutableNotes];

    if (params.search) {
      const search = params.search.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.content.toLowerCase().includes(search)
      );
    }

    if (params.tags?.length) {
      notes = notes.filter((n) => params.tags!.some((tag) => n.tags?.includes(tag)));
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = notes.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: notes.length,
      page,
      pageSize,
      totalPages: Math.ceil(notes.length / pageSize),
    };
  },

  async getNote(id: string): Promise<Note | null> {
    await delay(200);
    return mutableNotes.find((n) => n.id === id) || null;
  },

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    await delay(300);
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    this.extractAndUpdateLinks(newNote);
    mutableNotes.unshift(newNote);
    return newNote;
  },

  async updateNote(id: string, data: Partial<Note>): Promise<Note | null> {
    await delay(200);
    const index = mutableNotes.findIndex((n) => n.id === id);
    if (index === -1) return null;

    mutableNotes[index] = {
      ...mutableNotes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.content || data.title) {
      this.extractAndUpdateLinks(mutableNotes[index]);
    }

    return mutableNotes[index];
  },

  async deleteNote(id: string): Promise<boolean> {
    await delay(200);
    const note = mutableNotes.find((n) => n.id === id);
    if (!note) return false;

    if (note.incomingLinks) {
      note.incomingLinks.forEach((linkId) => {
        const linkedNote = mutableNotes.find((n) => n.id === linkId);
        if (linkedNote?.outgoingLinks) {
          linkedNote.outgoingLinks = linkedNote.outgoingLinks.filter((lid) => lid !== id);
        }
      });
    }

    if (note.outgoingLinks) {
      note.outgoingLinks.forEach((linkId) => {
        const linkedNote = mutableNotes.find((n) => n.id === linkId);
        if (linkedNote?.incomingLinks) {
          linkedNote.incomingLinks = linkedNote.incomingLinks.filter((lid) => lid !== id);
        }
      });
    }

    const index = mutableNotes.findIndex((n) => n.id === id);
    if (index !== -1) {
      mutableNotes.splice(index, 1);
    }

    return true;
  },

  extractAndUpdateLinks(note: Note): void {
    const linkPattern = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = linkPattern.exec(note.content)) !== null) {
      const linkText = match[1];
      const linkedNote = mutableNotes.find(
        (n) => n.id === linkText || n.title.toLowerCase() === linkText.toLowerCase()
      );
      if (linkedNote) {
        links.push(linkedNote.id);
      }
    }

    const oldLinks = note.outgoingLinks || [];
    note.outgoingLinks = [...new Set(links)];

    oldLinks.forEach((oldLinkId) => {
      if (!note.outgoingLinks!.includes(oldLinkId)) {
        const oldLinked = mutableNotes.find((n) => n.id === oldLinkId);
        if (oldLinked?.incomingLinks) {
          oldLinked.incomingLinks = oldLinked.incomingLinks.filter((lid) => lid !== note.id);
        }
      }
    });

    note.outgoingLinks.forEach((newLinkId) => {
      if (!oldLinks.includes(newLinkId)) {
        const newLinked = mutableNotes.find((n) => n.id === newLinkId);
        if (newLinked) {
          newLinked.incomingLinks = [...(newLinked.incomingLinks || []), note.id];
        }
      }
    });
  },

  async getBacklinks(noteId: string): Promise<Note[]> {
    await delay(200);
    const note = await this.getNote(noteId);
    if (!note?.incomingLinks) return [];
    return mutableNotes.filter((n) => note.incomingLinks!.includes(n.id));
  },

  async getOutlinks(noteId: string): Promise<Note[]> {
    await delay(200);
    const note = await this.getNote(noteId);
    if (!note?.outgoingLinks) return [];
    return mutableNotes.filter((n) => note.outgoingLinks!.includes(n.id));
  },

  async addAnnotationToNote(noteId: string, annotationId: string): Promise<Note | null> {
    const note = await this.getNote(noteId);
    if (!note) return null;

    const linkedAnnotations = note.linkedAnnotations || [];
    if (!linkedAnnotations.includes(annotationId)) {
      return this.updateNote(noteId, {
        linkedAnnotations: [...linkedAnnotations, annotationId],
      });
    }
    return note;
  },

  async linkPaper(noteId: string, paperId: string): Promise<Note | null> {
    const note = await this.getNote(noteId);
    if (!note) return null;

    const linkedPapers = note.linkedPapers || [];
    if (!linkedPapers.includes(paperId)) {
      return this.updateNote(noteId, {
        linkedPapers: [...linkedPapers, paperId],
      });
    }
    return note;
  },
};

export const citationService = {
  formatAPA(paper: Paper): string {
    const authors = paper.authors
      .map((a) => {
        const family = a.familyName || a.name.split(' ').pop() || a.name;
        const given = a.givenName || a.name.split(' ')[0];
        return `${family}, ${given ? given.charAt(0) + '.' : ''}`;
      })
      .join(', ');

    const year = paper.year || 'n.d.';
    const journal = paper.journal ? `*${paper.journal}*` : '';
    const volume = paper.volume ? `, *${paper.volume}*` : '';
    const pages = paper.pages ? `(${paper.issue || ''}), ${paper.pages}` : '';
    const doi = paper.doi ? `https://doi.org/${paper.doi}` : paper.url || '';

    return `${authors} (${year}). ${paper.title}. ${journal}${volume}${pages}. ${doi}`.trim();
  },

  formatMLA(paper: Paper): string {
    const authors = paper.authors
      .map((a, i) => {
        if (i === 0) {
          const family = a.familyName || a.name.split(' ').pop() || a.name;
          const given = a.givenName || a.name.split(' ').slice(0, -1).join(' ') || a.name.split(' ')[0];
          return `${family}, ${given}`;
        }
        return a.name;
      })
      .join(', ');

    const container = paper.journal || 'Manuscript';
    const year = paper.year || '';
    const pages = paper.pages ? `, pp. ${paper.pages}` : '';
    const doi = paper.doi ? `, doi:${paper.doi}` : '';

    return `${authors}. "${paper.title}." ${container}${year ? ', ' + year : ''}${pages}${doi}.`.trim();
  },

  formatChicago(paper: Paper): string {
    const authors = paper.authors
      .map((a) => {
        const family = a.familyName || a.name.split(' ').pop() || a.name;
        const given = a.givenName || a.name.split(' ')[0];
        return `${family}, ${given}`;
      })
      .join(', ');

    const year = paper.year || '';
    const journal = paper.journal || '';
    const volume = paper.volume || '';
    const issue = paper.issue ? `, no. ${paper.issue}` : '';
    const pages = paper.pages ? `: ${paper.pages}` : '';

    return `${authors}. ${year}. "${paper.title}." ${journal} ${volume}${issue}${pages}.`.trim();
  },

  formatGB7714(paper: Paper): string {
    const authors = paper.authors.map((a) => a.name).join(', ');
    const year = paper.year || '';
    const title = paper.title;
    const journal = paper.journal || '';
    const volume = paper.volume ? `, ${paper.volume}` : '';
    const pages = paper.pages ? `: ${paper.pages}` : '';

    return `${authors}. ${year}. ${title}[J]. ${journal}${volume}${pages}.`.trim();
  },

  formatIEEE(paper: Paper): string {
    const authors = paper.authors
      .map((a, i) => {
        const family = a.familyName || a.name.split(' ').pop() || a.name;
        const given = a.givenName || a.name.split(' ')[0];
        return `${given ? given.charAt(0) + '.' : ''} ${family}`;
      })
      .join(', ');

    const year = paper.year || '';
    const journal = paper.journal || '';
    const volume = paper.volume ? `, vol. ${paper.volume}` : '';
    const pages = paper.pages ? `, pp. ${paper.pages}` : '';

    return `${authors}, "${paper.title}," ${journal}${volume}${pages}, ${year}.`.trim();
  },

  formatCustom(paper: Paper, style: CustomCitationStyle): string {
    let result = style.format.author
      .replace('{authors}', paper.authors.map((a) => a.name).join(', '))
      .replace('{year}', paper.year?.toString() || '')
      .replace('{title}', paper.title)
      .replace('{journal}', paper.journal || '')
      .replace('{volume}', paper.volume || '')
      .replace('{pages}', paper.pages || '')
      .replace('{doi}', paper.doi || '');

    return result.trim();
  },

  formatInTextAPA(paper: Paper): string {
    const firstAuthor = paper.authors[0];
    const lastName = firstAuthor?.familyName || firstAuthor?.name.split(' ').pop() || 'Author';
    const year = paper.year || 'n.d.';

    if (paper.authors.length === 1) {
      return `(${lastName}, ${year})`;
    } else if (paper.authors.length === 2) {
      const secondAuthor = paper.authors[1];
      const secondLastName = secondAuthor?.familyName || secondAuthor?.name.split(' ').pop() || 'Author';
      return `(${lastName} & ${secondLastName}, ${year})`;
    } else {
      return `(${lastName} et al., ${year})`;
    }
  },

  formatBibliography(papers: Paper[], style: CitationStyle, customStyle?: CustomCitationStyle): string {
    return papers
      .map((paper) => {
        switch (style) {
          case 'apa':
            return this.formatAPA(paper);
          case 'mla':
            return this.formatMLA(paper);
          case 'chicago':
            return this.formatChicago(paper);
          case 'gb7714':
            return this.formatGB7714(paper);
          case 'ieee':
            return this.formatIEEE(paper);
          case 'custom':
            return customStyle ? this.formatCustom(paper, customStyle) : this.formatAPA(paper);
          default:
            return this.formatAPA(paper);
        }
      })
      .join('\n\n');
  },
};

export const exportService = {
  exportToMarkdown(note: Note, options: { includeAnnotations?: boolean; includeCitations?: boolean } = {}): string {
    let md = `# ${note.title}\n\n`;
    md += `*Created: ${dayjs(note.createdAt).format('YYYY-MM-DD')}*\n\n`;
    md += `---\n\n`;
    md += note.content.replace(/\[\[([^\]]+)\]\]/g, '[$1]');

    if (options.includeCitations && note.linkedPapers?.length) {
      md += `\n\n## References\n\n`;
      note.linkedPapers.forEach((paperId) => {
        const paper = mutablePapers.find((p) => p.id === paperId);
        if (paper) {
          md += `1. ${citationService.formatAPA(paper)}\n`;
        }
      });
    }

    if (options.includeAnnotations && note.linkedAnnotations?.length) {
      md += `\n\n## Annotations\n\n`;
      note.linkedAnnotations.forEach((annoId) => {
        const anno = mutableAnnotations.find((a) => a.id === annoId);
        if (anno) {
          const paper = mutablePapers.find((p) => p.id === anno.paperId);
          md += `> **${paper?.title || 'Unknown Paper'}** (p.${anno.pageNumber})\n`;
          md += `> ${anno.content}\n\n`;
        }
      });
    }

    return md;
  },

  exportToLaTeX(note: Note, options: { includeAnnotations?: boolean; includeCitations?: boolean } = {}): string {
    let tex = `\\documentclass{article}\n`;
    tex += `\\usepackage{hyperref}\n`;
    tex += `\\begin{document}\n\n`;
    tex += `\\title{${note.title}}\n`;
    tex += `\\date{${dayjs(note.createdAt).format('YYYY-MM-DD')}}\n`;
    tex += `\\maketitle\n\n`;

    let content = note.content
      .replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}')
      .replace(/\*(.*?)\*/g, '\\textit{$1}')
      .replace(/`([^`]+)`/g, '\\texttt{$1}')
      .replace(/\n\n/g, '\n\n')
      .replace(/\[\[([^\]]+)\]\]/g, '\\textit{$1}');

    tex += content + '\n\n';

    if (options.includeCitations && note.linkedPapers?.length) {
      tex += `\\section{References}\n\n`;
      tex += `\\begin{enumerate}\n`;
      note.linkedPapers.forEach((paperId) => {
        const paper = mutablePapers.find((p) => p.id === paperId);
        if (paper) {
          tex += `\\item ${citationService.formatAPA(paper).replace(/\*/g, '')}\n`;
        }
      });
      tex += `\\end{enumerate}\n\n`;
    }

    if (options.includeAnnotations && note.linkedAnnotations?.length) {
      tex += `\\section{Annotations}\n\n`;
      note.linkedAnnotations.forEach((annoId) => {
        const anno = mutableAnnotations.find((a) => a.id === annoId);
        if (anno) {
          const paper = mutablePapers.find((p) => p.id === anno.paperId);
          tex += `\\begin{quote}\n`;
          tex += `\\textbf{${paper?.title || 'Unknown Paper'}} (p.${anno.pageNumber}):\n\n`;
          tex += `${anno.content}\n`;
          tex += `\\end{quote}\n\n`;
        }
      });
    }

    tex += `\\end{document}`;
    return tex;
  },

  exportNotesToWord(notes: Note[]): string {
    let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Notes Export</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
  h1 { font-size: 18pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; margin-bottom: 9pt; }
  p { margin-bottom: 9pt; }
  blockquote { margin-left: 24pt; font-style: italic; }
</style>
</head>
<body>
`;

    notes.forEach((note, index) => {
      if (index > 0) {
        html += `<hr style="page-break-after:always;">\n`;
      }

      html += `<h1>${note.title}</h1>\n`;
      html += `<p><i>Created: ${dayjs(note.createdAt).format('YYYY-MM-DD')}</i></p>\n`;

      let content = note.content
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\[\[([^\]]+)\]\]/g, '<i>$1</i>');

      html += `<p>${content}</p>\n`;
    });

    html += `</body></html>`;
    return html;
  },

  generateResearchReport(
    title: string,
    sections: {
      introduction?: Note[];
      methods?: Note[];
      results?: Note[];
      discussion?: Note[];
    },
    references: Paper[]
  ): string {
    let md = `# ${title}\n\n`;
    md += `*Generated: ${dayjs().format('YYYY-MM-DD')}*\n\n`;
    md += `---\n\n`;

    if (sections.introduction?.length) {
      md += `## 1. Introduction\n\n`;
      sections.introduction.forEach((note) => {
        md += `### ${note.title}\n\n`;
        md += note.content.replace(/\[\[([^\]]+)\]\]/g, '*$1*') + '\n\n';
      });
    }

    if (sections.methods?.length) {
      md += `## 2. Methods\n\n`;
      sections.methods.forEach((note) => {
        md += `### ${note.title}\n\n`;
        md += note.content.replace(/\[\[([^\]]+)\]\]/g, '*$1*') + '\n\n';
      });
    }

    if (sections.results?.length) {
      md += `## 3. Results\n\n`;
      sections.results.forEach((note) => {
        md += `### ${note.title}\n\n`;
        md += note.content.replace(/\[\[([^\]]+)\]\]/g, '*$1*') + '\n\n';
      });
    }

    if (sections.discussion?.length) {
      md += `## 4. Discussion\n\n`;
      sections.discussion.forEach((note) => {
        md += `### ${note.title}\n\n`;
        md += note.content.replace(/\[\[([^\]]+)\]\]/g, '*$1*') + '\n\n';
      });
    }

    if (references.length) {
      md += `## References\n\n`;
      md += citationService.formatBibliography(references, 'apa');
    }

    return md;
  },

  downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export const zoteroSyncService = {
  async validateCredentials(apiKey: string, userId: string): Promise<boolean> {
    try {
      await delay(500);
      const response = await fetch(
        `https://api.zotero.org/users/${userId}/collections?limit=1`,
        {
          headers: {
            'Zotero-API-Key': apiKey,
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  },

  async fetchCollections(
    apiKey: string,
    userId: string,
    libraryType: 'personal' | 'group' = 'personal',
    groupId?: string
  ): Promise<{ key: string; name: string; parentCollection?: string }[]> {
    try {
      await delay(300);
      const baseUrl =
        libraryType === 'group' && groupId
          ? `https://api.zotero.org/groups/${groupId}`
          : `https://api.zotero.org/users/${userId}`;

      const response = await fetch(`${baseUrl}/collections?limit=100`, {
        headers: {
          'Zotero-API-Key': apiKey,
        },
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: { key: string; data: { name: string; parentCollection?: string } }) => ({
        key: item.key,
        name: item.data.name,
        parentCollection: item.data.parentCollection,
      }));
    } catch {
      return [];
    }
  },

  async fetchItems(
    apiKey: string,
    userId: string,
    libraryType: 'personal' | 'group' = 'personal',
    groupId?: string,
    collectionKey?: string
  ): Promise<Paper[]> {
    try {
      await delay(500);
      const baseUrl =
        libraryType === 'group' && groupId
          ? `https://api.zotero.org/groups/${groupId}`
          : `https://api.zotero.org/users/${userId}`;

      let url = `${baseUrl}/items?limit=100&format=json&include=data,bib`;
      if (collectionKey) {
        url = `${baseUrl}/collections/${collectionKey}/items?limit=100&format=json&include=data,bib`;
      }

      const response = await fetch(url, {
        headers: {
          'Zotero-API-Key': apiKey,
        },
      });

      if (!response.ok) return [];
      const data = await response.json();

      return data
        .filter((item: { data: { itemType: string } }) => item.data.itemType !== 'attachment')
        .map((item: { key: string; data: Record<string, unknown> }) => this.zoteroItemToPaper(item.data, item.key));
    } catch {
      return [];
    }
  },

  zoteroItemToPaper(item: Record<string, unknown>, key: string): Paper {
    const creators = (item.creators as Array<{
      creatorType: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    }> || []);

    const authors = creators
      .filter((c) => c.creatorType === 'author')
      .map((c) => ({
        id: uuidv4(),
        name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        givenName: c.firstName,
        familyName: c.lastName,
      }));

    let year: number | undefined;
    const date = item.date as string;
    if (date) {
      const yearMatch = date.match(/(\d{4})/);
      if (yearMatch) {
        year = parseInt(yearMatch[1], 10);
      }
    }

    return {
      id: uuidv4(),
      title: (item.title as string) || 'Unknown Title',
      authors,
      abstract: item.abstractNote as string | undefined,
      doi: item.DOI as string | undefined,
      url: item.url as string | undefined,
      journal: item.publicationTitle as string | undefined,
      volume: item.volume as string | undefined,
      issue: item.issue as string | undefined,
      pages: item.pages as string | undefined,
      year,
      publisher: item.publisher as string | undefined,
      isbn: item.ISBN as string | undefined,
      issn: item.ISSN as string | undefined,
      tags: ((item.tags as Array<{ tag: string }> | undefined) || []).map((t) => t.tag),
      readStatus: 'unread',
      addedBy: 1,
      addedAt: new Date().toISOString(),
    };
  },

  paperToZoteroItem(paper: Paper): Record<string, unknown> {
    return {
      itemType: 'journalArticle',
      title: paper.title,
      creators: paper.authors.map((a) => ({
        creatorType: 'author',
        firstName: a.givenName || a.name.split(' ')[0],
        lastName: a.familyName || a.name.split(' ').pop() || a.name,
      })),
      abstractNote: paper.abstract,
      DOI: paper.doi,
      url: paper.url,
      publicationTitle: paper.journal,
      volume: paper.volume,
      issue: paper.issue,
      pages: paper.pages,
      date: paper.year?.toString(),
      ISBN: paper.isbn,
      ISSN: paper.issn,
      tags: paper.tags?.map((t) => ({ tag: t })),
    };
  },

  async exportToZotero(
    apiKey: string,
    userId: string,
    papers: Paper[],
    libraryType: 'personal' | 'group' = 'personal',
    groupId?: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const baseUrl =
      libraryType === 'group' && groupId
        ? `https://api.zotero.org/groups/${groupId}`
        : `https://api.zotero.org/users/${userId}`;

    for (const paper of papers) {
      try {
        await delay(200);
        const response = await fetch(`${baseUrl}/items`, {
          method: 'POST',
          headers: {
            'Zotero-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([this.paperToZoteroItem(paper)]),
        });

        if (response.ok) {
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { success, failed };
  },
};

let mutableTimelines: Timeline[] = [];

function initTimelines(): Timeline[] {
  if (mutableTimelines.length > 0) return mutableTimelines;

  mutableTimelines = [
    {
      id: uuidv4(),
      projectId: 'proj1',
      projectName: 'Transformer Architecture Research',
      events: [
        {
          id: uuidv4(),
          type: 'milestone',
          title: 'Project Started',
          description: 'Begin research on transformer architectures',
          date: '2024-01-15',
          userId: 1,
        },
        {
          id: uuidv4(),
          type: 'paper-added',
          title: 'Added: Attention Is All You Need',
          date: '2024-01-20',
          paperId: mockPapers[0].id,
          userId: 1,
        },
        {
          id: uuidv4(),
          type: 'note-created',
          title: 'Created: Transformer Architecture Overview',
          date: '2024-01-25',
          noteId: mockNotes[0].id,
          userId: 1,
        },
        {
          id: uuidv4(),
          type: 'paper-added',
          title: 'Added: BERT Paper',
          date: '2024-02-20',
          paperId: mockPapers[1].id,
          userId: 1,
        },
        {
          id: uuidv4(),
          type: 'milestone',
          title: 'Literature Review Complete',
          description: 'Completed initial literature review on transformers',
          date: '2024-03-01',
          userId: 1,
        },
      ],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
    },
  ];
  return mutableTimelines;
}

export const timelineService = {
  async getTimelines(): Promise<Timeline[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(initTimelines()));
  },

  async addEvent(timelineId: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    await delay(100);
    const timelines = initTimelines();
    const timeline = timelines.find((t) => t.id === timelineId);
    
    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const newEvent: TimelineEvent = {
      id: uuidv4(),
      type: event.type || 'milestone',
      title: event.title || 'Untitled Event',
      description: event.description,
      date: event.date || new Date().toISOString().split('T')[0],
      paperId: event.paperId,
      noteId: event.noteId,
      userId: event.userId || 1,
      tags: event.tags,
    };

    timeline.events.push(newEvent);
    timeline.updatedAt = new Date().toISOString();

    return newEvent;
  },
};

export const mindMapService = {
  generateFromNotes(notes: Note[]): MindMapNode {
    const root: MindMapNode = {
      id: uuidv4(),
      label: 'Knowledge Base',
      children: [],
    };

    const tagMap = new Map<string, MindMapNode>();

    notes.forEach((note) => {
      const noteNode: MindMapNode = {
        id: note.id,
        noteId: note.id,
        label: note.title,
        children: [],
      };

      if (note.tags?.length) {
        note.tags.forEach((tag) => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, {
              id: uuidv4(),
              label: tag,
              children: [],
            });
            root.children.push(tagMap.get(tag)!);
          }
          tagMap.get(tag)!.children.push(noteNode);
        });
      } else {
        root.children.push(noteNode);
      }
    });

    return root;
  },

  generateFromPaper(paper: Paper, relatedPapers: Paper[]): MindMapNode {
    const root: MindMapNode = {
      id: paper.id,
      paperId: paper.id,
      label: paper.title,
      children: [],
    };

    if (paper.references?.length) {
      const referencesNode: MindMapNode = {
        id: uuidv4(),
        label: 'References',
        children: paper.references.map((refId) => {
          const refPaper = relatedPapers.find((p) => p.id === refId);
          return {
            id: refId,
            paperId: refPaper?.id,
            label: refPaper?.title || refId,
            children: [],
          };
        }),
      };
      root.children.push(referencesNode);
    }

    if (paper.citations?.length) {
      const citationsNode: MindMapNode = {
        id: uuidv4(),
        label: 'Cited By',
        children: paper.citations.map((citId) => {
          const citPaper = relatedPapers.find((p) => p.id === citId);
          return {
            id: citId,
            paperId: citPaper?.id,
            label: citPaper?.title || citId,
            children: [],
          };
        }),
      };
      root.children.push(citationsNode);
    }

    return root;
  },
};
