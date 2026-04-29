# 财务对账脚本测试指南

## 目录

1. [快速开始](#1-快速开始)
2. [测试环境搭建](#2-测试环境搭建)
3. [运行测试](#3-运行测试)
4. [编写新测试](#4-编写新测试)
5. [Golden File管理](#5-golden-file管理)
6. [调试测试](#6-调试测试)
7. [最佳实践](#7-最佳实践)
8. [常见问题](#8-常见问题)

---

## 1. 快速开始

### 1.1 一键运行所有测试

```bash
cd d:\TARE_workspace\test\project29

# 使用简化脚本（推荐）
python run_tests.py

# 或使用pytest
python -m pytest tests/ -v
```

### 1.2 预期输出

```
============================================================
运行完整测试套件
============================================================

========================================
单元测试 - Decimal精度
========================================

[测试] Decimal vs Float精度 ... 通过
[测试] 货币计算精度 ... 通过
[测试] Decimal四舍五入 ... 通过
...

============================================================
测试结果汇总
============================================================
通过: 35
失败: 0

所有测试通过!
```

---

## 2. 测试环境搭建

### 2.1 系统要求

- Python 3.6+
- pytest 7.0+

### 2.2 安装依赖

```bash
# 安装pytest
pip install --user pytest

# 验证安装
python -m pytest --version
```

### 2.3 项目结构

```
project29/
├── src/                          # 源代码目录
│   ├── __init__.py
│   └── financial_reconciliation.py    # 核心对账模块
├── tests/                        # 测试目录
│   ├── conftest.py              # pytest配置和fixtures
│   ├── test_unit.py             # 单元测试
│   ├── test_data_scenarios.py   # 数据测试
│   ├── test_boundary.py         # 边界测试
│   ├── test_error_handling.py   # 容错测试
│   ├── test_advanced.py         # 高级测试
│   └── golden_files/            # Golden File目录
│       ├── unit_*.json
│       ├── data_*.json
│       ├── boundary_*.json
│       ├── error_*.json
│       └── advanced_*.json
├── pyproject.toml               # 项目配置
├── run_tests.py                 # 简化测试运行脚本
├── verify_module.py             # 模块验证脚本
├── TEST_SPECIFICATION.md        # 测试说明文档
└── TEST_GUIDE.md                # 测试指南（本文档）
```

---

## 3. 运行测试

### 3.1 运行所有测试

```bash
# 方法1: 使用简化脚本
python run_tests.py

# 方法2: 使用pytest
python -m pytest tests/ -v
```

### 3.2 运行指定测试文件

```bash
# 单元测试
python -m pytest tests/test_unit.py -v

# 数据测试
python -m pytest tests/test_data_scenarios.py -v

# 边界测试
python -m pytest tests/test_boundary.py -v

# 容错测试
python -m pytest tests/test_error_handling.py -v

# 高级测试
python -m pytest tests/test_advanced.py -v
```

### 3.3 运行指定测试类

```bash
# Decimal精度测试类
python -m pytest tests/test_unit.py::TestDecimalPrecision -v

# 汇率转换测试类
python -m pytest tests/test_unit.py::TestExchangeRateConversion -v

# 正常对账测试类
python -m pytest tests/test_data_scenarios.py::TestNormalReconciliation -v
```

### 3.4 运行指定测试方法

```bash
# Decimal vs Float精度测试
python -m pytest tests/test_unit.py::TestDecimalPrecision::test_decimal_vs_float_precision -v

# 空账单测试
python -m pytest tests/test_boundary.py::TestEmptyBills::test_both_files_empty -v
```

### 3.5 按测试类型过滤

```bash
# 只运行包含"golden"的测试
python -m pytest tests/ -v -k "golden"

# 只运行包含"decimal"的测试
python -m pytest tests/ -v -k "decimal"

# 只运行包含"mismatch"的测试
python -m pytest tests/ -v -k "mismatch"
```

### 3.6 生成测试报告

```bash
# 生成JUnit XML报告（CI/CD集成用）
python -m pytest tests/ --junitxml=test-results.xml

# 生成覆盖率报告
python -m pytest tests/ --cov=src --cov-report=html

# 生成覆盖率摘要
python -m pytest tests/ --cov=src --cov-report=term-missing
```

---

## 4. 编写新测试

### 4.1 测试文件命名规范

| 测试类型 | 文件命名 | 示例 |
|---------|---------|------|
| 单元测试 | test_unit_*.py | test_unit_decimal.py |
| 数据测试 | test_data_*.py | test_data_scenarios.py |
| 边界测试 | test_boundary_*.py | test_boundary_edge.py |
| 容错测试 | test_error_*.py | test_error_handling.py |
| 集成测试 | test_integration_*.py | test_integration_flow.py |

### 4.2 测试类结构

```python
import pytest
from src.financial_reconciliation import ...

class TestFeatureName:
    """功能描述"""
    
    def test_scenario_1(self, temp_dir, sample_exchange_rates):
        """场景1描述"""
        # 1. 准备测试数据
        source_trans = [...]
        target_trans = [...]
        
        # 2. 创建测试文件
        source_file = os.path.join(temp_dir, "source.csv")
        target_file = os.path.join(temp_dir, "target.csv")
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        # 3. 执行测试
        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )
        
        # 4. 验证结果
        assert report.matched == expected_matched
        assert report.amount_mismatches == expected_mismatches
    
    def test_scenario_2_golden(self, temp_dir, sample_exchange_rates):
        """Golden File测试场景"""
        # 1. 准备测试数据
        source_trans = [...]
        target_trans = [...]
        
        # 2. 创建测试文件
        source_file = os.path.join(temp_dir, "source.csv")
        target_file = os.path.join(temp_dir, "target.csv")
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        # 3. 执行测试
        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )
        
        # 4. 生成实际输出
        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        
        # 5. 读取并对比Golden File
        golden = read_golden_file("test_feature_scenario_2")
        
        if not golden:
            # 首次运行：创建Golden File
            write_golden_file("test_feature_scenario_2", actual_output)
            pytest.fail("Golden file created, please review")
        
        # 后续运行：对比验证
        assert actual_output == golden
```

### 4.3 Fixture使用说明

#### 内置Fixture

| Fixture名称 | 说明 |
|------------|------|
| temp_dir | 临时目录，测试结束后自动清理 |
| sample_exchange_rates | 预配置的汇率提供者（USD:7.25, EUR:7.90, GBP:9.15） |
| tmp_path | pytest内置临时目录 |

#### 自定义Fixture (conftest.py)

```python
import pytest
import tempfile
import shutil
from datetime import date
from decimal import Decimal

@pytest.fixture
def temp_dir():
    """创建临时目录，测试后自动清理"""
    temp = tempfile.mkdtemp()
    yield temp
    shutil.rmtree(temp)

@pytest.fixture
def sample_exchange_rates():
    """预配置的汇率提供者"""
    from src.financial_reconciliation import ExchangeRateProvider
    provider = ExchangeRateProvider()
    provider.set_rate("USD", "CNY", date(2024, 1, 15), Decimal("7.25"))
    provider.set_rate("USD", "CNY", date(2024, 6, 30), Decimal("7.20"))
    provider.set_rate("EUR", "CNY", date(2024, 1, 15), Decimal("7.90"))
    provider.set_rate("GBP", "CNY", date(2024, 1, 15), Decimal("9.15"))
    return provider
```

### 4.4 测试数据构造模板

#### 正常交易数据

```python
source_trans = [
    {
        "transaction_id": "TXN001",
        "date": date(2024, 1, 15),
        "amount": Decimal("1000.00"),
        "description": "销售收入",
        "currency": "CNY",
    },
    {
        "transaction_id": "TXN002",
        "date": date(2024, 1, 16),
        "amount": Decimal("-500.25"),
        "description": "办公用品采购",
        "currency": "CNY",
    },
]
```

#### 金额差异数据

```python
source_trans = [
    {
        "transaction_id": "DIFF001",
        "date": date(2024, 1, 15),
        "amount": Decimal("1000.00"),
        "description": "源文件金额",
        "currency": "CNY",
    },
]

target_trans = [
    {
        "transaction_id": "DIFF001",
        "date": date(2024, 1, 15),
        "amount": Decimal("1050.00"),  # 差异50元
        "description": "目标文件金额",
        "currency": "CNY",
    },
]
```

#### 日期差异数据

```python
source_trans = [
    {
        "transaction_id": "DATE001",
        "date": date(2024, 1, 10),
        "amount": Decimal("1000.00"),
        "description": "源文件日期",
        "currency": "CNY",
    },
]

target_trans = [
    {
        "transaction_id": "DATE001",
        "date": date(2024, 1, 15),  # 延迟5天
        "amount": Decimal("1000.00"),
        "description": "目标文件日期",
        "currency": "CNY",
    },
]
```

#### 重复条目数据

```python
source_trans = [
    {
        "transaction_id": "DUP001",
        "date": date(2024, 1, 15),
        "amount": Decimal("1000.00"),
        "description": "第一次录入",
        "currency": "CNY",
    },
    {
        "transaction_id": "DUP001",  # 相同ID
        "date": date(2024, 1, 15),
        "amount": Decimal("1000.00"),
        "description": "第二次录入（重复）",
        "currency": "CNY",
    },
]
```

---

## 5. Golden File管理

### 5.1 Golden File工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                    Golden File 工作流程                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  首次运行测试:                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 执行测试  │───▶│生成实际输出│───▶│创建Golden│              │
│  └──────────┘    └──────────┘    │  File    │              │
│                                    └────┬─────┘              │
│                                         │                     │
│                                         ▼                     │
│                                    测试失败（提示审核）          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  后续运行测试:                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 执行测试  │───▶│生成实际输出│───▶│对比Golden│              │
│  └──────────┘    └──────────┘    │  File    │              │
│                                    └────┬─────┘              │
│                                         │                     │
│                          ┌──────────────┴──────────────┐    │
│                          ▼                             ▼    │
│                    ┌──────────┐                   ┌──────────┐│
│                    │ 匹配成功  │                   │ 匹配失败  ││
│                    │ 测试通过  │                   │ 测试失败  ││
│                    └──────────┘                   └──────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 创建Golden File

#### 自动创建（推荐）

首次运行包含Golden File的测试时，系统会自动创建：

```bash
python -m pytest tests/test_unit.py::TestDecimalPrecision::test_golden_decimal_calculations -v
```

输出：
```
FAILED tests/test_unit.py::TestDecimalPrecision::test_golden_decimal_calculations
    - Golden file created, please review
```

#### 手动审核

1. 查看生成的Golden File:
   ```
   tests/golden_files/unit_decimal_precision.json
   ```

2. 确认内容正确后，重新运行测试：
   ```bash
   python -m pytest tests/test_unit.py::TestDecimalPrecision::test_golden_decimal_calculations -v
   ```

3. 测试通过

### 5.3 更新Golden File

当业务逻辑变更导致预期输出变化时：

#### 方法1: 删除后重建

```bash
# 删除指定Golden File
del tests\golden_files\unit_decimal_precision.json

# 重新运行测试创建新的Golden File
python -m pytest tests/test_unit.py::TestDecimalPrecision::test_golden_decimal_calculations -v

# 审核确认后再次运行
python -m pytest tests/test_unit.py::TestDecimalPrecision::test_golden_decimal_calculations -v
```

#### 方法2: 使用pytest参数

```bash
# 使用--update-golden参数（需要配置）
python -m pytest tests/ --update-golden
```

### 5.4 Golden File内容示例

```json
{
  "test_name": "decimal_precision",
  "results": [
    {
      "operation": "addition",
      "operands": ["0.1", "0.2"],
      "result": "0.3",
      "expected": "0.3",
      "match": true
    },
    {
      "operation": "multiplication",
      "operands": ["0.1", "3"],
      "result": "0.3",
      "expected": "0.3",
      "match": true
    }
  ],
  "all_passed": true
}
```

### 5.5 Golden File命名规范

| 测试类型 | 命名前缀 | 示例 |
|---------|---------|------|
| 单元测试 | unit_* | unit_decimal_precision.json |
| 数据测试 | data_* | data_normal_reconciliation.json |
| 边界测试 | boundary_* | boundary_empty_bills.json |
| 容错测试 | error_* | error_encoding.json |
| 高级测试 | advanced_* | advanced_multi_currency.json |

---

## 6. 调试测试

### 6.1 常用调试技巧

#### 打印中间结果

```python
def test_debug_example(self, temp_dir, sample_exchange_rates):
    # 准备数据...
    
    report = reconcile_files(source_file, target_file)
    
    # 打印报告用于调试
    import json
    print(json.dumps(report.to_dict(), indent=2, ensure_ascii=False))
    
    # 断言...
```

运行时显示打印：
```bash
python -m pytest tests/ -v -s
```

#### 使用pytest.set_trace()

```python
def test_debug_example(self):
    # 准备数据...
    
    import pytest
    pytest.set_trace()  # 进入调试模式
    
    # 断言...
```

#### 增加详细输出

```bash
# 显示详细的断言信息
python -m pytest tests/ -v --tb=long

# 显示本地变量
python -m pytest tests/ -v --tb=short -l
```

### 6.2 常见错误诊断

#### 错误1: Golden File不匹配

```
AssertionError: '{\n  "test_name": ...' != '{\n  "test_name": ...'
```

**可能原因:**
- 业务逻辑变更
- 测试数据变更
- Golden File未更新

**解决方法:**
1. 检查实际输出与Golden File的差异
2. 确认变更是预期的
3. 更新Golden File

#### 错误2: 编码问题

```
UnicodeEncodeError: 'gbk' codec can't encode character
```

**可能原因:**
- Windows控制台默认GBK编码
- 输出包含特殊字符

**解决方法:**
```bash
# 设置环境变量
set PYTHONIOENCODING=utf-8

# 或在代码中指定
import sys
sys.stdout.reconfigure(encoding='utf-8')
```

#### 错误3: 模块导入失败

```
ModuleNotFoundError: No module named 'src'
```

**可能原因:**
- Python路径未正确设置
- 工作目录不正确

**解决方法:**
```bash
# 确保在项目根目录运行
cd d:\TARE_workspace\test\project29

# 或设置PYTHONPATH
set PYTHONPATH=d:\TARE_workspace\test\project29
```

#### 错误4: 文件权限问题

```
PermissionError: [WinError 5] 拒绝访问
```

**可能原因:**
- 临时目录权限问题
- 文件被其他程序占用

**解决方法:**
- 检查临时目录权限
- 关闭可能占用文件的程序
- 使用管理员权限运行

### 6.3 pytest命令速查

| 命令 | 说明 |
|------|------|
| `-v` | 详细输出 |
| `-s` | 显示print输出 |
| `-k "pattern"` | 按名称过滤测试 |
| `-x` | 首次失败后停止 |
| `--tb=short` | 简短的回溯信息 |
| `--tb=long` | 详细的回溯信息 |
| `--tb=no` | 不显示回溯 |
| `--collect-only` | 只收集测试，不执行 |
| `--co` | 同上 |
| `-q` | 安静模式 |
| `--lf` | 只运行上次失败的测试 |
| `--ff` | 先运行失败的测试 |

---

## 7. 最佳实践

### 7.1 测试设计原则

#### 1. 单一职责

每个测试方法只测试一个场景：

```python
# 好的做法
def test_exact_match(self):
    """测试完全匹配的交易"""
    ...

def test_amount_mismatch(self):
    """测试金额差异的交易"""
    ...

def test_date_mismatch(self):
    """测试日期差异的交易"""
    ...

# 不好的做法
def test_everything(self):
    """测试所有场景（不推荐）"""
    # 测试匹配...
    # 测试金额差异...
    # 测试日期差异...
```

#### 2. 独立隔离

每个测试应该相互独立，不依赖其他测试的状态：

```python
# 好的做法：使用fixture创建临时文件
def test_scenario_1(self, temp_dir):
    source_file = os.path.join(temp_dir, "source.csv")
    # ...

def test_scenario_2(self, temp_dir):
    source_file = os.path.join(temp_dir, "source.csv")  # 新的临时目录
    # ...

# 不好的做法：共享文件
SHARED_FILE = "shared.csv"

def test_scenario_1(self):
    # 修改共享文件...

def test_scenario_2(self):
    # 依赖第一个测试的状态...
```

#### 3. 清晰命名

使用描述性的测试方法名：

```python
# 好的做法
def test_decimal_vs_float_precision(self):
    ...

def test_usd_to_cny_conversion_with_rate_7_25(self):
    ...

def test_date_range_contains_boundary_dates(self):
    ...

# 不好的做法
def test_1(self):
    ...

def test_thing(self):
    ...
```

### 7.2 测试数据管理

#### 1. 避免硬编码

使用fixture或配置文件管理测试数据：

```python
# 好的做法：使用fixture
@pytest.fixture
def sample_transactions():
    return [
        {
            "transaction_id": "TXN001",
            "date": date(2024, 1, 15),
            "amount": Decimal("1000.00"),
            "description": "测试交易",
            "currency": "CNY",
        },
    ]

def test_with_sample_data(self, sample_transactions):
    # 使用sample_transactions
    ...
```

#### 2. 边界值测试

确保测试边界值：

```python
# 日期边界
test_dates = [
    date(2024, 1, 1),      # 月初
    date(2024, 1, 15),     # 月中
    date(2024, 1, 31),     # 月末
    date(2024, 2, 29),     # 闰年2月
    date(2024, 12, 31),    # 年末
]

# 金额边界
test_amounts = [
    Decimal("0.00"),       # 零金额
    Decimal("0.01"),       # 最小单位
    Decimal("-0.01"),      # 最小负数
    Decimal("999999.99"),  # 大额
    Decimal("-999999.99"), # 大额负数
]
```

### 7.3 Golden File最佳实践

#### 1. 内容稳定

Golden File的内容应该是稳定的，避免包含时间戳、随机数等：

```python
# 好的做法：使用固定日期
test_date = date(2024, 1, 15)

# 不好的做法：使用当前日期
import datetime
test_date = datetime.date.today()  # 每天都不一样！
```

#### 2. 审核流程

建立Golden File审核流程：

1. **创建阶段**: 开发人员创建Golden File
2. **审核阶段**: 代码审查人员审核Golden File内容
3. **确认阶段**: 审核通过后，Golden File被视为基准
4. **维护阶段**: 变更需要重新审核

#### 3. 版本控制

将Golden File纳入版本控制：

```bash
# 添加到git
git add tests/golden_files/*.json

# 提交
git commit -m "Add golden files for reconciliation tests"
```

---

## 8. 常见问题

### Q1: 如何添加新的测试场景？

**步骤:**
1. 确定测试类型（单元/数据/边界/容错/高级）
2. 在对应测试文件中创建测试类或方法
3. 准备测试数据
4. 实现测试逻辑
5. 验证测试通过

**示例:**
```python
# 在test_data_scenarios.py中添加
class TestNewScenario:
    """新场景描述"""
    
    def test_new_case(self, temp_dir, sample_exchange_rates):
        # 准备数据
        # 创建文件
        # 执行测试
        # 验证结果
```

### Q2: 如何处理测试失败？

**诊断流程:**
1. 查看详细错误信息: `pytest -v --tb=long`
2. 打印中间结果: 添加`print()`语句，使用`-s`参数
3. 检查测试数据是否正确
4. 确认业务逻辑是否变更
5. 验证Golden File是否需要更新

### Q3: 如何处理CI/CD集成？

**推荐配置:**
```bash
# 命令行参数
python -m pytest tests/ -v --junitxml=test-results.xml --tb=short

# 失败时停止
python -m pytest tests/ -x

# 只运行上次失败的
python -m pytest tests/ --lf
```

**GitHub Actions示例:**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install pytest
      - run: python -m pytest tests/ -v
```

### Q4: 测试运行太慢怎么办？

**优化建议:**
1. **并行测试**: 使用`pytest-xdist`
   ```bash
   pip install pytest-xdist
   python -m pytest tests/ -n 4  # 使用4个进程
   ```

2. **只运行相关测试**:
   ```bash
   # 只运行修改相关的测试
   python -m pytest tests/test_unit.py -v
   ```

3. **缓存fixture**:
   ```python
   @pytest.fixture(scope="session")  # 会话级别缓存
   def expensive_fixture():
       # 昂贵的初始化操作
       ...
   ```

### Q5: 如何编写可维护的测试？

**建议:**
1. **遵循AAA模式**: Arrange（准备）- Act（执行）- Assert（验证）
2. **使用描述性名称**: 测试方法名应该说明测试什么
3. **保持测试简洁**: 每个测试只关注一个点
4. **文档化测试**: 添加注释说明测试的业务场景
5. **定期重构**: 像维护生产代码一样维护测试代码

---

## 附录

### A. 测试类型速查表

| 测试类型 | 目的 | 示例场景 |
|---------|------|---------|
| 单元测试 | 验证单个组件功能 | Decimal计算、汇率转换 |
| 数据测试 | 验证业务场景 | 正常对账、金额差异 |
| 边界测试 | 验证边界条件 | 空账单、单条记录 |
| 容错测试 | 验证错误处理 | 编码错误、缺失字段 |
| 集成测试 | 验证组件协作 | 端到端对账流程 |

### B. 断言最佳实践

```python
# 好的做法：明确的断言
assert report.matched == 1
assert report.amount_mismatches == 0
assert report.total_source == 3

# 不好的做法：模糊的断言
assert report is not None
assert len(report.results) > 0
```

### C. 常用测试数据模板

```python
# 标准交易
standard_transaction = {
    "transaction_id": "TXN001",
    "date": date(2024, 1, 15),
    "amount": Decimal("1000.00"),
    "description": "标准交易",
    "currency": "CNY",
}

# 收入交易
income_transaction = {
    "transaction_id": "INC001",
    "date": date(2024, 1, 15),
    "amount": Decimal("5000.00"),  # 正数
    "description": "销售收入",
    "currency": "CNY",
}

# 支出交易
expense_transaction = {
    "transaction_id": "EXP001",
    "date": date(2024, 1, 15),
    "amount": Decimal("-500.00"),  # 负数
    "description": "办公用品采购",
    "currency": "CNY",
}

# 零金额交易
zero_transaction = {
    "transaction_id": "ZER001",
    "date": date(2024, 1, 15),
    "amount": Decimal("0.00"),  # 零
    "description": "冲销交易",
    "currency": "CNY",
}

# 外币交易
foreign_transaction = {
    "transaction_id": "FOR001",
    "date": date(2024, 1, 15),
    "amount": Decimal("100.00"),
    "description": "美元交易",
    "currency": "USD",
}
```

---

**文档版本**: 1.0.0  
**最后更新**: 2024-04-29
