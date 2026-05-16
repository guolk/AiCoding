const axios = require('axios');
const { parseString } = require('xml2js');

async function fetchByDOI(doi) {
  try {
    const response = await axios.get(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResearchReader/1.0 (mailto:your@email.com)'
      }
    });

    const data = response.data.message;
    return {
      title: data.title?.[0] || '',
      authors: data.author?.map(a => `${a.given} ${a.family}`).join(', ') || '',
      abstract: data.abstract || '',
      year: data.published?.['date-parts']?.[0]?.[0] || null,
      journal: data['container-title']?.[0] || '',
      doi: doi
    };
  } catch (error) {
    console.error('Error fetching DOI metadata:', error);
    throw new Error('无法获取DOI元数据');
  }
}

async function fetchByArXivId(arxivId) {
  try {
    const cleanId = arxivId.replace('arXiv:', '').trim();
    const response = await axios.get(`http://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}`);
    
    return new Promise((resolve, reject) => {
      parseString(response.data, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const entry = result.feed?.entry?.[0];
        if (!entry) {
          reject(new Error('未找到该ArXiv ID的文献'));
          return;
        }

        const published = entry.published?.[0];
        const year = published ? new Date(published).getFullYear() : null;

        resolve({
          title: entry.title?.[0]?.replace(/\s+/g, ' ').trim() || '',
          authors: entry.author?.map(a => a.name?.[0]).join(', ') || '',
          abstract: entry.summary?.[0]?.replace(/\s+/g, ' ').trim() || '',
          year: year,
          journal: 'arXiv',
          arxiv_id: cleanId
        });
      });
    });
  } catch (error) {
    console.error('Error fetching arXiv metadata:', error);
    throw new Error('无法获取ArXiv元数据');
  }
}

module.exports = {
  fetchByDOI,
  fetchByArXivId
};
