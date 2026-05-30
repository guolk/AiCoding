# 在线古典音乐欣赏和作品收藏管理工具 - 技术架构

## 1. Architecture Design

```mermaid
graph TB
    subgraph Frontend["前端 (React + Vite)"]
        A1["Pages (页面组件)"]
        A2["Components (通用组件)"]
        A3["State Management (Zustand)"]
        A4["Router (React Router)"]
        A5["API Service (Axios/fetch)"]
    end
    
    subgraph Backend["后端 (Express)"]
        B1["Controllers (控制器)"]
        B2["Services (业务逻辑)"]
        B3["MusicBrainz API Service"]
    end
    
    subgraph Data["数据存储"]
        C1["LocalStorage (本地存储)"]
        C2["JSON File Storage (后端存储)"]
    end
    
    subgraph External["外部服务"]
        D1["MusicBrainz API (作品信息)"]
    end
    
    A4 --> A1
    A1 --> A2
    A1 --> A3
    A5 --> B1
    B1 --> B2
    B2 --> C2
    B2 --> D1
    A3 --> C1
```

## 2. Technology Description

- **Frontend**: React@18 + TypeScript + tailwindcss@3 + vite
- **Initialization Tool**: vite-init with `react-express-ts` template
- **Backend**: Express@4 + TypeScript
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: lucide-react
- **Data Storage**: LocalStorage (前端) + JSON File (后端)
- **External API**: MusicBrainz API

## 3. Route Definitions

| Route | Purpose |
|-------|---------|
| / | 首页 Dashboard |
| /works | 作品收藏列表 |
| /works/new | 添加新作品 |
| /works/:id | 作品详情 |
| /works/:id/edit | 编辑作品 |
| /versions/compare/:workId | 版本对比 |
| /notes | 欣赏笔记列表 |
| /notes/new | 新建笔记 |
| /notes/:id | 笔记详情 |
| /composers | 作曲家列表 |
| /composers/:id | 作曲家详情 |
| /concerts | 音乐会追踪 |
| /concerts/new | 添加音乐会 |

## 4. API Definitions

```typescript
// 作品类型
interface Work {
  id: string;
  composer: string;
  composerId?: string;
  title: string;
  opus?: string;
  catalogNumber?: string;
  compositionYear?: number;
  duration?: number;
  instrumentation?: string;
  form?: string;
  movements?: Movement[];
  personalRating?: number;
  listenCount: number;
  favoriteVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Movement {
  number: number;
  title: string;
  duration?: number;
  tempo?: string;
  key?: string;
}

// 版本类型
interface Version {
  id: string;
  workId: string;
  conductor: string;
  orchestra: string;
  soloists?: string;
  recordingYear?: number;
  releaseYear?: number;
  duration?: number;
  characteristics?: string;
  historicalContext?: string;
  personalRank?: number;
  label?: string;
  catalogNumber?: string;
  format?: string;
  createdAt: string;
}

// 笔记类型
interface ListeningNote {
  id: string;
  workId: string;
  versionId?: string;
  listenDate: string;
  movementNotes: MovementNote[];
  emotionalJourney?: string;
  highlightMoments: HighlightMoment[];
  structureAnalysis?: string;
  historicalNotes?: string;
  overallImpression?: string;
  createdAt: string;
}

interface MovementNote {
  movementNumber: number;
  title: string;
  impression?: string;
  structureNotes?: string;
}

interface HighlightMoment {
  timestamp: string;
  description: string;
}

// 作曲家类型
interface Composer {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  period?: string;
  biography?: string;
  timelineEvents: TimelineEvent[];
  relationships: ComposerRelationship[];
  representativeWorks: RepresentativeWork[];
  createdAt: string;
}

interface TimelineEvent {
  year: number;
  event: string;
  type: 'birth' | 'work' | 'life' | 'death';
}

interface ComposerRelationship {
  composerId: string;
  composerName: string;
  relationship: string;
  description?: string;
}

interface RepresentativeWork {
  workId?: string;
  title: string;
  year?: number;
  form?: string;
}

// 音乐会类型
interface Concert {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  city?: string;
  type: 'attended' | 'planned';
  programItems: ConcertProgramItem[];
  performers?: string;
  notes?: string;
  rating?: number;
  createdAt: string;
}

interface ConcertProgramItem {
  order: number;
  composer: string;
  workTitle: string;
  workId?: string;
  intermission?: boolean;
}
```

