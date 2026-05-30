import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import type { Task } from '../types';
import { useUserStore } from '../stores/useUserStore';
import DifficultyBadge from './DifficultyBadge';
import TaskTypeBadge from './TaskTypeBadge';

interface Props {
  task: Task;
  onComplete?: (taskId: string) => void;
  onClick?: () => void;
}

export default function TaskCard({ task, onComplete, onClick }: Props) {
  const { getUserById } = useUserStore();
  const assignee = getUserById(task.assignedTo);

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  return (
    <div
      onClick={onClick}
      className={`card-hover cursor-pointer relative overflow-hidden ${
        isCompleted ? 'opacity-70' : ''
      }`}
    >
      {isCompleted && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          已完成
        </div>
      )}
      
      {isInProgress && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold animate-pulse">
          进行中
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="text-4xl p-3 bg-gradient-warm rounded-2xl shadow-md">
          {task.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <TaskTypeBadge type={task.type} />
            <DifficultyBadge difficulty={task.difficulty} size="sm" />
          </div>
          <h3 className={`font-semibold text-lg mb-1 ${isCompleted ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
            {task.name}
          </h3>
          <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
            {task.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-primary-600 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>+{task.expReward} EXP</span>
              </div>
              <div className="flex items-center gap-1 text-secondary-600 font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>+{task.coinReward}</span>
              </div>
            </div>
            
            {assignee && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{assignee.avatarUrl}</span>
                <span className="text-sm text-neutral-500 hidden sm:inline">
                  {assignee.roleName}
                </span>
              </div>
            )}
          </div>

          {onComplete && !isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              className="mt-4 w-full btn-secondary text-sm py-2"
            >
              ✅ 标记完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
