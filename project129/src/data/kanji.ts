import { KanjiProgress, JLPTLevel } from '@/types';
import { generateId, todayISO } from '@/utils/helpers';

interface KanjiDef {
  kanji: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
}

const n5Kanji: KanjiDef[] = [
  { kanji: '一', meaning: 'one', onyomi: 'イチ、イツ', kunyomi: 'ひと' },
  { kanji: '二', meaning: 'two', onyomi: 'ニ', kunyomi: 'ふた' },
  { kanji: '三', meaning: 'three', onyomi: 'サン', kunyomi: 'み' },
  { kanji: '四', meaning: 'four', onyomi: 'シ', kunyomi: 'よん、よ' },
  { kanji: '五', meaning: 'five', onyomi: 'ゴ', kunyomi: 'いつ' },
  { kanji: '六', meaning: 'six', onyomi: 'ロク', kunyomi: 'む' },
  { kanji: '七', meaning: 'seven', onyomi: 'シチ', kunyomi: 'なな' },
  { kanji: '八', meaning: 'eight', onyomi: 'ハチ', kunyomi: 'や' },
  { kanji: '九', meaning: 'nine', onyomi: 'キュウ、ク', kunyomi: 'ここの' },
  { kanji: '十', meaning: 'ten', onyomi: 'ジュウ', kunyomi: 'とお' },
  { kanji: '百', meaning: 'hundred', onyomi: 'ヒャク', kunyomi: '' },
  { kanji: '千', meaning: 'thousand', onyomi: 'セン', kunyomi: 'ち' },
  { kanji: '万', meaning: 'ten thousand', onyomi: 'マン、バン', kunyomi: '' },
  { kanji: '日', meaning: 'day; sun', onyomi: 'ニチ、ジツ', kunyomi: 'ひ、か' },
  { kanji: '月', meaning: 'month; moon', onyomi: 'ゲツ、ガツ', kunyomi: 'つき' },
  { kanji: '火', meaning: 'fire', onyomi: 'カ', kunyomi: 'ひ' },
  { kanji: '水', meaning: 'water', onyomi: 'スイ', kunyomi: 'みず' },
  { kanji: '木', meaning: 'tree; wood', onyomi: 'モク、ボク', kunyomi: 'き' },
  { kanji: '金', meaning: 'gold; money', onyomi: 'キン、コン', kunyomi: 'かね' },
  { kanji: '土', meaning: 'earth; soil', onyomi: 'ド、ト', kunyomi: 'つち' },
  { kanji: '上', meaning: 'up; above', onyomi: 'ジョウ', kunyomi: 'うえ、あ' },
  { kanji: '下', meaning: 'down; below', onyomi: 'カ、ゲ', kunyomi: 'した、さ' },
  { kanji: '左', meaning: 'left', onyomi: 'サ', kunyomi: 'ひだり' },
  { kanji: '右', meaning: 'right', onyomi: 'ウ、ユウ', kunyomi: 'みぎ' },
  { kanji: '大', meaning: 'big; large', onyomi: 'ダイ、タイ', kunyomi: 'おお' },
  { kanji: '中', meaning: 'middle; inside', onyomi: 'チュウ', kunyomi: 'なか' },
  { kanji: '小', meaning: 'small', onyomi: 'ショウ', kunyomi: 'ちい、こ' },
  { kanji: '山', meaning: 'mountain', onyomi: 'サン、ザン', kunyomi: 'やま' },
  { kanji: '川', meaning: 'river', onyomi: 'セン', kunyomi: 'かわ' },
  { kanji: '田', meaning: 'rice field', onyomi: 'デン', kunyomi: 'た' },
  { kanji: '天', meaning: 'sky; heaven', onyomi: 'テン', kunyomi: 'あま' },
  { kanji: '気', meaning: 'spirit; air', onyomi: 'キ、ケ', kunyomi: '' },
  { kanji: '人', meaning: 'person', onyomi: 'ジン、ニン', kunyomi: 'ひと' },
  { kanji: '子', meaning: 'child', onyomi: 'シ、ス', kunyomi: 'こ' },
  { kanji: '女', meaning: 'woman', onyomi: 'ジョ、ニョ', kunyomi: 'おんな' },
  { kanji: '男', meaning: 'man', onyomi: 'ダン、ナン', kunyomi: 'おとこ' },
  { kanji: '学', meaning: 'study; learning', onyomi: 'ガク', kunyomi: 'まな' },
  { kanji: '先', meaning: 'before; ahead', onyomi: 'セン', kunyomi: 'さき' },
  { kanji: '生', meaning: 'life; birth', onyomi: 'セイ、ショウ', kunyomi: 'い、なま' },
  { kanji: '年', meaning: 'year', onyomi: 'ネン', kunyomi: 'とし' },
  { kanji: '時', meaning: 'time; hour', onyomi: 'ジ', kunyomi: 'とき' },
  { kanji: '分', meaning: 'minute; part', onyomi: 'ブン、フン、ブ', kunyomi: 'わ' },
  { kanji: '前', meaning: 'front; before', onyomi: 'ゼン', kunyomi: 'まえ' },
  { kanji: '後', meaning: 'after; behind', onyomi: 'ゴ、コウ', kunyomi: 'あと、うし' },
];

