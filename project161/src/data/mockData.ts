import type { Tree, CulturalRecord, MediaAsset, HealthAssessment, ProtectionMeasure, SurveyGrid, AuditRecord } from '@/types';

export const mockTrees: Tree[] = [
  {
    id: 't001', species: '银杏', scientificName: 'Ginkgo biloba', dbh: 128, height: 22.5,
    crownWidth: 16.8, estimatedAge: 850, gpsLatitude: '30.2592', gpsLongitude: '120.1551',
    location: '浙江省杭州市西湖区灵隐路', ownership: '杭州市园林文物局',
    healthStatus: 'good', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20ginkgo%20tree%20with%20golden%20leaves%20in%20autumn%20traditional%20Chinese%20temple%20background%20misty%20morning&image_size=landscape_4_3',
    createdAt: '2024-03-15', updatedAt: '2025-01-10',
  },
  {
    id: 't002', species: '樟树', scientificName: 'Cinnamomum camphora', dbh: 186, height: 25.3,
    crownWidth: 22.4, estimatedAge: 1200, gpsLatitude: '28.2282', gpsLongitude: '112.9388',
    location: '湖南省长沙市岳麓山', ownership: '岳麓山风景名胜区管委会',
    healthStatus: 'excellent', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=magnificent%20ancient%20camphor%20tree%20massive%20trunk%20spreading%20canopy%20Chinese%20garden%20pathway&image_size=landscape_4_3',
    createdAt: '2024-03-18', updatedAt: '2025-02-20',
  },
  {
    id: 't003', species: '侧柏', scientificName: 'Platycladus orientalis', dbh: 95, height: 18.6,
    crownWidth: 12.3, estimatedAge: 620, gpsLatitude: '34.2270', gpsLongitude: '108.8894',
    location: '陕西省西安市碑林区', ownership: '西安市文物局',
    healthStatus: 'fair', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20arborvitae%20tree%20tall%20slender%20shape%20stone%20temple%20courtyard%20historic&image_size=landscape_4_3',
    createdAt: '2024-04-02', updatedAt: '2025-01-25',
  },
  {
    id: 't004', species: '榕树', scientificName: 'Ficus microcarpa', dbh: 245, height: 28.0,
    crownWidth: 35.6, estimatedAge: 980, gpsLatitude: '26.0745', gpsLongitude: '119.2965',
    location: '福建省福州市鼓楼区', ownership: '福州市绿化管理处',
    healthStatus: 'good', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20banyan%20tree%20with%20aerial%20roots%20massive%20spreading%20canopy%20tropical%20Chinese%20village&image_size=landscape_4_3',
    createdAt: '2024-04-10', updatedAt: '2025-03-05',
  },
  {
    id: 't005', species: '红豆杉', scientificName: 'Taxus wallichiana', dbh: 72, height: 15.2,
    crownWidth: 9.8, estimatedAge: 530, gpsLatitude: '27.6104', gpsLongitude: '111.4688',
    location: '湖南省邵阳市城步县', ownership: '城步苗族自治县林业局',
    healthStatus: 'poor', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20yew%20tree%20red%20berries%20misty%20mountain%20forest%20Chinese%20countryside&image_size=landscape_4_3',
    createdAt: '2024-05-08', updatedAt: '2025-02-15',
  },
  {
    id: 't006', species: '桂花', scientificName: 'Osmanthus fragrans', dbh: 68, height: 12.8,
    crownWidth: 11.5, estimatedAge: 420, gpsLatitude: '30.8742', gpsLongitude: '120.0955',
    location: '浙江省嘉兴市南湖区', ownership: '南湖区住建局',
    healthStatus: 'good', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20osmanthus%20tree%20with%20tiny%20golden%20flowers%20traditional%20Chinese%20courtyard%20autumn&image_size=landscape_4_3',
    createdAt: '2024-05-20', updatedAt: '2025-01-30',
  },
  {
    id: 't007', species: '松树', scientificName: 'Pinus massoniana', dbh: 110, height: 20.4,
    crownWidth: 14.2, estimatedAge: 760, gpsLatitude: '30.1314', gpsLongitude: '118.1673',
    location: '安徽省黄山市黄山风景区', ownership: '黄山风景区管委会',
    healthStatus: 'fair', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20pine%20tree%20clinging%20to%20rocky%20cliff%20Huangshan%20mountain%20misty%20dawn&image_size=landscape_4_3',
    createdAt: '2024-06-12', updatedAt: '2025-03-18',
  },
  {
    id: 't008', species: '槐树', scientificName: 'Sophora japonica', dbh: 142, height: 19.5,
    crownWidth: 18.7, estimatedAge: 900, gpsLatitude: '39.9042', gpsLongitude: '116.4074',
    location: '北京市东城区景山公园', ownership: '北京市公园管理中心',
    healthStatus: 'critical', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Scholar%20tree%20with%20hollow%20trunk%20support%20poles%20Beijing%20imperial%20garden&image_size=landscape_4_3',
    createdAt: '2024-06-25', updatedAt: '2025-02-28',
  },
  {
    id: 't009', species: '银杏', scientificName: 'Ginkgo biloba', dbh: 156, height: 26.8,
    crownWidth: 19.2, estimatedAge: 1100, gpsLatitude: '31.3011', gpsLongitude: '120.5853',
    location: '江苏省苏州市姑苏区', ownership: '苏州市园林和绿化管理局',
    healthStatus: 'excellent', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=giant%20ancient%20ginkgo%20tree%20golden%20autumn%20leaves%20Suzhou%20classical%20garden%20pond&image_size=landscape_4_3',
    createdAt: '2024-07-10', updatedAt: '2025-03-22',
  },
  {
    id: 't010', species: '楠木', scientificName: 'Phoebe zhennan', dbh: 88, height: 16.5,
    crownWidth: 10.3, estimatedAge: 480, gpsLatitude: '29.5671', gpsLongitude: '106.5528',
    location: '重庆市南岸区', ownership: '重庆市南岸区林业局',
    healthStatus: 'good', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Nanmu%20tree%20tall%20straight%20trunk%20lush%20green%20foliage%20Sichuan%20mountain%20forest&image_size=landscape_4_3',
    createdAt: '2024-07-22', updatedAt: '2025-01-15',
  },
  {
    id: 't011', species: '樟树', scientificName: 'Cinnamomum camphora', dbh: 164, height: 23.1,
    crownWidth: 20.8, estimatedAge: 950, gpsLatitude: '28.6820', gpsLongitude: '115.8579',
    location: '江西省南昌市东湖区', ownership: '南昌市园林绿化局',
    healthStatus: 'good', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20camphor%20tree%20village%20square%20stone%20bench%20beneath%20Jiangxi%20countryside&image_size=landscape_4_3',
    createdAt: '2024-08-05', updatedAt: '2025-02-10',
  },
  {
    id: 't012', species: '榕树', scientificName: 'Ficus microcarpa', dbh: 210, height: 26.5,
    crownWidth: 32.1, estimatedAge: 870, gpsLatitude: '23.1291', gpsLongitude: '113.2644',
    location: '广东省广州市越秀区', ownership: '广州市林业和园林局',
    healthStatus: 'fair', coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=massive%20banyan%20tree%20with%20hanging%20aerial%20roots%20Guangzhou%20park%20afternoon%20light&image_size=landscape_4_3',
    createdAt: '2024-08-18', updatedAt: '2025-03-12',
  },
];

