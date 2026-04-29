# 财务对账脚本测试说明文档

## 1. 文档概述

本文档详细描述了自动化财务对账脚本的测试套件，包括测试策略、测试范围、测试用例设计和预期结果验证方法。

### 1.1 测试目标

- 验证财务对账脚本的核心功能正确性
- 确保金额计算使用Decimal而非float，避免精度问题
- 验证多币种汇率转换逻辑的准确性
- 测试日期范围边界计算的正确性
- 验证各种数据场景下的对账结果
- 测试边界条件和异常处理
- 确保错误信息清晰可操作

### 1.2 测试范围

| 测试类型 | 覆盖范围 | 测试文件 |
|---------|---------|---------|
| 单元测试 | Decimal精度、汇率转换、日期范围、交易匹配 | test_unit.py |
| 数据测试 | 正常对账、金额差异、日期错位、重复条目、缺失交易 | test_data_scenarios.py |
| 边界测试 | 空账单、单条记录、零金额、负数金额、跨年跨月、大额金额 | test_boundary.py |
| 容错测试 | 编码错误、列名不一致、缺失字段、无效数据格式 | test_error_handling.py |
| 高级测试 | 多币种对账、组合容差、报告输出、CSV格式错误 | test_advanced.py |

---

## 2. 单元测试说明

### 2.1 Decimal精度测试

#### 测试目的
验证使用Python的`Decimal`类型进行金额计算，避免`float`类型的精度问题。

#### 测试用例

| 用例ID | 测试名称 | 测试描述 | 预期结果 |
|--------|---------|---------|---------|
| UT-DEC-001 | Decimal vs Float精度对比 | 验证0.1+0.2在float和Decimal中的不同结果 | float结果≠0.3，Decimal结果=0.3 |
| UT-DEC-002 | 货币计算精度 | 连续累加10个0.1，验证总和为1.0 | 总和精确等于1.0 |
| UT-DEC-003 | Decimal四舍五入 | 验证ROUND_HALF_UP模式的四舍五入行为 | 1.234→1.23，1.235→1.24 |
| UT-DEC-004 | 交易金额精度 | 验证Transaction对象中金额的精确比较 | 相同金额的对象比较相等 |

#### 测试原理

```python
# float的精度问题
0.1 + 0.2  # 结果: 0.30000000000000004

# Decimal的精确计算
Decimal("0.1") + Decimal("0.2")  # 结果: Decimal("0.3")
```

#### Golden File说明

Golden File: `unit_decimal_precision.json`

包含以下测试场景的预期结果：
- 加法运算 (0.1 + 0.2)
- 乘法运算 (0.1 * 3)
- 除法运算 (1.0 / 3)
- 四舍五入 (1.235 保留两位小数)

---

### 2.2 汇率转换测试

#### 测试目的
验证多币种汇率转换逻辑的正确性，包括正向转换、反向转换和汇率缺失处理。

#### 测试用例

| 用例ID | 测试名称 | 测试描述 | 预期结果 |
|--------|---------|---------|---------|
| UT-EX-001 | 相同货币转换 | CNY转换为CNY | 金额不变，汇率=1.0 |
| UT-EX-002 | USD转CNY | 100 USD按汇率7.25转换为CNY | 结果=725.00 CNY |
| UT-EX-003 | CNY转USD | 725 CNY反向转换为USD | 结果=100.00 USD |
| UT-EX-004 | 缺失汇率处理 | 转换未配置汇率的货币对 | 抛出ValueError异常 |
| UT-EX-005 | 汇率随时间变化 | 不同日期使用不同汇率 | 1月汇率7.25，6月汇率7.20 |

#### 汇率转换规则

```
转换公式: 目标金额 = 源金额 × 汇率
反向汇率: 1 / 正向汇率
四舍五入: ROUND_HALF_UP，保留2位小数
```

#### Golden File说明

Golden File: `unit_exchange_rate.json`

包含以下测试场景的预期结果：
- USD → CNY (汇率7.25)
- EUR → CNY (汇率7.90)
- CNY → USD (反向计算)
- CNY → CNY (相同货币)

---

### 2.3 日期范围测试

#### 测试目的
验证日期范围的计算逻辑，包括包含检查、天数计算、跨月/跨年检测等。

#### 测试用例