const n4Kanji: KanjiDef[] = [
  { kanji: '話', meaning: 'tale; speech', onyomi: 'ワ', kunyomi: 'はな' },
  { kanji: '読', meaning: 'read', onyomi: 'ドク、トク、トウ', kunyomi: 'よ' },
  { kanji: '書', meaning: 'write', onyomi: 'ショ', kunyomi: 'か' },
  { kanji: '考', meaning: 'think; consider', onyomi: 'コウ', kunyomi: 'かんが' },
  { kanji: '電', meaning: 'electricity', onyomi: 'デン', kunyomi: '' },
  { kanji: '車', meaning: 'car; vehicle', onyomi: 'シャ', kunyomi: 'くるま' },
  { kanji: '駅', meaning: 'station', onyomi: 'エキ', kunyomi: '' },
  { kanji: '店', meaning: 'shop; store', onyomi: 'テン', kunyomi: 'みせ' },
  { kanji: '食', meaning: 'eat; food', onyomi: 'ショク、ジキ', kunyomi: 'た、く' },
  { kanji: '飲', meaning: 'drink', onyomi: 'イン', kunyomi: 'の' },
  { kanji: '病', meaning: 'illness', onyomi: 'ビョウ', kunyomi: 'や' },
  { kanji: '院', meaning: 'institution', onyomi: 'イン', kunyomi: '' },
  { kanji: '薬', meaning: 'medicine', onyomi: 'ヤク', kunyomi: 'くすり' },
  { kanji: '文', meaning: 'writing; literature', onyomi: 'ブン、モン', kunyomi: 'ふみ' },
  { kanji: '字', meaning: 'character; letter', onyomi: 'ジ', kunyomi: 'あざ' },
  { kanji: '語', meaning: 'language; word', onyomi: 'ゴ', kunyomi: 'かた' },
  { kanji: '目', meaning: 'eye', onyomi: 'モク、ボク', kunyomi: 'め' },
  { kanji: '耳', meaning: 'ear', onyomi: 'ジ', kunyomi: 'みみ' },
  { kanji: '口', meaning: 'mouth', onyomi: 'コウ、ク', kunyomi: 'くち' },
  { kanji: '手', meaning: 'hand', onyomi: 'シュ', kunyomi: 'て' },
  { kanji: '足', meaning: 'foot; leg', onyomi: 'ソク', kunyomi: 'あし' },
  { kanji: '首', meaning: 'neck', onyomi: 'シュ', kunyomi: 'くび' },
  { kanji: '体', meaning: 'body', onyomi: 'タイ', kunyomi: 'からだ' },
  { kanji: '力', meaning: 'power; strength', onyomi: 'リキ、リョク', kunyomi: 'ちから' },
  { kanji: '仕', meaning: 'serve; work', onyomi: 'シ', kunyomi: 'つか' },
  { kanji: '事', meaning: 'thing; matter', onyomi: 'ジ', kunyomi: 'こと' },
  { kanji: '東', meaning: 'east', onyomi: 'トウ', kunyomi: 'ひがし' },
  { kanji: '西', meaning: 'west', onyomi: 'セイ、サイ', kunyomi: 'にし' },
  { kanji: '南', meaning: 'south', onyomi: 'ナン', kunyomi: 'みなみ' },
  { kanji: '北', meaning: 'north', onyomi: 'ホク', kunyomi: 'きた' },
];

