# 测试指南

本文档说明如何运行和维护账户服务的事件溯源测试套件。

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
```

### 运行特定测试

```bash
# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 一致性测试
npm run test:consistency

# 并发测试
npm run test:concurrency

# 投影测试
npm run test:projection
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

报告将生成在 `coverage/` 目录下。

---

## 测试分类详解

### 1. 单元测试 (`tests/unit/`)

#### 测试目标
验证单个组件的逻辑正确性，不依赖外部系统。

#### 包含文件

| 文件 | 测试内容 |
|------|----------|
| `accountAggregate.apply.test.ts` | 事件 Apply 函数是否正确更新聚合状态 |
| `commandValidation.test.ts` | 命令验证逻辑的边界情况 |
| `accountAggregate.business.test.ts` | 聚合根业务方法 (deposit/withdraw/close) |

#### 测试场景示例

**事件 Apply 测试：**
- AccountCreated 事件初始化状态
- MoneyDeposited 事件增加余额
- MoneyWithdrawn 事件减少余额
- OverdraftStarted 标记透支状态
- 事件版本顺序验证

**命令验证测试：**
- 空值验证 (ownerName, transactionId)
- 边界值验证 (金额、字符串长度)
- 负数验证 (初始余额、交易金额)
- 组合错误返回多个验证错误

### 2. 集成测试 (`tests/integration/`)

#### 测试目标
验证多个组件之间的协作是否正确。

#### 包含文件

| 文件 | 测试内容 |
|------|----------|
| `eventStore.test.ts` | 事件存储的写入和读取 |
| `snapshot.test.ts` | 快照的创建和恢复 |
| `outOfOrderEvents.test.ts` | 事件乱序到达处理 |
| `commandHandler.integration.test.ts` | 命令处理器完整流程 |

#### 测试场景示例

**事件存储测试：**
- 追加事件到新流
- 读取特定版本范围的事件
- 乐观锁版本冲突检测
- 多聚合独立存储

**快照测试：**
- 保存和检索快照
- 按版本检索快照
- 快照阈值控制
- 快照状态不可变性

**乱序事件测试：**
- 单批次内版本不连续
- 跨批次版本不连续
- 异常信息正确性
- 事务回滚（失败时无数据持久化）

### 3. 一致性测试 (`tests/consistency/`)

#### 测试目标
验证从不同路径加载的状态是否一致。

#### 包含文件

| 文件 | 测试内容 |
|------|----------|
| `stateConsistency.test.ts` | 事件重放 vs 快照状态一致性 |
| `fullLifecycle.test.ts` | 完整账户生命周期一致性 |

#### 测试场景示例

**状态一致性测试：**
- 从空状态重放所有事件
- 从快照 + 后续事件恢复
- 幂等性测试（多次重放相同事件）
- 不同路径恢复状态比较

### 4. 并发测试 (`tests/concurrency/`)

#### 测试目标
验证并发操作下的正确性。

#### 包含文件

| 文件 | 测试内容 |
|------|----------|
| `optimisticLocking.test.ts` | 乐观锁版本号冲突处理 |

#### 测试场景示例

**乐观锁测试：**
- 版本不匹配抛出异常
- 异常包含正确的版本信息
- 指定 expectedVersion 时不重试
- 模拟竞争写入场景
- 重试后成功写入

### 5. 投影测试 (`tests/projection/`)

#### 测试目标
验证读模型投影是否正确维护查询视图。

#### 包含文件

| 文件 | 测试内容 |
|------|----------|
| `projection.test.ts` | 账户余额和交易历史投影 |
| `projectionConsistency.test.ts` | 投影与写模型一致性 |

#### 测试场景示例

**账户余额投影：**
- AccountCreated 创建初始视图
- MoneyDeposited 更新余额
- OverdraftStarted 标记透支
- AccountClosed 标记关闭

**交易历史投影：**
- TransactionRecorded 记录交易
- 分页查询 (limit/offset)
- 交易计数统计
- 去重处理（重复事件）

---

## 测试数据 Builder 模式

测试使用 Builder 模式构造测试数据，提高可读性。

### 事件 Builder

```typescript
import { EventBuilder } from '../builders';

// 创建账户创建事件
const createdEvent = EventBuilder.anEvent(accountId)
  .accountCreated('John Doe', 1000, 'CNY')
  .withVersion(1)
  .withTimestamp(Date.now())
  .build();

// 创建存款事件
const depositEvent = EventBuilder.anEvent(accountId)
  .moneyDeposited('txn_001', 500, 1500, 'ATM Deposit')
  .withVersion(2)
  .build();

// 创建交易记录事件
const txnEvent = EventBuilder.anEvent(accountId)
  .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
  .withVersion(3)
  .build();
```

### 命令 Builder

