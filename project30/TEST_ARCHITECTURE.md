# 测试架构说明

本文档详细说明账户服务事件溯源测试套件的架构设计。

---

## 目录

1. [整体架构](#整体架构)
2. [测试分层](#测试分层)
3. [组件依赖](#组件依赖)
4. [测试数据构建模式](#测试数据构建模式)
5. [测试覆盖策略](#测试覆盖策略)
6. [扩展指南](#扩展指南)

---

## 整体架构

### 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      命令处理器 (Command Handler)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  命令验证    │  │  聚合加载    │  │  事件通知 (发布订阅)  │  │
│  │  (Validator)│  │ (Aggregate) │  │  (Event Publisher)  │  │
│  └─────────────┘  └──────┬──────┘  └──────────┬──────────┘  │
└───────────────────────────┼──────────────────────┼──────────────┘
                            │                      │
              ┌─────────────┴─────────────┐        │
              ▼                           ▼        │
┌─────────────────────────┐    ┌──────────────────┐ │
│    事件存储 (Event Store)  │    │  快照存储 (Snapshot)│ │
│  - 追加事件              │    │  - 保存快照       │ │
│  - 按版本读取             │    │  - 按版本检索      │ │
│  - 乐观锁控制             │    │  - 阈值管理       │ │
└─────────────────────────┘    └──────────────────┘ │
                            │                      │
                            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      读模型投影 (Projections)                  │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │  账户余额投影         │    │      交易历史投影            │  │
│  │  AccountBalanceView │    │    TransactionHistoryView    │  │
│  │  - 实时余额           │    │  - 交易列表                 │  │
│  │  - 透支状态           │    │  - 分页查询                 │  │
│  │  - 账户状态           │    │  - 交易计数                 │  │
│  └─────────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 测试架构概览

```
┌──────────────────────────────────────────────────────────────┐
│                        测试套件 (Test Suite)                    │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   测试数据构建层                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │EventBuilder  │  │CommandBuilder│  │StateBuilder  │ │  │
│  │  │ 事件构建器     │  │ 命令构建器     │  │ 状态构建器     │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                │
│                              ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     测试执行层                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │  │
│  │  │ 单元测试  │  │ 集成测试  │  │ 一致性测试│  │并发测试│ │  │
│  │  │ Unit     │  │Integration│  │Consistency│ │Concur. │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └───────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │                   投影测试                         │  │  │
│  │  │              Projection Tests                     │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                │
│                              ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     断言验证层                           │  │
│  │  - 状态相等性断言                                        │  │
│  │  - 异常类型断言                                          │  │
│  │  - 版本一致性断言                                        │  │
│  │  - 事件顺序断言                                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 测试分层

### 1. 单元测试层 (`tests/unit/`)

#### 设计原则
- **隔离性**：不依赖外部系统
- **快速执行**：毫秒级完成
- **细粒度**：测试单个函数或方法

#### 测试对象

| 测试文件 | 职责 | 测试粒度 |
|----------|------|----------|
| `accountAggregate.apply.test.ts` | 事件 Apply 函数 | 单个事件的状态转换 |
| `commandValidation.test.ts` | 命令验证器 | 输入验证逻辑 |
| `accountAggregate.business.test.ts` | 聚合根业务方法 | 业务规则执行 |

#### 测试模式

```typescript
describe('单元测试 - 事件Apply', () => {
  it('应该正确应用 MoneyDeposited 事件', () => {
    // 1. 准备：创建初始状态和事件
    const initialState = createInitialState(accountId);
    const event = createMoneyDepositedEvent(amount, balanceAfter);

    // 2. 执行：应用事件
    aggregate.apply(event);

    // 3. 断言：验证状态变化
    expect(aggregate.state.balance).toBe(balanceAfter);
  });
});
```

---

### 2. 集成测试层 (`tests/integration/`)

#### 设计原则
- **协作验证**：测试多个组件之间的交互
- **数据流验证**：验证数据在组件间的流动
- **端到端片段**：测试完整的业务流程片段

#### 测试对象

| 测试文件 | 职责 | 涉及组件 |
|----------|------|----------|
| `eventStore.test.ts` | 事件存储操作 | EventStore |
| `snapshot.test.ts` | 快照机制 | SnapshotStore + SnapshotService |
| `outOfOrderEvents.test.ts` | 乱序事件处理 | EventStore + 版本验证 |
| `commandHandler.integration.test.ts` | 命令处理流程 | CommandHandler + EventStore + Projections |

#### 测试模式

```typescript
describe('集成测试 - 事件存储', () => {
  let eventStore: InMemoryEventStore;

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
  });

  it('应该正确追加和读取事件', async () => {
    // 1. 准备：创建事件列表
    const events = [createAccountCreatedEvent(), createMoneyDepositedEvent()];

    // 2. 执行：追加事件
    await eventStore.appendEvents(accountId, events, 0);

    // 3. 执行：读取事件
    const storedEvents = await eventStore.readEvents(accountId);

    // 4. 断言：验证数据完整性
    expect(storedEvents).toHaveLength(events.length);
  });
});
```

---

### 3. 一致性测试层 (`tests/consistency/`)

#### 设计原则
- **状态等价性**：验证不同路径到达的状态是否相同
- **幂等性验证**：验证重复操作的结果一致性
- **确定性验证**：验证相同输入产生相同输出

#### 测试对象

| 测试文件 | 职责 | 验证内容 |
|----------|------|----------|
| `stateConsistency.test.ts` | 状态一致性 | 事件重放 vs 快照恢复 |
| `fullLifecycle.test.ts` | 生命周期一致性 | 完整账户生命周期 |

#### 测试模式

```typescript
describe('一致性测试', () => {
  it('快照状态应该等于事件重放状态', () => {
    // 1. 路径A：从所有事件重放
    const stateFromEvents = AccountAggregate.fromEvents(events).state;

    // 2. 路径B：从快照 + 后续事件
    const aggregate = AccountAggregate.fromSnapshot(snapshotState);
    for (const event of eventsAfterSnapshot) {
      aggregate.apply(event);
    }
    const stateFromSnapshot = aggregate.state;

    // 3. 断言：两种路径应该到达相同状态
    assertStatesEqual(stateFromEvents, stateFromSnapshot);
  });
});
```

---

### 4. 并发测试层 (`tests/concurrency/`)

#### 设计原则
- **竞争条件**：验证并发操作的正确性
- **乐观锁**：验证版本冲突处理
- **重试机制**：验证冲突后的恢复策略

#### 测试对象

| 测试文件 | 职责 | 验证内容 |
|----------|------|----------|
| `optimisticLocking.test.ts` | 乐观锁机制 | 版本冲突、异常抛出、重试逻辑 |

#### 测试模式

```typescript
describe('并发测试 - 乐观锁', () => {
  it('应该在版本冲突时抛出异常', async () => {
    // 1. 准备：两个并发写入者
    const writerA = createCommandHandler();
    const writerB = createCommandHandler();

    // 2. 执行：WriterA 先写入成功
    await writerA.handle(depositCommand);

    // 3. 执行与断言：WriterB 使用旧版本写入应该失败
    await expect(writerB.handle(depositCommandWithOldVersion))
      .rejects.toThrow(OptimisticConcurrencyException);
  });
});
```

---

### 5. 投影测试层 (`tests/projection/`)

#### 设计原则
- **视图一致性**：验证读模型与写模型的一致性
- **事件消费**：验证投影正确消费事件
- **查询能力**：验证读模型的查询功能

#### 测试对象

| 测试文件 | 职责 | 验证内容 |
|----------|------|----------|
| `projection.test.ts` | 单个投影 | 账户余额、交易历史投影 |
| `projectionConsistency.test.ts` | 跨投影一致性 | 多投影与聚合状态的一致性 |

#### 测试模式

```typescript
describe('投影测试', () => {
  it('投影状态应该与聚合状态一致', () => {
    // 1. 准备：创建事件流
    const events = [createdEvent, depositEvent, withdrawEvent];

    // 2. 执行：应用到聚合和投影
    const aggregateState = AccountAggregate.fromEvents(events).state;
    
    events.forEach(e => projection.applyEvent(e));
    const projectionState = projection.getBalance(accountId);

    // 3. 断言：验证一致性
    expect(projectionState?.balance).toBe(aggregateState.balance);
    expect(projectionState?.isOverdrawn).toBe(aggregateState.isOverdrawn);
  });
});
```

---

## 组件依赖

### 依赖关系图

```
                    ┌─────────────────┐
                    │   测试断言层      │
                    │  (Jest Matchers) │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  单元测试      │   │  集成测试      │   │  系统测试      │
│  (Unit)       │   │(Integration)  │   │  (System)     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        │    依赖           │    依赖           │    依赖
        ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                      领域模型层                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐│
│  │   类型定义   │  │   事件定义   │  │   命令定义       ││
│  │  (types)    │  │  (events)   │  │  (commands)     ││
│  └─────────────┘  └─────────────┘  └─────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │                  账户聚合根                          ││
│  │              AccountAggregate                        ││
│  │  - create()    - deposit()    - withdraw()          ││
│  │  - close()     - apply()      - fromEvents()        ││
│  └─────────────────────────────────────────────────────┘│
└───────────────────────────┬─────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ 基础设施层   │   │  应用层     │   │  投影层     │
    │(Infrastructure)│ │(Application)│ │(Projections)│
    ├─────────────┤   ├─────────────┤   ├─────────────┤
    │ EventStore  │   │CommandHandler│  │BalanceProj. │
    │SnapshotStore│   │  + 重试逻辑   │   │HistoryProj. │
    └─────────────┘   └─────────────┘   └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  测试数据层   │
                    │  (Builders)  │
                    └─────────────┘
```

### 详细依赖说明

#### 1. 领域模型层 (`src/domain/`)

```typescript
// 核心依赖关系
AccountAggregate
  ├── 依赖: types.ts (类型定义)
  ├── 依赖: events.ts (事件定义)
  ├── 依赖: commands.ts (命令定义)
  └── 包含: Validators (命令验证器)

// 数据流向
Command → Validator → Aggregate → Events
```

#### 2. 基础设施层 (`src/infrastructure/`)

```typescript
// 核心依赖关系
EventStore
  └── 依赖: DomainEvent (来自 domain/events)

SnapshotStore
  └── 依赖: Snapshot + AccountState (来自 domain)

SnapshotService
  ├── 依赖: SnapshotStore
  └── 包含: 阈值管理逻辑
```

#### 3. 应用层 (`src/application/`)

```typescript
// 核心依赖关系
CommandHandler
  ├── 依赖: EventStore (事件存储)
  ├── 依赖: SnapshotStore (快照存储)
  ├── 依赖: AccountAggregate (聚合根)
  ├── 依赖: EventHandlers (事件处理器)
  └── 包含: 重试逻辑 + 乐观锁处理
```

#### 4. 投影层 (`src/projections/`)

```typescript
// 核心依赖关系
AccountBalanceProjection
  └── 依赖: DomainEvent (事件消费)

TransactionHistoryProjection
  └── 依赖: DomainEvent (事件消费)
```

---

## 测试数据构建模式

### Builder 模式架构

```
┌─────────────────────────────────────────────────────────┐
│                    测试数据构建器                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │   EventBuilder  │    │  CommandBuilder │            │
│  │   事件构建器      │    │   命令构建器      │            │
│  ├─────────────────┤    ├─────────────────┤            │
│  │ - accountCreated│    │ - createAccount │            │
│  │ - moneyDeposited│    │ - depositMoney  │            │
│  │ - moneyWithdrawn│    │ - withdrawMoney │            │
│  │ - transaction...│    │ - closeAccount  │            │
│  │ - overdraft...  │    │                 │            │
│  │ - accountClosed │    │ withVersion()   │            │
│  │                 │    │ withMetadata()  │            │
│  │ withVersion()   │    │                 │            │
│  │ withTimestamp() │    └─────────────────┘            │
│  │ withEventId()   │                                     │
│  │ withMetadata()  │    ┌─────────────────┐            │
│  │                 │    │ AccountState... │            │
│  │ build()         │    │   状态构建器      │            │
│  │ buildAsSequence()│   ├─────────────────┤            │
│  └─────────────────┘    │ - withOwnerName │            │
│                          │ - withBalance   │            │
│  辅助函数:                │ - withCurrency  │            │
│  - createAccountCreated  │ - overdrawn()   │            │
│  - createMoneyDeposited  │ - closed()      │            │
│  - createMoneyWithdrawn  │ - withVersion() │            │
│                          │                 │            │
│                          │ build()         │            │
│                          │ buildForDeposit │            │
│                          │ buildForWithdr..│            │
│                          └─────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Builder 使用模式

#### 流式 API 设计

```typescript
// 链式调用，提高可读性
const event = EventBuilder.anEvent(accountId)
  .accountCreated('John Doe', 1000, 'CNY')  // 设置事件类型和载荷
  .withVersion(1)                              // 设置版本
  .withTimestamp(Date.now())                   // 设置时间戳
  .withMetadata({ source: 'test' })           // 设置元数据
  .build();                                     // 构建事件
```

#### 不可变性保证

```typescript
// Builder 内部使用对象展开，保证不可变性
class EventBuilder {
  build(): AccountDomainEvent {
    return {
      eventId: this.eventId || generateId(),
      // 使用展开运算符创建新对象
      payload: { ...this.payload },
      metadata: this.metadata ? { ...this.metadata } : undefined,
      // ...
    };
  }
}
```

---

## 测试覆盖策略

### 覆盖矩阵

#### 事件类型覆盖

| 事件类型 | 单元测试 | 集成测试 | 一致性测试 | 投影测试 |
|----------|----------|----------|------------|----------|
| AccountCreated | ✅ | ✅ | ✅ | ✅ |
| MoneyDeposited | ✅ | ✅ | ✅ | ✅ |
| MoneyWithdrawn | ✅ | ✅ | ✅ | ✅ |
| TransactionRecorded | ✅ | ✅ | ✅ | ✅ |
| OverdraftStarted | ✅ | ✅ | ✅ | ✅ |
| OverdraftResolved | ✅ | ✅ | ✅ | ✅ |
| AccountClosed | ✅ | ✅ | ✅ | ✅ |

#### 命令类型覆盖

| 命令类型 | 验证测试 | 处理器测试 | 集成测试 |
|----------|----------|------------|----------|
| CreateAccount | ✅ | ✅ | ✅ |
| DepositMoney | ✅ | ✅ | ✅ |
| WithdrawMoney | ✅ | ✅ | ✅ |
| CloseAccount | ✅ | ✅ | ✅ |

#### 异常类型覆盖

| 异常类型 | 触发条件 | 测试覆盖 |
|----------|----------|----------|
| CommandValidationException | 命令字段无效 | ✅ |
| OptimisticConcurrencyException | 版本冲突 | ✅ |
| EventOutOfOrderException | 事件版本不连续 | ✅ |
| AggregateNotFoundException | 账户不存在 | ✅ |

### 边界条件覆盖

#### 数值边界

| 条件 | 测试场景 | 覆盖状态 |
|------|----------|----------|
| 金额为 0 | 零金额存款/取款 | ✅ |
| 金额为负数 | 负金额交易 | ✅ |
| 金额极小 | 0.01 金额 | ✅ |
| 金额极大 | MAX_SAFE_INTEGER | ✅ |
| 非有限数值 | Infinity, NaN | ✅ |

#### 字符串边界

| 条件 | 测试场景 | 覆盖状态 |
|------|----------|----------|
| 空字符串 | ownerName, transactionId | ✅ |
| 空白字符串 | "   " (全空白) | ✅ |
| 超长字符串 | 超过 100 字符 | ✅ |
| 边界长度 | 正好 100 字符 | ✅ |

#### 版本边界

| 条件 | 测试场景 | 覆盖状态 |
|------|----------|----------|
| 初始版本 | version = 0 | ✅ |
| 首次事件 | version = 1 | ✅ |
| 版本不连续 | 跳版本 | ✅ |
| 版本冲突 | 并发写入 | ✅ |

---

## 扩展指南

### 添加新事件类型

#### 1. 定义事件

```typescript
// src/domain/events.ts
export enum AccountEventType {
  // ... 现有事件
  NEW_EVENT_TYPE = 'NewEventType',
}

export interface NewEventPayload {
  // 载荷字段
}

export function createNewEvent(...): AccountDomainEvent {
  // 事件工厂函数
}
```

#### 2. 更新聚合根 Apply 逻辑

```typescript
// src/domain/account.ts
class AccountAggregate {
  apply(event: AccountDomainEvent): void {
    switch (event.eventType) {
      // ... 现有 case
      case AccountEventType.NEW_EVENT_TYPE:
        this.applyNewEvent(event.payload as NewEventPayload, nextVersion);
        break;
    }
  }

  private applyNewEvent(payload: NewEventPayload, version: Version): AccountState {
    // 状态转换逻辑
  }
}
```

#### 3. 添加测试

```typescript
// tests/unit/accountAggregate.apply.test.ts
describe('NewEventType Event', () => {
  it('should correctly apply NewEventType', () => {
    // 测试逻辑
  });
});
```

### 添加新投影

#### 1. 实现投影

```typescript
// src/projections/newProjection.ts
export interface NewView {
  // 视图定义
}

export class NewProjection {
  applyEvent(event: AccountDomainEvent): void {
    switch (event.eventType) {
      // 处理相关事件
    }
  }

  // 查询方法
}
```

#### 2. 添加测试

```typescript
// tests/projection/newProjection.test.ts
describe('NewProjection', () => {
  it('should handle relevant events', () => {
    // 测试逻辑
  });

  it('should maintain consistency with aggregate', () => {
    // 一致性测试
  });
});
```

### 添加新异常类型

#### 1. 定义异常

```typescript
// src/domain/types.ts
export class NewException extends Error {
  constructor(
    // 额外字段
    message?: string
  ) {
    super(message || 'Default message');
    this.name = 'NewException';
  }
}
```

#### 2. 添加测试

```typescript
// tests/unit/exceptions.test.ts
describe('NewException', () => {
  it('should have correct properties', () => {
    const error = new NewException(/* args */);
    expect(error.name).toBe('NewException');
    // 其他断言
  });
});
```

---

## 最佳实践

### 1. 测试命名

```typescript
// ✅ 好的做法：描述性名称
it('应该在余额不足时拒绝取款', () => { /* ... */ });

// ❌ 不好的做法：模糊名称
it('测试取款', () => { /* ... */ });
```

### 2. 测试数据

```typescript
// ✅ 好的做法：使用常量或 Builder
const accountId = 'acc_test_001';
const event = EventBuilder.anEvent(accountId)
  .accountCreated('Test User', 1000, 'CNY')
  .build();

// ❌ 不好的做法：硬编码魔法值
const event = {
  aggregateId: 'acc_123',  // 魔法值
  payload: { ownerName: 'John' },  // 无意义数据
};
```

### 3. 断言数量

```typescript
// ✅ 好的做法：一个测试一个概念
it('应该正确更新余额', () => {
  expect(state.balance).toBe(expectedBalance);
});

it('应该正确更新交易计数', () => {
  expect(state.transactionCount).toBe(expectedCount);
});

// ❌ 不好的做法：一个测试过多断言
it('应该处理存款', () => {
  expect(state.balance).toBe(1500);
  expect(state.transactionCount).toBe(1);
  expect(state.version).toBe(3);
  // ... 更多断言
});
```

### 4. 异常测试

```typescript
// ✅ 好的做法：验证异常类型和属性
await expect(operation).rejects.toThrow(
  expect.objectContaining({
    name: 'OptimisticConcurrencyException',
    expectedVersion: 0,
    actualVersion: 1,
  })
);

// ❌ 不好的做法：只验证消息
await expect(operation).rejects.toThrow('some message');
```

---

## 相关文档

- [测试指南](./TESTING_GUIDE.md) - 运行和维护测试的详细指南
- [领域模型](../src/domain/) - 领域层代码
- [事件存储](../src/infrastructure/) - 基础设施层代码
