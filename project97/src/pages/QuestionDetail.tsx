import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { TopicBadge } from '../components/common/TopicBadge';
import { LatexRenderer } from '../components/common/LatexRenderer';
import { useQuestionStore } from '../stores/questionStore';
import { useWrongNoteStore } from '../stores/wrongNoteStore';

export function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuestion, deleteQuestion } = useQuestionStore();
  const { wrongNotes, addWrongNote } = useWrongNoteStore();

  const question = getQuestion(id!);

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">题目不存在</p>
        <Link to="/questions" className="mt-4 inline-block">
          <Button variant="secondary">返回题目库</Button>
        </Link>
      </div>
    );
  }

  const wrongNote = wrongNotes.find((n) => n.questionId === question.id);

  const handleDelete = () => {
    if (confirm('确定要删除这道题目吗？')) {
      deleteQuestion(question.id);
      navigate('/questions');
    }
  };

  const handleMarkCorrect = () => {
    if (wrongNote) return;
    addWrongNote({
      questionId: question.id,
      errorReason: 'careless',
      errorReasonText: '答题时粗心导致错误',
      correctSolution: '',
    });
  };

  const handleMarkWrong = () => {
    if (wrongNote) return;
    addWrongNote({
      questionId: question.id,
      errorReason: 'approach',
      errorReasonText: '',
      correctSolution: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/questions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <TopicBadge topic={question.topic} />
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="text-sm text-text-muted">{question.source}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/questions/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>题目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg font-mono leading-relaxed">
              <LatexRenderer latex={question.content} />
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>知识点标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {question.knowledgeTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>解题方法 ({question.solutions.length})</CardTitle>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              添加解法
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {question.solutions.length === 0 ? (
            <p className="text-text-muted text-center py-8">暂无解法</p>
          ) : (
            <div className="space-y-6">
              {question.solutions.map((solution, index) => (
                <div key={solution.id} className="p-4 bg-background-hover rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-lg font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-text-primary">{solution.method}</h4>
                      <p className="text-sm text-text-muted">{solution.applicableTo}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">思路分析</p>
                      <p className="text-text-primary">{solution.idea}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">详细步骤</p>
                      <p className="text-text-primary font-mono text-sm">
                        <LatexRenderer latex={solution.content} />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>答题练习</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="success"
              onClick={handleMarkCorrect}
              disabled={!!wrongNote}
              className="flex-1"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              正确
            </Button>
            <Button
              variant="danger"
              onClick={handleMarkWrong}
              disabled={!!wrongNote}
              className="flex-1"
            >
              <XCircle className="w-5 h-5 mr-2" />
              错误
            </Button>
          </div>
          {wrongNote && (
            <p className="mt-3 text-sm text-text-muted text-center">
              已加入错题本，可在错题本中查看详情
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
