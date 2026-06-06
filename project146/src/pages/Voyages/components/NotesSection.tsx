interface NotesSectionProps {
  notes: string;
  onChange: (field: string, value: string) => void;
}

export default function NotesSection({ notes, onChange }: NotesSectionProps) {
  return (
    <div className="card p-6">
      <h2 className="section-title">航行笔记</h2>
      <textarea
        value={notes}
        onChange={(e) => onChange('notes', e.target.value)}
        placeholder="记录航行中的体验、见闻、注意事项等..."
        rows={5}
        className="input-field resize-none"
      />
    </div>
  );
}
