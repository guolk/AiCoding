import { MusicBrainzWorkResult, MusicBrainzArtistResult, Movement } from '../../shared/types';

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'Maestoso/1.0.0 (maestoso@example.com)';

interface MusicBrainzApiResponse {
  works?: Array<{
    id: string;
    title: string;
    'artist-relation-list'?: Array<{
      artist: { id: string; name: string; 'sort-name'?: string };
      type: string;
    }>;
    attributes?: Array<{ value: string; type: string }>;
    'first-release-date'?: string;
    type?: string;
  }>;
  artists?: Array<{
    id: string;
    name: string;
    'sort-name'?: string;
    'life-span'?: { begin?: string; end?: string; ended?: boolean };
    area?: { name: string };
    tags?: Array<{ name: string; count: number }>;
  }>;
}

async function fetchFromMusicBrainz(endpoint: string): Promise<MusicBrainzApiResponse> {
  const url = `${MUSICBRAINZ_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': USER_AGENT
    }
  });
  if (!response.ok) {
    throw new Error(`MusicBrainz API error: ${response.status}`);
  }
  return response.json();
}

function parseWorkTitle(title: string): { opus?: string; catalogNumber?: string; cleanedTitle: string } {
  const opusMatch = title.match(/Op\.\s*(\d+\w*(?:,\s*No\.\s*\d+)?)/i);
  const kvMatch = title.match(/K\.\s*(\d+\w*)/i);
  const bwvMatch = title.match(/BWV\s*(\d+\w*)/i);
  
  let opus = opusMatch ? opusMatch[0] : undefined;
  let catalogNumber = kvMatch ? kvMatch[0] : (bwvMatch ? bwvMatch[0] : undefined);
  
  let cleanedTitle = title;
  if (opus) cleanedTitle = cleanedTitle.replace(/,\s*Op\.\s*[\d\w, ]+/i, '');
  if (catalogNumber) cleanedTitle = cleanedTitle.replace(/,\s*(?:K\.|BWV)\s*[\d\w]+/i, '');
  
  return { opus, catalogNumber, cleanedTitle: cleanedTitle.trim() };
}

export async function searchWorks(query: string): Promise<MusicBrainzWorkResult[]> {
  const encodedQuery = encodeURIComponent(query);
  const endpoint = `/work/?query=${encodedQuery}&fmt=json&limit=10&inc=artist-rels`;
  
  try {
    const response = await fetchFromMusicBrainz(endpoint);
    if (!response.works) return [];
    
    return response.works.map(work => {
      const composerRel = work['artist-relation-list']?.find(
        rel => rel.type === 'composer'
      );
      const { opus, catalogNumber, cleanedTitle } = parseWorkTitle(work.title);
      
      return {
        id: work.id,
        title: cleanedTitle,
        composer: composerRel?.artist.name,
        composerId: composerRel?.artist.id,
        workType: work.type,
        opus,
        catalogNumber,
        compositionYear: work['first-release-date'] 
          ? parseInt(work['first-release-date'].substring(0, 4))
          : undefined
      };
    });
  } catch (error) {
    console.error('Error searching works:', error);
    return [];
  }
}

export async function searchArtists(query: string): Promise<MusicBrainzArtistResult[]> {
  const encodedQuery = encodeURIComponent(query);
  const endpoint = `/artist/?query=${encodedQuery}&fmt=json&limit=10`;
  
  try {
    const response = await fetchFromMusicBrainz(endpoint);
    if (!response.artists) return [];
    
    return response.artists.map(artist => {
      const composerTag = artist.tags?.find(t => t.name === 'composer');
      
      return {
        id: artist.id,
        name: artist.name,
        sortName: artist['sort-name'],
        birthYear: artist['life-span']?.begin 
          ? parseInt(artist['life-span'].begin.substring(0, 4))
          : undefined,
        deathYear: artist['life-span']?.end 
          ? parseInt(artist['life-span'].end.substring(0, 4))
          : undefined,
        nationality: artist.area?.name,
        period: composerTag ? '作曲家' : undefined
      };
    });
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
}

export async function getWorkDetails(mbId: string): Promise<MusicBrainzWorkResult | null> {
  const endpoint = `/work/${mbId}?fmt=json&inc=artist-rels+recordings`;
  
  try {
    const work = await fetchFromMusicBrainz(endpoint);
    if (!('id' in work)) return null;
    
    const composerRel = work['artist-relation-list']?.find(
      rel => rel.type === 'composer'
    );
    const { opus, catalogNumber, cleanedTitle } = parseWorkTitle((work as any).title);
    
    return {
      id: (work as any).id,
      title: cleanedTitle,
      composer: composerRel?.artist.name,
      composerId: composerRel?.artist.id,
      workType: (work as any).type,
      opus,
      catalogNumber
    };
  } catch (error) {
    console.error('Error getting work details:', error);
    return null;
  }
}
