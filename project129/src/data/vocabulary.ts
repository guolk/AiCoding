import { VocabularyItem, JLPTLevel } from '@/types';
import { generateId, todayISO } from '@/utils/helpers';

interface VocabDef {
  word: string;
  reading: string;
  meaning: string;
}

const n5Vocabulary: VocabDef[] = [
  { word: '私', reading: 'わたし', meaning: 'I; me' },
  { word: '貴方', reading: 'あなた', meaning: 'you' },
  { word: '友達', reading: 'ともだち', meaning: 'friend' },
  { word: '先生', reading: 'せんせい', meaning: 'teacher' },
  { word: '学生', reading: 'がくせい', meaning: 'student' },
  { word: '学校', reading: 'がっこう', meaning: 'school' },
  { word: '食べ物', reading: 'たべもの', meaning: 'food' },
  { word: '飲み物', reading: 'のみもの', meaning: 'drink; beverage' },
  { word: '家', reading: 'いえ', meaning: 'house; home' },
  { word: '水', reading: 'みず', meaning: 'water' },
  { word: 'お金', reading: 'おかね', meaning: 'money' },
  { word: '時間', reading: 'じかん', meaning: 'time' },
  { word: '明日', reading: 'あした', meaning: 'tomorrow' },
  { word: '今日', reading: 'きょう', meaning: 'today' },
  { word: '昨日', reading: 'きのう', meaning: 'yesterday' },
];

const n4Vocabulary: VocabDef[] = [
  { word: '約束', reading: 'やくそく', meaning: 'promise; appointment' },
  { word: '経験', reading: 'けいけん', meaning: 'experience' },
  { word: '準備', reading: 'じゅんび', meaning: 'preparation' },
  { word: '都合', reading: 'つごう', meaning: 'convenience; circumstances' },
  { word: '場合', reading: 'ばあい', meaning: 'case; situation' },
  { word: '発表', reading: 'はっぴょう', meaning: 'presentation; announcement' },
  { word: '連絡', reading: 'れんらく', meaning: 'contact; communication' },
  { word: '返事', reading: 'へんじ', meaning: 'reply; response' },
  { word: '迷惑', reading: 'めいわく', meaning: 'trouble; annoyance' },
  { word: '説明', reading: 'せつめい', meaning: 'explanation' },
  { word: '練習', reading: 'れんしゅう', meaning: 'practice' },
  { word: '試験', reading: 'しけん', meaning: 'exam; test' },
  { word: '留守', reading: 'るす', meaning: 'absence; being away from home' },
  { word: '事故', reading: 'じこ', meaning: 'accident' },
  { word: '感情', reading: 'かんじょう', meaning: 'emotion; feeling' },
];

const n3Vocabulary: VocabDef[] = [
  { word: '影響', reading: 'えいきょう', meaning: 'influence; effect' },
  { word: '現実', reading: 'げんじつ', meaning: 'reality' },
  { word: '自由', reading: 'じゆう', meaning: 'freedom; liberty' },
  { word: '作品', reading: 'さくひん', meaning: 'work of art; creation' },
  { word: '目的', reading: 'もくてき', meaning: 'purpose; goal' },
  { word: '結果', reading: 'けっか', meaning: 'result; outcome' },
  { word: '努力', reading: 'どりょく', meaning: 'effort; endeavor' },
  { word: '成功', reading: 'せいこう', meaning: 'success' },
  { word: '失敗', reading: 'しっぱい', meaning: 'failure' },
  { word: '経済', reading: 'けいざい', meaning: 'economy' },
  { word: '文化', reading: 'ぶんか', meaning: 'culture' },
  { word: '社会', reading: 'しゃかい', meaning: 'society' },
  { word: '自然', reading: 'しぜん', meaning: 'nature' },
  { word: '環境', reading: 'かんきょう', meaning: 'environment' },
  { word: '伝統', reading: 'でんとう', meaning: 'tradition' },
];

const n2Vocabulary: VocabDef[] = [
  { word: '投資', reading: 'とうし', meaning: 'investment' },
  { word: '財産', reading: 'ざいさん', meaning: 'property; assets' },
  { word: '責任', reading: 'せきにん', meaning: 'responsibility' },
  { word: '企業', reading: 'きぎょう', meaning: 'enterprise; company' },
  { word: '競争', reading: 'きょうそう', meaning: 'competition' },
  { word: '技術', reading: 'ぎじゅつ', meaning: 'technology; technique' },
  { word: '資源', reading: 'しげん', meaning: 'resources' },
  { word: '市場', reading: 'しじょう', meaning: 'market' },
  { word: '消費', reading: 'しょうひ', meaning: 'consumption' },
  { word: '景気', reading: 'けいき', meaning: 'business conditions' },
  { word: '政策', reading: 'せいさく', meaning: 'policy' },
  { word: '制度', reading: 'せいど', meaning: 'system; institution' },
  { word: '方針', reading: 'ほうしん', meaning: 'policy direction; guiding principle' },
  { word: '傾向', reading: 'けいこう', meaning: 'tendency; trend' },
  { word: '経営', reading: 'けいえい', meaning: 'management; administration' },
];

const n1Vocabulary: VocabDef[] = [
  { word: '概念', reading: 'がいねん', meaning: 'concept' },
  { word: '規範', reading: 'きはん', meaning: 'norm; standard' },
  { word: '根幹', reading: 'こんかん', meaning: 'foundation; basis' },
  { word: '踏襲', reading: 'とうしゅう', meaning: 'following precedent' },
  { word: '醸成', reading: 'じょうせい', meaning: 'brewing; fostering' },
  { word: '帰趨', reading: 'きすう', meaning: 'outcome; trend' },
  { word: '顕現', reading: 'けんげん', meaning: 'manifestation' },
  { word: '端緒', reading: 'たんちょ', meaning: 'clue; beginning' },
  { word: '慫恿', reading: 'しょうよう', meaning: 'instigation; urging' },
  { word: '慎重', reading: 'しんちょう', meaning: 'cautious; careful' },
  { word: '妥協', reading: 'だきょう', meaning: 'compromise' },
  { word: '摩擦', reading: 'まさつ', meaning: 'friction; conflict' },
  { word: '克服', reading: 'こくふく', meaning: 'overcoming; conquering' },
  { word: '洞察', reading: 'どうさつ', meaning: 'insight; discernment' },
  { word: '維持', reading: 'いじ', meaning: 'maintenance; preservation' },
];

const vocabularyByLevel: Record<JLPTLevel, VocabDef[]> = {
  N5: n5Vocabulary,
  N4: n4Vocabulary,
  N3: n3Vocabulary,
  N2: n2Vocabulary,
  N1: n1Vocabulary,
};

export function createInitialVocabulary(level?: JLPTLevel): VocabularyItem[] {
  const today = todayISO();
  const result: VocabularyItem[] = [];
  const levels: JLPTLevel[] = level ? [level] : ['N5', 'N4', 'N3', 'N2', 'N1'];
  levels.forEach(lvl => {
    vocabularyByLevel[lvl].forEach(v => {
      result.push({
        id: generateId(),
        word: v.word,
        reading: v.reading,
        meaning: v.meaning,
        level: lvl,
        status: 'unlearned',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: today,
        addedDate: today,
      });
    });
  });
  return result;
}

export { n5Vocabulary, n4Vocabulary, n3Vocabulary, n2Vocabulary, n1Vocabulary, vocabularyByLevel };
export type { VocabDef };