| 用例ID | 测试名称 | 测试描述 | 预期结果 |
|--------|---------|---------|---------|
| UT-DR-001 | 日期包含检查 | 验证日期是否在范围内 | 边界日期被正确包含/排除 |
| UT-DR-002 | 天数计算 | 计算日期范围内的天数 | 1月1日-1月7日 = 7天 |
| UT-DR-003 | 范围重叠检查 | 两个日期范围是否重叠 | 部分重叠=重叠，无交集=不重叠 |
| UT-DR-004 | 跨月检测 | 日期范围是否跨越月份边界 | 1月25日-2月5日=跨月 |
| UT-DR-005 | 跨年检测 | 日期范围是否跨越年份边界 | 12月25日-1月5日=跨年 |
| UT-DR-006 | 无效日期范围 | 开始日期晚于结束日期 | 抛出ValueError异常 |

#### 日期范围规则

```python
# 包含检查（闭区间）
start_date <= check_date <= end_date

# 天数计算
(end_date - start_date).days + 1  # 包含开始和结束日期

# 跨月检测
start_date.month != end_date.month

# 跨年检测
start_date.year != end_date.year
```

#### Golden File说明

Golden File: `unit_date_range.json`

包含以下测试场景的预期结果：
- 1月完整月份 (2024-01-01 至 2024-01-31)
- 跨年跨月 (2024-12-25 至 2025-01-05)
- 闰年2月 (2024-02-01 至 2024-02-29)

---

### 2.4 交易匹配测试

#### 测试目的
验证交易匹配逻辑，包括精确匹配、金额差异、日期差异和容差处理。

#### 测试用例

| 用例ID | 测试名称 | 测试描述 | 预期结果 |
|--------|---------|---------|---------|
| UT-TM-001 | 精确匹配 | 交易ID、日期、金额完全相同 | 状态=matched |
| UT-TM-002 | 金额差异 | 交易ID相同但金额不同 | 状态=amount_mismatch，记录差异值 |
| UT-TM-003 | 日期差异 | 交易ID相同但日期不同 | 状态=date_mismatch |
| UT-TM-004 | 日期容差 | 日期差异在容差范围内 | 状态=matched |

#### 匹配优先级

1. 首先检查交易ID是否存在
2. 检查日期差异（考虑日期容差）
3. 检查金额差异（考虑金额容差）
4. 所有检查通过才标记为matched

---

## 3. 数据测试说明

### 3.1 正常对账场景

#### 测试目的
验证完全匹配的交易对账结果。

#### 测试场景

| 场景ID | 场景描述 | 交易数量 | 预期结果 |
|--------|---------|---------|---------|
| DT-NR-001 | 多条交易完美匹配 | 3条 | 全部matched=3 |
| DT-NR-002 | 包含正负金额 | 4条（2正2负） | 全部matched=4 |
| DT-NR-003 | 真实业务数据 | 4条（销售+支出） | 全部matched=4 |

#### Golden File说明

Golden File: `data_normal_reconciliation.json`

包含4条真实业务场景的对账结果：
- 销售收入 (5000.00, 3200.75)
- 设备采购支出 (-1500.00)
- 差旅费报销 (-800.50)

---

### 3.2 金额差异场景

#### 测试目的
验证金额差异的检测和报告。

#### 测试场景

| 场景ID | 场景描述 | 差异类型 | 预期结果 |
|--------|---------|---------|---------|
| DT-AM-001 | 部分交易金额差异 | 1条匹配，1条差异 | matched=1, amount_mismatches=1 |
| DT-AM-002 | 金额容差范围内 | 差异0.05，容差0.10 | 状态=matched |
| DT-AM-003 | 金额容差范围外 | 差异0.05，容差0.00 | 状态=amount_mismatch |
| DT-AM-004 | 真实业务差异 | 多笔交易含手续费差异 | 正确记录差异详情 |

#### 金额差异计算

```python
difference = source_amount - target_amount
# 正数表示源文件金额大于目标文件
# 负数表示源文件金额小于目标文件
```

#### Golden File说明

Golden File: `data_amount_mismatch.json`

包含3条交易的对账结果：
- 完全匹配 (10000.00)
- 含手续费差异 (7500.50 vs 7550.50)
- 服务费用差异 (-3000.00 vs -2900.00)

---

### 3.3 日期错位场景