## 5. Server Architecture

```mermaid
graph TB
    subgraph API["API Layer"]
        A1["WorkController"]
        A2["VersionController"]
        A3["NoteController"]
        A4["ComposerController"]
        A5["ConcertController"]
        A6["MusicBrainzController"]
    end
    
    subgraph Service["Service Layer"]
        B1["WorkService"]
        B2["VersionService"]
        B3["NoteService"]
        B4["ComposerService"]
        B5["ConcertService"]
        B6["MusicBrainzService"]
    end
    
    subgraph Storage["Storage Layer"]
        C1["WorkRepository"]
        C2["VersionRepository"]
        C3["NoteRepository"]
        C4["ComposerRepository"]
        C5["ConcertRepository"]
        C6["JSONFileStore"]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    A5 --> B5
    A6 --> B6
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
    B5 --> C5
    B6 --> C1
    B6 --> C4
    
    C1 --> C6
    C2 --> C6
    C3 --> C6
    C4 --> C6
    C5 --> C6
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    COMPOSER ||--o{ WORK : creates
    WORK ||--o{ VERSION : has
    WORK ||--o{ LISTENING_NOTE : has
    VERSION ||--o{ LISTENING_NOTE : used_in
    COMPOSER ||--o{ COMPOSER : related_to
    
    COMPOSER {
        string id PK
        string name
        number birthYear
        number deathYear
        string nationality
        string period
        string biography
        string timelineEvents
        string relationships
        string representativeWorks
        string createdAt
    }
    
    WORK {
        string id PK
        string composer
        string composerId FK
        string title
        string opus
        string catalogNumber
        number compositionYear
        number duration
        string instrumentation
        string form
        string movements
        number personalRating
        number listenCount
        string favoriteVersionId
        string createdAt
        string updatedAt
    }
    
    VERSION {
        string id PK
        string workId FK
        string conductor
        string orchestra
        string soloists
        number recordingYear
        number releaseYear
        number duration
        string characteristics
        string historicalContext
        number personalRank
        string label
        string catalogNumber
        string format
        string createdAt
    }
    
    LISTENING_NOTE {
        string id PK
        string workId FK
        string versionId FK
        string listenDate
        string movementNotes
        string emotionalJourney
        string highlightMoments
        string structureAnalysis
        string historicalNotes
        string overallImpression
        string createdAt
    }
    
    CONCERT {
        string id PK
        string title
        string date
        string time
        string venue
        string city
        string type
        string programItems
        string performers
        string notes
        number rating
        string createdAt
    }
```

### 6.2 Storage Structure

后端使用 JSON 文件存储数据，文件结构如下：

```json
{
  "works": [],
  "versions": [],
  "listeningNotes": [],
  "composers": [],
  "concerts": []
}
```

### 6.3 Seed Data

系统包含以下示例数据：

**作曲家示例**:
- Ludwig van Beethoven (1770-1827) - 古典主义/浪漫主义早期
- Wolfgang Amadeus Mozart (1756-1791) - 古典主义
- Johann Sebastian Bach (1685-1750) - 巴洛克
- Frédéric Chopin (1810-1849) - 浪漫主义

**作品示例**:
- Beethoven: Symphony No. 9 in D minor, Op. 125 "Choral"
- Mozart: Piano Concerto No. 21 in C major, K. 467
- Bach: Brandenburg Concerto No. 5 in D major, BWV 1050
- Chopin: Nocturne Op. 9, No. 2 in E-flat major
