from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class QuestionType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"
    PROGRAMMING = "programming"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


class ExamStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    IN_PROGRESS = "in_progress"
    ENDED = "ended"
    ARCHIVED = "archived"


class SubmissionStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    GRADED = "graded"


class QuestionBase(BaseModel):
    title: str = Field(..., description="题目内容，支持富文本")
    type: QuestionType = Field(..., description="题目类型")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.MEDIUM, description="难度")
    tags: List[str] = Field(default=[], description="标签列表")
    score: float = Field(default=1.0, description="默认分值")
    explanation: Optional[str] = Field(None, description="答案解析")
    knowledge_points: List[str] = Field(default=[], description="知识点列表")


class SingleChoiceData(BaseModel):
    options: List[str] = Field(..., description="选项列表")
    correct_answer: int = Field(..., description="正确选项索引")


class MultipleChoiceData(BaseModel):
    options: List[str] = Field(..., description="选项列表")
    correct_answers: List[int] = Field(..., description="正确选项索引列表")


class TrueFalseData(BaseModel):
    correct_answer: bool = Field(..., description="正确答案")


class FillBlankData(BaseModel):
    blanks: List[Dict[str, Any]] = Field(..., description="填空列表，包含答案和可选的提示")


class ShortAnswerData(BaseModel):
    reference_answer: Optional[str] = Field(None, description="参考答案")


class ProgrammingData(BaseModel):
    language: str = Field(default="python", description="编程语言")
    template_code: Optional[str] = Field(None, description="代码模板")
    test_cases: List[Dict[str, Any]] = Field(..., description="测试用例列表")
    time_limit: int = Field(default=5000, description="时间限制(ms)")
    memory_limit: int = Field(default=256, description="内存限制(MB)")


class QuestionCreate(QuestionBase):
    question_data: Dict[str, Any] = Field(..., description="题目特定数据")


class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[QuestionType] = None
    difficulty: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None
    score: Optional[float] = None
    explanation: Optional[str] = None
    knowledge_points: Optional[List[str]] = None
    question_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class QuestionResponse(QuestionBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    is_active: bool
    question_data: Dict[str, Any]

    class Config:
        from_attributes = True


class PaperMode(str, Enum):
    MANUAL = "manual"
    RANDOM = "random"


class PaperQuestionItem(BaseModel):
    question_id: int
    score: Optional[float] = None


class RandomRule(BaseModel):
    question_type: QuestionType
    count: int
    difficulty: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None
    score_per_question: float = 1.0


class PaperCreate(BaseModel):
    title: str = Field(..., description="试卷标题")
    description: Optional[str] = Field(None, description="试卷描述")
    mode: PaperMode = Field(default=PaperMode.MANUAL, description="组卷模式")
    questions: Optional[List[PaperQuestionItem]] = Field(None, description="手动选题列表")
    random_rules: Optional[List[RandomRule]] = Field(None, description="随机抽题规则")
    total_score: Optional[float] = Field(None, description="总分")
    tags: List[str] = Field(default=[], description="试卷标签")


class PaperResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    mode: PaperMode
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    total_score: float
    question_count: int
    tags: List[str]
    is_active: bool

    class Config:
        from_attributes = True


class PaperDetailResponse(PaperResponse):
    questions: List[Dict[str, Any]]


class ExamCreate(BaseModel):
    title: str = Field(..., description="考试标题")
    paper_id: int = Field(..., description="关联试卷ID")
    start_time: datetime = Field(..., description="开始时间")
    end_time: datetime = Field(..., description="结束时间")
    duration: int = Field(..., description="考试时长(分钟)")
    allowed_users: Optional[List[int]] = Field(None, description="允许参加的用户ID列表")
    allowed_roles: Optional[List[UserRole]] = Field(None, description="允许参加的角色列表")
    shuffle_questions: bool = Field(default=False, description="题目随机顺序")
    shuffle_options: bool = Field(default=False, description="选项随机顺序")
    allow_late_submit: bool = Field(default=False, description="允许迟到提交")
    auto_submit: bool = Field(default=True, description="自动提交")
    anti_cheat_enabled: bool = Field(default=True, description="启用防作弊")
    max_tab_switch_count: int = Field(default=3, description="最大切换标签页次数")


class ExamResponse(BaseModel):
    id: int
    title: str
    paper_id: int
    creator_id: int
    start_time: datetime
    end_time: datetime
    duration: int
    status: ExamStatus
    shuffle_questions: bool
    shuffle_options: bool
    anti_cheat_enabled: bool
    max_tab_switch_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ExamForStudentResponse(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: datetime
    duration: int
    status: ExamStatus
    paper_title: str
    total_score: float

    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    question_id: int
    answer: Any = Field(..., description="答案内容")


class DraftSave(BaseModel):
    answers: List[AnswerSubmit] = Field(..., description="草稿答案列表")


class SubmissionResponse(BaseModel):
    id: int
    exam_id: int
    user_id: int
    status: SubmissionStatus
    total_score: Optional[float]
    submitted_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class QuestionResult(BaseModel):
    question_id: int
    question_type: QuestionType
    score: float
    max_score: float
    is_correct: Optional[bool]
    user_answer: Any
    correct_answer: Optional[Any]
    manual_comment: Optional[str] = None


class SubmissionDetailResponse(SubmissionResponse):
    results: List[QuestionResult]


class ManualGrading(BaseModel):
    submission_id: int
    question_id: int
    score: float = Field(..., ge=0, description="给分")
    comment: Optional[str] = Field(None, description="评语")


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    real_name: Optional[str] = Field(None, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    role: UserRole = Field(default=UserRole.STUDENT)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ScoreDistribution(BaseModel):
    range: str
    count: int


class QuestionStats(BaseModel):
    question_id: int
    question_title: str
    correct_rate: float
    avg_score: float
    total_attempts: int


class KnowledgePointStats(BaseModel):
    name: str
    correct_rate: float
    total_questions: int
    avg_score: float


class ExamAnalytics(BaseModel):
    exam_id: int
    exam_title: str
    total_submissions: int
    avg_score: float
    max_score: float
    min_score: float
    pass_rate: float
    score_distribution: List[ScoreDistribution]
    question_stats: List[QuestionStats]
    knowledge_stats: List[KnowledgePointStats]


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
