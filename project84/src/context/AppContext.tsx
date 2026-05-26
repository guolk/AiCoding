import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, Question, Answer, Tag, DailyChallenge, QuizQuestion, KnowledgeArea } from '../types'
import { mockUser, mockQuestions, mockAnswers, tags, mockDailyChallenges, mockQuizHistory, mockKnowledgeAreas, mockBadges, levelConfig, mockPointsHistory, otherUsers } from '../data/mockData'

interface AppContextType {
  currentUser: User
  questions: Question[]
  answers: Answer[]
  allTags: Tag[]
  dailyChallenges: DailyChallenge[]
  quizHistory: QuizQuestion[]
  knowledgeAreas: KnowledgeArea[]
  pointsHistory: typeof mockPointsHistory
  addQuestion: (question: Omit<Question, 'id' | 'authorId' | 'author' | 'createdAt' | 'updatedAt' | 'voteCount' | 'answerCount' | 'viewCount' | 'hasAcceptedAnswer'>) => void
  addAnswer: (questionId: string, content: string) => void
  voteQuestion: (questionId: string, value: 1 | -1) => void
  voteAnswer: (answerId: string, value: 1 | -1) => void
  acceptAnswer: (questionId: string, answerId: string) => void
  followTag: (tagId: string) => void
  unfollowTag: (tagId: string) => void
  completeDailyChallenge: (challengeId: string, isCorrect: boolean) => void
  getQuestionsByTag: (tagId: string) => Question[]
  getQuestionsByCategory: (category: string) => Question[]
  getAnswersByQuestion: (questionId: string) => Answer[]
  getQuestionsByUser: (userId: string) => Question[]
  getAnswersByUser: (userId: string) => Answer[]
  getTagById: (tagId: string) => Tag | undefined
  getLevelInfo: (level: number) => { name: string; minPoints: number; icon: string } | undefined
  getNextLevelPoints: (currentLevel: number) => number
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(mockUser)
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [answers, setAnswers] = useState<Answer[]>(mockAnswers)
  const [allTags] = useState<Tag[]>(tags)
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(mockDailyChallenges)
  const [quizHistory] = useState<QuizQuestion[]>(mockQuizHistory)
  const [knowledgeAreas] = useState<KnowledgeArea[]>(mockKnowledgeAreas)
  const [pointsHistory] = useState(mockPointsHistory)

  const addQuestion = useCallback((q: Omit<Question, 'id' | 'authorId' | 'author' | 'createdAt' | 'updatedAt' | 'voteCount' | 'answerCount' | 'viewCount' | 'hasAcceptedAnswer'>) => {
    const newQuestion: Question = {
      ...q,
      id: `q-${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      voteCount: 0,
      answerCount: 0,
      viewCount: 0,
      hasAcceptedAnswer: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setQuestions(prev => [newQuestion, ...prev])
    setCurrentUser(prev => ({ ...prev, questionsAsked: prev.questionsAsked + 1 }))
  }, [currentUser])

  const addAnswer = useCallback((questionId: string, content: string) => {
    const newAnswer: Answer = {
      id: `a-${Date.now()}`,
      questionId,
      content,
      authorId: currentUser.id,
      author: currentUser,
      voteCount: 0,
      isAccepted: false,
      isBestAnswer: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setAnswers(prev => [...prev, newAnswer])
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answerCount: q.answerCount + 1, updatedAt: new Date() } : q))
    setCurrentUser(prev => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1, points: prev.points + 10, totalPoints: prev.totalPoints + 10 }))
  }, [currentUser])

  const voteQuestion = useCallback((questionId: string, value: 1 | -1) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, voteCount: q.voteCount + value } : q))
  }, [])

  const voteAnswer = useCallback((answerId: string, value: 1 | -1) => {
    setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, voteCount: a.voteCount + value } : a))
  }, [])

  const acceptAnswer = useCallback((questionId: string, answerId: string) => {
    setAnswers(prev => prev.map(a => {
      if (a.questionId === questionId) {
        return { ...a, isAccepted: a.id === answerId, isBestAnswer: a.id === answerId }
      }
      return a
    }))
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, hasAcceptedAnswer: true, updatedAt: new Date() } : q))

    const acceptedAnswer = answers.find(a => a.id === answerId)
    if (acceptedAnswer && acceptedAnswer.authorId === currentUser.id) {
      setCurrentUser(prev => ({ ...prev, acceptedAnswers: prev.acceptedAnswers + 1, helpedUsers: prev.helpedUsers + 1, points: prev.points + 50, totalPoints: prev.totalPoints + 50 }))
    }
  }, [answers, currentUser.id])

  const followTag = useCallback((tagId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      followedTags: [...prev.followedTags, tagId],
    }))
  }, [])

  const unfollowTag = useCallback((tagId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      followedTags: prev.followedTags.filter(id => id !== tagId),
    }))
  }, [])

  const completeDailyChallenge = useCallback((challengeId: string, isCorrect: boolean) => {
    setDailyChallenges(prev => prev.map(dc => dc.id === challengeId ? { ...dc, isCompleted: true, isCorrect } : dc))
    if (isCorrect) {
      setCurrentUser(prev => ({ ...prev, points: prev.points + 30, totalPoints: prev.totalPoints + 30 }))
    } else {
      setCurrentUser(prev => ({ ...prev, points: prev.points + 5, totalPoints: prev.totalPoints + 5 }))
    }
  }, [])

  const getQuestionsByTag = useCallback((tagId: string) => {
    return questions.filter(q => q.tags.includes(tagId))
  }, [questions])

  const getQuestionsByCategory = useCallback((category: string) => {
    return questions.filter(q => q.category === category)
  }, [questions])

  const getAnswersByQuestion = useCallback((questionId: string) => {
    return answers.filter(a => a.questionId === questionId)
  }, [answers])

  const getQuestionsByUser = useCallback((userId: string) => {
    return questions.filter(q => q.authorId === userId)
  }, [questions])

  const getAnswersByUser = useCallback((userId: string) => {
    return answers.filter(a => a.authorId === userId)
  }, [answers])

  const getTagById = useCallback((tagId: string) => {
    return allTags.find(t => t.id === tagId)
  }, [allTags])

  const getLevelInfo = useCallback((level: number) => {
    return levelConfig[level as keyof typeof levelConfig]
  }, [])

  const getNextLevelPoints = useCallback((currentLevel: number) => {
    const nextLevel = levelConfig[(currentLevel + 1) as keyof typeof levelConfig]
    return nextLevel ? nextLevel.minPoints : currentLevel * 1000
  }, [])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        questions,
        answers,
        allTags,
        dailyChallenges,
        quizHistory,
        knowledgeAreas,
        pointsHistory,
        addQuestion,
        addAnswer,
        voteQuestion,
        voteAnswer,
        acceptAnswer,
        followTag,
        unfollowTag,
        completeDailyChallenge,
        getQuestionsByTag,
        getQuestionsByCategory,
        getAnswersByQuestion,
        getQuestionsByUser,
        getAnswersByUser,
        getTagById,
        getLevelInfo,
        getNextLevelPoints,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