const n3Kanji: KanjiDef[] = [
  { kanji: '意', meaning: 'intent; mind', onyomi: 'イ', kunyomi: '' },
  { kanji: '味', meaning: 'taste; flavor', onyomi: 'ミ', kunyomi: 'あじ' },
  { kanji: '問', meaning: 'question', onyomi: 'モン', kunyomi: 'と' },
  { kanji: '題', meaning: 'topic; problem', onyomi: 'ダイ', kunyomi: '' },
  { kanji: '反', meaning: 'opposite; anti', onyomi: 'ハン', kunyomi: 'そ' },
  { kanji: '対', meaning: 'opposite; pair', onyomi: 'タイ', kunyomi: '' },
  { kanji: '現', meaning: 'appear; present', onyomi: 'ゲン', kunyomi: 'あらわ' },
  { kanji: '代', meaning: 'generation; substitute', onyomi: 'ダイ、タイ', kunyomi: 'か' },
  { kanji: '化', meaning: 'change; transform', onyomi: 'カ、ケ', kunyomi: 'ば' },
  { kanji: '研', meaning: 'sharpen; research', onyomi: 'ケン', kunyomi: 'と' },
  { kanji: '究', meaning: 'research; investigate', onyomi: 'キュウ', kunyomi: '' },
  { kanji: '経', meaning: 'pass through; sutra', onyomi: 'ケイ、キョウ', kunyomi: 'へ' },
  { kanji: '済', meaning: 'settle; relieve', onyomi: 'サイ', kunyomi: '' },
  { kanji: '政', meaning: 'politics; government', onyomi: 'セイ', kunyomi: 'まつりごと' },
  { kanji: '治', meaning: 'govern; cure', onyomi: 'チ', kunyomi: 'なお、おさ' },
  { kanji: '社', meaning: 'company; shrine', onyomi: 'シャ', kunyomi: '' },
  { kanji: '会', meaning: 'meeting; society', onyomi: 'カイ', kunyomi: 'あ' },
  { kanji: '国', meaning: 'country', onyomi: 'コク', kunyomi: 'くに' },
  { kanji: '際', meaning: 'occasion; border', onyomi: 'サイ', kunyomi: 'きわ' },
  { kanji: '表', meaning: 'surface; express', onyomi: 'ヒョウ', kunyomi: 'あらわ、おもて' },
  { kanji: '感', meaning: 'feeling; sensation', onyomi: 'カン', kunyomi: '' },
  { kanji: '覚', meaning: 'memorize; awaken', onyomi: 'カク', kunyomi: 'おぼ、さ' },
  { kanji: '結', meaning: 'tie; bind', onyomi: 'ケツ', kunyomi: 'むす' },
  { kanji: '果', meaning: 'fruit; result', onyomi: 'カ', kunyomi: 'は' },
  { kanji: '原', meaning: 'origin; field', onyomi: 'ゲン', kunyomi: 'はら' },
  { kanji: '因', meaning: 'cause; reason', onyomi: 'イン', kunyomi: 'よ' },
];