#### 测试目的
验证日期差异的检测和容差处理。

#### 测试场景

| 场景ID | 场景描述 | 日期差异 | 预期结果 |
|--------|---------|---------|---------|
| DT-DM-001 | 日期差异检测 | 相差5天 | 状态=date_mismatch |
| DT-DM-002 | 日期在容差内 | 相差2天，容差3天 | 状态=matched |
| DT-DM-003 | 银行到账延迟 | 相差2-3天 | 状态=date_mismatch |

#### 银行到账延迟说明

在实际业务中，银行转账通常存在1-3天的到账延迟。测试用例模拟了这种场景：
- 供应商付款记录日期 vs 银行实际扣款日期
- 客户回款记录日期 vs 银行实际到账日期

#### Golden File说明

Golden File: `data_date_mismatch.json`

包含3条交易的对账结果：
- 付款延迟2天
- 付款延迟3天
- 正常到账

---

### 3.4 重复条目场景

#### 测试目的
验证重复交易条目的检测。

#### 测试场景

| 场景ID | 场景描述 | 重复位置 | 预期结果 |
|--------|---------|---------|---------|
| DT-DU-001 | 源文件重复 | 源文件有2条相同ID | duplicates=1 |
| DT-DU-002 | 双方都有重复 | 源和目标都有重复 | duplicates=1 |
| DT-DU-003 | 真实业务重复 | 多次录入同一张发票 | 正确标记重复 |

#### 重复检测规则

同一交易ID出现次数 > 1 即标记为duplicate

#### Golden File说明

Golden File: `data_duplicate_entries.json`

包含5条交易的对账结果：
- 重复录入的销售发票 (2条)
- 正常销售发票 (1条)
- 重复的办公费用 (2条)

---

### 3.5 缺失交易场景

#### 测试目的
验证单边缺失交易的检测。

#### 测试场景

| 场景ID | 场景描述 | 缺失位置 | 预期结果 |
|--------|---------|---------|---------|
| DT-MI-001 | 目标文件缺失 | 源有，目标无 | missing_in_target=1 |
| DT-MI-002 | 源文件缺失 | 源无，目标有 | missing_in_source=1 |

---

## 4. 边界测试说明

### 4.1 空账单场景

#### 测试目的
验证空账单的处理逻辑。

#### 测试场景

| 场景ID | 场景描述 | 预期结果 |
|--------|---------|---------|
| BT-EM-001 | 双方都为空 | total_source=0, total_target=0 |
| BT-EM-002 | 源空目标有数据 | missing_in_source=目标记录数 |
| BT-EM-003 | 目标空源有数据 | missing_in_target=源记录数 |

#### Golden File说明

Golden File: `boundary_empty_bills.json`

---

### 4.2 单条记录场景

#### 测试目的
验证单笔交易的对账处理。

#### 测试场景

| 场景ID | 场景描述 | 预期结果 |
|--------|---------|---------|
| BT-SR-001 | 单条匹配 | matched=1 |
| BT-SR-002 | 单条金额差异 | amount_mismatches=1 |

#### Golden File说明

Golden File: `boundary_single_record.json`

单笔大额交易 (50000.00) 的对账结果

---

### 4.3 零金额场景

#### 测试目的
验证零金额交易的处理。

#### 测试场景

| 场景ID | 场景描述 | 预期结果 |
|--------|---------|---------|
| BT-ZA-001 | 零金额匹配 | matched=1 |
| BT-ZA-002 | 零vs非零 | amount_mismatches=1 |

#### 业务说明

零金额交易通常用于：
- 冲销交易
- 抵消错误记账
- 免费服务记录

#### Golden File说明

Golden File: `boundary_zero_amount.json`

---

### 4.4 负数金额场景

#### 测试目的
验证负数金额（支出）的处理。

#### 测试场景

| 场景ID | 场景描述 | 预期结果 |
|--------|---------|---------|
| BT-NA-001 | 负数支出匹配 | matched=1 |
| BT-NA-002 | 负vs正差异 | amount_mismatches=1, 差异=-200.00 |

#### 金额符号规则

- 正数：收入、回款
- 负数：支出、扣款

#### Golden File说明

Golden File: `boundary_negative_amount.json`

4条交易：
- 设备采购支出 (-15000.00)
- 差旅费 (-3500.50)
- 销售收入 (50000.00)
- 办公费用 (-2500.00)

