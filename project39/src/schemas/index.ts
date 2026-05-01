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
