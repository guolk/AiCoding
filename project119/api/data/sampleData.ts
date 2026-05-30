import { Paper, CitationRecord, CitationHistory, SocialMention, DownloadData, ApplicationCase } from '../../shared/types';

export const samplePapers: Paper[] = [
  {
    id: 'p1',
    title: 'Deep Learning for Natural Language Processing: A Survey',
    journal: 'IEEE Transactions on Neural Networks',
    publicationDate: '2020-03-15',
    doi: '10.1109/TNNLS.2020.2979284',
    authors: 'Zhang, Wei; Li, Ming',
    field: 'Computer Science',
    currentCitations: 1247,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'p2',
    title: 'Transformer Architectures in Computer Vision',
    journal: 'NeurIPS 2021',
    publicationDate: '2021-12-01',
    doi: '10.48550/arXiv.2109.01166',
    authors: 'Wang, Hong; Chen, Jie',
    field: 'Computer Science',
    currentCitations: 856,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'p3',
    title: 'Reinforcement Learning for Autonomous Systems',
    journal: 'Nature Machine Intelligence',
    publicationDate: '2022-05-20',
    doi: '10.1038/s42256-022-00483-z',
    authors: 'Liu, Fang; Zhao, Yang',
    field: 'AI/Robotics',
    currentCitations: 423,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'p4',
    title: 'Graph Neural Networks for Drug Discovery',
    journal: 'Journal of Chemical Information and Modeling',
    publicationDate: '2022-08-10',
    doi: '10.1021/acs.jcim.2c00438',
    authors: 'Sun, Lin; Zhou, Bo',
    field: 'Bioinformatics',
    currentCitations: 312,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'p5',
    title: 'Attention Mechanisms in Time Series Forecasting',
    journal: 'ICML 2023',
    publicationDate: '2023-07-01',
    doi: '10.48550/arXiv.2306.09309',
    authors: 'Wu, Qing; Yang, Shu',
    field: 'Data Science',
    currentCitations: 178,
    createdAt: '2023-07-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export const sampleCitationRecords: CitationRecord[] = [
  {
    id: 'cr1',
    paperId: 'p1',
    citingPaperTitle: 'A Novel Transformer-Based Approach for Text Classification',
    citingAuthors: 'Kim, S.; Park, J.',
    citingJournal: 'ACL 2023',
    citingYear: 2023,
    citationContext: 'Following the survey by Zhang et al. (2020), we implement a multi-head attention mechanism...',
    category: 'method',
    citedDate: '2023-06-15T00:00:00Z'
  },
  {
    id: 'cr2',
    paperId: 'p1',
    citingPaperTitle: 'Efficient Pre-training Strategies for Large Language Models',
    citingAuthors: 'Brown, A. et al.',
    citingJournal: 'NeurIPS 2023',
    citingYear: 2023,
    citationContext: 'The comprehensive review by Zhang and Li provides an excellent foundation for understanding...',
    category: 'background',
    citedDate: '2023-09-20T00:00:00Z'
  },
  {
    id: 'cr3',
    paperId: 'p1',
    citingPaperTitle: 'Limitations of Current Transformer Architectures in Long Document Understanding',
    citingAuthors: 'Smith, R.; Jones, M.',
    citingJournal: 'EMNLP 2023',
    citingYear: 2023,
    citationContext: 'While Zhang et al. (2020) provide an excellent overview, they do not address the computational...',
    category: 'critical',
    citedDate: '2023-11-05T00:00:00Z'
  },
  {
    id: 'cr4',
    paperId: 'p1',
    citingPaperTitle: 'Sentiment Analysis with Enhanced Attention Mechanisms',
    citingAuthors: 'Garcia, L.',
    citingJournal: 'IEEE Transactions on Affective Computing',
    citingYear: 2024,
    citationContext: 'Our work extends the findings presented in the seminal survey by Zhang and Li (2020)...',
    category: 'positive',
    citedDate: '2024-01-10T00:00:00Z'
  },
  {
    id: 'cr5',
    paperId: 'p2',
    citingPaperTitle: 'Vision Transformers for Medical Image Segmentation',
    citingAuthors: 'Chen, Y.; Liu, Z.',
    citingJournal: 'MICCAI 2023',
    citingYear: 2023,
    citationContext: 'As demonstrated by Wang and Chen (2021), transformer architectures show great promise in...',
    category: 'method',
    citedDate: '2023-08-22T00:00:00Z'
  },
  {
    id: 'cr6',
    paperId: 'p2',
    citingPaperTitle: 'Self-Supervised Learning for Visual Recognition',
    citingAuthors: 'Doe, J.',
    citingJournal: 'CVPR 2024',
    citingYear: 2024,
    citationContext: 'Wang et al.s foundational work in transformers for CV has paved the way for...',
    category: 'positive',
    citedDate: '2024-02-01T00:00:00Z'
  },
  {
    id: 'cr7',
    paperId: 'p3',
    citingPaperTitle: 'Policy Optimization for Safe Robot Navigation',
    citingAuthors: 'Tanaka, H.; Suzuki, T.',
    citingJournal: 'IJCAI 2023',
    citingYear: 2023,
    citationContext: 'Liu and Zhao (2022) present a comprehensive framework that we adapt for...',
    category: 'method',
    citedDate: '2023-07-18T00:00:00Z'
  },
  {
    id: 'cr8',
    paperId: 'p4',
    citingPaperTitle: 'Molecular Property Prediction Using Graph Neural Networks',
    citingAuthors: 'Brown, E.; Wilson, K.',
    citingJournal: 'JACS 2023',
    citingYear: 2023,
    citationContext: 'Building upon the approach outlined by Sun and Zhou (2022), we introduce...',
    category: 'method',
    citedDate: '2023-10-05T00:00:00Z'
  },
  {
    id: 'cr9',
    paperId: 'p5',
    citingPaperTitle: 'Stock Price Prediction with Temporal Attention Networks',
    citingAuthors: 'Johnson, A.',
    citingJournal: 'Quantitative Finance',
    citingYear: 2024,
    citationContext: 'Wu and Yangs (2023) attention-based forecasting methods are particularly relevant...',
    category: 'background',
    citedDate: '2024-01-25T00:00:00Z'
  }
];

function generateCitationHistory(paperId: string, startYear: number, startMonth: number, baseCites: number, growthRate: number): CitationHistory[] {
  const history: CitationHistory[] = [];
  let currentCites = baseCites;
  let id = 0;
  
  for (let year = startYear; year <= 2023; year++) {
    const startM = year === startYear ? startMonth : 1;
    const endM = year === 2023 ? 12 : 12;
    for (let month = startM; month <= endM; month++) {
      const monthlyGrowth = Math.floor(currentCites * (growthRate / 12));
      const variance = Math.floor(Math.random() * 20) - 10;
      const cites = Math.max(1, monthlyGrowth + variance);
      currentCites += cites;
      history.push({
        id: `ch-${paperId}-${id++}`,
        paperId,
        year,
        month,
        citations: cites
      });
    }
  }
  return history;
}

export const sampleCitationHistory: CitationHistory[] = [
  ...generateCitationHistory('p1', 2020, 3, 5, 0.08),
  ...generateCitationHistory('p2', 2022, 1, 3, 0.06),
  ...generateCitationHistory('p3', 2022, 6, 2, 0.05),
  ...generateCitationHistory('p4', 2022, 9, 1, 0.04),
  ...generateCitationHistory('p5', 2023, 7, 0, 0.03)
];

export const sampleSocialMentions: SocialMention[] = [
  {
    id: 'sm1',
    paperId: 'p1',
    platform: 'twitter',
    author: 'Prof_AIResearch',
    content: 'One of the most cited DL NLP surveys - essential reading! #DeepLearning #NLP',
    url: 'https://twitter.com/example/status/12345',
    engagement: 234,
    postedDate: '2023-11-15T00:00:00Z'
  },
  {
    id: 'sm2',
    paperId: 'p1',
    platform: 'blog',
    author: 'MachineThinking.com',
    content: 'Understanding Deep Learning for NLP: A Comprehensive Guide',
    url: 'https://example.com/blog/deep-learning-nlp',
    engagement: 850,
    postedDate: '2023-12-01T00:00:00Z'
  },
  {
    id: 'sm3',
    paperId: 'p2',
    platform: 'reddit',
    author: 'r/MachineLearning',
    content: '[R] Vision Transformers explained with code examples',
    url: 'https://reddit.com/r/ML/comments/abc',
    engagement: 567,
    postedDate: '2023-10-20T00:00:00Z'
  },
  {
    id: 'sm4',
    paperId: 'p3',
    platform: 'news',
    author: 'TechNews Daily',
    content: 'How AI is Revolutionizing Autonomous Vehicles',
    url: 'https://technews.example.com/ai-autonomous',
    engagement: 2100,
    postedDate: '2023-11-28T00:00:00Z'
  },
  {
    id: 'sm5',
    paperId: 'p1',
    platform: 'linkedin',
    author: 'Dr. Researcher',
    content: 'Just published a paper that builds on this survey...',
    url: 'https://linkedin.com/post/example',
    engagement: 145,
    postedDate: '2024-01-05T00:00:00Z'
  }
];

function generateDownloads(paperId: string, baseDownloads: number): DownloadData[] {
  const downloads: DownloadData[] = [];
  let id = 0;
  for (let month = 1; month <= 12; month++) {
    const variance = Math.floor(Math.random() * 15) - 5;
    downloads.push({
      id: `dd-${paperId}-${id++}`,
      paperId,
      year: 2023,
      month,
      downloads: Math.max(5, baseDownloads + month * 3 + variance)
    });
  }
  return downloads;
}

export const sampleDownloadData: DownloadData[] = [
  ...generateDownloads('p1', 40),
  ...generateDownloads('p2', 25),
  ...generateDownloads('p3', 18),
  ...generateDownloads('p4', 12),
  ...generateDownloads('p5', 8)
];

export const sampleApplicationCases: ApplicationCase[] = [
  {
    id: 'ac1',
    paperId: 'p1',
    title: 'ChatAssistant AI - 智能客服系统',
    description: '基于论文中的NLP技术开发的企业级智能客服平台，服务超过50万用户',
    type: 'product',
    url: 'https://example.com/chatassistant',
    source: 'TechCorp Inc.',
    date: '2023-03-15T00:00:00Z',
    createdAt: '2023-03-15T00:00:00Z'
  },
  {
    id: 'ac2',
    paperId: 'p2',
    title: 'MedicalVision - 医学影像诊断平台',
    description: '采用Vision Transformer技术的AI辅助诊断系统，已部署于15家三甲医院',
    type: 'product',
    url: 'https://example.com/medicalvision',
    source: 'HealthAI Corp',
    date: '2023-06-20T00:00:00Z',
    createdAt: '2023-06-20T00:00:00Z'
  },
  {
    id: 'ac3',
    paperId: 'p3',
    title: '国家自动驾驶技术标准',
    description: '论文研究成果被纳入中国自动驾驶安全技术标准制定',
    type: 'policy',
    url: 'https://example.com/auto-policy',
    source: '国家工信部',
    date: '2023-09-01T00:00:00Z',
    createdAt: '2023-09-01T00:00:00Z'
  },
  {
    id: 'ac4',
    paperId: 'p4',
    title: 'DrugDiscovery AI - 药物发现平台',
    description: '基于GNN的药物分子设计平台，已帮助发现2种候选药物',
    type: 'product',
    url: 'https://example.com/drugdiscovery',
    source: 'PharmaTech Ltd.',
    date: '2023-11-10T00:00:00Z',
    createdAt: '2023-11-10T00:00:00Z'
  },
  {
    id: 'ac5',
    paperId: 'p1',
    title: '智能教育平台',
    description: '论文中的注意力机制被应用于个性化学习推荐系统',
    type: 'education',
    url: 'https://example.com/edu-ai',
    source: 'EduTech Innovations',
    date: '2024-01-05T00:00:00Z',
    createdAt: '2024-01-05T00:00:00Z'
  }
];