---

### 4.5 跨年跨月场景

#### 测试目的
验证跨越月份和年份的数据集处理。

#### 测试场景

| 场景ID | 场景描述 | 日期范围 | 预期结果 |
|--------|---------|---------|---------|
| BT-CM-001 | 跨月数据 | 1月30日-2月1日 | 正确匹配 |
| BT-CY-001 | 跨年数据 | 12月30日-1月2日 | 正确匹配 |
| BT-DF-001 | 日期范围过滤 | 过滤1月外的交易 | 只处理范围内交易 |

#### Golden File说明

Golden File: `boundary_cross_year_month.json`

4条跨年交易：
- 年终结算收入 (2024-12-28, 25000.00)
- 年终奖金发放 (2024-12-30, -10000.00)
- 新年第一笔收入 (2025-01-02, 15000.00)
- 办公设备采购 (2025-01-05, -5000.00)

---

## 5. 容错测试说明

### 5.1 编码错误场景

#### 测试目的
验证CSV文件编码错误的处理。

#### 测试场景

| 场景ID | 场景描述 | 预期行为 |
|--------|---------|---------|
| ET-EN-001 | GBK文件用UTF-8读取 | 抛出CSVParserError，提示编码问题 |
| ET-EN-002 | 指定正确编码 | 正常解析 |

#### 错误信息格式

```
文件编码错误: 无法使用 {encoding} 编码解码文件。
请检查文件编码是否正确。错误详情: {error_message}
```

#### Golden File说明

Golden File: `error_encoding.json`

---

### 5.2 列名不一致场景

#### 测试目的
验证列名不匹配和列名映射功能。

#### 测试场景

| 场景ID | 场景描述 | 预期行为 |
|--------|---------|---------|
| ET-CM-001 | 中文列名无映射 | 抛出错误，提示缺少必需列 |
| ET-CM-002 | 使用列名映射 | 正常解析 |
| ET-CM-003 | 部分列名映射 | 混合使用映射和默认列名 |

#### 列名映射配置

```python
column_mapping = {
    "transaction_id": "交易编号",
    "date": "交易日期",
    "amount": "交易金额",
    "description": "交易描述",
}
```

#### Golden File说明

Golden File: `error_column_mismatch.json`

---

### 5.3 缺失必填字段场景

#### 测试目的
验证缺失必填字段的检测。

#### 测试场景

| 场景ID | 缺失字段 | 错误信息 |
|--------|---------|---------|
| ET-MF-001 | transaction_id | 提示缺少transaction_id列 |
| ET-MF-002 | date | 提示缺少date列 |
| ET-MF-003 | amount | 提示缺少amount列 |
| ET-MF-004 | 空交易ID值 | 提示交易ID不能为空 |

#### 必填字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| transaction_id | string | 交易唯一标识 |
| date | date | 交易日期 (YYYY-MM-DD) |
| amount | decimal | 交易金额 |
| description | string | 交易描述 |

#### 错误信息格式

```
CSV文件缺少必需的列: {columns}
可用列: {available_columns}
```

#### Golden File说明

Golden File: `error_missing_fields.json`

---

### 5.4 无效数据格式场景

#### 测试目的
验证无效数据格式的检测。

#### 测试场景

| 场景ID | 无效类型 | 错误信息 |
|--------|---------|---------|
| ET-ID-001 | 日期格式错误 | 无效的日期格式: {value}，预期格式: YYYY-MM-DD |
| ET-ID-002 | 金额格式错误 | 无效的金额: {value} |
| ET-ID-003 | 货币符号金额 | 无效的金额 (包含¥/$符号) |

#### 行号定位

错误信息包含行号，便于定位问题：
```
第 {row_num} 行解析错误: {error_message}
```

#### Golden File说明

Golden File: `error_invalid_data.json`

---

### 5.5 错误信息可用性测试

#### 测试目的
验证错误信息是否清晰可操作。

#### 验证标准

1. **包含可用列列表**：当缺少列时，显示文件中实际存在的列
2. **包含行号**：数据格式错误时，显示具体行号
3. **包含错误详情**：提供足够的调试信息

#### Golden File说明

Golden File: `error_messages_actionable.json`

---

## 6. 高级测试说明

### 6.1 多币种对账场景

