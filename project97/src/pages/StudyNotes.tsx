import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Lightbulb, Trophy, Trash2, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { NoteTypeBadge } from '../components/common/TopicBadge';
import { useNoteStore } from '../stores/noteStore';
import type { NoteType } from '../types';

const noteTypes: { value: NoteType | 'all'; label: string; icon: typeof FileText }[] = [
  { value: 'all', label: '全部', icon: FileText },
  { value: 'knowledge', label: '知识梳理', icon: FileText },
  { value: 'method', label: '方法归纳', icon: Lightbulb },
  { value: 'experience', label: '参赛感悟', icon: Trophy },
];

export function StudyNotes() {
  const navigate = useNavigate();
  const { notes, deleteNote } = useNoteStore();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');

  const filterNotes = notes.filter((note) => {
    const lowerSearch = searchText.toLowerCase().trim();
    const matchesSearch = lowerSearch === '' ||
      note.title.toLowerCase().includes(lowerSearch) ||
      note.content.toLowerCase().includes(lowerSearch) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerSearch));

    const matchesType = filterType === 'all' || note.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇笔记吗？')) {
      deleteNote(id);
    }
  };

  const getTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'knowledge':
        return <FileText className="w-5 h-5" />;
      case 'method':
        return <Lightbulb className="w-5 h-5" />;
      case 'experience':
        return <Trophy className="w-5 h-5" />;
    }
  };

  const typeColors = {
    knowledge: 'bg-primary/10 text-primary',
    method: 'bg-success/10 text-success',
    experience: 'bg-yellow-500/10 text-yellow-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">学习笔记</h1>
          <p className="text-text-secondary mt-1">共 {notes.length} 篇笔记</p>
        </div>
        <Link to="/notes/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            新建笔记
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="搜索笔记标题、内容或标签..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-card rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {noteTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                filterType === type.value
                  ? 'bg-primary text-white'
                  : 'bg-background-card hover:bg-background-hover text-text-secondary'
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterNotes.length > 0 ? (
          filterNotes.map((note) => (
            <Card key={note.id} hover onClick={() => navigate(`/notes/${note.id}`)}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${typeColors[note.type]}`}>
                    {getTypeIcon(note.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <NoteTypeBadge type={note.type} />
                  </div>
                </div>

                <h3 className="font-semibold text-text-primary">{note.title}</h3>

                <p className="text-sm text-text-secondary line-clamp-3">
                  {note.content.replace(/[#*`]/g, '').substring(0, 100)}...
                </p>

                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-background-hover rounded text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-background-hover">
                  <span className="text-xs text-text-muted">
                    {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/notes/${note.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-primary font-medium">
                {searchText || filterType !== 'all' ? '没有找到符合条件的笔记' : '暂无笔记，点击新建笔记开始记录'}
              </p>
              {searchText || filterType !== 'all' ? (
                <p className="text-text-secondary text-sm mt-2">
                  尝试修改搜索条件或清除筛选
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
