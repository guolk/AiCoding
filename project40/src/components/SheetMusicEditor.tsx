import { useState, useCallback } from 'react';
import type { SheetMusic, Measure, Note, NoteAnnotation, NotationType, ClefType, KeySignature, TimeSignature, NoteDuration, NotePitch } from '@/types';
import { generateUniqueId, createEmptyNote } from '@/utils/music';
import SheetMusicRenderer from './SheetMusicRenderer';
import Button from './Button';
import Select from './Select';
import Input from './Input';

interface SheetMusicEditorProps {
  initialSheetMusic?: SheetMusic;
  onSave?: (sheetMusic: SheetMusic) => void;
  onCancel?: () => void;
}

const CLEF_OPTIONS: { value: ClefType; label: string }[] = [
  { value: 'treble', label: '高音谱号' },
  { value: 'bass', label: '低音谱号' },
  { value: 'alto', label: '中音谱号' },
  { value: 'tenor', label: '次中音谱号' },
];

const KEY_OPTIONS: { value: KeySignature; label: string }[] = [
  { value: 'C', label: 'C大调' },
  { value: 'G', label: 'G大调 (1#)' },
  { value: 'D', label: 'D大调 (2#)' },
  { value: 'A', label: 'A大调 (3#)' },
  { value: 'E', label: 'E大调 (4#)' },
  { value: 'B', label: 'B大调 (5#)' },
  { value: 'F#', label: 'F#大调 (6#)' },
  { value: 'F', label: 'F大调 (1b)' },
  { value: 'Bb', label: 'Bb大调 (2b)' },
  { value: 'Eb', label: 'Eb大调 (3b)' },
  { value: 'Ab', label: 'Ab大调 (4b)' },
  { value: 'Db', label: 'Db大调 (5b)' },
];

const TIME_OPTIONS: { value: TimeSignature; label: string }[] = [
  { value: '4/4', label: '4/4拍' },
  { value: '3/4', label: '3/4拍' },
  { value: '2/4', label: '2/4拍' },
  { value: '6/8', label: '6/8拍' },
];

const DURATION_OPTIONS: { value: NoteDuration; label: string }[] = [
  { value: 'w', label: '全音符' },
  { value: 'h', label: '二分音符' },
  { value: 'q', label: '四分音符' },
  { value: '8', label: '八分音符' },
  { value: '16', label: '十六分音符' },
];