#### 测试目的
验证多币种混合对账的处理。

#### 测试场景

| 场景ID | 场景描述 | 预期结果 |
|--------|---------|---------|
| AT-MC-001 | CNY和USD混合 | 按币种分别处理 |
| AT-MC-002 | USD交易对账 | 按汇率转换后比较 |
| AT-MC-003 | 汇率转换后差异 | 检测转换后的金额差异 |

#### Golden File说明

Golden File: `advanced_multi_currency.json`

---

### 6.2 组合容差场景

#### 测试目的
验证日期容差和金额容差的组合使用。

#### 测试场景

| 场景ID | 场景描述 | 预期结果 |
|--------|---------|---------|
| AT-CT-001 | 日期在容差内，金额在容差内 | matched |
| AT-CT-002 | 日期在容差内，金额超容差 | amount_mismatch |
| AT-CT-003 | 日期超容差，金额在容差内 | date_mismatch |
| AT-CT-004 | 都超容差 | date_mismatch (优先级更高) |

#### Golden File说明

Golden File: `advanced_combined_tolerance.json`

---

### 6.3 CSV格式错误场景

#### 测试目的
验证CSV格式错误的处理。

#### 测试场景

| 场景ID | 场景描述 | 预期行为 |
|--------|---------|---------|
| AT-CF-001 | 引号不匹配 | 抛出CSV格式错误 |
| AT-CF-002 | 空行 | 跳过或错误处理 |
| AT-CF-003 | 多余列 | 忽略多余列 |
| AT-CF-004 | 交易ID大小写 | 大小写敏感比较 |

#### Golden File说明

Golden File: `advanced_csv_format.json`

---

### 6.4 报告输出验证

#### 测试目的
验证对账报告的输出格式。

#### 验证项

1. **JSON格式正确性**：有效的JSON格式
2. **摘要信息完整性**：包含所有统计字段
3. **结果详情完整性**：每条结果包含必要字段
4. **错误信息格式**：清晰的错误描述

#### 报告结构

```json
{
  "summary": {
    "total_source": 3,
    "total_target": 3,
    "matched": 2,
    "amount_mismatches": 1,
    "date_mismatches": 0,
    "duplicates": 0,
    "missing_in_source": 0,
    "missing_in_target": 0
  },
  "results": [
    {
      "status": "matched",
      "transaction_id": "TXN001",
      "source": {...},
      "target": {...},
      "difference": null,
      "notes": "交易记录完全匹配"
    }
  ],
  "errors": []
}
```

---

## 7. Golden File模式说明

### 7.1 什么是Golden File

Golden File是一种测试模式，通过将实际输出与预先生成的"黄金文件"进行比较来验证测试结果。

### 7.2 Golden File管理

#### 文件位置
```
tests/golden_files/
├── unit_decimal_precision.json
├── unit_exchange_rate.json
├── unit_date_range.json
├── data_normal_reconciliation.json
├── data_amount_mismatch.json
├── data_date_mismatch.json
├── data_duplicate_entries.json
├── boundary_empty_bills.json
├── boundary_single_record.json
├── boundary_zero_amount.json
├── boundary_negative_amount.json
├── boundary_cross_year_month.json
├── error_encoding.json
├── error_column_mismatch.json
├── error_missing_fields.json
├── error_invalid_data.json
├── error_messages_actionable.json
├── advanced_multi_currency.json
├── advanced_combined_tolerance.json
├── advanced_csv_format.json
└── advanced_report_output.json
```

#### 创建Golden File

首次运行测试时，如果Golden File不存在，测试会：
1. 生成实际输出
2. 写入Golden File
3. 测试失败（提示审核Golden File）

#### 更新Golden File

当业务逻辑变更导致预期输出变化时：
1. 删除对应的Golden File
2. 重新运行测试生成新的Golden File
3. 审核确认新的Golden File内容正确

### 7.3 Golden File内容规范

每个Golden File包含：
- test_name: 测试名称
- results: 测试结果列表
- all_passed: 是否全部通过

结果字段：
- 测试输入参数
- 实际结果
- 预期结果
- 匹配状态

---

## 8. 测试执行指南

### 8.1 环境准备

```bash
# 安装依赖
pip install pytest

# 或使用开发依赖
pip install -e ".[dev]"
```

### 8.2 运行测试

