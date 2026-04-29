import csv
import json
import os
from datetime import date
from decimal import Decimal
from pathlib import Path

import pytest

from src.financial_reconciliation import (
    CSVParser,
    DateRange,
    ExchangeRateProvider,
    FinancialReconciliator,
    Transaction,
    reconcile_files,
)
from tests.conftest import create_test_csv, read_golden_file, write_golden_file


class TestEmptyBills:
    def test_both_files_empty(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_empty.csv")
        target_file = os.path.join(temp_dir, "target_empty.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["transaction_id", "date", "amount", "description"]
            )
            writer.writeheader()

        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["transaction_id", "date", "amount", "description"]
            )
            writer.writeheader()

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.total_source == 0
        assert report.total_target == 0
        assert report.matched == 0
        assert report.results == []
        assert report.errors == []

    def test_source_empty_target_has_data(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_empty2.csv")
        target_file = os.path.join(temp_dir, "target_data.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["transaction_id", "date", "amount", "description"]
            )
            writer.writeheader()

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.total_source == 0
        assert report.total_target == 1
        assert report.missing_in_source == 1

    def test_target_empty_source_has_data(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_data.csv")
        target_file = os.path.join(temp_dir, "target_empty2.csv")

        source_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]
        create_test_csv(source_file, source_trans, include_optional=True)

        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["transaction_id", "date", "amount", "description"]
            )
            writer.writeheader()

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.total_source == 1
        assert report.total_target == 0
        assert report.missing_in_target == 1

    def test_golden_empty_bills(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_empty_golden.csv")
        target_file = os.path.join(temp_dir, "target_empty_golden.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["transaction_id", "date", "amount", "description"]
            )
            writer.writeheader()

        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["transaction_id", "date", "amount", "description"]
            )
            writer.writeheader()

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("boundary_empty_bills")

        if not golden:
            write_golden_file("boundary_empty_bills", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestSingleRecord:
    def test_single_record_matched(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "SINGLE001",
                "date": date(2024, 1, 1),
                "amount": Decimal("9999.99"),
                "description": "单笔测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "SINGLE001",
                "date": date(2024, 1, 1),
                "amount": Decimal("9999.99"),
                "description": "单笔测试交易（目标）",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_single.csv")
        target_file = os.path.join(temp_dir, "target_single.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.total_source == 1
        assert report.total_target == 1
        assert report.matched == 1

    def test_single_record_amount_mismatch(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "SINGLE002",
                "date": date(2024, 1, 1),
                "amount": Decimal("100.00"),
                "description": "单笔金额差异测试",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "SINGLE002",
                "date": date(2024, 1, 1),
                "amount": Decimal("101.00"),
                "description": "单笔金额差异测试",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_single2.csv")
        target_file = os.path.join(temp_dir, "target_single2.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.amount_mismatches == 1
        assert report.matched == 0

    def test_golden_single_record(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "INV-SINGLE-2024-001",
                "date": date(2024, 6, 15),
                "amount": Decimal("50000.00"),
                "description": "单笔大额交易 - 年度服务费",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "INV-SINGLE-2024-001",
                "date": date(2024, 6, 15),
                "amount": Decimal("50000.00"),
                "description": "年度服务费到账",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_single_golden.csv")
        target_file = os.path.join(temp_dir, "target_single_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("boundary_single_record")

        if not golden:
            write_golden_file("boundary_single_record", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestZeroAmount:
    def test_zero_amount_transaction(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "ZERO001",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.00"),
                "description": "零金额交易 - 冲销",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "ZERO001",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.00"),
                "description": "零金额交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_zero.csv")
        target_file = os.path.join(temp_dir, "target_zero.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1

    def test_zero_vs_non_zero_mismatch(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "ZERO002",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.00"),
                "description": "零金额",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "ZERO002",
                "date": date(2024, 1, 15),
                "amount": Decimal("1.00"),
                "description": "非零金额",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_zero2.csv")
        target_file = os.path.join(temp_dir, "target_zero2.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.amount_mismatches == 1

    def test_golden_zero_amount(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "OFFSET-2024-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("0.00"),
                "description": "冲销交易 - 抵消错误记账",
                "currency": "CNY",
            },
            {
                "transaction_id": "NORMAL-2024-001",
                "date": date(2024, 3, 2),
                "amount": Decimal("1000.00"),
                "description": "正常交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "OFFSET-2024-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("0.00"),
                "description": "银行冲销记录",
                "currency": "CNY",
            },
            {
                "transaction_id": "NORMAL-2024-001",
                "date": date(2024, 3, 2),
                "amount": Decimal("1000.00"),
                "description": "正常到账",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_zero_golden.csv")
        target_file = os.path.join(temp_dir, "target_zero_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("boundary_zero_amount")

        if not golden:
            write_golden_file("boundary_zero_amount", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestNegativeAmount:
    def test_negative_amount_expense(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "NEG001",
                "date": date(2024, 1, 15),
                "amount": Decimal("-500.00"),
                "description": "支出交易 - 办公用品",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "NEG001",
                "date": date(2024, 1, 15),
                "amount": Decimal("-500.00"),
                "description": "办公用品扣款",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_neg.csv")
        target_file = os.path.join(temp_dir, "target_neg.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1

    def test_negative_vs_positive_mismatch(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "NEG002",
                "date": date(2024, 1, 15),
                "amount": Decimal("-100.00"),
                "description": "支出",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "NEG002",
                "date": date(2024, 1, 15),
                "amount": Decimal("100.00"),
                "description": "收入",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_neg2.csv")
        target_file = os.path.join(temp_dir, "target_neg2.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.amount_mismatches == 1
        assert report.results[0].difference == Decimal("-200.00")

    def test_golden_negative_amount(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "EXP-2024-03-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("-15000.00"),
                "description": "设备采购支出",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP-2024-03-002",
                "date": date(2024, 3, 5),
                "amount": Decimal("-3500.50"),
                "description": "员工差旅费",
                "currency": "CNY",
            },
            {
                "transaction_id": "REV-2024-03-001",
                "date": date(2024, 3, 10),
                "amount": Decimal("50000.00"),
                "description": "销售收入",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP-2024-03-003",
                "date": date(2024, 3, 15),
                "amount": Decimal("-2500.00"),
                "description": "办公费用",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "EXP-2024-03-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("-15000.00"),
                "description": "设备供应商扣款",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP-2024-03-002",
                "date": date(2024, 3, 5),
                "amount": Decimal("-3500.50"),
                "description": "差旅费报销支付",
                "currency": "CNY",
            },
            {
                "transaction_id": "REV-2024-03-001",
                "date": date(2024, 3, 10),
                "amount": Decimal("50000.00"),
                "description": "客户汇款到账",
                "currency": "CNY",
            },
            {
                "transaction_id": "EXP-2024-03-003",
                "date": date(2024, 3, 15),
                "amount": Decimal("-2500.00"),
                "description": "办公用品采购",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_neg_golden.csv")
        target_file = os.path.join(temp_dir, "target_neg_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("boundary_negative_amount")

        if not golden:
            write_golden_file("boundary_negative_amount", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestCrossYearMonth:
    def test_cross_month_data(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "CM001",
                "date": date(2024, 1, 30),
                "amount": Decimal("1000.00"),
                "description": "1月交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "CM002",
                "date": date(2024, 2, 1),
                "amount": Decimal("2000.00"),
                "description": "2月交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "CM001",
                "date": date(2024, 1, 30),
                "amount": Decimal("1000.00"),
                "description": "1月交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "CM002",
                "date": date(2024, 2, 1),
                "amount": Decimal("2000.00"),
                "description": "2月交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_cm.csv")
        target_file = os.path.join(temp_dir, "target_cm.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        date_range = DateRange(date(2024, 1, 15), date(2024, 2, 15))
        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_range=date_range,
        )

        assert report.total_source == 2
        assert report.total_target == 2
        assert report.matched == 2

    def test_cross_year_data(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "CY001",
                "date": date(2024, 12, 30),
                "amount": Decimal("1000.00"),
                "description": "2024年交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "CY002",
                "date": date(2025, 1, 2),
                "amount": Decimal("2000.00"),
                "description": "2025年交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "CY001",
                "date": date(2024, 12, 30),
                "amount": Decimal("1000.00"),
                "description": "2024年交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "CY002",
                "date": date(2025, 1, 2),
                "amount": Decimal("2000.00"),
                "description": "2025年交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_cy.csv")
        target_file = os.path.join(temp_dir, "target_cy.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        date_range = DateRange(date(2024, 12, 20), date(2025, 1, 10))
        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_range=date_range,
        )

        assert report.total_source == 2
        assert report.total_target == 2
        assert report.matched == 2

    def test_date_range_filtering(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "DF001",
                "date": date(2024, 1, 10),
                "amount": Decimal("100.00"),
                "description": "范围内",
                "currency": "CNY",
            },
            {
                "transaction_id": "DF002",
                "date": date(2024, 2, 1),
                "amount": Decimal("200.00"),
                "description": "范围外",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "DF001",
                "date": date(2024, 1, 10),
                "amount": Decimal("100.00"),
                "description": "范围内",
                "currency": "CNY",
            },
            {
                "transaction_id": "DF002",
                "date": date(2024, 2, 1),
                "amount": Decimal("200.00"),
                "description": "范围外",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_df.csv")
        target_file = os.path.join(temp_dir, "target_df.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        date_range = DateRange(date(2024, 1, 1), date(2024, 1, 31))
        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_range=date_range,
        )

        assert report.total_source == 2
        assert report.total_target == 2

    def test_golden_cross_year_month(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "DEC-2024-001",
                "date": date(2024, 12, 28),
                "amount": Decimal("25000.00"),
                "description": "年终结算收入",
                "currency": "CNY",
            },
            {
                "transaction_id": "DEC-2024-002",
                "date": date(2024, 12, 30),
                "amount": Decimal("-10000.00"),
                "description": "年终奖金发放",
                "currency": "CNY",
            },
            {
                "transaction_id": "JAN-2025-001",
                "date": date(2025, 1, 2),
                "amount": Decimal("15000.00"),
                "description": "新年第一笔收入",
                "currency": "CNY",
            },
            {
                "transaction_id": "JAN-2025-002",
                "date": date(2025, 1, 5),
                "amount": Decimal("-5000.00"),
                "description": "办公设备采购",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "DEC-2024-001",
                "date": date(2024, 12, 28),
                "amount": Decimal("25000.00"),
                "description": "客户年终付款",
                "currency": "CNY",
            },
            {
                "transaction_id": "DEC-2024-002",
                "date": date(2024, 12, 30),
                "amount": Decimal("-10000.00"),
                "description": "员工奖金支付",
                "currency": "CNY",
            },
            {
                "transaction_id": "JAN-2025-001",
                "date": date(2025, 1, 2),
                "amount": Decimal("15000.00"),
                "description": "新年回款",
                "currency": "CNY",
            },
            {
                "transaction_id": "JAN-2025-002",
                "date": date(2025, 1, 5),
                "amount": Decimal("-5000.00"),
                "description": "设备采购扣款",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_cross_golden.csv")
        target_file = os.path.join(temp_dir, "target_cross_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        date_range = DateRange(date(2024, 12, 20), date(2025, 1, 15))
        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_range=date_range,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("boundary_cross_year_month")

        if not golden:
            write_golden_file("boundary_cross_year_month", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestLargeAmounts:
    def test_very_large_amount(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "LARGE001",
                "date": date(2024, 1, 15),
                "amount": Decimal("999999999.99"),
                "description": "大额交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "LARGE001",
                "date": date(2024, 1, 15),
                "amount": Decimal("999999999.99"),
                "description": "大额交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_large.csv")
        target_file = os.path.join(temp_dir, "target_large.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1

    def test_precise_decimal_calculation(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "PREC001",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.1"),
                "description": "高精度测试1",
                "currency": "CNY",
            },
            {
                "transaction_id": "PREC002",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.2"),
                "description": "高精度测试2",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "PREC001",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.1"),
                "description": "高精度测试1",
                "currency": "CNY",
            },
            {
                "transaction_id": "PREC002",
                "date": date(2024, 1, 15),
                "amount": Decimal("0.2"),
                "description": "高精度测试2",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_prec.csv")
        target_file = os.path.join(temp_dir, "target_prec.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 2
