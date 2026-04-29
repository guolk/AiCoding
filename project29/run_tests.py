import sys
import os
import json
import tempfile
import shutil
from datetime import date
from decimal import Decimal

sys.path.insert(0, '.')

from src.financial_reconciliation import (
    CSVParser,
    CSVParserError,
    DateRange,
    ExchangeRateProvider,
    FinancialReconciliator,
    Transaction,
    reconcile_files,
)
import csv

print("=" * 60)
print("运行完整测试套件")
print("=" * 60)

passed = 0
failed = 0
errors = []

def run_test(name, test_func):
    global passed, failed, errors
    print(f"\n[测试] {name} ... ", end="")
    try:
        test_func()
        print("通过")
        passed += 1
    except AssertionError as e:
        print(f"失败: {e}")
        failed += 1
        errors.append(f"{name}: {e}")
    except Exception as e:
        print(f"错误: {e}")
        failed += 1
        errors.append(f"{name}: {e}")

def create_test_csv(filepath, transactions, include_optional=False, encoding="utf-8"):
    fieldnames = ["transaction_id", "date", "amount", "description"]
    if include_optional:
        fieldnames.extend(["currency", "original_amount", "original_currency"])
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    with open(filepath, "w", encoding=encoding, newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for trans in transactions:
            row = {
                "transaction_id": trans["transaction_id"],
                "date": trans["date"].isoformat() if hasattr(trans["date"], "isoformat") else trans["date"],
                "amount": str(trans["amount"]) if hasattr(trans["amount"], "__str__") else trans["amount"],
                "description": trans["description"],
            }
            if include_optional:
                row["currency"] = trans.get("currency", "CNY")
                row["original_amount"] = str(trans.get("original_amount", "")) if trans.get("original_amount") else ""
                row["original_currency"] = trans.get("original_currency", "")
            writer.writerow(row)

temp_dir = tempfile.mkdtemp()
try:
    print("\n" + "=" * 40)
    print("单元测试 - Decimal精度")
    print("=" * 40)
    
    def test_decimal_vs_float():
        float_sum = 0.1 + 0.2
        decimal_sum = Decimal("0.1") + Decimal("0.2")
        assert float_sum != 0.3
        assert decimal_sum == Decimal("0.3")
    
    def test_currency_precision():
        amounts = [
            Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"),
            Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"),
        ]
        total = sum(amounts)
        assert total == Decimal("1.0")
    
    def test_decimal_rounding():
        assert Decimal("1.234").quantize(Decimal("0.00"), rounding="ROUND_HALF_UP") == Decimal("1.23")
        assert Decimal("1.235").quantize(Decimal("0.00"), rounding="ROUND_HALF_UP") == Decimal("1.24")
    
    run_test("Decimal vs Float精度", test_decimal_vs_float)
    run_test("货币计算精度", test_currency_precision)
    run_test("Decimal四舍五入", test_decimal_rounding)

    print("\n" + "=" * 40)
    print("单元测试 - 汇率转换")
    print("=" * 40)
    
    provider = ExchangeRateProvider()
    provider.set_rate("USD", "CNY", date(2024, 1, 15), Decimal("7.25"))
    provider.set_rate("EUR", "CNY", date(2024, 1, 15), Decimal("7.90"))
    
    def test_same_currency():
        result, rate = provider.convert(Decimal("100.00"), "CNY", "CNY", date(2024, 1, 15))
        assert result == Decimal("100.00")
        assert rate == Decimal("1.0")
    
    def test_usd_to_cny():
        result, rate = provider.convert(Decimal("100.00"), "USD", "CNY", date(2024, 1, 15))
        assert rate == Decimal("7.25")
        assert result == Decimal("725.00")
    
    def test_cny_to_usd():
        result, rate = provider.convert(Decimal("725.00"), "CNY", "USD", date(2024, 1, 15))
        assert result == Decimal("100.00")
    
    run_test("相同货币转换", test_same_currency)
    run_test("USD转CNY", test_usd_to_cny)
    run_test("CNY转USD", test_cny_to_usd)

    print("\n" + "=" * 40)
    print("单元测试 - 日期范围")
    print("=" * 40)
    
    def test_date_contains():
        date_range = DateRange(date(2024, 1, 1), date(2024, 1, 31))
        assert date_range.contains(date(2024, 1, 1))
        assert date_range.contains(date(2024, 1, 15))
        assert date_range.contains(date(2024, 1, 31))
        assert not date_range.contains(date(2023, 12, 31))
        assert not date_range.contains(date(2024, 2, 1))
    
    def test_date_days():
        range1 = DateRange(date(2024, 1, 1), date(2024, 1, 1))
        assert range1.days() == 1
        range2 = DateRange(date(2024, 1, 1), date(2024, 1, 7))
        assert range2.days() == 7
    
    def test_crosses_boundaries():
        range1 = DateRange(date(2024, 1, 15), date(2024, 1, 20))
        assert not range1.crosses_month_boundary()
        assert not range1.crosses_year_boundary()
        
        range2 = DateRange(date(2024, 1, 25), date(2024, 2, 5))
        assert range2.crosses_month_boundary()
        assert not range2.crosses_year_boundary()
        
        range3 = DateRange(date(2024, 12, 25), date(2025, 1, 5))
        assert range3.crosses_month_boundary()
        assert range3.crosses_year_boundary()
    
    run_test("日期范围包含检查", test_date_contains)
    run_test("日期范围天数计算", test_date_days)
    run_test("日期跨月跨年检测", test_crosses_boundaries)

    print("\n" + "=" * 40)
    print("数据测试 - 正常对账")
    print("=" * 40)
    
    def test_normal_reconciliation():
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试1",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2500.50"),
                "description": "测试2",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试1目标",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2500.50"),
                "description": "测试2目标",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_norm.csv")
        target_file = os.path.join(temp_dir, "target_norm.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert report.total_source == 2
        assert report.total_target == 2
        assert report.matched == 2
        assert report.amount_mismatches == 0
        assert report.date_mismatches == 0
    
    run_test("正常对账匹配", test_normal_reconciliation)

    print("\n" + "=" * 40)
    print("数据测试 - 金额差异")
    print("=" * 40)
    
    def test_amount_mismatch():
        source_trans = [
            {
                "transaction_id": "AMT001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "金额差异测试",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "AMT001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1050.00"),
                "description": "金额差异测试",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_amt.csv")
        target_file = os.path.join(temp_dir, "target_amt.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert report.amount_mismatches == 1
        assert report.matched == 0
    
    run_test("金额差异检测", test_amount_mismatch)

    print("\n" + "=" * 40)
    print("数据测试 - 日期错位")
    print("=" * 40)
    
    def test_date_mismatch():
        source_trans = [
            {
                "transaction_id": "DATE001",
                "date": date(2024, 1, 10),
                "amount": Decimal("1000.00"),
                "description": "日期测试",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "DATE001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "日期测试",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_date.csv")
        target_file = os.path.join(temp_dir, "target_date.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert report.date_mismatches == 1
        assert report.matched == 0
    
    run_test("日期错位检测", test_date_mismatch)

    print("\n" + "=" * 40)
    print("数据测试 - 重复条目")
    print("=" * 40)
    
    def test_duplicate_entries():
        source_trans = [
            {
                "transaction_id": "DUP001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "第一次",
                "currency": "CNY",
            },
            {
                "transaction_id": "DUP001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "第二次（重复）",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "DUP001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "目标",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_dup.csv")
        target_file = os.path.join(temp_dir, "target_dup.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert report.duplicates == 1
        assert report.total_source == 2
        assert report.total_target == 1
    
    run_test("重复条目检测", test_duplicate_entries)

    print("\n" + "=" * 40)
    print("边界测试 - 空账单")
    print("=" * 40)
    
    def test_empty_bills():
        source_file = os.path.join(temp_dir, "source_empty.csv")
        target_file = os.path.join(temp_dir, "target_empty.csv")
        
        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["transaction_id", "date", "amount", "description"])
            writer.writeheader()
        
        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["transaction_id", "date", "amount", "description"])
            writer.writeheader()
        
        report = reconcile_files(source_file, target_file)
        
        assert report.total_source == 0
        assert report.total_target == 0
        assert report.matched == 0
        assert report.errors == []
    
    run_test("空账单对账", test_empty_bills)

    print("\n" + "=" * 40)
    print("边界测试 - 单条记录")
    print("=" * 40)
    
    def test_single_record():
        source_trans = [
            {
                "transaction_id": "SINGLE001",
                "date": date(2024, 1, 1),
                "amount": Decimal("9999.99"),
                "description": "单笔测试",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "SINGLE001",
                "date": date(2024, 1, 1),
                "amount": Decimal("9999.99"),
                "description": "单笔测试",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_single.csv")
        target_file = os.path.join(temp_dir, "target_single.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert report.total_source == 1
        assert report.total_target == 1
        assert report.matched == 1
    
    run_test("单条记录对账", test_single_record)

    print("\n" + "=" * 40)
    print("边界测试 - 零金额和负数")
    print("=" * 40)
    
    def test_zero_amount():
        source_trans = [
            {
                "transaction_id": "ZERO001",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.00"),
                "description": "零金额",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "ZERO001",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.00"),
                "description": "零金额",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_zero.csv")
        target_file = os.path.join(temp_dir, "target_zero.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert report.matched == 1
    
    def test_negative_amount():
        source_trans = [
            {
                "transaction_id": "NEG001",
                "date": date(2024, 1, 15),
                "amount": Decimal("-500.00"),
                "description": "支出",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "NEG001",
                "date": date(2024, 1, 15),
                "amount": Decimal("-500.00"),
                "description": "支出",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_neg.csv")
        target_file = os.path.join(temp_dir, "target_neg.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert report.matched == 1
    
    run_test("零金额交易", test_zero_amount)
    run_test("负数金额交易", test_negative_amount)

    print("\n" + "=" * 40)
    print("边界测试 - 跨年跨月")
    print("=" * 40)
    
    def test_cross_year_month():
        source_trans = [
            {
                "transaction_id": "DEC2024",
                "date": date(2024, 12, 30),
                "amount": Decimal("1000.00"),
                "description": "2024年",
                "currency": "CNY",
            },
            {
                "transaction_id": "JAN2025",
                "date": date(2025, 1, 2),
                "amount": Decimal("2000.00"),
                "description": "2025年",
                "currency": "CNY",
            },
        ]
        
        target_trans = [
            {
                "transaction_id": "DEC2024",
                "date": date(2024, 12, 30),
                "amount": Decimal("1000.00"),
                "description": "2024年",
                "currency": "CNY",
            },
            {
                "transaction_id": "JAN2025",
                "date": date(2025, 1, 2),
                "amount": Decimal("2000.00"),
                "description": "2025年",
                "currency": "CNY",
            },
        ]
        
        source_file = os.path.join(temp_dir, "source_cross.csv")
        target_file = os.path.join(temp_dir, "target_cross.csv")
        
        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)
        
        date_range = DateRange(date(2024, 12, 20), date(2025, 1, 10))
        report = reconcile_files(source_file, target_file, date_range=date_range)
        
        assert report.total_source == 2
        assert report.total_target == 2
        assert report.matched == 2
    
    run_test("跨年跨月数据集", test_cross_year_month)

    print("\n" + "=" * 40)
    print("容错测试 - 列名不一致/缺失")
    print("=" * 40)
    
    def test_missing_columns():
        source_file = os.path.join(temp_dir, "source_missing_col.csv")
        
        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "date", "description"])
            writer.writerow(["TXN001", "2024-01-15", "测试"])
        
        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试",
                "currency": "CNY",
            },
        ]
        target_file = os.path.join(temp_dir, "target_missing_col.csv")
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "缺少" in error_msg or "必需的列" in error_msg
    
    def test_invalid_date_format():
        source_file = os.path.join(temp_dir, "source_bad_date.csv")
        
        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "15/01/2024", "1000.00", "测试"])
        
        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试",
                "currency": "CNY",
            },
        ]
        target_file = os.path.join(temp_dir, "target_bad_date.csv")
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "日期格式" in error_msg or "无效" in error_msg
    
    def test_invalid_amount_format():
        source_file = os.path.join(temp_dir, "source_bad_amt.csv")
        
        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "abc", "测试"])
        
        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试",
                "currency": "CNY",
            },
        ]
        target_file = os.path.join(temp_dir, "target_bad_amt.csv")
        create_test_csv(target_file, target_trans, include_optional=True)
        
        report = reconcile_files(source_file, target_file)
        
        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "金额" in error_msg or "无效" in error_msg
    
    def test_column_mapping():
        source_file = os.path.join(temp_dir, "source_mapped.csv")
        
        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["交易编号", "交易日期", "交易金额", "交易描述"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试"])
        
        target_file = os.path.join(temp_dir, "target_mapped.csv")
        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["交易编号", "交易日期", "交易金额", "交易描述"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试"])
        
        column_mapping = {
            "transaction_id": "交易编号",
            "date": "交易日期",
            "amount": "交易金额",
            "description": "交易描述",
        }
        
        report = reconcile_files(source_file, target_file, column_mapping=column_mapping)
        
        assert report.errors == []
        assert report.matched == 1
    
    run_test("缺失必要列", test_missing_columns)
    run_test("无效日期格式", test_invalid_date_format)
    run_test("无效金额格式", test_invalid_amount_format)
    run_test("列名映射", test_column_mapping)

    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    print(f"通过: {passed}")
    print(f"失败: {failed}")
    
    if errors:
        print("\n错误详情:")
        for err in errors:
            print(f"  - {err}")
    else:
        print("\n所有测试通过!")

finally:
    shutil.rmtree(temp_dir)

if failed > 0:
    sys.exit(1)
