import { MoodDimensions } from '../types';

export const getGuidedPrompts = (dimensions: MoodDimensions): string[] => {
  const prompts: string[] = [];

  if (dimensions.pleasure < 4) {
    prompts.push('写下三件今天值得感激的事');
    prompts.push('描述一个曾经让你感到快乐的回忆');
    prompts.push('今天有什么小确幸吗？');
  }

  if (dimensions.anxiety > 6 || dimensions.stress > 6) {
    prompts.push('是什么让你感到焦虑？把它们写下来');
    prompts.push('如果焦虑会说话，它会说什么？');
    prompts.push('深呼吸三次，然后写下现在最想做的一件事');
  }

  if (dimensions.energy < 4) {
    prompts.push('什么能让你恢复精力？');
    prompts.push('今天最轻松的时刻是什么时候？');
  }

  if (dimensions.pleasure >= 7) {
    prompts.push('是什么让你今天感到开心？');
    prompts.push('把这份快乐描述得更详细一些');
    prompts.push('你想把这份好心情分享给谁？');
  }

  prompts.push('今天有什么收获或感悟？');
  prompts.push('你想对明天的自己说什么？');

  return prompts.slice(0, 3);
};