```typescript
import { CommandBuilder } from '../builders';

// 创建账户命令
const createCmd = CommandBuilder.aCommand(accountId)
  .createAccount('John Doe', 1000, 'CNY');

// 存款命令（指定期望版本）
const depositCmd = CommandBuilder.aCommand(accountId)
  .withExpectedVersion(1)
  .withMetadata({ source: 'mobile-app' })
  .depositMoney('txn_001', 500, 'ATM Deposit');

// 预定义的有效/无效命令
import { createValidCreateAccountCommand, createInvalidDepositCommand } from '../builders';

const validCmd = createValidCreateAccountCommand();
const invalidCmd = createInvalidDepositCommand(accountId);
```

### 账户状态 Builder

```typescript
import { AccountStateBuilder } from '../builders';

// 构建完整账户状态
const state = AccountStateBuilder.anAccount(accountId)
  .withOwnerName('John Doe')
  .withBalance(1000)
  .withCurrency('CNY')
  .withTransactionCount(5)
  .withVersion(10)
  .build();

// 构建特定场景的状态
const overdrawnState = AccountStateBuilder.anAccount(accountId)
  .withBalance(-500)
  .overdrawn()
  .build();

const closedState = AccountStateBuilder.anAccount(accountId)
  .withBalance(0)
  .closed('User requested')
  .build();
```

---

## 添加新测试

### 1. 确定测试类型

| 测试类型 | 适用场景 |
|----------|----------|
| 单元测试 | 单个函数/方法的逻辑验证 |
| 集成测试 | 多组件协作验证 |
| 一致性测试 | 状态一致性验证 |
| 并发测试 | 竞争条件验证 |
| 投影测试 | 读模型验证 |

### 2. 测试文件命名规范

```
tests/{category}/{feature}.test.ts
```

示例：
- `tests/unit/accountAggregate.apply.test.ts`
- `tests/integration/eventStore.test.ts`

### 3. 测试结构模板

```typescript
describe('测试组件名', () => {
  // 前置条件设置
  beforeEach(() => {
    // 初始化测试环境
  });

  describe('测试场景分类', () => {
    it('应该...', () => {
      // 1. 准备数据 (Arrange)
      // 2. 执行操作 (Act)
      // 3. 验证结果 (Assert)
    });
  });
});
```

### 4. 断言最佳实践

```typescript
// ✅ 好的做法
expect(result).toBe(expected);
expect(errors).toHaveLength(1);
expect(errors[0].field).toBe('amount');

// ✅ 异常测试
await expect(promise).rejects.toThrow(ExpectedException);
await expect(promise).rejects.toThrow(expect.objectContaining({
  name: 'OptimisticConcurrencyException',
  expectedVersion: 0,
}));

// ✅ 数组包含
expect(array).toContain(item);
expect(array).toEqual(expect.arrayContaining([item1, item2]));
```

---

## 测试覆盖矩阵

### 领域事件覆盖

| 事件类型 | Apply 测试 | 投影测试 |
|----------|------------|----------|
| AccountCreated | ✅ | ✅ |
| MoneyDeposited | ✅ | ✅ |
| MoneyWithdrawn | ✅ | ✅ |
| TransactionRecorded | ✅ | ✅ |
| OverdraftStarted | ✅ | ✅ |
| OverdraftResolved | ✅ | ✅ |
| AccountClosed | ✅ | ✅ |

### 命令类型覆盖

| 命令类型 | 验证测试 | 处理器测试 |
|----------|----------|------------|
| CreateAccount | ✅ | ✅ |
| DepositMoney | ✅ | ✅ |
| WithdrawMoney | ✅ | ✅ |
| CloseAccount | ✅ | ✅ |

### 异常类型覆盖

| 异常类型 | 测试覆盖 |
|----------|----------|
| CommandValidationException | ✅ |
| OptimisticConcurrencyException | ✅ |
| EventOutOfOrderException | ✅ |
| AggregateNotFoundException | ✅ |

---

## 常见问题

### Q: 如何调试失败的测试？

```bash
# 运行特定测试文件
npx jest tests/unit/accountAggregate.apply.test.ts

# 显示详细输出
npx jest --verbose

# 使用 test.only 运行单个测试
it.only('应该...', () => {
  // 测试内容
});
```

### Q: 如何模拟时间？

```typescript
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));

// 测试完成后恢复
jest.useRealTimers();
```

### Q: 如何处理异步测试？

```typescript
// 使用 async/await
it('应该异步操作', async () => {
  const result = await asyncOperation();
  expect(result).toBe(expected);
});

// 使用 Promise
it('应该拒绝', () => {
  return expect(failingOperation()).rejects.toThrow();
});
```

---

## 持续集成

测试套件配置了以下 CI 友好的特性：

- 测试超时：30秒
- 详细输出模式
- 覆盖率报告生成
- TypeScript 类型检查

### CI 命令示例

```yaml
# GitHub Actions 示例
- run: npm ci
- run: npm run test:coverage
- uses: codecov/codecov-action@v3
```

---

## 进一步阅读

- [测试架构说明](./TEST_ARCHITECTURE.md)
- [领域模型设计](../src/domain/)
- [事件溯源模式](https://microservices.io/patterns/data/event-sourcing.html)
- [CQRS 模式](https://microservices.io/patterns/data/cqrs.html)