const PITCH_OPTIONS: { value: NotePitch; label: string }[] = [
  { value: 'C', label: 'C' }, { value: 'C#', label: 'C#' }, { value: 'Db', label: 'Db' },
  { value: 'D', label: 'D' }, { value: 'D#', label: 'D#' }, { value: 'Eb', label: 'Eb' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' }, { value: 'F#', label: 'F#' }, { value: 'Gb', label: 'Gb' },
  { value: 'G', label: 'G' }, { value: 'G#', label: 'G#' }, { value: 'Ab', label: 'Ab' },
  { value: 'A', label: 'A' }, { value: 'A#', label: 'A#' }, { value: 'Bb', label: 'Bb' },
  { value: 'B', label: 'B' },
];

export function SheetMusicEditor({ initialSheetMusic, onSave, onCancel }: SheetMusicEditorProps) {
  const [sheetMusic, setSheetMusic] = useState<SheetMusic>(() => {
    if (initialSheetMusic) return initialSheetMusic;
    return {
      id: generateUniqueId(),
      title: '新乐谱',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: 100,
      notationType: 'staff',
      measures: [
        {
          id: generateUniqueId(),
          notes: [createEmptyNote('C', 4, 'q'), createEmptyNote('D', 4, 'q'), createEmptyNote('E', 4, 'q'), createEmptyNote('F', 4, 'q')],
          annotations: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [selectedMeasureIndex, setSelectedMeasureIndex] = useState<number | null>(null);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(null);
  const [notationType, setNotationType] = useState<NotationType>('staff');
  const [activeTool, setActiveTool] = useState<'select' | 'note' | 'rest' | 'erase' | 'annotation'>('select');

  const [newNotePitch, setNewNotePitch] = useState<NotePitch>('C');
  const [newNoteOctave, setNewNoteOctave] = useState<number>(4);
  const [newNoteDuration, setNewNoteDuration] = useState<NoteDuration>('q');
  const [newNoteDotted, setNewNoteDotted] = useState<boolean>(false);

  const [annotationText, setAnnotationText] = useState('');
  const [annotationType, setAnnotationType] = useState<'finger' | 'dynamic' | 'expression' | 'text' | 'highlight'>('text');

  const updateSheetMusic = useCallback((updates: Partial<SheetMusic>) => {
    setSheetMusic(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  }, []);

  const addMeasure = useCallback(() => {
    const newMeasure: Measure = {
      id: generateUniqueId(),
      notes: [],
      annotations: [],
    };
    updateSheetMusic({
      measures: [...sheetMusic.measures, newMeasure],
    });
  }, [sheetMusic.measures, updateSheetMusic]);

  const removeMeasure = useCallback((index: number) => {
    if (sheetMusic.measures.length <= 1) return;
    const newMeasures = sheetMusic.measures.filter((_, i) => i !== index);
    updateSheetMusic({ measures: newMeasures });
    setSelectedMeasureIndex(null);
    setSelectedNoteIndex(null);
  }, [sheetMusic.measures, updateSheetMusic]);

  const addNoteToMeasure = useCallback((measureIndex: number) => {
    const newNote: Note = {
      id: generateUniqueId(),
      pitch: newNotePitch,
      octave: newNoteOctave,
      duration: newNoteDuration,
      dotted: newNoteDotted,
      rest: activeTool === 'rest',
      annotations: [],
    };

    const newMeasures = [...sheetMusic.measures];
    if (selectedNoteIndex !== null && selectedMeasureIndex === measureIndex) {
      newMeasures[measureIndex].notes.splice(selectedNoteIndex + 1, 0, newNote);
    } else {
      newMeasures[measureIndex].notes.push(newNote);
    }
    updateSheetMusic({ measures: newMeasures });
  }, [sheetMusic.measures, newNotePitch, newNoteOctave, newNoteDuration, newNoteDotted, activeTool, selectedNoteIndex, selectedMeasureIndex, updateSheetMusic]);

  const updateNote = useCallback((measureIndex: number, noteIndex: number, updates: Partial<Note>) => {
    const newMeasures = [...sheetMusic.measures];
    newMeasures[measureIndex].notes[noteIndex] = {
      ...newMeasures[measureIndex].notes[noteIndex],
      ...updates,
    };
    updateSheetMusic({ measures: newMeasures });
  }, [sheetMusic.measures, updateSheetMusic]);

  const removeNote = useCallback((measureIndex: number, noteIndex: number) => {
    const newMeasures = [...sheetMusic.measures];
    newMeasures[measureIndex].notes.splice(noteIndex, 1);
    updateSheetMusic({ measures: newMeasures });
    if (selectedNoteIndex === noteIndex && selectedMeasureIndex === measureIndex) {
      setSelectedNoteIndex(null);
    }
  }, [sheetMusic.measures, selectedNoteIndex, selectedMeasureIndex, updateSheetMusic]);

  const addAnnotation = useCallback((measureIndex: number, noteIndex: number) => {
    if (!annotationText.trim()) return;
    
    const annotation: NoteAnnotation = {
      id: generateUniqueId(),
      type: annotationType,
      value: annotationText,
      position: 'above',
    };

    const newMeasures = [...sheetMusic.measures];
    const note = newMeasures[measureIndex].notes[noteIndex];
    note.annotations = [...(note.annotations || []), annotation];
    updateSheetMusic({ measures: newMeasures });
    setAnnotationText('');
  }, [annotationText, annotationType, sheetMusic.measures, updateSheetMusic]);

  const highlightMeasure = useCallback((measureIndex: number) => {
    const newMeasures = [...sheetMusic.measures];
    newMeasures[measureIndex].isHighlighted = !newMeasures[measureIndex].isHighlighted;
    newMeasures[measureIndex].highlightColor = newMeasures[measureIndex].isHighlighted ? '#FFD700' : undefined;
    updateSheetMusic({ measures: newMeasures });
  }, [sheetMusic.measures, updateSheetMusic]);

  const handleSave = useCallback(() => {
    onSave?.(sheetMusic);
  }, [sheetMusic, onSave]);

  const selectedNote = selectedMeasureIndex !== null && selectedNoteIndex !== null
    ? sheetMusic.measures[selectedMeasureIndex]?.notes[selectedNoteIndex]
    : null;

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg">
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={sheetMusic.title}
              onChange={(e) => updateSheetMusic({ title: e.target.value })}
              placeholder="乐谱标题"
              className="w-48"
            />
            <Select
              value={notationType}
              onChange={(e) => setNotationType(e.target.value as NotationType)}
              options={[
                { value: 'staff', label: '五线谱' },
                { value: 'jianpu', label: '简谱' },
              ]}
              className="w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                取消
              </Button>
            )}
            <Button onClick={handleSave}>
              保存乐谱
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">谱号:</label>
            <Select
              value={sheetMusic.clef}
              onChange={(e) => updateSheetMusic({ clef: e.target.value as ClefType })}
              options={CLEF_OPTIONS}
              className="w-28"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">调号:</label>
            <Select
              value={sheetMusic.keySignature}
              onChange={(e) => updateSheetMusic({ keySignature: e.target.value as KeySignature })}
              options={KEY_OPTIONS}
              className="w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">拍号:</label>
            <Select
              value={sheetMusic.timeSignature}
              onChange={(e) => updateSheetMusic({ timeSignature: e.target.value as TimeSignature })}
              options={TIME_OPTIONS}
              className="w-28"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">速度:</label>
            <Input
              type="number"
              value={sheetMusic.tempo}
              onChange={(e) => updateSheetMusic({ tempo: parseInt(e.target.value) || 100 })}
              min={20}
              max={240}
              className="w-20"
            />
            <span className="text-sm text-gray-500">BPM</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">工具栏</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { tool: 'select' as const, label: '选择', icon: '↖' },
              { tool: 'note' as const, label: '音符', icon: '♪' },
              { tool: 'rest' as const, label: '休止符', icon: '▮' },
              { tool: 'erase' as const, label: '擦除', icon: '⌫' },
            ].map(({ tool, label, icon }) => (
              <Button
                key={tool}
                variant={activeTool === tool ? 'primary' : 'secondary'}
                onClick={() => setActiveTool(tool)}
                className="flex flex-col items-center py-2"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">音符设置</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">音高</label>
                <Select
                  value={selectedNote?.pitch || newNotePitch}
                  onChange={(e) => {
                    const pitch = e.target.value as NotePitch;
                    setNewNotePitch(pitch);
                    if (selectedNote && selectedMeasureIndex !== null && selectedNoteIndex !== null) {
                      updateNote(selectedMeasureIndex, selectedNoteIndex, { pitch });
                    }
                  }}
                  options={PITCH_OPTIONS}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block mb-1">八度</label>
                <Select
                  value={selectedNote?.octave.toString() || newNoteOctave.toString()}
                  onChange={(e) => {
                    const octave = parseInt(e.target.value);
                    setNewNoteOctave(octave);
                    if (selectedNote && selectedMeasureIndex !== null && selectedNoteIndex !== null) {
                      updateNote(selectedMeasureIndex, selectedNoteIndex, { octave });
                    }
                  }}
                  options={[3, 4, 5, 6, 7].map(n => ({ value: n.toString(), label: `${n}` }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block mb-1">时值</label>
                <Select
                  value={selectedNote?.duration || newNoteDuration}
                  onChange={(e) => {
                    const duration = e.target.value as NoteDuration;
                    setNewNoteDuration(duration);
                    if (selectedNote && selectedMeasureIndex !== null && selectedNoteIndex !== null) {
                      updateNote(selectedMeasureIndex, selectedNoteIndex, { duration });
                    }
                  }}
                  options={DURATION_OPTIONS}
                  className="w-full"
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedNote?.dotted ?? newNoteDotted}
                  onChange={(e) => {
                    const dotted = e.target.checked;
                    setNewNoteDotted(dotted);
                    if (selectedNote && selectedMeasureIndex !== null && selectedNoteIndex !== null) {
                      updateNote(selectedMeasureIndex, selectedNoteIndex, { dotted });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">附点音符</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">添加标注</h4>
            
            <div className="space-y-2">
              <Select
                value={annotationType}
                onChange={(e) => setAnnotationType(e.target.value as typeof annotationType)}
                options={[
                  { value: 'text', label: '文本' },
                  { value: 'finger', label: '指法' },
                  { value: 'dynamic', label: '力度' },
                  { value: 'expression', label: '表情' },
                  { value: 'highlight', label: '高亮' },
                ]}
                className="w-full"
              />
              <Input
                type="text"
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="标注内容..."
                className="w-full"
              />
              {selectedNote && selectedMeasureIndex !== null && selectedNoteIndex !== null && (
                <Button
                  variant="secondary"
                  onClick={() => addAnnotation(selectedMeasureIndex, selectedNoteIndex)}
                  className="w-full"
                  disabled={!annotationText.trim()}
                >
                  添加到选中音符
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="secondary" onClick={addMeasure}>
              + 添加小节
            </Button>
            {selectedMeasureIndex !== null && (
              <Button
                variant="secondary"
                onClick={() => addNoteToMeasure(selectedMeasureIndex)}
                disabled={activeTool !== 'note' && activeTool !== 'rest'}
              >
                添加{activeTool === 'rest' ? '休止符' : '音符'}到选中小节
              </Button>
            )}
            {selectedMeasureIndex !== null && sheetMusic.measures.length > 1 && (
              <Button variant="danger" onClick={() => removeMeasure(selectedMeasureIndex)}>
                删除选中小节
              </Button>
            )}
            {selectedMeasureIndex !== null && (
              <Button
                variant="secondary"
                onClick={() => highlightMeasure(selectedMeasureIndex)}
              >
                {sheetMusic.measures[selectedMeasureIndex]?.isHighlighted ? '取消高亮' : '标记重点小节'}
              </Button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-h-96">
            <SheetMusicRenderer
              sheetMusic={sheetMusic}
              notationType={notationType}
              width={Math.max(800, window.innerWidth - 400)}
              height={400}
              highlightMeasures={sheetMusic.measures
                .map((m, i) => m.isHighlighted ? i : -1)
                .filter(i => i >= 0)}
            />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">小节列表</h4>
            <div className="flex gap-2 flex-wrap">
              {sheetMusic.measures.map((measure, index) => (
                <button
                  key={measure.id}
                  onClick={() => setSelectedMeasureIndex(selectedMeasureIndex === index ? null : index)}
                  className={`px-3 py-2 rounded border text-sm ${
                    selectedMeasureIndex === index
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : measure.isHighlighted
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  小节 {index + 1} ({measure.notes.length}个音符)
                </button>
              ))}
            </div>
          </div>

          {selectedMeasureIndex !== null && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                小节 {selectedMeasureIndex + 1} - 音符列表
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {sheetMusic.measures[selectedMeasureIndex]?.notes.map((note, noteIndex) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteIndex(selectedNoteIndex === noteIndex ? null : noteIndex);
                      if (activeTool === 'erase') {
                        removeNote(selectedMeasureIndex, noteIndex);
                      }
                    }}
                    className={`px-3 py-2 rounded border text-sm text-left ${
                      selectedNoteIndex === noteIndex
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {note.rest ? '休止符' : `${note.pitch}${note.octave}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      时值: {note.duration}{note.dotted ? '.' : ''}
                      {note.annotations && note.annotations.length > 0 && (
                        <span className="ml-2">标注: {note.annotations.length}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedNoteIndex !== null && (
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeNote(selectedMeasureIndex, selectedNoteIndex)}
                  >
                    删除选中音符
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SheetMusicEditor;
