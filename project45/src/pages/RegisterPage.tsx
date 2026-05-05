import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { learnerRegistrationSchema, LearnerRegistrationFormData } from '@/schemas';
import { languageExchangeApi } from '@/services/languageExchangeService';
import {
  LANGUAGES,
  LANGUAGE_LEVELS,
  LEARNING_GOALS,
  INTEREST_TAGS,
  TIMEZONES,
  LanguageCode,
  LanguageLevel,
  LearningGoal,
  InterestTag,
} from '@/constants/languages';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Loading from '@/components/Loading';

type Step = 'account' | 'languages' | 'interests' | 'review';

const languageOptions = Object.values(LANGUAGES).map((lang) => ({
  value: lang.code,
  label: `${lang.nativeName} (${lang.name})`,
}));

const levelOptions = Object.values(LANGUAGE_LEVELS).map((level) => ({
  value: level.value,
  label: `${level.label} - ${level.description}`,
}));

const goalOptions = Object.values(LEARNING_GOALS).map((goal) => ({
  value: goal.value,
  label: `${goal.icon} ${goal.label}`,
}));

const interestOptions = Object.values(INTEREST_TAGS).map((interest) => ({
  value: interest.value,
  label: `${interest.icon} ${interest.label}`,
}));

const timezoneOptions = TIMEZONES.map((tz) => ({
  value: tz.name,
  label: `${tz.name} (${tz.label})`,
  offset: tz.offset,
}));

function RegisterPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultTimezone = timezoneOptions.find((tz) => tz.offset === 8) || timezoneOptions[0];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<LearnerRegistrationFormData>({
    resolver: zodResolver(learnerRegistrationSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      nativeLanguages: [
        { language: 'zh-CN' as LanguageCode, level: 'native' as LanguageLevel, isNative: true },
      ],
      learningLanguages: [
        { language: 'en-US' as LanguageCode, level: 'intermediate' as LanguageLevel, isNative: false },
      ],
      learningGoals: [],
      interests: [],
      timezone: {
        name: defaultTimezone.value,
        offset: defaultTimezone.offset,
        label: defaultTimezone.label,
      },
      bio: '',
      location: '',
    },
  });

  const {
    fields: nativeLanguageFields,
    append: appendNativeLanguage,
    remove: removeNativeLanguage,
  } = useFieldArray({
    control,
    name: 'nativeLanguages',
  });

  const {
    fields: learningLanguageFields,
    append: appendLearningLanguage,
    remove: removeLearningLanguage,
  } = useFieldArray({
    control,
    name: 'learningLanguages',
  });

  const watchNativeLanguages = watch('nativeLanguages');
  const watchLearningLanguages = watch('learningLanguages');
  const watchLearningGoals = watch('learningGoals');
  const watchInterests = watch('interests');
  const watchTimezone = watch('timezone');

  const steps: { key: Step; label: string }[] = [
    { key: 'account', label: '账户信息' },
    { key: 'languages', label: '语言设置' },
    { key: 'interests', label: '兴趣目标' },
    { key: 'review', label: '确认信息' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'account':
        return (
          !errors.username &&
          !errors.email &&
          !errors.password &&
          !errors.confirmPassword &&
          watch('username')?.length >= 3 &&
          watch('email')?.includes('@') &&
          watch('password')?.length >= 6 &&
          watch('password') === watch('confirmPassword')
        );
      case 'languages':
        return (
          watchNativeLanguages.length > 0 &&
          watchLearningLanguages.length > 0 &&
          !errors.nativeLanguages &&
          !errors.learningLanguages
        );
      case 'interests':
        return (
          watchLearningGoals.length > 0 &&
          watchInterests.length > 0 &&
          !errors.learningGoals &&
          !errors.interests
        );
      case 'review':
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const toggleGoal = (goal: string) => {
    const current = watchLearningGoals || [];
    if (current.includes(goal as LearningGoal)) {
      setValue(
        'learningGoals',
        current.filter((g) => g !== goal) as LearningGoal[]
      );
    } else {
      setValue('learningGoals', [...current, goal as LearningGoal]);
    }
  };

  const toggleInterest = (interest: string) => {
    const current = watchInterests || [];
    if (current.includes(interest as InterestTag)) {
      setValue(
        'interests',
        current.filter((i) => i !== interest) as InterestTag[]
      );
    } else {
      setValue('interests', [...current, interest as InterestTag]);
    }
  };

  const handleTimezoneChange = (timezoneName: string) => {
    const tz = timezoneOptions.find((t) => t.value === timezoneName);
    if (tz) {
      setValue('timezone', {
        name: tz.value,
        offset: tz.offset,
        label: tz.label,
      });
    }
  };

  const onSubmit = async (data: LearnerRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const result = await languageExchangeApi.registerLearner(data);
      showSuccess(`注册成功！欢迎加入，${result.username}！`);
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败，请重试';
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    const isValid = await handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">语言交换平台</h1>
          <p className="text-indigo-100">创建您的账户，开始语言学习之旅</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                  index <= currentStepIndex
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/30 text-white'
                }`}
              >
                {index < currentStepIndex ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-1 mx-2 rounded transition-all ${
                    index < currentStepIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              {steps[currentStepIndex].label}
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              步骤 {currentStepIndex + 1} / {steps.length}
            </p>
          </div>

          <div className="px-8 py-8">
            <Loading isLoading={isSubmitting} fullScreen>
              <form onSubmit={handleSubmit(onSubmit)}>
                {currentStep === 'account' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="用户名"
                        type="text"
                        placeholder="请输入用户名"
                        isRequired
                        error={errors.username?.message}
                        register={register('username')}
                        fullWidth
                      />
                      <Input
                        label="邮箱地址"
                        type="email"
                        placeholder="请输入邮箱地址"
                        isRequired
                        error={errors.email?.message}
                        register={register('email')}
                        fullWidth
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="密码"
                        type="password"
                        placeholder="请输入密码（至少6个字符）"
                        isRequired
                        error={errors.password?.message}
                        register={register('password')}
                        fullWidth
                      />
                      <Input
                        label="确认密码"
                        type="password"
                        placeholder="请再次输入密码"
                        isRequired
                        error={errors.confirmPassword?.message}
                        register={register('confirmPassword')}
                        fullWidth
                      />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">密码要求</h3>
                      <ul className="text-xs text-blue-600 space-y-1">
                        <li>• 至少6个字符</li>
                        <li>• 建议包含大小写字母、数字和特殊字符</li>
                        <li>• 不要使用容易猜测的密码</li>
                      </ul>
                    </div>
                  </div>
                )}

                {currentStep === 'languages' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          母语（您能熟练教授的语言）
                        </h3>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            appendNativeLanguage({
                              language: 'en-US' as LanguageCode,
                              level: 'native' as LanguageLevel,
                              isNative: true,
                            })
                          }
                        >
                          + 添加语言
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {nativeLanguageFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  语言
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  {...register(`nativeLanguages.${index}.language`)}
                                >
                                  {languageOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  水平
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  {...register(`nativeLanguages.${index}.level`)}
                                >
                                  {levelOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {nativeLanguageFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeNativeLanguage(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.nativeLanguages && (
                        <p className="text-sm text-red-500 mt-2">
                          至少需要选择一门母语
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          学习语言（您想要学习的语言）
                        </h3>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            appendLearningLanguage({
                              language: 'ja-JP' as LanguageCode,
                              level: 'beginner' as LanguageLevel,
                              isNative: false,
                            })
                          }
                        >
                          + 添加语言
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {learningLanguageFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  语言
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  {...register(`learningLanguages.${index}.language`)}
                                >
                                  {languageOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  当前水平
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  {...register(`learningLanguages.${index}.level`)}
                                >
                                  {levelOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {learningLanguageFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLearningLanguage(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.learningLanguages && (
                        <p className="text-sm text-red-500 mt-2">
                          至少需要选择一门学习语言
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 'interests' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        学习目标（至少选择一个）
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        选择您学习语言的主要目标，这将帮助我们为您匹配更合适的语言伙伴
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {goalOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleGoal(opt.value)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              watchLearningGoals?.includes(opt.value as LearningGoal)
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-2xl mb-1">
                              {opt.label.split(' ')[0]}
                            </div>
                            <div className="text-sm font-medium">
                              {opt.label.split(' ').slice(1).join(' ')}
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.learningGoals && (
                        <p className="text-sm text-red-500 mt-2">
                          至少需要选择一个学习目标
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        兴趣标签（至少选择一个）
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        选择您感兴趣的话题，这将帮助您找到有共同爱好的语言伙伴
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {interestOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleInterest(opt.value)}
                            className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
                              watchInterests?.includes(opt.value as InterestTag)
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-lg">{opt.label.split(' ')[0]}</span>
                            <span className="text-sm font-medium">
                              {opt.label.split(' ').slice(1).join(' ')}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.interests && (
                        <p className="text-sm text-red-500 mt-2">
                          至少需要选择一个兴趣标签
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        时区设置
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        选择您所在的时区，这将帮助我们计算您与其他用户的时间重叠度
                      </p>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={watchTimezone?.name || defaultTimezone.value}
                        onChange={(e) => handleTimezoneChange(e.target.value)}
                      >
                        {timezoneOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          个人简介（可选）
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={4}
                          placeholder="介绍一下您自己，您的语言学习经历，或者您期望什么样的语言伙伴..."
                          {...register('bio')}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          最多500个字符
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          所在地（可选）
                        </label>
                        <Input
                          type="text"
                          placeholder="例如：北京，中国"
                          error={errors.location?.message}
                          register={register('location')}
                          fullWidth
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          可以是城市、国家或地区
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="space-y-6">
                    <div className="bg-indigo-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-indigo-800 mb-4">
                        📋 账户信息确认
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">用户名：</span>
                          <span className="font-medium text-gray-800 ml-2">
                            {watch('username')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">邮箱：</span>
                          <span className="font-medium text-gray-800 ml-2">
                            {watch('email')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-4">
                        🌍 语言设置
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2">
                            母语：
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {watchNativeLanguages.map((lang, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                              >
                                {LANGUAGES[lang.language]?.nativeName || lang.language}
                                <span className="ml-2 text-green-600">
                                  ({LANGUAGE_LEVELS[lang.level]?.label})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2">
                            学习语言：
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {watchLearningLanguages.map((lang, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                              >
                                {LANGUAGES[lang.language]?.nativeName || lang.language}
                                <span className="ml-2 text-blue-600">
                                  ({LANGUAGE_LEVELS[lang.level]?.label})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-800 mb-4">
                        🎯 学习目标
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {watchLearningGoals.map((goal) => (
                          <span
                            key={goal}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                          >
                            {LEARNING_GOALS[goal]?.icon} {LEARNING_GOALS[goal]?.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-pink-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-pink-800 mb-4">
                        ❤️ 兴趣爱好
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {watchInterests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
                          >
                            {INTEREST_TAGS[interest]?.icon} {INTEREST_TAGS[interest]?.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        ⏰ 时区
                      </h3>
                      <p className="text-sm text-gray-600">
                        {watchTimezone?.name} - {watchTimezone?.label}
                      </p>
                      {watch('bio') && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            个人简介：
                          </h4>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                            {watch('bio')}
                          </p>
                        </div>
                      )}
                      {watch('location') && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            所在地：
                          </h4>
                          <p className="text-sm text-gray-600">
                            {watch('location')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        ⚠️ 注册须知
                      </h4>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• 点击"完成注册"即表示您同意我们的服务条款和隐私政策</li>
                        <li>• 请确保您的邮箱地址正确，以便接收验证邮件</li>
                        <li>• 您可以随时在设置中修改您的个人信息</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={goToPrevStep}
                    disabled={currentStepIndex === 0}
                  >
                    上一步
                  </Button>
                  {currentStepIndex < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={goToNextStep}
                      disabled={!canProceed()}
                    >
                      下一步
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleReviewSubmit}
                      isLoading={isSubmitting}
                    >
                      完成注册
                    </Button>
                  )}
                </div>
              </form>
            </Loading>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/80">
            已有账户？{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-white font-semibold hover:underline"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
