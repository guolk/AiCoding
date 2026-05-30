import type {
  Work,
  Version,
  ListeningNote,
  Composer,
  Concert,
  MusicBrainzWorkResult,
  MusicBrainzArtistResult
} from '../../shared/types';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const workApi = {
  getAll: () => fetchApi<Work[]>('/works'),
  getById: (id: string) => fetchApi<Work>(`/works/${id}`),
  create: (data: Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'listenCount'>) =>
    fetchApi<Work>('/works', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id: string, data: Partial<Work>) =>
    fetchApi<Work>(`/works/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id: string) =>
    fetchApi<void>(`/works/${id}`, { method: 'DELETE' }),
  getVersions: (workId: string) => fetchApi<Version[]>(`/works/${workId}/versions`),
  getNotes: (workId: string) => fetchApi<ListeningNote[]>(`/works/${workId}/notes`)
};

export const versionApi = {
  getById: (id: string) => fetchApi<Version>(`/versions/${id}`),
  create: (data: Omit<Version, 'id' | 'createdAt'>) =>
    fetchApi<Version>('/versions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id: string, data: Partial<Version>) =>
    fetchApi<Version>(`/versions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id: string) =>
    fetchApi<void>(`/versions/${id}`, { method: 'DELETE' })
};

export const noteApi = {
  getAll: () => fetchApi<ListeningNote[]>('/notes'),
  getById: (id: string) => fetchApi<ListeningNote>(`/notes/${id}`),
  create: (data: Omit<ListeningNote, 'id' | 'createdAt'>) =>
    fetchApi<ListeningNote>('/notes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id: string, data: Partial<ListeningNote>) =>
    fetchApi<ListeningNote>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id: string) =>
    fetchApi<void>(`/notes/${id}`, { method: 'DELETE' })
};

export const composerApi = {
  getAll: () => fetchApi<Composer[]>('/composers'),
  getById: (id: string) => fetchApi<Composer>(`/composers/${id}`),
  create: (data: Omit<Composer, 'id' | 'createdAt'>) =>
    fetchApi<Composer>('/composers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id: string, data: Partial<Composer>) =>
    fetchApi<Composer>(`/composers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id: string) =>
    fetchApi<void>(`/composers/${id}`, { method: 'DELETE' })
};

export const concertApi = {
  getAll: () => fetchApi<Concert[]>('/concerts'),
  getById: (id: string) => fetchApi<Concert>(`/concerts/${id}`),
  create: (data: Omit<Concert, 'id' | 'createdAt'>) =>
    fetchApi<Concert>('/concerts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id: string, data: Partial<Concert>) =>
    fetchApi<Concert>(`/concerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id: string) =>
    fetchApi<void>(`/concerts/${id}`, { method: 'DELETE' })
};

export const musicbrainzApi = {
  searchWorks: (query: string) =>
    fetchApi<MusicBrainzWorkResult[]>(`/musicbrainz/works?q=${encodeURIComponent(query)}`),
  searchArtists: (query: string) =>
    fetchApi<MusicBrainzArtistResult[]>(`/musicbrainz/artists?q=${encodeURIComponent(query)}`),
  getWork: (mbid: string) =>
    fetchApi<MusicBrainzWorkResult>(`/musicbrainz/works/${mbid}`)
};
