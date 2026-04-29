import csv
import json
import os
from datetime import date
from decimal import Decimal
from pathlib import Path

import pytest

from src.financial_reconciliation import (
    CSVParser,
    ExchangeRateProvider,
    FinancialReconciliator,
    Transaction,
    reconcile_files,
)
from tests.conftest import create_test_csv, read_golden_file, write_golden_file


class TestNormalReconciliation:
    def test_perfect_match_all_transactions(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "销售收入 - 客户A",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2500.50"),
                "description": "办公用品采购",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN003",
                "date": date(2024, 1, 17),
                "amount": Decimal("500.00"),
                "description": "服务费收入",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "客户A付款",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2500.50"),
                "description": "办公用品支出",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN003",
                "date": date(2024, 1, 17),
                "amount": Decimal("500.00"),
                "description": "服务费到账",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source.csv")
        target_file = os.path.join(temp_dir, "target.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.total_source == 3
        assert report.total_target == 3
        assert report.matched == 3
        assert report.amount_mismatches == 0
        assert report.date_mismatches == 0
        assert report.duplicates == 0
        assert report.missing_in_source == 0
        assert report.missing_in_target == 0

    def test_golden_normal_reconciliation(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "INV001",
                "date": date(2024, 3, 1),
                "amount": Decimal("5000.00"),
                "description": "销售发票 #001 - 北京科技有限公司",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV002",
                "date": date(2024, 3, 5),
                "amount": Decimal("3200.75"),
                "description": "销售发票 #002 - 上海贸易公司",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP001",
                "date": date(2024, 3, 10),
                "amount": Decimal("-1500.00"),
                "description": "办公设备采购",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP002",
                "date": date(2024, 3, 15),
                "amount": Decimal("-800.50"),
                "description": "员工差旅费报销",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "INV001",
                "date": date(2024, 3, 1),
                "amount": Decimal("5000.00"),
                "description": "北京科技有限公司转账",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV002",
                "date": date(2024, 3, 5),
                "amount": Decimal("3200.75"),
                "description": "上海贸易公司付款",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP001",
                "date": date(2024, 3, 10),
                "amount": Decimal("-1500.00"),
                "description": "设备供应商扣款",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP002",
                "date": date(2024, 3, 15),
                "amount": Decimal("-800.50"),
                "description": "员工报销支付",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_normal.csv")
        target_file = os.path.join(temp_dir, "target_normal.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("data_normal_reconciliation")

        if not golden:
            write_golden_file("data_normal_reconciliation", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestAmountMismatch:
    def test_partial_amount_differences(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易1",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2500.00"),
                "description": "测试交易2",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易1",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2550.00"),
                "description": "测试交易2",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_amt.csv")
        target_file = os.path.join(temp_dir, "target_amt.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1
        assert report.amount_mismatches == 1

        mismatch_result = [
            r for r in report.results if r.status.value == "amount_mismatch"
        ][0]
        assert mismatch_result.difference == Decimal("-50.00")

    def test_amount_tolerance(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.05"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_tol.csv")
        target_file = os.path.join(temp_dir, "target_tol.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report_with_tolerance = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            amount_tolerance=Decimal("0.10"),
        )
        assert report_with_tolerance.matched == 1

        report_without_tolerance = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            amount_tolerance=Decimal("0.00"),
        )
        assert report_without_tolerance.amount_mismatches == 1

    def test_golden_amount_mismatch(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "INV2024001",
                "date": date(2024, 2, 1),
                "amount": Decimal("10000.00"),
                "description": "销售发票 - 广州电子科技",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV2024002",
                "date": date(2024, 2, 5),
                "amount": Decimal("7500.50"),
                "description": "销售发票 - 深圳软件公司",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP2024001",
                "date": date(2024, 2, 10),
                "amount": Decimal("-3000.00"),
                "description": "服务器租金",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "INV2024001",
                "date": date(2024, 2, 1),
                "amount": Decimal("10000.00"),
                "description": "广州电子科技付款",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV2024002",
                "date": date(2024, 2, 5),
                "amount": Decimal("7550.50"),
                "description": "深圳软件公司付款（含手续费）",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP2024001",
                "date": date(2024, 2, 10),
                "amount": Decimal("-2900.00"),
                "description": "服务器服务商扣款",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_amt_golden.csv")
        target_file = os.path.join(temp_dir, "target_amt_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("data_amount_mismatch")

        if not golden:
            write_golden_file("data_amount_mismatch", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestDateMismatch:
    def test_date_differences(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 10),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_date.csv")
        target_file = os.path.join(temp_dir, "target_date.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.date_mismatches == 1
        assert report.matched == 0

    def test_date_within_tolerance(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 10),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 12),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_date_tol.csv")
        target_file = os.path.join(temp_dir, "target_date_tol.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_tolerance_days=3,
        )

        assert report.matched == 1
        assert report.date_mismatches == 0

    def test_golden_date_mismatch(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "PAY001",
                "date": date(2024, 3, 1),
                "amount": Decimal("15000.00"),
                "description": "供应商付款 - 原材料A",
                "currency": "CNY",
            },
            {
                "transaction_id": "PAY002",
                "date": date(2024, 3, 5),
                "amount": Decimal("8500.25"),
                "description": "供应商付款 - 原材料B",
                "currency": "CNY",
            },
            {
                "transaction_id": "REC001",
                "date": date(2024, 3, 10),
                "amount": Decimal("25000.00"),
                "description": "客户回款",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "PAY001",
                "date": date(2024, 3, 3),
                "amount": Decimal("15000.00"),
                "description": "银行扣款 - 供应商A",
                "currency": "CNY",
            },
            {
                "transaction_id": "PAY002",
                "date": date(2024, 3, 8),
                "amount": Decimal("8500.25"),
                "description": "银行扣款 - 供应商B",
                "currency": "CNY",
            },
            {
                "transaction_id": "REC001",
                "date": date(2024, 3, 10),
                "amount": Decimal("25000.00"),
                "description": "银行到账",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_date_golden.csv")
        target_file = os.path.join(temp_dir, "target_date_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("data_date_mismatch")

        if not golden:
            write_golden_file("data_date_mismatch", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestDuplicateEntries:
    def test_duplicates_in_source(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易 - 第一次",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易 - 第二次（重复）",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_dup.csv")
        target_file = os.path.join(temp_dir, "target_dup.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.duplicates == 1
        assert report.total_source == 2
        assert report.total_target == 1

    def test_duplicates_in_both_files(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "源文件第一次",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "源文件第二次",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "目标文件第一次",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "目标文件第二次",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_dup2.csv")
        target_file = os.path.join(temp_dir, "target_dup2.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.duplicates == 1

    def test_golden_duplicate_entries(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "INV20240301",
                "date": date(2024, 3, 1),
                "amount": Decimal("20000.00"),
                "description": "销售发票 - 杭州科技（第一次录入）",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV20240301",
                "date": date(2024, 3, 1),
                "amount": Decimal("20000.00"),
                "description": "销售发票 - 杭州科技（重复录入）",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV20240305",
                "date": date(2024, 3, 5),
                "amount": Decimal("15000.00"),
                "description": "销售发票 - 南京贸易",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP20240310",
                "date": date(2024, 3, 10),
                "amount": Decimal("-5000.00"),
                "description": "办公费用",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP20240310",
                "date": date(2024, 3, 10),
                "amount": Decimal("-5000.00"),
                "description": "办公费用（重复）",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "INV20240301",
                "date": date(2024, 3, 1),
                "amount": Decimal("20000.00"),
                "description": "杭州科技转账",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV20240305",
                "date": date(2024, 3, 5),
                "amount": Decimal("15000.00"),
                "description": "南京贸易付款",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP20240310",
                "date": date(2024, 3, 10),
                "amount": Decimal("-5000.00"),
                "description": "办公用品采购扣款",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_dup_golden.csv")
        target_file = os.path.join(temp_dir, "target_dup_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("data_duplicate_entries")

        if not golden:
            write_golden_file("data_duplicate_entries", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestMissingTransactions:
    def test_missing_in_target(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "存在的交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2000.00"),
                "description": "缺失的交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "存在的交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_miss.csv")
        target_file = os.path.join(temp_dir, "target_miss.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1
        assert report.missing_in_target == 1
        assert report.total_source == 2
        assert report.total_target == 1

    def test_missing_in_source(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "存在的交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "存在的交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "TXN002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2000.00"),
                "description": "额外的交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_miss2.csv")
        target_file = os.path.join(temp_dir, "target_miss2.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1
        assert report.missing_in_source == 1
