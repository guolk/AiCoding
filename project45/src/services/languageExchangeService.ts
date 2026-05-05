import { v4 as uuidv4 } from 'uuid';
import type {
  LanguageLearner,
  Match,
  DailyRecommendation,
  ChatRoom,
  ChatMessage,
  MessageAnnotation,
  GrammarCorrection,
  VocabularyItem,
  CommunityPost,
  SpeakingChallenge,
  ChallengeSubmission,
  PeerRating,
  SubscriptionPlan,
  UserSubscription,
  LearningActivity,
  LearningCalendar,
  Notification,
} from '@/types';
import {
  mockUsers,
  getMockUserById,
  generateMockMatches,
  mockChatRooms,
  mockChatMessages,
  mockCommunityPosts,
  mockSpeakingChallenges,
  mockSubscriptionPlans,
} from '@/data/mockData';
import { createMatch, calculateMatchScore, sortMatchesByScore, getTopDailyMatches } from '@/utils/matchingAlgorithm';

const API_BASE_URL = '/api/v1';

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

class LanguageExchangeError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'LanguageExchangeError';
  }
}

let mutableMockData = {
  users: [...mockUsers],
  matches: generateMockMatches(),
  dailyRecommendations: [] as DailyRecommendation[],
  chatRooms: [...mockChatRooms],
  chatMessages: [...mockChatMessages],
  vocabularyItems: [] as VocabularyItem[],
  communityPosts: [...mockCommunityPosts],
  speakingChallenges: [...mockSpeakingChallenges],
  challengeSubmissions: [] as ChallengeSubmission[],
  peerRatings: [] as PeerRating[],
  subscriptionPlans: [...mockSubscriptionPlans],
  userSubscriptions: [] as UserSubscription[],
  learningActivities: [] as LearningActivity[],
  notifications: [] as Notification[],
  nextUserId: 6,
};

const getCurrentLearnerId = (): number => {
  const auth = sessionStorage.getItem('auth');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed.user?.id || 1;
    } catch {
      return 1;
    }
  }
  return 1;
};

