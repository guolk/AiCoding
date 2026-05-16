const http = require('http');

const postData = JSON.stringify({
  title: "深度学习在NLP中的应用",
  authors: "张三, 李四",
  abstract: "本文探讨了深度学习在自然语言处理中的最新进展，包括Transformer架构、预训练模型等。",
  year: 2024,
  doi: "",
  arxiv_id: "",
  journal: "计算机学报",
  status: "reading",
  rating: 5,
  notes: "非常有价值的论文！"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/papers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(postData, 'utf8')
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('创建结果:', data);
    
    // 验证GET请求
    const getOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/papers/7',
      method: 'GET'
    };
    
    http.get(getOptions, (getRes) => {
      let getData = '';
      getRes.setEncoding('utf8');
      getRes.on('data', (chunk) => getData += chunk);
      getRes.on('end', () => {
        const paper = JSON.parse(getData);
        console.log('\n验证读取结果:');
        console.log('标题:', paper.title);
        console.log('作者:', paper.authors);
        console.log('摘要:', paper.abstract);
        console.log('笔记:', paper.notes);
      });
    });
  });
});

req.on('error', (e) => console.error('请求错误:', e.message));
req.write(postData, 'utf8');
req.end();
