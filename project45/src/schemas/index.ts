import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符'),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const baseUserSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z
    .string()
    .email('请输入有效的邮箱地址'),
  roleId: z.coerce.number({
    required_error: '请选择角色',
    invalid_type_error: '角色值无效',
  }).positive('请选择角色'),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^1[3-9]\d{9}$/.test(val),
      '请输入有效的手机号码'
    ),
  address: z
    .string()
    .max(200, '地址不能超过200个字符')
    .optional(),
});

export const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符'),
  confirmPassword: z
    .string()
    .min(6, '确认密码至少需要6个字符'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
);

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      '密码至少需要6个字符'
    ),
  confirmPassword: z
    .string()
    .optional(),
}).refine(
  (data) => !data.password || data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
);

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const roleSchema = z.object({
  name: z
    .string()
    .min(2, '角色名称至少需要2个字符')
    .max(50, '角色名称不能超过50个字符'),
  code: z
    .string()
    .min(2, '角色代码至少需要2个字符')
    .max(30, '角色代码不能超过30个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '角色代码只能包含字母、数字和下划线'),
  description: z
    .string()
    .max(200, '描述不能超过200个字符')
    .optional(),
  permissions: z
    .array(z.number())
    .optional()
    .default([]),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const generalSettingsSchema = z.object({
  siteName: z
    .string()
    .min(2, '网站名称至少需要2个字符')
    .max(100, '网站名称不能超过100个字符'),
  siteDescription: z
    .string()
    .max(500, '网站描述不能超过500个字符')
    .optional(),
  defaultLanguage: z.enum(['zh-CN', 'en-US']),
  defaultTheme: z.enum(['light', 'dark']),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

export const securitySettingsSchema = z.object({
  sessionTimeout: z.coerce
    .number()
    .int('会话超时必须是整数')
    .min(5, '会话超时不能小于5分钟')
    .max(120, '会话超时不能大于120分钟'),
  maxLoginAttempts: z.coerce
    .number()
    .int('最大登录尝试次数必须是整数')
    .min(1, '最大登录尝试次数不能小于1次')
    .max(10, '最大登录尝试次数不能大于10次'),
  passwordMinLength: z.coerce
    .number()
    .int('密码最小长度必须是整数')
    .min(6, '密码最小长度不能小于6个字符')
    .max(20, '密码最小长度不能大于20个字符'),
  requireMFA: z.boolean(),
});

export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

export const emailSettingsSchema = z.object({
  smtpHost: z
    .string()
    .min(1, 'SMTP服务器不能为空'),
  smtpPort: z.coerce
    .number()
    .int('SMTP端口必须是整数')
    .min(1, 'SMTP端口不能小于1')
    .max(65535, 'SMTP端口不能大于65535'),
  smtpUsername: z
    .string()
    .email('请输入有效的邮箱地址'),
  smtpPassword: z
    .string()
    .min(1, 'SMTP密码不能为空'),
});

export type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;

export const notificationSettingsSchema = z.object({
  notifyUserCreated: z.boolean(),
  notifyUserUpdated: z.boolean(),
  notifyUserDeleted: z.boolean(),
  notifySystemError: z.boolean(),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export const passwordStrengthSchema = z
  .string()
  .superRefine((password, ctx) => {
    if (!password) return;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码强度不够，建议包含大小写字母、数字和特殊字符',
      });
    }
  });

const languageCodeEnum = z.enum(['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU', 'ar-SA', 'hi-IN', 'th-TH', 'vi-VN']);

const languageLevelEnum = z.enum(['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced', 'native']);

const learningGoalEnum = z.enum(['travel', 'business', 'academic', 'daily_conversation', 'exam_preparation', 'cultural_interest']);

const interestTagEnum = z.enum(['travel', 'music', 'movies', 'books', 'sports', 'food', 'technology', 'art', 'history', 'science', 'gaming', 'photography', 'fitness', 'politics', 'fashion']);

export const languageSkillSchema = z.object({
  language: languageCodeEnum,
  level: languageLevelEnum,
  isNative: z.boolean().default(false),
});

export type LanguageSkillFormData = z.infer<typeof languageSkillSchema>;

export const timezoneSchema = z.object({
  name: z.string().min(1, '时区名称不能为空'),
  offset: z.number(),
  label: z.string().min(1, '时区标签不能为空'),
});

export type TimezoneFormData = z.infer<typeof timezoneSchema>;

export const learnerRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符'),
  confirmPassword: z
    .string()
    .min(6, '确认密码至少需要6个字符'),
  nativeLanguages: z
    .array(languageSkillSchema)
    .min(1, '至少需要选择一门母语'),
  learningLanguages: z
    .array(languageSkillSchema)
    .min(1, '至少需要选择一门学习语言'),
  learningGoals: z
    .array(learningGoalEnum)
    .min(1, '至少需要选择一个学习目标'),
  interests: z
    .array(interestTagEnum)
    .min(1, '至少需要选择一个兴趣标签'),
  timezone: timezoneSchema,
  bio: z
    .string()
    .max(500, '个人简介不能超过500个字符')
    .optional(),
  location: z
    .string()
    .max(100, '所在地不能超过100个字符')
    .optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
);

export type LearnerRegistrationFormData = z.infer<typeof learnerRegistrationSchema>;

export const updateLearnerProfileSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .optional(),
  avatar: z.string().url('请输入有效的头像URL').optional(),
  nativeLanguages: z
    .array(languageSkillSchema)
    .min(1, '至少需要选择一门母语')
    .optional(),
  learningLanguages: z
    .array(languageSkillSchema)
    .min(1, '至少需要选择一门学习语言')
    .optional(),
  learningGoals: z
    .array(learningGoalEnum)
    .min(1, '至少需要选择一个学习目标')
    .optional(),
  interests: z
    .array(interestTagEnum)
    .min(1, '至少需要选择一个兴趣标签')
    .optional(),
  timezone: timezoneSchema.optional(),
  bio: z
    .string()
    .max(500, '个人简介不能超过500个字符')
    .optional(),
  location: z
    .string()
    .max(100, '所在地不能超过100个字符')
    .optional(),
});

export type UpdateLearnerProfileFormData = z.infer<typeof updateLearnerProfileSchema>;

export const matchActionSchema = z.object({
  matchId: z.string().min(1, '匹配ID不能为空'),
  action: z.enum(['accept', 'reject']),
  message: z.string().max(200, '消息不能超过200个字符').optional(),
});

export type MatchActionFormData = z.infer<typeof matchActionSchema>;

export const chatMessageSchema = z.object({
  roomId: z.string().min(1, '聊天室ID不能为空'),
  content: z.string().min(1, '消息内容不能为空').max(2000, '消息不能超过2000个字符'),
  language: languageCodeEnum.optional(),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;

const annotationTypeEnum = z.enum(['grammar_error', 'natural_expression', 'question', 'suggestion']);

export const messageAnnotationSchema = z.object({
  messageId: z.string().min(1, '消息ID不能为空'),
  type: annotationTypeEnum,
  text: z.string().min(1, '标注文本不能为空'),
  startIndex: z.number().int().nonnegative('开始索引必须是非负整数'),
  endIndex: z.number().int().nonnegative('结束索引必须是非负整数'),
  comment: z.string().max(500, '评论不能超过500个字符').optional(),
});

export type MessageAnnotationFormData = z.infer<typeof messageAnnotationSchema>;

export const grammarCorrectionSchema = z.object({
  messageId: z.string().min(1, '消息ID不能为空'),
  originalText: z.string().min(1, '原文本不能为空'),
  correctedText: z.string().min(1, '修改文本不能为空'),
  explanation: z.string().max(500, '解释不能超过500个字符').optional(),
});

export type GrammarCorrectionFormData = z.infer<typeof grammarCorrectionSchema>;

export const webRTCSessionSchema = z.object({
  roomId: z.string().min(1, '聊天室ID不能为空'),
  type: z.enum(['voice', 'video']),
  offerSDP: z.string().optional(),
  answerSDP: z.string().optional(),
  iceCandidates: z.array(z.string()).default([]),
});

export type WebRTCSessionFormData = z.infer<typeof webRTCSessionSchema>;

export const vocabularyWordSchema = z.object({
  word: z.string().min(1, '单词不能为空'),
  language: languageCodeEnum,
  sourceMessageId: z.string().optional(),
  chatRoomId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type VocabularyWordFormData = z.infer<typeof vocabularyWordSchema>;

const ankiCardFormatEnum = z.enum(['basic', 'basic_reverse', 'cloze']);

export const ankiExportSchema = z.object({
  format: ankiCardFormatEnum.default('basic'),
  deckName: z.string().min(1, '卡组名称不能为空').default('LanguageExchange'),
  includeAudio: z.boolean().default(true),
  includeExamples: z.boolean().default(true),
  language: languageCodeEnum,
  wordIds: z.array(z.string()).optional(),
});

export type AnkiExportFormData = z.infer<typeof ankiExportSchema>;

export const sessionRecordingSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
  consentGiven: z.boolean().refine((val) => val === true, '必须同意录音才能开始录音'),
});

export type SessionRecordingFormData = z.infer<typeof sessionRecordingSchema>;

export const communityPostSchema = z.object({
  title: z.string().min(5, '标题至少需要5个字符').max(100, '标题不能超过100个字符'),
  content: z.string().min(10, '内容至少需要10个字符').max(10000, '内容不能超过10000个字符'),
  language: languageCodeEnum,
  topic: z.string().min(1, '话题不能为空').max(50, '话题不能超过50个字符'),
  tags: z.array(z.string()).max(10, '最多添加10个标签').default([]),
  isAnonymous: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('published'),
});

export type CommunityPostFormData = z.infer<typeof communityPostSchema>;

export const postCommentSchema = z.object({
  postId: z.string().min(1, '帖子ID不能为空'),
  content: z.string().min(1, '评论内容不能为空').max(500, '评论不能超过500个字符'),
  parentCommentId: z.string().optional(),
});

export type PostCommentFormData = z.infer<typeof postCommentSchema>;

export const challengeSubmissionSchema = z.object({
  challengeId: z.string().min(1, '挑战ID不能为空'),
  audioUrl: z.string().url('请输入有效的音频URL'),
});

export type ChallengeSubmissionFormData = z.infer<typeof challengeSubmissionSchema>;

export const peerRatingSchema = z.object({
  submissionId: z.string().min(1, '提交ID不能为空'),
  pronunciation: z.number().int().min(1, '评分至少1分').max(5, '评分最多5分'),
  fluency: z.number().int().min(1, '评分至少1分').max(5, '评分最多5分'),
  vocabulary: z.number().int().min(1, '评分至少1分').max(5, '评分最多5分'),
  grammar: z.number().int().min(1, '评分至少1分').max(5, '评分最多5分'),
  comment: z.string().max(500, '评论不能超过500个字符').optional(),
});

export type PeerRatingFormData = z.infer<typeof peerRatingSchema>;

const subscriptionTierEnum = z.enum(['free', 'premium', 'professional']);

export const subscriptionPlanSchema = z.object({
  tier: subscriptionTierEnum,
  name: z.string().min(1, '套餐名称不能为空').max(50, '套餐名称不能超过50个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  priceMonthly: z.number().positive('月价格必须是正数'),
  priceYearly: z.number().positive('年价格必须是正数'),
  currency: z.string().default('CNY'),
  isPopular: z.boolean().default(false),
});

export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;

export const teacherSessionSchema = z.object({
  teacherId: z.number().int().positive('教师ID必须是正整数'),
  startTime: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    '请输入有效的开始时间'
  ),
  endTime: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    '请输入有效的结束时间'
  ),
  language: languageCodeEnum,
  topic: z.string().max(100, '主题不能超过100个字符').optional(),
});

export type TeacherSessionFormData = z.infer<typeof teacherSessionSchema>;
