export const extractWords = (texts: string[]): [string, number][] => {
  const wordCount: Record<string, number> = {};
  const stopWords = new Set([
    '的', '了', '是', '我', '你', '他', '她', '它', '们', '在', '有', '和',
    '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要',
    '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '什么',
    '这个', '那个', '因为', '所以', '但是', '可以', '今天', '昨天', '明天',
    '时候', '还是', '觉得', '时候', '怎么', '这样', '那样', '然后', '就是',
    '不是', '一下', '真的', '非常', '比较', '有点', '还是', '已经', '之后'
  ]);

  texts.forEach(text => {
    const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]+/g) || [];
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 1) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50) as [string, number][];
};
