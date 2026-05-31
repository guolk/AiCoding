
import type { 
  WorldSetting, 
  Character, 
  Faction, 
  FactionRelation,
  RuleCheckResult,
  MagicSystem,
  TechSystem
} from '@/types';

export const checkMagicRulesConsistency = (
  magicSystem: MagicSystem | null
): RuleCheckResult[] => {
  const results: RuleCheckResult[] = [];
  
  if (!magicSystem) {
    return results;
  }

  if (magicSystem.rules.length === 0) {
    results.push({
      type: 'warning',
      message: '魔法系统缺少规则定义',
      details: '建议添加具体的魔法规则，以便更好地定义魔法使用的边界。'
    });
  }

  if (magicSystem.limitations.length === 0) {
    results.push({
      type: 'warning',
      message: '魔法系统缺少限制条件',
      details: '为魔法系统添加限制条件可以增强设定的真实性和戏剧性张力。'
    });
  }

  const ruleText = magicSystem.rules.join(' ').toLowerCase();
  const limitationText = magicSystem.limitations.join(' ').toLowerCase();

  if (ruleText.includes('无限制') && !limitationText.includes('无限制')) {
    results.push({
      type: 'error',
      message: '发现矛盾的设定',
      details: '规则中提到"无限制"，但限制条件中没有相应的说明。请确保一致性。'
    });
  }

  return results;
};

export const checkTechConsistency = (
  techSystem: TechSystem | null,
  characters: Character[]
): RuleCheckResult[] => {
  const results: RuleCheckResult[] = [];
  
  if (!techSystem) {
    return results;
  }

  if (!techSystem.level) {
    results.push({
      type: 'info',
      message: '科技水平未定义',
      details: '建议明确科技水平（如：中世纪、工业革命、太空时代等）。'
    });
  }

  if (techSystem.keyInventions.length === 0) {
    results.push({
      type: 'info',
      message: '未添加关键发明',
      details: '添加关键发明可以帮助明确世界的技术特色。'
    });
  }

  return results;
};

export const checkFactionRelations = (
  factions: Faction[],
  relations: FactionRelation[]
): RuleCheckResult[] => {
  const results: RuleCheckResult[] = [];
  const factionIds = new Set(factions.map(f => f.id));

  for (const relation of relations) {
    if (!factionIds.has(relation.factionA)) {
      results.push({
        type: 'error',
        message: `阵营关系引用了不存在的阵营`,
        details: `关系中提到的阵营A (${relation.factionA}) 不存在。`
      });
    }
    if (!factionIds.has(relation.factionB)) {
      results.push({
        type: 'error',
        message: `阵营关系引用了不存在的阵营`,
        details: `关系中提到的阵营B (${relation.factionB}) 不存在。`
      });
    }
    if (relation.factionA === relation.factionB) {
      results.push({
        type: 'warning',
        message: `阵营自引用关系`,
        details: `发现一个阵营与自身建立关系。这可能是数据错误。`
      });
    }
  }

  const checkedPairs = new Set<string>();
  for (const relation of relations) {
    const pairKey = [relation.factionA, relation.factionB].sort().join('-');
    if (checkedPairs.has(pairKey)) {
      results.push({
        type: 'warning',
        message: `发现重复的阵营关系`,
        details: `阵营 ${relation.factionA} 和 ${relation.factionB} 之间有多个关系定义。`
      });
    }
    checkedPairs.add(pairKey);
  }

  return results;
};

export const checkWorldConsistency = (
  worldSetting: WorldSetting | null,
  characters: Character[],
  factions: Faction[],
  factionRelations: FactionRelation[]
): RuleCheckResult[] => {
  const results: RuleCheckResult[] = [];

  if (!worldSetting) {
    results.push({
      type: 'info',
      message: '尚未创建世界基础设定',
      details: '建议先创建世界基础设定，包括宇宙起源、物理规则等核心设定。'
    });
    return results;
  }

  if (!worldSetting.cosmicOrigin) {
    results.push({
      type: 'info',
      message: '宇宙起源未定义',
      details: '定义宇宙起源可以为世界观提供深度和连贯性。'
    });
  }

  if (!worldSetting.physicsRules) {
    results.push({
      type: 'info',
      message: '物理规则未定义',
      details: '明确物理规则可以帮助维持世界观的一致性。'
    });
  }

  results.push(...checkMagicRulesConsistency(worldSetting.magicSystem));
  results.push(...checkTechConsistency(worldSetting.techSystem, characters));
  results.push(...checkFactionRelations(factions, factionRelations));

  if (factions.length > 0 && characters.length > 0) {
    const factionIds = new Set(factions.map(f => f.id));
    const orphanedCharacters = characters.filter(
      c => c.factionId && !factionIds.has(c.factionId)
    );
    
    if (orphanedCharacters.length > 0) {
      results.push({
        type: 'warning',
        message: `${orphanedCharacters.length} 个角色的阵营引用无效`,
        details: `以下角色的阵营ID不存在：${orphanedCharacters.map(c => c.name).join(', ')}`
      });
    }
  }

  return results;
};
