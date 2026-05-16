const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/database.db');

// 如果数据库文件存在则删除，重新创建
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✓ 已清理旧数据库');
}

const db = new sqlite3.Database(dbPath);
db.run('PRAGMA encoding = "UTF-8"');

// 创建表结构
function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS papers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          authors TEXT,
          abstract TEXT,
          year INTEGER,
          doi TEXT UNIQUE,
          arxiv_id TEXT UNIQUE,
          journal TEXT,
          file_path TEXT,
          status TEXT DEFAULT 'unread',
          rating INTEGER,
          notes TEXT,
          reading_progress REAL DEFAULT 0,
          last_read_page INTEGER DEFAULT 1,
          last_read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS annotations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          paper_id INTEGER,
          type TEXT,
          content TEXT,
          page INTEGER,
          color TEXT,
          x REAL,
          y REAL,
          width REAL,
          height REAL,
          selected_text TEXT,
          context_before TEXT,
          context_after TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          paper_id INTEGER,
          annotation_id INTEGER,
          title TEXT,
          content TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS paper_relations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          paper_id1 INTEGER,
          paper_id2 INTEGER,
          relation_type TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS key_insights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          paper_id INTEGER,
          research_question TEXT,
          methods TEXT,
          conclusions TEXT,
          limitations TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS reading_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          paper_id INTEGER,
          start_time DATETIME,
          end_time DATETIME,
          pages_read INTEGER,
          duration INTEGER
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('✓ 数据库表结构创建完成');
          resolve();
        }
      });
    });
  });
}

const papers = [
  {
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    year: 2017,
    doi: '10.48550/arXiv.1706.03762',
    journal: 'NeurIPS',
    status: 'reading',
    rating: 5,
    notes: 'Transformer架构的开山之作，彻底改变了NLP领域。自注意力机制是核心创新。',
    reading_progress: 65,
    last_read_page: 8,
  },
  {
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: 'Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova',
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    year: 2019,
    doi: '10.48550/arXiv.1810.04805',
    journal: 'NAACL',
    status: 'completed',
    rating: 5,
    notes: 'Bidirectional pre-training是关键创新。MLM和NSP两个预训练任务设计巧妙。',
    reading_progress: 100,
    last_read_page: 12,
  },
  {
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun',
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.',
    year: 2016,
    doi: '10.48550/arXiv.1512.03385',
    journal: 'CVPR',
    status: 'mastered',
    rating: 5,
    notes: 'ResNet解决了深度网络退化问题，残差连接是深度学习最重要的发明之一。',
    reading_progress: 100,
    last_read_page: 10,
  },
  {
    title: 'Language Models are Few-Shot Learners',
    authors: 'Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, Dario Amodei',
    abstract: 'We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches.',
    year: 2020,
    doi: '10.48550/arXiv.2005.14165',
    journal: 'NeurIPS',
    status: 'reading',
    rating: 4,
    notes: 'GPT-3，展示了大语言模型的涌现能力。规模定律得到验证。',
    reading_progress: 45,
    last_read_page: 15,
  },
  {
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: 'Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton',
    abstract: 'We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest into the 1000 different classes. The network contains 60 million parameters and 650,000 neurons.',
    year: 2012,
    doi: '10.1145/3065386',
    journal: 'NeurIPS',
    status: 'unread',
    rating: 0,
    notes: '',
    reading_progress: 0,
    last_read_page: 1,
  },
  {
    title: 'Generative Adversarial Networks',
    authors: 'Ian J. Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, Yoshua Bengio',
    abstract: 'We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model that captures the data distribution, and a discriminative model that estimates the probability that a sample came from the training data rather than the generator.',
    year: 2014,
    doi: '10.48550/arXiv.1406.2661',
    journal: 'NeurIPS',
    status: 'completed',
    rating: 5,
    notes: 'GAN开创了生成式AI的新纪元，minimax博弈思想非常精妙。',
    reading_progress: 100,
    last_read_page: 9,
  },
];

const annotations = [
  {
    paper_id: 1,
    type: 'highlight',
    content: '',
    page: 3,
    color: 'yellow',
    selected_text: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
  },
  {
    paper_id: 1,
    type: 'note',
    content: '这是文章的核心论点。相比RNN和CNN，纯注意力机制可以并行计算，同时捕获长距离依赖。',
    page: 3,
    color: 'green',
    selected_text: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
  },
  {
    paper_id: 1,
    type: 'highlight',
    content: '',
    page: 5,
    color: 'blue',
    selected_text: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.',
  },
  {
    paper_id: 2,
    type: 'highlight',
    content: '',
    page: 1,
    color: 'yellow',
    selected_text: 'BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
  },
  {
    paper_id: 2,
    type: 'note',
    content: '与GPT的单向attention不同，BERT使用双向attention，能够更好地理解上下文。',
    page: 1,
    color: 'pink',
    selected_text: 'BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
  },
  {
    paper_id: 3,
    type: 'highlight',
    content: '',
    page: 2,
    color: 'green',
    selected_text: 'We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.',
  },
  {
    paper_id: 3,
    type: 'highlight',
    content: '',
    page: 3,
    color: 'yellow',
    selected_text: 'Instead of hoping each few stacked layers directly fit a desired underlying mapping, we explicitly let these layers fit a residual mapping.',
  },
  {
    paper_id: 6,
    type: 'highlight',
    content: '',
    page: 1,
    color: 'blue',
    selected_text: 'We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model and a discriminative model.',
  },
];

