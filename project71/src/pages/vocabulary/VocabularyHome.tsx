import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Layers, PenTool, ChevronRight, Star, BookMarked, Zap } from 'lucide-react'
import { vocabularyWords, phrases } from '../../data/mockData'

const modules = [
  {
    id: 'words',
    title: '词汇收藏',
    description: '收藏对话中遇到的新单词，随时复习巩固',
    icon: Heart,
    path: '/vocabulary/words',
    gradient: 'from-rose-400 to-rose-600',
    count: vocabularyWords.length
  },
  {
    id: 'phrases',
    title: '表达归类',
    description: '按正式/非正式/书面/口语风格分类整理常用表达',
    icon: Layers,
    path: '/vocabulary/phrases',
    gradient: 'from-purple-400 to-purple-600',
    count: phrases.length
  },
  {
    id: 'collocations',
    title: '搭配练习',
    description: '填空练习常用搭配的使用，强化记忆',
    icon: PenTool,
    path: '/vocabulary/collocations',
    gradient: 'from-indigo-400 to-indigo-600',
    count: 8
  }
]

const styleCategories = [
  { id: 'formal', name: '正式', color: 'bg-blue-500', description: '商务、学术场合' },
  { id: 'informal', name: '非正式', color: 'bg-green-500', description: '日常对话' },
  { id: 'written', name: '书面', color: 'bg-purple-500', description: '文章、邮件' },
  { id: 'spoken', name: '口语', color: 'bg-amber-500', description: '口头表达' }
]

export const VocabularyHome: React.FC = () => {
  const favoriteCount = vocabularyWords.filter(w => w.isFavorite).length
  const favoritePhrasesCount = phrases.filter(p => p.isFavorite).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">词汇积累</h1>
          <p className="text-gray-500 mt-1">收藏、归类、练习，高效扩充词汇量</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">总词汇</p>
            <p className="text-2xl font-bold text-gray-800">{vocabularyWords.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Star className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">收藏词汇</p>
            <p className="text-2xl font-bold text-gray-800">{favoriteCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
            <BookMarked className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">常用表达</p>
            <p className="text-2xl font-bold text-gray-800">{phrases.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">收藏表达</p>
            <p className="text-2xl font-bold text-gray-800">{favoritePhrasesCount}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">表达风格分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {styleCategories.map(cat => {
            const wordCount = vocabularyWords.filter(w => w.category === cat.id).length
            const phraseCount = phrases.filter(p => p.style === cat.id).length
            return (
              <div key={cat.id} className="p-4 rounded-xl border-2 border-gray-100 hover:border-primary-200 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-3 h-3 ${cat.color} rounded-full`} />
                  <span className="font-semibold text-gray-800">{cat.name}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xl font-bold text-gray-800">{wordCount}</p>
                    <p className="text-xs text-gray-500">单词</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">{phraseCount}</p>
                    <p className="text-xs text-gray-500">表达</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map(module => {
          const Icon = module.icon
          return (
            <Link
              key={module.id}
              to={module.path}
              className="card card-hover group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">{module.title}</h3>
                <span className="badge badge-primary">{module.count} 个</span>
              </div>
              <p className="text-gray-500 text-sm mb-4">{module.description}</p>
              <span className="text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                开始学习 <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          )
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">今日推荐单词</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vocabularyWords.slice(0, 4).map(word => (
            <div key={word.id} className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{word.word}</h4>
                  <p className="text-xs text-gray-500">{word.phonetic}</p>
                </div>
                {word.isFavorite && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">{word.meaning}</p>
              <p className="text-xs text-gray-500 italic">"{word.example}"</p>
              <div className="mt-3">
                <span className={`badge ${
                  word.category === 'formal' ? 'bg-blue-100 text-blue-700' :
                  word.category === 'informal' ? 'bg-green-100 text-green-700' :
                  word.category === 'written' ? 'bg-purple-100 text-purple-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {word.category === 'formal' ? '正式' :
                   word.category === 'informal' ? '非正式' :
                   word.category === 'written' ? '书面' : '口语'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