export const mockCulturalRecords: CulturalRecord[] = [
  { id: 'cr001', treeId: 't001', type: 'historical', title: '灵隐古银杏', content: '据《西湖志》记载，此银杏植于唐代贞观年间，距今已逾千年。相传灵隐寺开山祖师慧理和尚手植，历经唐宋元明清五朝更替，依然枝繁叶茂。每年深秋，满树金黄，成为灵隐路最负盛名的秋景。', period: '唐代贞观年间（约627年）' },
  { id: 'cr002', treeId: 't001', type: 'legend', title: '白蛇传与银杏树', content: '民间传说中，白娘子与许仙的爱情故事中，此银杏树曾为白娘子遮风避雨。每逢中秋月圆之夜，树影婆娑中似有白蛇游动，当地百姓视为灵树，常来祈福。', period: '宋代民间传说' },
  { id: 'cr003', treeId: 't002', type: 'celebrity', title: '朱熹与岳麓古樟', content: '南宋理学家朱熹曾在此樟树下讲学，与张栻论道，史称"朱张会讲"。古樟见证了湖湘学派的开端，被后人称为"会讲樟"。朱熹曾题诗赞其苍劲。', period: '南宋乾道三年（1167年）' },
  { id: 'cr004', treeId: 't002', type: 'historical', title: '抗战时期的守护', content: '抗日战争期间，长沙会战中岳麓山遭日军炮火轰击，古樟身中数弹却依然挺立。弹痕至今可见，成为民族不屈精神的象征。', period: '抗日战争时期（1939-1944年）' },
  { id: 'cr005', treeId: 't008', type: 'historical', title: '景山古槐与崇祯帝', content: '相传明思宗崇祯帝在景山自缢前，曾在此槐树下长叹。后此树被视为历史见证，历代均有保护。现存槐树为原树萌生的后代，仍有数百年树龄。', period: '明末（1644年）' },
  { id: 'cr006', treeId: 't009', type: 'celebrity', title: '文徵明手植银杏', content: '据传此银杏为明代著名画家文徵明在苏州建造园林时手植。文徵明常于树下作画，留下了著名的《古银杏图》。至今每至深秋，满地金叶如画。', period: '明代嘉靖年间' },
  { id: 'cr007', treeId: 't004', type: 'legend', title: '榕树精的传说', content: '福州民间传说，千年古榕中住着榕树精，守护一方百姓。每逢大旱，榕树精便显灵降雨，解救旱情。当地人在树下设有神龛，至今仍有居民前来祭拜。', period: '明代民间传说' },
  { id: 'cr008', treeId: 't007', type: 'celebrity', title: '迎客松的前身', content: '黄山古松中，此松与著名的迎客松同属一代，曾出现在徐霞客的游记中。徐霞客赞叹其"奇绝盘虬，天下无双"。', period: '明代万历年间' },
];

