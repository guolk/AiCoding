import { GrammarProgress, JLPTLevel } from '@/types';
import { generateId, todayISO } from '@/utils/helpers';

interface GrammarDef {
  grammarPoint: string;
  meaning: string;
  example: string;
}

const n5Grammar: GrammarDef[] = [
  { grammarPoint: '〜は〜です', meaning: 'X is Y (copula)', example: '私は学生です' },
  { grammarPoint: '〜を〜ます', meaning: 'to do (with object)', example: '本を読みます' },
  { grammarPoint: '〜にあります', meaning: 'exists in/at a place', example: '銀行は駅にあります' },
  { grammarPoint: '〜から〜まで', meaning: 'from...to...', example: '9時から5時まで働きます' },
  { grammarPoint: '〜と', meaning: 'and; with', example: '友達と映画を見ます' },
  { grammarPoint: '〜の', meaning: 'possessive particle', example: '私の本です' },
  { grammarPoint: '〜で', meaning: 'by means of; at', example: 'バスで学校に行きます' },
  { grammarPoint: '〜ませんか', meaning: "won't you? (invitation)", example: '一緒に食べませんか' },
];

const n4Grammar: GrammarDef[] = [
  { grammarPoint: '〜ている', meaning: 'is doing; has done', example: '本を読んでいます' },
  { grammarPoint: '〜たことがある', meaning: 'have experienced', example: '日本に行ったことがあります' },
  { grammarPoint: '〜たり〜たり', meaning: 'doing things like...', example: '本を読んだり音楽を聞いたりします' },
  { grammarPoint: '〜し', meaning: 'and; moreover', example: '雨だし、寒いし' },
  { grammarPoint: '〜すぎる', meaning: 'too much; overly', example: '食べすぎました' },
  { grammarPoint: '〜ほうがいい', meaning: 'had better', example: '早く寝たほうがいいです' },
  { grammarPoint: '〜つもり', meaning: 'intention; plan', example: '来年日本に行くつもりです' },
  { grammarPoint: '〜かもしれません', meaning: 'might; maybe', example: '明日雨かもしれません' },
];

const n3Grammar: GrammarDef[] = [
  { grammarPoint: '〜ばかり', meaning: 'just; only', example: '帰ったばかりです' },
  { grammarPoint: '〜ずに', meaning: 'without doing', example: '朝ごはんを食べずに学校に行きました' },
  { grammarPoint: '〜に対して', meaning: 'towards; against', example: 'この問題に対して意見があります' },
  { grammarPoint: '〜によって', meaning: 'by; depending on', example: '国によって文化が違います' },
  { grammarPoint: '〜として', meaning: 'as; in the capacity of', example: '学生として日本に来ました' },
  { grammarPoint: '〜のに', meaning: 'even though; despite', example: '早く来たのに間に合わなかった' },
  { grammarPoint: '〜ようになる', meaning: 'come to be able to', example: '日本語が話せるようになりました' },
  { grammarPoint: '〜てしまう', meaning: 'to do completely; regretfully', example: 'ケーキを食べてしまった' },
];

const n2Grammar: GrammarDef[] = [
  { grammarPoint: '〜かねない', meaning: 'might; could (negative outcome)', example: '病気になりかねない' },
  { grammarPoint: '〜つつある', meaning: 'is gradually becoming', example: '回復しつつある' },
  { grammarPoint: '〜をもとに', meaning: 'based on', example: '事実をもとに書かれた' },
  { grammarPoint: '〜にかけて', meaning: 'over; during; through', example: '春から夏にかけて' },
  { grammarPoint: '〜にわたって', meaning: 'over; spanning', example: '3年にわたる研究' },
  { grammarPoint: '〜かぎり', meaning: 'as long as', example: '私がいるかぎり大丈夫です' },
  { grammarPoint: '〜ものの', meaning: 'although; even though', example: '見つけたものの高すぎた' },
  { grammarPoint: '〜ざるをえない', meaning: 'cannot help but', example: '受けざるをえない' },
];

const n1Grammar: GrammarDef[] = [
  { grammarPoint: '〜にもまして', meaning: 'more than ever', example: '前にもまして努力が必要だ' },
  { grammarPoint: '〜とあれば', meaning: 'if it is the case', example: '必要とあれば手伝います' },
  { grammarPoint: '〜んがため', meaning: 'for the purpose of', example: '勝たんがための練習' },
  { grammarPoint: '〜べく', meaning: 'in order to', example: '成功すべく努力している' },
  { grammarPoint: '〜めく', meaning: 'to seem like; begin to', example: '春めいてきた' },
  { grammarPoint: '〜なりに', meaning: "in one's own way", example: '子供なりに考えている' },
  { grammarPoint: '〜そばから', meaning: 'as soon as; right after', example: '覚えるそばから忘れる' },
  { grammarPoint: '〜が早いか', meaning: 'as soon as', example: 'ベルが鳴るが早いか走り出した' },
];

const grammarByLevel: Record<JLPTLevel, GrammarDef[]> = {
  N5: n5Grammar,
  N4: n4Grammar,
  N3: n3Grammar,
  N2: n2Grammar,
  N1: n1Grammar,
};

export function createInitialGrammarProgress(level?: JLPTLevel): GrammarProgress[] {
  const result: GrammarProgress[] = [];
  const levels: JLPTLevel[] = level ? [level] : ['N5', 'N4', 'N3', 'N2', 'N1'];
  levels.forEach(lvl => {
    grammarByLevel[lvl].forEach(g => {
      result.push({
        id: generateId(),
        grammarPoint: g.grammarPoint,
        level: lvl,
        status: 'unlearned',
        meaning: g.meaning,
        example: g.example,
        lastStudied: '',
      });
    });
  });
  return result;
}

export { n5Grammar, n4Grammar, n3Grammar, n2Grammar, n1Grammar, grammarByLevel };
export type { GrammarDef };
