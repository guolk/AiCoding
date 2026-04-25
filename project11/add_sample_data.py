import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal, init_db
from backend.models import Article, Tag
from backend.schemas import ArticleCreate
from backend import crud

def add_sample_data():
    init_db()
    db = SessionLocal()
    
    sample_articles = [
        {
            "title": "欢迎来到我的个人博客",
            "summary": "这是我的第一篇博客文章，介绍这个博客系统的功能特点。",
            "content": """# 欢迎来到我的个人博客

这是一个使用 **FastAPI** 和 **Vue3** 构建的轻量级个人博客系统。

## 功能特点

- ✅ **文章管理**：支持创建、编辑、删除文章
- ✅ **Markdown支持**：文章内容使用Markdown格式编写
- ✅ **代码高亮**：支持多种编程语言的代码高亮
- ✅ **标签系统**：文章可以添加多个标签
- ✅ **搜索功能**：按关键词搜索文章
- ✅ **置顶功能**：重要文章可以置顶显示

## 技术栈

### 后端
- **FastAPI**: 现代、快速的Web框架
- **SQLAlchemy**: ORM框架
- **SQLite**: 轻量级数据库

### 前端
- **Vue3**: 渐进式JavaScript框架
- **Vue Router**: 路由管理
- **Axios**: HTTP客户端
- **Marked**: Markdown解析器
- **Highlight.js**: 代码高亮

## 代码示例

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, Blog!"}
```

```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

希望你喜欢这个博客系统！🎉
""",
            "tags": ["公告", "介绍"],
            "is_pinned": True
        },
        {
            "title": "Vue3组合式API入门指南",
            "summary": "Vue3引入了组合式API，让我们一起来学习如何使用它。",
            "content": """# Vue3组合式API入门指南

Vue3引入了**组合式API**，这是一种新的编写组件逻辑的方式。

## 为什么需要组合式API？

在Vue2中，我们使用选项式API：

```javascript
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
```

当组件变得复杂时，相关的逻辑会分散在不同的选项中。

## 组合式API的基本用法

```javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    return { count, double, increment }
  }
}
```

## 使用`<script setup>`语法糖

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>
```

组合式API让代码更加灵活和可复用！
""",
            "tags": ["Vue3", "前端", "JavaScript"],
            "is_pinned": False
        },
        {
            "title": "FastAPI快速入门教程",
            "summary": "FastAPI是一个现代、快速的Web框架，让我们快速上手。",
            "content": """# FastAPI快速入门教程

**FastAPI** 是一个用于构建API的现代、快速（高性能）的Web框架。

## 安装

```bash
pip install fastapi uvicorn
```

## 第一个应用

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

## 运行服务

```bash
uvicorn main:app --reload
```

## 路径参数

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

## 请求体

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = None

@app.post("/items/")
async def create_item(item: Item):
    return item
```

## 自动文档

FastAPI自动生成交互式API文档：
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

FastAPI真是太棒了！🚀
""",
            "tags": ["FastAPI", "Python", "后端"],
            "is_pinned": False
        },
        {
            "title": "SQLAlchemy ORM使用指南",
            "summary": "学习如何使用SQLAlchemy ORM进行数据库操作。",
            "content": """# SQLAlchemy ORM使用指南

**SQLAlchemy** 是Python中最流行的ORM框架。

## 安装

```bash
pip install sqlalchemy
```

## 连接数据库

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
```

## 定义模型

```python
from sqlalchemy import Column, Integer, String

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    email = Column(String(100), unique=True)
```

## 创建表

```python
Base.metadata.create_all(bind=engine)
```

## CRUD操作

```python
db = SessionLocal()

# 创建
user = User(name="张三", email="zhangsan@example.com")
db.add(user)
db.commit()
db.refresh(user)

# 查询
users = db.query(User).all()
user = db.query(User).filter(User.id == 1).first()

# 更新
user.name = "李四"
db.commit()

# 删除
db.delete(user)
db.commit()

db.close()
```

SQLAlchemy让数据库操作变得简单优雅！💎
""",
            "tags": ["Python", "SQLAlchemy", "数据库"],
            "is_pinned": False
        }
    ]
    
    for article_data in sample_articles:
        article_create = ArticleCreate(**article_data)
        crud.create_article(db=db, article=article_create)
        print(f"已创建文章: {article_data['title']}")
    
    db.close()
    print("\n示例数据添加完成！")

if __name__ == "__main__":
    add_sample_data()