const n2Kanji: KanjiDef[] = [
  { kanji: '投', meaning: 'throw', onyomi: 'トウ', kunyomi: 'な' },
  { kanji: '資', meaning: 'resources; capital', onyomi: 'シ', kunyomi: '' },
  { kanji: '財', meaning: 'wealth; property', onyomi: 'ザイ、サイ', kunyomi: '' },
  { kanji: '産', meaning: 'production; property', onyomi: 'サン', kunyomi: 'う' },
  { kanji: '効', meaning: 'effect; efficiency', onyomi: 'コウ', kunyomi: 'き' },
  { kanji: '責', meaning: 'blame; responsibility', onyomi: 'セキ', kunyomi: '' },
  { kanji: '任', meaning: 'duty; appoint', onyomi: 'ニン', kunyomi: 'まか' },
  { kanji: '方', meaning: 'direction; method', onyomi: 'ホウ', kunyomi: 'かた' },
  { kanji: '針', meaning: 'needle', onyomi: 'シン', kunyomi: 'はり' },
  { kanji: '制', meaning: 'system; control', onyomi: 'セイ', kunyomi: '' },
  { kanji: '度', meaning: 'degree; limit', onyomi: 'ド、ト', kunyomi: '' },
  { kanji: '企', meaning: 'enterprise; plan', onyomi: 'キ', kunyomi: '' },
  { kanji: '業', meaning: 'business; industry', onyomi: 'ギョウ', kunyomi: '' },
  { kanji: '競', meaning: 'compete', onyomi: 'キョウ', kunyomi: 'きそ' },
  { kanji: '争', meaning: 'conflict; compete', onyomi: 'ソウ', kunyomi: 'あらそ' },
  { kanji: '環', meaning: 'ring; environment', onyomi: 'カン', kunyomi: '' },
  { kanji: '境', meaning: 'boundary; condition', onyomi: 'キョウ', kunyomi: 'さかい' },
  { kanji: '技', meaning: 'skill; technique', onyomi: 'ギ', kunyomi: 'わざ' },
  { kanji: '術', meaning: 'art; technique', onyomi: 'ジュツ', kunyomi: '' },
  { kanji: '源', meaning: 'source; origin', onyomi: 'ゲン', kunyomi: 'みなもと' },
  { kanji: '市', meaning: 'city; market', onyomi: 'シ', kunyomi: 'いち' },
  { kanji: '場', meaning: 'place; field', onyomi: 'ジョウ', kunyomi: 'ば' },
  { kanji: '消', meaning: 'extinguish; consume', onyomi: 'ショウ', kunyomi: 'き' },
  { kanji: '費', meaning: 'expense; consume', onyomi: 'ヒ', kunyomi: '' },
];

const n1Kanji: KanjiDef[] = [
  { kanji: '概', meaning: 'approximate; outline', onyomi: 'ガイ', kunyomi: '' },
  { kanji: '念', meaning: 'thought; wish', onyomi: 'ネン', kunyomi: '' },
  { kanji: '規', meaning: 'rule; standard', onyomi: 'キ', kunyomi: '' },
  { kanji: '範', meaning: 'pattern; range', onyomi: 'ハン', kunyomi: '' },
  { kanji: '根', meaning: 'root', onyomi: 'コン', kunyomi: 'ね' },
  { kanji: '幹', meaning: 'trunk; main', onyomi: 'カン', kunyomi: 'みき' },
  { kanji: '踏', meaning: 'step; tread', onyomi: 'トウ', kunyomi: 'ふ' },
  { kanji: '襲', meaning: 'attack; inherit', onyomi: 'シュウ', kunyomi: '' },
  { kanji: '醸', meaning: 'brew', onyomi: 'ジョウ', kunyomi: 'かも' },
  { kanji: '成', meaning: 'become; achieve', onyomi: 'セイ、ジョウ', kunyomi: 'な' },
  { kanji: '帰', meaning: 'return', onyomi: 'キ', kunyomi: 'かえ' },
  { kanji: '趨', meaning: 'tendency; direction', onyomi: 'スウ', kunyomi: '' },
  { kanji: '顕', meaning: 'appear; manifest', onyomi: 'ケン', kunyomi: 'あきら' },
  { kanji: '端', meaning: 'edge; beginning', onyomi: 'タン', kunyomi: 'はし' },
  { kanji: '緒', meaning: 'thread; beginning', onyomi: 'ショ', kunyomi: 'お' },
  { kanji: '慫', meaning: 'instigate', onyomi: 'ショウ', kunyomi: '' },
  { kanji: '恿', meaning: 'urge; instigate', onyomi: 'ヨウ', kunyomi: '' },
];

const kanjiByLevel: Record<JLPTLevel, KanjiDef[]> = {
  N5: n5Kanji,
  N4: n4Kanji,
  N3: n3Kanji,
  N2: n2Kanji,
  N1: n1Kanji,
};

export function createInitialKanjiProgress(level?: JLPTLevel): KanjiProgress[] {
  const result: KanjiProgress[] = [];
  const levels: JLPTLevel[] = level ? [level] : ['N5', 'N4', 'N3', 'N2', 'N1'];
  levels.forEach(lvl => {
    kanjiByLevel[lvl].forEach(k => {
      result.push({
        id: generateId(),
        kanji: k.kanji,
        level: lvl,
        status: 'unlearned',
        meaning: k.meaning,
        onyomi: k.onyomi,
        kunyomi: k.kunyomi,
        lastStudied: '',
      });
    });
  });
  return result;
}

export { n5Kanji, n4Kanji, n3Kanji, n2Kanji, n1Kanji, kanjiByLevel };
export type { KanjiDef };