export const languageExchangeApi = {
  async registerLearner(data: {
    username: string;
    email: string;
    password: string;
    nativeLanguages: { language: string; level: string; isNative: boolean }[];
    learningLanguages: { language: string; level: string; isNative: boolean }[];
    learningGoals: string[];
    interests: string[];
    timezone: { name: string; offset: number; label: string };
    bio?: string;
    location?: string;
  }): Promise<LanguageLearner> {
    await delay(500);

    const exists = mutableMockData.users.find(
      (u) => u.username === data.username || u.email === data.email
    );

    if (exists) {
      throw new LanguageExchangeError('用户名或邮箱已存在', 400);
    }

    const newLearner: LanguageLearner = {
      id: mutableMockData.nextUserId++,
      username: data.username,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      nativeLanguages: data.nativeLanguages as any,
      learningLanguages: data.learningLanguages as any,
      learningGoals: data.learningGoals as any,
      interests: data.interests as any,
      timezone: data.timezone,
      bio: data.bio,
      location: data.location,
      onlineStatus: 'online',
      lastActiveAt: new Date().toISOString(),
      rating: 0,
      totalMatches: 0,
      totalChatHours: 0,
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutableMockData.users.push(newLearner);

    return newLearner;
  },

  async getCurrentLearner(): Promise<LanguageLearner> {
    await delay(200);
    const learnerId = getCurrentLearnerId();
    const learner = mutableMockData.users.find((u) => u.id === learnerId);

    if (!learner) {
      throw new LanguageExchangeError('用户不存在', 404);
    }

    return learner;
  },

  async updateLearnerProfile(
    learnerId: number,
    data: Partial<LanguageLearner>
  ): Promise<LanguageLearner> {
    await delay(300);

    const learnerIndex = mutableMockData.users.findIndex((u) => u.id === learnerId);

    if (learnerIndex === -1) {
      throw new LanguageExchangeError('用户不存在', 404);
    }

    mutableMockData.users[learnerIndex] = {
      ...mutableMockData.users[learnerIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mutableMockData.users[learnerIndex];
  },

  async searchLearners(
    params: {
      language?: string;
      interest?: string;
      level?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ items: LanguageLearner[]; total: number; page: number; pageSize: number; totalPages: number }> {
    await delay(300);

    let learners = [...mutableMockData.users];
    const currentLearnerId = getCurrentLearnerId();

    learners = learners.filter((l) => l.id !== currentLearnerId);

    if (params.language) {
      learners = learners.filter(
        (l) =>
          l.nativeLanguages.some((nl) => nl.language === params.language) ||
          l.learningLanguages.some((ll) => ll.language === params.language)
      );
    }

    if (params.interest) {
      learners = learners.filter((l) =>
        l.interests.includes(params.interest as any)
      );
    }

    if (params.level) {
      learners = learners.filter(
        (l) =>
          l.learningLanguages.some((ll) => ll.level === params.level)
      );
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      learners = learners.filter(
        (l) =>
          l.username.toLowerCase().includes(search) ||
          l.email.toLowerCase().includes(search) ||
          l.bio?.toLowerCase().includes(search)
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = learners.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: learners.length,
      page,
      pageSize,
      totalPages: Math.ceil(learners.length / pageSize),
    };
  },

  async getRecommendedMatches(learnerId: number): Promise<Match[]> {
    await delay(300);

    const learner = mutableMockData.users.find((l) => l.id === learnerId);
    if (!learner) {
      throw new LanguageExchangeError('用户不存在', 404);
    }

    const today = new Date().toISOString().split('T')[0];
    const existingRecommendation = mutableMockData.dailyRecommendations.find(
      (r) => r.userId === learnerId && r.date === today
    );

    if (existingRecommendation) {
      return existingRecommendation.matches;
    }

    const candidates = mutableMockData.users.filter((u) => u.id !== learnerId);
    const recommendedMatches = getTopDailyMatches(learner, candidates, 3);

    const newRecommendation: DailyRecommendation = {
      date: today,
      userId: learnerId,
      matches: recommendedMatches,
      viewed: false,
      createdAt: new Date().toISOString(),
    };

    mutableMockData.dailyRecommendations.push(newRecommendation);

    return recommendedMatches;
  },

  async calculateMatchBetween(learnerId1: number, learnerId2: number): Promise<Match> {
    await delay(200);

    const learner1 = mutableMockData.users.find((l) => l.id === learnerId1);
    const learner2 = mutableMockData.users.find((l) => l.id === learnerId2);

    if (!learner1 || !learner2) {
      throw new LanguageExchangeError('用户不存在', 404);
    }

    return createMatch(learner1, learner2);
  },

  async sendMatchRequest(receiverId: number, message?: string): Promise<Match> {
    await delay(300);

    const senderId = getCurrentLearnerId();
    const sender = mutableMockData.users.find((l) => l.id === senderId);
    const receiver = mutableMockData.users.find((l) => l.id === receiverId);

    if (!sender || !receiver) {
      throw new LanguageExchangeError('用户不存在', 404);
    }

    const existingMatch = mutableMockData.matches.find(
      (m) =>
        (m.senderId === senderId && m.receiverId === receiverId) ||
        (m.senderId === receiverId && m.receiverId === senderId)
    );

    if (existingMatch) {
      return existingMatch;
    }

    const { score, breakdown } = calculateMatchScore(sender, receiver);

    const newMatch: Match = {
      id: uuidv4(),
      senderId,
      receiverId,
      score,
      breakdown,
      status: 'pending',
      message,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      sender,
      receiver,
    };

    mutableMockData.matches.push(newMatch);

    const notification: Notification = {
      id: uuidv4(),
      userId: receiverId,
      type: 'match',
      title: '新的匹配请求',
      content: `${sender.username} 向您发送了匹配请求`,
      data: { matchId: newMatch.id },
      read: false,
      createdAt: new Date().toISOString(),
    };
    mutableMockData.notifications.push(notification);

    return newMatch;
  },

  async respondToMatch(matchId: string, action: 'accept' | 'reject'): Promise<Match> {
    await delay(300);

    const currentLearnerId = getCurrentLearnerId();
    const matchIndex = mutableMockData.matches.findIndex((m) => m.id === matchId);

    if (matchIndex === -1) {
      throw new LanguageExchangeError('匹配不存在', 404);
    }

    const match = mutableMockData.matches[matchIndex];

    if (match.receiverId !== currentLearnerId) {
      throw new LanguageExchangeError('您无权对此匹配进行操作', 403);
    }

    if (match.status !== 'pending') {
      throw new LanguageExchangeError('此匹配已处理或已过期', 400);
    }

    mutableMockData.matches[matchIndex] = {
      ...match,
      status: action === 'accept' ? 'accepted' : 'rejected',
    };

    if (action === 'accept') {
      const newChatRoom: ChatRoom = {
        id: uuidv4(),
        participants: [match.senderId, match.receiverId],
        matchId: match.id,
        type: 'text',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mutableMockData.chatRooms.push(newChatRoom);
    }

    const notification: Notification = {
      id: uuidv4(),
      userId: match.senderId,
      type: 'match',
      title: action === 'accept' ? '匹配已接受' : '匹配被拒绝',
      content: `${match.receiver?.username} ${action === 'accept' ? '接受了' : '拒绝了'}您的匹配请求`,
      data: { matchId: match.id },
      read: false,
      createdAt: new Date().toISOString(),
    };
    mutableMockData.notifications.push(notification);

    return mutableMockData.matches[matchIndex];
  },

  async getMatches(
    status?: 'pending' | 'accepted' | 'rejected' | 'expired'
  ): Promise<Match[]> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    let matches = mutableMockData.matches.filter(
      (m) => m.senderId === currentLearnerId || m.receiverId === currentLearnerId
    );

    if (status) {
      matches = matches.filter((m) => m.status === status);
    }

    return sortMatchesByScore(matches);
  },

  async getChatRooms(): Promise<ChatRoom[]> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    const rooms = mutableMockData.chatRooms.filter((r) =>
      r.participants.includes(currentLearnerId)
    );

    return rooms;
  },

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    await delay(200);

    const messages = mutableMockData.chatMessages
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return messages;
  },

  async sendChatMessage(
    roomId: string,
    content: string,
    language?: string
  ): Promise<ChatMessage> {
    await delay(100);

    const currentLearnerId = getCurrentLearnerId();
    const room = mutableMockData.chatRooms.find((r) => r.id === roomId);

    if (!room) {
      throw new LanguageExchangeError('聊天室不存在', 404);
    }

    if (!room.participants.includes(currentLearnerId)) {
      throw new LanguageExchangeError('您无权在此聊天室发送消息', 403);
    }

    const newMessage: ChatMessage = {
      id: uuidv4(),
      roomId,
      senderId: currentLearnerId,
      content,
      type: 'text',
      language: language as any,
      annotations: [],
      corrections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutableMockData.chatMessages.push(newMessage);

    const roomIndex = mutableMockData.chatRooms.findIndex((r) => r.id === roomId);
    if (roomIndex !== -1) {
      mutableMockData.chatRooms[roomIndex].lastMessageAt = new Date().toISOString();
    }

    const otherParticipantId = room.participants.find((p) => p !== currentLearnerId);
    if (otherParticipantId) {
      const notification: Notification = {
        id: uuidv4(),
        userId: otherParticipantId,
        type: 'message',
        title: '新消息',
        content: `收到来自 ${getMockUserById(currentLearnerId)?.username} 的新消息`,
        data: { roomId, messageId: newMessage.id },
        read: false,
        createdAt: new Date().toISOString(),
      };
      mutableMockData.notifications.push(notification);
    }

    return newMessage;
  },

  async addMessageAnnotation(
    messageId: string,
    annotation: Omit<MessageAnnotation, 'id' | 'messageId' | 'annotatorId' | 'createdAt'>
  ): Promise<MessageAnnotation> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    const messageIndex = mutableMockData.chatMessages.findIndex((m) => m.id === messageId);

    if (messageIndex === -1) {
      throw new LanguageExchangeError('消息不存在', 404);
    }

    const message = mutableMockData.chatMessages[messageIndex];

    if (message.senderId === currentLearnerId) {
      throw new LanguageExchangeError('不能标注自己发送的消息', 400);
    }

    const newAnnotation: MessageAnnotation = {
      id: uuidv4(),
      messageId,
      annotatorId: currentLearnerId,
      ...annotation,
      createdAt: new Date().toISOString(),
    };

    mutableMockData.chatMessages[messageIndex].annotations.push(newAnnotation);

    const notification: Notification = {
      id: uuidv4(),
      userId: message.senderId,
      type: 'correction',
      title: '消息被标注',
      content: `您的消息被 ${getMockUserById(currentLearnerId)?.username} 标注`,
      data: { messageId, annotationId: newAnnotation.id },
      read: false,
      createdAt: new Date().toISOString(),
    };
    mutableMockData.notifications.push(notification);

    return newAnnotation;
  },

  async suggestGrammarCorrection(
    messageId: string,
    originalText: string,
    correctedText: string,
    explanation?: string
  ): Promise<GrammarCorrection> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    const messageIndex = mutableMockData.chatMessages.findIndex((m) => m.id === messageId);

    if (messageIndex === -1) {
      throw new LanguageExchangeError('消息不存在', 404);
    }

    const message = mutableMockData.chatMessages[messageIndex];

    if (message.senderId === currentLearnerId) {
      throw new LanguageExchangeError('不能修改自己发送的消息', 400);
    }

    const newCorrection: GrammarCorrection = {
      id: uuidv4(),
      messageId,
      correctorId: currentLearnerId,
      originalText,
      correctedText,
      explanation,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    mutableMockData.chatMessages[messageIndex].corrections.push(newCorrection);

    const notification: Notification = {
      id: uuidv4(),
      userId: message.senderId,
      type: 'correction',
      title: '收到语法修改建议',
      content: `${getMockUserById(currentLearnerId)?.username} 对您的消息提出了语法修改建议`,
      data: { messageId, correctionId: newCorrection.id },
      read: false,
      createdAt: new Date().toISOString(),
    };
    mutableMockData.notifications.push(notification);

    return newCorrection;
  },

  async respondToGrammarCorrection(
    correctionId: string,
    action: 'accept' | 'reject'
  ): Promise<GrammarCorrection> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();

    for (const message of mutableMockData.chatMessages) {
      const correctionIndex = message.corrections.findIndex((c) => c.id === correctionId);
      if (correctionIndex !== -1) {
        if (message.senderId !== currentLearnerId) {
          throw new LanguageExchangeError('您无权对此修改进行操作', 403);
        }

        if (message.corrections[correctionIndex].status !== 'pending') {
          throw new LanguageExchangeError('此修改已处理', 400);
        }

        const newStatus = action === 'accept' ? 'accepted' : 'rejected';
        message.corrections[correctionIndex].status = newStatus;

        const notification: Notification = {
          id: uuidv4(),
          userId: message.corrections[correctionIndex].correctorId,
          type: 'correction',
          title: newStatus === 'accepted' ? '修改被接受' : '修改被拒绝',
          content: `您的语法修改建议被 ${getMockUserById(currentLearnerId)?.username} ${newStatus === 'accepted' ? '接受' : '拒绝'}`,
          data: { correctionId },
          read: false,
          createdAt: new Date().toISOString(),
        };
        mutableMockData.notifications.push(notification);

        return message.corrections[correctionIndex];
      }
    }

    throw new LanguageExchangeError('修改不存在', 404);
  },

  async getVocabularyItems(): Promise<VocabularyItem[]> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    return mutableMockData.vocabularyItems.filter((v) => v.userId === currentLearnerId);
  },

  async addVocabularyItem(
    data: Omit<VocabularyItem, 'id' | 'userId' | 'definitions' | 'examples' | 'reviewCount' | 'nextReviewAt' | 'mastered' | 'createdAt' | 'updatedAt'>
  ): Promise<VocabularyItem> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();

    const mockDefinitions = [
      {
        partOfSpeech: 'noun',
        definition: `A sample definition for "${data.word}"`,
        translation: `${data.word} 的示例释义`,
      },
      {
        partOfSpeech: 'verb',
        definition: `Another definition for "${data.word}"`,
        translation: `${data.word} 的另一个释义`,
      },
    ];

    const mockExamples = [
      {
        text: `This is an example sentence using "${data.word}".`,
        translation: `这是一个使用 "${data.word}" 的示例句子。`,
        source: 'Oxford Dictionary',
      },
    ];

    const newVocabulary: VocabularyItem = {
      id: uuidv4(),
      userId: currentLearnerId,
      word: data.word,
      language: data.language,
      definitions: mockDefinitions,
      examples: mockExamples,
      pronunciation: `/prəˌnʌnsiˈeɪʃən/`,
      audioUrl: undefined,
      sourceMessageId: data.sourceMessageId,
      chatRoomId: data.chatRoomId,
      tags: data.tags,
      reviewCount: 0,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      mastered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutableMockData.vocabularyItems.push(newVocabulary);

    return newVocabulary;
  },

  async updateVocabularyItem(
    id: string,
    data: Partial<VocabularyItem>
  ): Promise<VocabularyItem> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    const vocabIndex = mutableMockData.vocabularyItems.findIndex(
      (v) => v.id === id && v.userId === currentLearnerId
    );

    if (vocabIndex === -1) {
      throw new LanguageExchangeError('生词不存在', 404);
    }

    mutableMockData.vocabularyItems[vocabIndex] = {
      ...mutableMockData.vocabularyItems[vocabIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mutableMockData.vocabularyItems[vocabIndex];
  },

  async deleteVocabularyItem(id: string): Promise<{ message: string }> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    const vocabIndex = mutableMockData.vocabularyItems.findIndex(
      (v) => v.id === id && v.userId === currentLearnerId
    );

    if (vocabIndex === -1) {
      throw new LanguageExchangeError('生词不存在', 404);
    }

    mutableMockData.vocabularyItems.splice(vocabIndex, 1);

    return { message: '删除成功' };
  },

  async exportToAnki(
    config: {
      format: 'basic' | 'basic_reverse' | 'cloze';
      deckName: string;
      includeAudio: boolean;
      includeExamples: boolean;
      language: string;
      wordIds?: string[];
    }
  ): Promise<{ format: string; content: string; filename: string }> {
    await delay(500);

    const currentLearnerId = getCurrentLearnerId();
    let vocabItems = mutableMockData.vocabularyItems.filter(
      (v) => v.userId === currentLearnerId
    );

    if (config.wordIds && config.wordIds.length > 0) {
      vocabItems = vocabItems.filter((v) => config.wordIds!.includes(v.id));
    }

    let content = '#separator:tab\n';
    content += '#html:true\n';
    content += '#deck column:1\n';

    for (const item of vocabItems) {
      const front = `<b>${item.word}</b> <i>${item.pronunciation || ''}</i>`;
      let back = '';

      for (const def of item.definitions) {
        back += `<b>${def.partOfSpeech}.</b> ${def.definition}<br>`;
        if (def.translation) {
          back += `<i>${def.translation}</i><br>`;
        }
      }

      if (config.includeExamples && item.examples.length > 0) {
        back += '<br><b>Examples:</b><br>';
        for (const example of item.examples) {
          back += `• ${example.text}<br>`;
          if (example.translation) {
            back += `&nbsp;&nbsp;<i>${example.translation}</i><br>`;
          }
        }
      }

      content += `${config.deckName}\t${front}\t${back}\n`;
    }

    return {
      format: 'txt',
      content,
      filename: `${config.deckName}_${new Date().toISOString().split('T')[0]}.txt`,
    };
  },

  async getCommunityPosts(
    params: {
      language?: string;
      topic?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ items: CommunityPost[]; total: number; page: number; pageSize: number; totalPages: number }> {
    await delay(200);

    let posts = [...mutableMockData.communityPosts];

    if (params.language) {
      posts = posts.filter((p) => p.language === params.language);
    }

    if (params.topic) {
      posts = posts.filter((p) => p.topic === params.topic);
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.content.toLowerCase().includes(search)
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = posts.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: posts.length,
      page,
      pageSize,
      totalPages: Math.ceil(posts.length / pageSize),
    };
  },

  async getSpeakingChallenges(
    status?: 'upcoming' | 'active' | 'ended'
  ): Promise<SpeakingChallenge[]> {
    await delay(200);

    let challenges = [...mutableMockData.speakingChallenges];

    if (status) {
      challenges = challenges.filter((c) => c.status === status);
    }

    return challenges;
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    await delay(100);
    return mutableMockData.subscriptionPlans;
  },

  async getCurrentSubscription(): Promise<UserSubscription | null> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    const subscription = mutableMockData.userSubscriptions.find(
      (s) => s.userId === currentLearnerId && s.status === 'active'
    );

    return subscription || null;
  },

  async subscribe(tier: 'premium' | 'professional', billingCycle: 'monthly' | 'yearly'): Promise<UserSubscription> {
    await delay(500);

    const currentLearnerId = getCurrentLearnerId();
    const plan = mutableMockData.subscriptionPlans.find((p) => p.tier === tier);

    if (!plan) {
      throw new LanguageExchangeError('套餐不存在', 404);
    }

    const now = new Date();
    const endDate = new Date(now);
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const existingSubscriptionIndex = mutableMockData.userSubscriptions.findIndex(
      (s) => s.userId === currentLearnerId
    );

    const newSubscription: UserSubscription = {
      id: uuidv4(),
      userId: currentLearnerId,
      planId: plan.id,
      tier: plan.tier,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      paymentMethod: 'credit_card',
      usage: {
        matchesUsed: 0,
        matchesLimit: 9999,
        aiCorrectionsUsed: 0,
        aiCorrectionsLimit: tier === 'professional' ? 9999 : 50,
        teacherConnectionsUsed: 0,
        teacherConnectionsLimit: tier === 'professional' ? 9999 : 0,
        recordingMinutesUsed: 0,
        recordingMinutesLimit: tier === 'professional' ? 9999 : 600,
      },
      plan,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (existingSubscriptionIndex !== -1) {
      mutableMockData.userSubscriptions[existingSubscriptionIndex] = newSubscription;
    } else {
      mutableMockData.userSubscriptions.push(newSubscription);
    }

    const learnerIndex = mutableMockData.users.findIndex((u) => u.id === currentLearnerId);
    if (learnerIndex !== -1) {
      mutableMockData.users[learnerIndex].subscriptionTier = tier;
      mutableMockData.users[learnerIndex].subscriptionEndDate = endDate.toISOString();
    }

    return newSubscription;
  },

  async cancelSubscription(): Promise<{ message: string }> {
    await delay(300);

    const currentLearnerId = getCurrentLearnerId();
    const subscriptionIndex = mutableMockData.userSubscriptions.findIndex(
      (s) => s.userId === currentLearnerId && s.status === 'active'
    );

    if (subscriptionIndex === -1) {
      throw new LanguageExchangeError('没有活跃的订阅', 404);
    }

    mutableMockData.userSubscriptions[subscriptionIndex].status = 'canceled';
    mutableMockData.userSubscriptions[subscriptionIndex].autoRenew = false;
    mutableMockData.userSubscriptions[subscriptionIndex].updatedAt = new Date().toISOString();

    return { message: '订阅已取消，将在当前周期结束后失效' };
  },

  async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    await delay(100);

    const currentLearnerId = getCurrentLearnerId();
    let notifications = mutableMockData.notifications.filter(
      (n) => n.userId === currentLearnerId
    );

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    return notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    await delay(100);

    const notificationIndex = mutableMockData.notifications.findIndex(
      (n) => n.id === notificationId
    );

    if (notificationIndex === -1) {
      throw new LanguageExchangeError('通知不存在', 404);
    }

    mutableMockData.notifications[notificationIndex].read = true;

    return mutableMockData.notifications[notificationIndex];
  },

  async getLearningCalendar(
    year: number = new Date().getFullYear(),
    month: number = new Date().getMonth() + 1
  ): Promise<LearningCalendar> {
    await delay(200);

    const currentLearnerId = getCurrentLearnerId();
    const daysInMonth = new Date(year, month, 0).getDate();

    const activities: LearningActivity[] = [];
    const heatmapData: LearningCalendar['heatmapData'] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const randomActivity = Math.random() > 0.6;

      if (randomActivity) {
        const activityTypes: ('chat' | 'correction' | 'vocabulary' | 'session')[] = [];
        let intensity = 0;

        if (Math.random() > 0.5) {
          activityTypes.push('chat');
          intensity += 1;
        }
        if (Math.random() > 0.6) {
          activityTypes.push('correction');
          intensity += 1;
        }
        if (Math.random() > 0.7) {
          activityTypes.push('vocabulary');
          intensity += 1;
        }
        if (Math.random() > 0.8) {
          activityTypes.push('session');
          intensity += 2;
        }

        activities.push({
          id: uuidv4(),
          userId: currentLearnerId,
          date,
          chatMinutes: activityTypes.includes('chat') ? Math.floor(Math.random() * 120) : 0,
          correctionsMade: activityTypes.includes('correction') ? Math.floor(Math.random() * 5) : 0,
          correctionsReceived: activityTypes.includes('correction') ? Math.floor(Math.random() * 3) : 0,
          wordsLearned: activityTypes.includes('vocabulary') ? Math.floor(Math.random() * 10) : 0,
          sessionsCompleted: activityTypes.includes('session') ? 1 : 0,
          goalsMet: [],
        });

        heatmapData.push({
          date,
          intensity: Math.min(intensity, 4),
          activityTypes,
        });
      }
    }

    return {
      userId: currentLearnerId,
      year,
      month,
      activities,
      heatmapData,
    };
  },

  resetMockData(): void {
    mutableMockData = {
      users: [...mockUsers],
      matches: generateMockMatches(),
      dailyRecommendations: [],
      chatRooms: [...mockChatRooms],
      chatMessages: [...mockChatMessages],
      vocabularyItems: [],
      communityPosts: [...mockCommunityPosts],
      speakingChallenges: [...mockSpeakingChallenges],
      challengeSubmissions: [],
      peerRatings: [],
      subscriptionPlans: [...mockSubscriptionPlans],
      userSubscriptions: [],
      learningActivities: [],
      notifications: [],
      nextUserId: 6,
    };
  },
};

export { LanguageExchangeError };