export const mockMediaAssets: MediaAsset[] = [
  { id: 'ma001', treeId: 't001', category: 'full', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=full%20view%20ancient%20ginkgo%20tree%20golden%20autumn%20leaves%20pathway%20beneath&image_size=landscape_4_3', description: '秋季全株金黄', uploadedAt: '2024-11-05' },
  { id: 'ma002', treeId: 't001', category: 'trunk', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close%20up%20ancient%20ginkgo%20tree%20bark%20texture%20deep%20fissures%20moss&image_size=landscape_4_3', description: '树干纹理特写', uploadedAt: '2024-11-05' },
  { id: 'ma003', treeId: 't001', category: 'leaf', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20ginkgo%20leaves%20close%20up%20fan%20shaped%20autumn%20sunlight&image_size=landscape_4_3', description: '银杏叶片特写', uploadedAt: '2024-11-05' },
  { id: 'ma004', treeId: 't001', category: 'fruit', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ginkgo%20biloba%20fruits%20on%20branch%20white%20nuts%20autumn&image_size=landscape_4_3', description: '银杏果实', uploadedAt: '2024-10-20' },
  { id: 'ma005', treeId: 't002', category: 'full', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=full%20view%20massive%20ancient%20camphor%20tree%20spreading%20canopy%20pathway&image_size=landscape_4_3', description: '樟树全株', uploadedAt: '2024-06-10' },
  { id: 'ma006', treeId: 't002', category: 'trunk', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20camphor%20tree%20trunk%20close%20up%20bark%20texture%20bullet%20scars&image_size=landscape_4_3', description: '弹痕树干', uploadedAt: '2024-06-10' },
  { id: 'ma007', treeId: 't008', category: 'full', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20Scholar%20tree%20with%20support%20poles%20hollow%20trunk%20Beijing%20garden&image_size=landscape_4_3', description: '古槐全株（含支撑架）', uploadedAt: '2024-07-15' },
  { id: 'ma008', treeId: 't008', category: 'trunk', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hollow%20tree%20trunk%20ancient%20tree%20rot%20cavity%20close%20up%20texture&image_size=landscape_4_3', description: '空洞树干', uploadedAt: '2024-07-15' },
];

export const mockHealthAssessments: HealthAssessment[] = [
  {
    id: 'ha001', treeId: 't001', treeSpecies: '银杏', assessmentDate: '2025-01-10',
    overallScore: 78, trunkDecay: 'mild', hollowStatus: 'none', breakStatus: 'none',
    pestDisease: 'mild', soilCompaction: 'mild', rootProtectionScore: 7, lightConditionScore: 8,
    soilQualityScore: 6, assessor: '张明华', notes: '树干基部有轻微腐烂迹象，叶片偶有虫蛀。整体生长状况良好，建议加强土壤改良。', createdAt: '2025-01-10',
  },
  {
    id: 'ha002', treeId: 't002', treeSpecies: '樟树', assessmentDate: '2025-02-20',
    overallScore: 92, trunkDecay: 'none', hollowStatus: 'none', breakStatus: 'none',
    pestDisease: 'none', soilCompaction: 'none', rootProtectionScore: 9, lightConditionScore: 9,
    soilQualityScore: 8, assessor: '李文婷', notes: '古樟生长旺盛，树冠完整。树干上历史弹痕已愈合成疤，不影响健康。', createdAt: '2025-02-20',
  },
  {
    id: 'ha003', treeId: 't005', treeSpecies: '红豆杉', assessmentDate: '2025-02-15',
    overallScore: 45, trunkDecay: 'moderate', hollowStatus: 'mild', breakStatus: 'mild',
    pestDisease: 'severe', soilCompaction: 'moderate', rootProtectionScore: 4, lightConditionScore: 5,
    soilQualityScore: 3, assessor: '王建国', notes: '红豆杉遭受严重病虫害侵袭，树干中空，需紧急救治。土壤严重板结，根系生长受限。', createdAt: '2025-02-15',
  },
  {
    id: 'ha004', treeId: 't008', treeSpecies: '槐树', assessmentDate: '2025-02-28',
    overallScore: 35, trunkDecay: 'severe', hollowStatus: 'severe', breakStatus: 'moderate',
    pestDisease: 'moderate', soilCompaction: 'severe', rootProtectionScore: 3, lightConditionScore: 4,
    soilQualityScore: 3, assessor: '赵志远', notes: '古槐树干严重腐朽中空，已架设支撑架。部分枝条折断风险高，需持续监测并考虑树冠修剪减负。', createdAt: '2025-02-28',
  },
  {
    id: 'ha005', treeId: 't003', treeSpecies: '侧柏', assessmentDate: '2025-01-25',
    overallScore: 62, trunkDecay: 'mild', hollowStatus: 'mild', breakStatus: 'none',
    pestDisease: 'mild', soilCompaction: 'moderate', rootProtectionScore: 5, lightConditionScore: 7,
    soilQualityScore: 5, assessor: '陈晓红', notes: '侧柏整体尚可，但土壤板结问题需要关注，根系保护空间不足。', createdAt: '2025-01-25',
  },
  {
    id: 'ha006', treeId: 't004', treeSpecies: '榕树', assessmentDate: '2025-03-05',
    overallScore: 82, trunkDecay: 'none', hollowStatus: 'none', breakStatus: 'none',
    pestDisease: 'mild', soilCompaction: 'mild', rootProtectionScore: 8, lightConditionScore: 9,
    soilQualityScore: 7, assessor: '刘大伟', notes: '古榕生长良好，气根发达。少量蚜虫危害，已建议喷施生物农药。', createdAt: '2025-03-05',
  },
];

export const mockProtectionMeasures: ProtectionMeasure[] = [
  { id: 'pm001', assessmentId: 'ha003', treeId: 't005', type: 'fertilization', description: '施用有机肥和微量元素，改善土壤养分状况', operationDate: '2025-03-01', operator: '王建国', effect: 'partial' },
  { id: 'pm002', assessmentId: 'ha003', treeId: 't005', type: 'other', description: '注射生物农药防治天牛虫害', operationDate: '2025-03-05', operator: '张明华', effect: 'effective' },
  { id: 'pm003', assessmentId: 'ha004', treeId: 't008', type: 'support', description: '增设三根钢索支撑架，加固主枝', operationDate: '2024-12-20', operator: '赵志远', effect: 'effective' },
  { id: 'pm004', assessmentId: 'ha004', treeId: 't008', type: 'filling', description: '对树干空洞进行消毒防腐处理并填补', operationDate: '2025-01-15', operator: '赵志远', effect: 'partial' },
  { id: 'pm005', assessmentId: 'ha005', treeId: 't003', type: 'fertilization', description: '翻土施肥，改善根际土壤通透性', operationDate: '2025-02-10', operator: '陈晓红', effect: 'effective' },
];

export const mockSurveyGrids: SurveyGrid[] = [
  { id: 'sg001', name: '西湖区-A01', centerLat: 30.25, centerLng: 120.15, assignee: '张明华', totalTrees: 15, surveyedTrees: 12, status: 'in_progress' },
  { id: 'sg002', name: '岳麓区-B03', centerLat: 28.23, centerLng: 112.94, assignee: '李文婷', totalTrees: 22, surveyedTrees: 22, status: 'completed' },
  { id: 'sg003', name: '碑林区-C02', centerLat: 34.23, centerLng: 108.89, assignee: '陈晓红', totalTrees: 8, surveyedTrees: 3, status: 'in_progress' },
  { id: 'sg004', name: '鼓楼区-D01', centerLat: 26.07, centerLng: 119.30, assignee: '刘大伟', totalTrees: 18, surveyedTrees: 0, status: 'pending' },
  { id: 'sg005', name: '城步县-E04', centerLat: 27.61, centerLng: 111.47, assignee: '王建国', totalTrees: 12, surveyedTrees: 12, status: 'completed' },
  { id: 'sg006', name: '东城区-F02', centerLat: 39.90, centerLng: 116.41, assignee: '赵志远', totalTrees: 25, surveyedTrees: 18, status: 'in_progress' },
  { id: 'sg007', name: '姑苏区-G01', centerLat: 31.30, centerLng: 120.59, assignee: '周雪梅', totalTrees: 10, surveyedTrees: 10, status: 'completed' },
  { id: 'sg008', name: '南岸区-H03', centerLat: 29.57, centerLng: 106.55, assignee: '孙立峰', totalTrees: 14, surveyedTrees: 5, status: 'in_progress' },
];

export const mockAuditRecords: AuditRecord[] = [
  { id: 'ar001', treeId: 't001', treeSpecies: '银杏', auditor: '周雪梅', coordinateAccuracy: 'accurate', photoQuality: 'clear', dataCompleteness: 'complete', result: 'approved', comment: '数据完整，照片清晰，坐标精确', auditedAt: '2024-03-16' },
  { id: 'ar002', treeId: 't002', treeSpecies: '樟树', auditor: '周雪梅', coordinateAccuracy: 'accurate', photoQuality: 'clear', dataCompleteness: 'complete', result: 'approved', comment: '全部合格', auditedAt: '2024-03-19' },
  { id: 'ar003', treeId: 't003', treeSpecies: '侧柏', auditor: '孙立峰', coordinateAccuracy: 'approximate', photoQuality: 'acceptable', dataCompleteness: 'partial', result: 'rejected', comment: '坐标精度不足，缺少果实照片，请补充', auditedAt: '2024-04-03' },
  { id: 'ar004', treeId: 't005', treeSpecies: '红豆杉', auditor: '孙立峰', coordinateAccuracy: 'accurate', photoQuality: 'poor', dataCompleteness: 'complete', result: 'rejected', comment: '全株照片模糊，需重新拍摄', auditedAt: '2024-05-09' },
  { id: 'ar005', treeId: 't006', treeSpecies: '桂花', auditor: '周雪梅', coordinateAccuracy: 'accurate', photoQuality: 'clear', dataCompleteness: 'complete', result: 'approved', comment: '数据质量优秀', auditedAt: '2024-05-21' },
  { id: 'ar006', treeId: 't007', treeSpecies: '松树', auditor: '孙立峰', coordinateAccuracy: 'approximate', photoQuality: 'clear', dataCompleteness: 'partial', result: 'pending', comment: '', auditedAt: '' },
  { id: 'ar007', treeId: 't010', treeSpecies: '楠木', auditor: '周雪梅', coordinateAccuracy: 'accurate', photoQuality: 'acceptable', dataCompleteness: 'complete', result: 'pending', comment: '', auditedAt: '' },
  { id: 'ar008', treeId: 't011', treeSpecies: '樟树', auditor: '孙立峰', coordinateAccuracy: 'accurate', photoQuality: 'clear', dataCompleteness: 'partial', result: 'pending', comment: '', auditedAt: '' },
];
