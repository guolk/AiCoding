import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Image, Link, Mic, FileText, Tag } from 'lucide-react';
import { useAppStore } from '@/store';
import { IDEA_SOURCES, IDEA_EMOTIONS, type IdeaSource, type IdeaEmotion, type MediaAttachment } from '@/types';
import { generateId } from '@/lib/utils';

interface IdeaCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdeaCaptureDialog({ open, onOpenChange }: IdeaCaptureDialogProps) {
  const addIdea = useAppStore(state => state.addIdea);
  const tags = useAppStore(state => state.tags);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<IdeaSource>('other');
  const [emotion, setEmotion] = useState<IdeaEmotion>('neutral');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [linkUrl, setLinkUrl] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSource('other');
    setEmotion('neutral');
    setSelectedTags([]);
    setNewTag('');
    setMedia([]);
    setLinkUrl('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    addIdea({
      title: title.trim(),
      description: description.trim(),
      source,
      emotion,
      tags: selectedTags,
      media
    });
    
    resetForm();
    onOpenChange(false);
  };

  const addNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleLinkAdd = () => {
    if (linkUrl.trim()) {
      setMedia([...media, {
        id: generateId(),
        type: 'link',
        url: linkUrl.trim(),
        name: linkUrl.trim()
      }]);
      setLinkUrl('');
    }
  };

  const removeMedia = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
  };

  const availableTags = tags.filter(t => !selectedTags.includes(t.name));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">捕捉新灵感 ✨</DialogTitle>
          <DialogDescription>
            快速记录你的灵感，随时补充更多细节
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">灵感标题 *</label>
            <Input
              placeholder="用一句话描述这个灵感..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">详细描述</label>
            <Textarea
              placeholder="这个灵感是什么？为什么它让你感兴趣？"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">灵感来源</label>
            <div className="flex flex-wrap gap-2">
              {IDEA_SOURCES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSource(s.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    source === s.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">当时的感受</label>
            <div className="flex flex-wrap gap-2">
              {IDEA_EMOTIONS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEmotion(e.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    emotion === e.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="输入新标签或选择已有..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
              />
              <Button onClick={addNewTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTags([...selectedTags, tag.name])}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    + {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">多媒体附件</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setMedia([...media, {
                    id: generateId(),
                    type: 'text',
                    url: '',
                    name: '文本笔记'
                  }]);
                }}
              >
                <FileText className="w-4 h-4" />
                添加文本
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setMedia([...media, {
                          id: generateId(),
                          type: 'image',
                          url: event.target?.result as string,
                          name: file.name
                        }]);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
              >
                <Image className="w-4 h-4" />
                添加图片
              </Button>
              <div className="col-span-2 flex gap-2">
                <Input
                  placeholder="粘贴链接 URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLinkAdd())}
                />
                <Button onClick={handleLinkAdd} type="button" variant="outline">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {media.length > 0 && (
              <div className="space-y-2 mt-3">
                {media.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {m.type === 'image' && <Image className="w-4 h-4 text-blue-500" />}
                      {m.type === 'link' && <Link className="w-4 h-4 text-green-500" />}
                      {m.type === 'text' && <FileText className="w-4 h-4 text-purple-500" />}
                      {m.type === 'voice' && <Mic className="w-4 h-4 text-red-500" />}
                      <span className="text-sm truncate max-w-xs">{m.name}</span>
                    </div>
                    <button onClick={() => removeMedia(m.id)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()} className="gradient">
            保存灵感
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