```bash
# 运行所有测试
python -m pytest tests/ -v

# 运行指定测试文件
python -m pytest tests/test_unit.py -v

# 运行指定测试类
python -m pytest tests/test_unit.py::TestDecimalPrecision -v

# 运行指定测试方法
python -m pytest tests/test_unit.py::TestDecimalPrecision::test_decimal_vs_float_precision -v

# 使用简化脚本
python run_tests.py
```

### 8.3 测试报告

```bash
# 生成覆盖率报告
python -m pytest tests/ --cov=src --cov-report=html

# 生成JUnit XML报告
python -m pytest tests/ --junitxml=test-results.xml
```

---

## 9. 测试覆盖矩阵

### 9.1 功能覆盖

| 功能模块 | 单元测试 | 数据测试 | 边界测试 | 容错测试 | 高级测试 |
|---------|---------|---------|---------|---------|---------|
| Decimal精度 | ✓ | - | - | - | - |
| 汇率转换 | ✓ | - | - | - | ✓ |
| 日期范围 | ✓ | - | ✓ | - | - |
| 交易匹配 | ✓ | ✓ | ✓ | - | ✓ |
| CSV解析 | - | - | - | ✓ | ✓ |
| 列名映射 | - | - | - | ✓ | - |
| 容差处理 | ✓ | ✓ | - | - | ✓ |
| 报告输出 | - | - | - | - | ✓ |

### 9.2 场景覆盖

| 业务场景 | 覆盖状态 | 测试文件 |
|---------|---------|---------|
| 正常对账 | ✓ | test_data_scenarios.py |
| 金额差异 | ✓ | test_data_scenarios.py |
| 日期错位 | ✓ | test_data_scenarios.py |
| 重复条目 | ✓ | test_data_scenarios.py |
| 缺失交易 | ✓ | test_data_scenarios.py |
| 空账单 | ✓ | test_boundary.py |
| 单条记录 | ✓ | test_boundary.py |
| 零金额 | ✓ | test_boundary.py |
| 负数金额 | ✓ | test_boundary.py |
| 跨年跨月 | ✓ | test_boundary.py |
| 大额金额 | ✓ | test_boundary.py |
| 编码错误 | ✓ | test_error_handling.py |
| 列名不一致 | ✓ | test_error_handling.py |
| 缺失字段 | ✓ | test_error_handling.py |
| 无效数据 | ✓ | test_error_handling.py |
| 多币种对账 | ✓ | test_advanced.py |
| 组合容差 | ✓ | test_advanced.py |
| CSV格式错误 | ✓ | test_advanced.py |
| 报告输出验证 | ✓ | test_advanced.py |

---

## 10. 附录

### 10.1 CSV文件格式规范

#### 必填列

| 列名 | 格式 | 示例 |
|------|------|------|
| transaction_id | 字符串 | TXN001, INV-2024-001 |
| date | YYYY-MM-DD | 2024-01-15 |
| amount | 十进制数 | 1000.00, -500.25 |
| description | 字符串 | 销售收入, 办公用品采购 |

#### 可选列

| 列名 | 格式 | 说明 |
|------|------|------|
| currency | 字符串 | CNY, USD, EUR (默认CNY) |
| original_amount | 十进制数 | 原币金额 |
| original_currency | 字符串 | 原币种 |

#### 示例CSV

```csv
transaction_id,date,amount,description,currency
TXN001,2024-01-15,1000.00,销售收入,CNY
TXN002,2024-01-16,-500.25,办公用品采购,CNY
TXN003,2024-01-17,200.00,服务费收入,USD
```

### 10.2 测试数据构造指南

#### 正常数据构造原则

1. 包含正负金额（收入和支出）
2. 包含不同日期的交易
3. 包含不同金额精度（整数、两位小数）

#### 异常数据构造原则

1. 金额差异：在源和目标中设置不同金额
2. 日期差异：设置不同日期（考虑银行延迟场景）
3. 重复条目：同一ID出现多次
4. 缺失交易：一方有一方无

#### 边界数据构造原则

1. 空账单：只有表头
2. 单条记录：仅一条交易
3. 零金额：amount=0.00
4. 负数金额：支出类交易
5. 跨年跨月：12月到1月的交易

### 10.3 版本历史

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| 1.0.0 | 2024-04-29 | - | 初始版本 |