const insights = [
  {
    paper_id: 1,
    research_question: '如何设计一个不依赖RNN和CNN的序列建模架构，能够并行计算且捕获长距离依赖？',
    methods: '提出纯注意力机制的Transformer架构，包括多头注意力、位置编码、残差连接、LayerNorm等组件。',
    conclusions: 'Transformer在机器翻译任务上取得SOTA，训练速度显著快于RNN架构，证明了纯注意力机制的有效性。',
    limitations: '计算复杂度是序列长度的二次方，对于极长序列计算开销较大；需要大量训练数据。',
  },
  {
    paper_id: 2,
    research_question: '如何预训练一个双向的语言表示模型，能够捕获更丰富的上下文信息？',
    methods: '使用Masked Language Model (MLM)和Next Sentence Prediction (NSP)两个预训练任务，基于Transformer编码器架构。',
    conclusions: 'BERT在11个NLP任务上取得SOTA，证明了双向预训练的巨大优势，开启了预训练-微调范式。',
    limitations: 'MLM任务中[MASK]token在微调时不存在，造成预训练-微调差异；NSP任务相对简单。',
  },
  {
    paper_id: 3,
    research_question: '为什么深度神经网络随着层数增加会出现性能退化？如何训练极深的神经网络？',
    methods: '提出残差学习框架，让网络层学习残差映射H(x)-x而非直接学习H(x)，通过shortcut连接实现。',
    conclusions: '残差网络能够轻松训练152层甚至1000层网络，在ImageNet和COCO上取得SOTA。',
    limitations: '残差连接增加了模型参数；理论分析还不够完善。',
  },
  {
    paper_id: 6,
    research_question: '如何训练生成模型以捕获复杂的数据分布？',
    methods: '提出对抗训练框架：生成器G学习数据分布，判别器D估计样本来自真实数据还是G生成的。',
    conclusions: 'GAN生成的图像质量显著优于当时其他方法，开创了生成式建模的新范式。',
    limitations: '训练不稳定、模式崩溃问题难以解决；没有明确的损失函数衡量训练进展。',
  },
];

const relations = [
  {
    paper_id1: 1,
    paper_id2: 2,
    relation_type: 'support',
    description: 'BERT基于Transformer编码器架构，验证了Transformer的通用性。',
  },
  {
    paper_id1: 1,
    paper_id2: 4,
    relation_type: 'support',
    description: 'GPT-3基于Transformer解码器架构，展示了Transformer的规模化潜力。',
  },
  {
    paper_id1: 3,
    paper_id2: 5,
    relation_type: 'support',
    description: 'ResNet建立在AlexNet开创的深度CNN基础之上，进一步深化了深度表示学习。',
  },
  {
    paper_id1: 1,
    paper_id2: 3,
    relation_type: 'related',
    description: '两者都采用残差连接作为核心组件，但建模范式不同（注意力vs卷积）。',
  },
];

function seedDatabase() {
  return new Promise((resolve, reject) => {
    console.log('开始初始化测试数据...');

    db.serialize(() => {
      papers.forEach((paper, index) => {
        const stmt = db.prepare(`
          INSERT INTO papers (title, authors, abstract, year, doi, journal, status, rating, notes, reading_progress, last_read_page, last_read_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${index * 2} days'), datetime('now', '-${index * 30} days'))
        `);
        stmt.run(
          paper.title,
          paper.authors,
          paper.abstract,
          paper.year,
          paper.doi,
          paper.journal,
          paper.status,
          paper.rating,
          paper.notes,
          paper.reading_progress,
          paper.last_read_page
        );
        stmt.finalize();
        console.log(`✓ 添加文献: ${paper.title.substring(0, 50)}...`);
      });

      annotations.forEach((ann) => {
        const stmt = db.prepare(`
          INSERT INTO annotations (paper_id, type, content, page, color, selected_text)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(ann.paper_id, ann.type, ann.content, ann.page, ann.color, ann.selected_text);
        stmt.finalize();
      });
      console.log(`✓ 添加 ${annotations.length} 条批注`);

      insights.forEach((insight) => {
        const stmt = db.prepare(`
          INSERT INTO key_insights (paper_id, research_question, methods, conclusions, limitations)
          VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(insight.paper_id, insight.research_question, insight.methods, insight.conclusions, insight.limitations);
        stmt.finalize();
      });
      console.log(`✓ 添加 ${insights.length} 篇文献的知识提炼`);

      relations.forEach((rel) => {
        const stmt = db.prepare(`
          INSERT INTO paper_relations (paper_id1, paper_id2, relation_type, description)
          VALUES (?, ?, ?, ?)
        `);
        stmt.run(rel.paper_id1, rel.paper_id2, rel.relation_type, rel.description);
        stmt.finalize();
      });
      console.log(`✓ 添加 ${relations.length} 个文献关联`);
    });

    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('\n🎉 测试数据初始化完成！');
        console.log('统计信息:');
        console.log(`  - 文献: ${papers.length} 篇`);
        console.log(`  - 批注: ${annotations.length} 条`);
        console.log(`  - 知识提炼: ${insights.length} 篇`);
        console.log(`  - 文献关联: ${relations.length} 个`);
        resolve();
      }
    });
  });
}

async function main() {
  try {
    await createTables();
    await seedDatabase();
  } catch (err) {
    console.error('初始化失败:', err);
    process.exit(1);
  }
}

main();
