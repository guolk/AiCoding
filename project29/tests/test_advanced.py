import csv
import json
import os
import tempfile
import shutil
from datetime import date
from decimal import Decimal
from pathlib import Path

import pytest

from src.financial_reconciliation import (
    CSVParser,
    CSVParserError,
    DateRange,
    ExchangeRateProvider,
    FinancialReconciliator,
    Transaction,
    reconcile_files,
)
from tests.conftest import create_test_csv, read_golden_file, write_golden_file


class TestMultiCurrencyReconciliation:
    def test_mixed_currency_transactions(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "MC001",
                "date": date(2024, 1, 15),
                "amount": Decimal("5000.00"),
                "description": "人民币收入",
                "currency": "CNY",
            },
            {
                "transaction_id": "MC002",
                "date": date(2024, 1, 15),
                "amount": Decimal("100.00"),
                "description": "美元收入",
                "currency": "USD",
            },
        ]

        target_trans = [
            {
                "transaction_id": "MC001",
                "date": date(2024, 1, 15),
                "amount": Decimal("5000.00"),
                "description": "人民币收入",
                "currency": "CNY",
            },
            {
                "transaction_id": "MC002",
                "date": date(2024, 1, 15),
                "amount": Decimal("725.00"),
                "description": "美元结汇",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_mc.csv")
        target_file = os.path.join(temp_dir, "target_mc.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates,
            target_currency="CNY",
        )

        parser = CSVParser()
        source_txns = parser.parse(source_file)
        target_txns = parser.parse(target_file)

        report = reconciliator.reconcile(source_txns, target_txns)

        assert report.total_source == 2
        assert report.total_target == 2

    def test_usd_transaction_reconciliation(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "USD001",
                "date": date(2024, 1, 15),
                "amount": Decimal("100.00"),
                "description": "美元销售",
                "currency": "USD",
            },
        ]

        target_trans = [
            {
                "transaction_id": "USD001",
                "date": date(2024, 1, 15),
                "amount": Decimal("725.00"),
                "description": "美元到账",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_usd.csv")
        target_file = os.path.join(temp_dir, "target_usd.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates,
            target_currency="CNY",
        )

        parser = CSVParser()
        source_txns = parser.parse(source_file)
        target_txns = parser.parse(target_file)

        report = reconciliator.reconcile(source_txns, target_txns)

        assert report.matched == 1

    def test_currency_conversion_mismatch(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "MIS001",
                "date": date(2024, 1, 15),
                "amount": Decimal("100.00"),
                "description": "美元销售",
                "currency": "USD",
            },
        ]

        target_trans = [
            {
                "transaction_id": "MIS001",
                "date": date(2024, 1, 15),
                "amount": Decimal("730.00"),
                "description": "美元到账（差异）",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_mis.csv")
        target_file = os.path.join(temp_dir, "target_mis.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates,
            target_currency="CNY",
        )

        parser = CSVParser()
        source_txns = parser.parse(source_file)
        target_txns = parser.parse(target_file)

        report = reconciliator.reconcile(source_txns, target_txns)

        assert report.amount_mismatches == 1
        assert report.results[0].difference == Decimal("-5.00")

    def test_golden_multi_currency(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "MC-CNY-001",
                "date": date(2024, 1, 15),
                "amount": Decimal("10000.00"),
                "description": "国内销售收入",
                "currency": "CNY",
            },
            {
                "transaction_id": "MC-USD-001",
                "date": date(2024, 1, 15),
                "amount": Decimal("500.00"),
                "description": "出口销售收入",
                "currency": "USD",
            },
            {
                "transaction_id": "MC-EUR-001",
                "date": date(2024, 1, 15),
                "amount": Decimal("200.00"),
                "description": "欧洲客户付款",
                "currency": "EUR",
            },
            {
                "transaction_id": "MC-CNY-002",
                "date": date(2024, 1, 15),
                "amount": Decimal("-3000.00"),
                "description": "办公设备采购",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "MC-CNY-001",
                "date": date(2024, 1, 15),
                "amount": Decimal("10000.00"),
                "description": "国内客户转账",
                "currency": "CNY",
            },
            {
                "transaction_id": "MC-USD-001",
                "date": date(2024, 1, 15),
                "amount": Decimal("3625.00"),
                "description": "出口货款结汇",
                "currency": "CNY",
            },
            {
                "transaction_id": "MC-EUR-001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1580.00"),
                "description": "欧元结汇",
                "currency": "CNY",
            },
            {
                "transaction_id": "MC-CNY-002",
                "date": date(2024, 1, 15),
                "amount": Decimal("-3000.00"),
                "description": "设备采购扣款",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_mc_golden.csv")
        target_file = os.path.join(temp_dir, "target_mc_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates,
            target_currency="CNY",
        )

        parser = CSVParser()
        source_txns = parser.parse(source_file)
        target_txns = parser.parse(target_file)

        report = reconciliator.reconcile(source_txns, target_txns)

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("advanced_multi_currency")

        if not golden:
            write_golden_file("advanced_multi_currency", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestCombinedTolerance:
    def test_both_within_tolerance(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "CT001",
                "date": date(2024, 1, 10),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "CT001",
                "date": date(2024, 1, 12),
                "amount": Decimal("1000.05"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_ct1.csv")
        target_file = os.path.join(temp_dir, "target_ct1.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_tolerance_days=3,
            amount_tolerance=Decimal("0.10"),
        )

        assert report.matched == 1
        assert report.date_mismatches == 0
        assert report.amount_mismatches == 0

    def test_date_in_tolerance_amount_out(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "CT002",
                "date": date(2024, 1, 10),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "CT002",
                "date": date(2024, 1, 12),
                "amount": Decimal("1050.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_ct2.csv")
        target_file = os.path.join(temp_dir, "target_ct2.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_tolerance_days=3,
            amount_tolerance=Decimal("0.10"),
        )

        assert report.matched == 0
        assert report.amount_mismatches == 1
        assert report.date_mismatches == 0

    def test_amount_in_tolerance_date_out(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "CT003",
                "date": date(2024, 1, 10),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "CT003",
                "date": date(2024, 1, 20),
                "amount": Decimal("1000.05"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_ct3.csv")
        target_file = os.path.join(temp_dir, "target_ct3.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_tolerance_days=3,
            amount_tolerance=Decimal("0.10"),
        )

        assert report.matched == 0
        assert report.date_mismatches == 1
        assert report.amount_mismatches == 0

    def test_golden_combined_tolerance(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TOL-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("5000.00"),
                "description": "正常交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "TOL-002",
                "date": date(2024, 3, 2),
                "amount": Decimal("3000.00"),
                "description": "日期在容差内",
                "currency": "CNY",
            },
            {
                "transaction_id": "TOL-003",
                "date": date(2024, 3, 5),
                "amount": Decimal("2000.00"),
                "description": "金额在容差内",
                "currency": "CNY",
            },
            {
                "transaction_id": "TOL-004",
                "date": date(2024, 3, 8),
                "amount": Decimal("4000.00"),
                "description": "都在容差内",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TOL-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("5000.00"),
                "description": "完全匹配",
                "currency": "CNY",
            },
            {
                "transaction_id": "TOL-002",
                "date": date(2024, 3, 4),
                "amount": Decimal("3000.00"),
                "description": "日期延迟2天",
                "currency": "CNY",
            },
            {
                "transaction_id": "TOL-003",
                "date": date(2024, 3, 5),
                "amount": Decimal("2000.05"),
                "description": "金额差异0.05",
                "currency": "CNY",
            },
            {
                "transaction_id": "TOL-004",
                "date": date(2024, 3, 10),
                "amount": Decimal("4000.08"),
                "description": "日期延迟2天，金额差异0.08",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_tol_golden.csv")
        target_file = os.path.join(temp_dir, "target_tol_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
            date_tolerance_days=3,
            amount_tolerance=Decimal("0.10"),
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("advanced_combined_tolerance")

        if not golden:
            write_golden_file("advanced_combined_tolerance", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestAdvancedCSVFormat:
    def test_case_sensitive_transaction_id(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "Txn001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "混合大小写",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "全大写",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_case.csv")
        target_file = os.path.join(temp_dir, "target_case.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.missing_in_source == 1
        assert report.missing_in_target == 1

    def test_extra_columns_ignored(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_extra.csv")
        target_file = os.path.join(temp_dir, "target_extra.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "transaction_id", "date", "amount", "description",
                "extra_col1", "extra_col2", "operator", "department"
            ])
            writer.writerow([
                "EXT001", "2024-01-15", "1000.00", "测试交易",
                "extra_value1", "extra_value2", "张三", "财务部"
            ])

        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["EXT001", "2024-01-15", "1000.00", "测试交易"])

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1

    def test_empty_rows_handling(self, temp_dir):
        source_file = os.path.join(temp_dir, "source_empty_row.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            f.write('transaction_id,date,amount,description\n')
            f.write('TXN001,2024-01-15,1000.00,测试交易\n')
            f.write('\n')
            f.write(',,,\n')
            f.write('TXN002,2024-01-16,2000.00,另一笔交易\n')

        parser = CSVParser()
        try:
            transactions = parser.parse(source_file)
            assert len(transactions) >= 2
        except CSVParserError:
            pass

    def test_golden_csv_format(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_csv_golden.csv")
        target_file = os.path.join(temp_dir, "target_csv_golden.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "transaction_id", "date", "amount", "description",
                "bank_reference", "status"
            ])
            writer.writerow([
                "CSV-001", "2024-03-01", "1500.00", "带额外列的交易",
                "REF12345", "completed"
            ])
            writer.writerow([
                "CSV-002", "2024-03-02", "2500.00", "另一笔交易",
                "REF12346", "pending"
            ])

        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["CSV-001", "2024-03-01", "1500.00", "标准格式交易"])
            writer.writerow(["CSV-002", "2024-03-02", "2500.00", "标准格式交易2"])

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("advanced_csv_format")

        if not golden:
            write_golden_file("advanced_csv_format", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestReportOutputValidation:
    def test_report_json_format(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "ROV001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "ROV001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "测试交易",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_rov.csv")
        target_file = os.path.join(temp_dir, "target_rov.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        report_dict = report.to_dict()

        assert "summary" in report_dict
        assert "results" in report_dict
        assert "errors" in report_dict

        summary = report_dict["summary"]
        required_summary_fields = [
            "total_source", "total_target", "matched", "amount_mismatches",
            "date_mismatches", "duplicates", "missing_in_source", "missing_in_target"
        ]
        for field in required_summary_fields:
            assert field in summary

        if report_dict["results"]:
            result = report_dict["results"][0]
            required_result_fields = [
                "status", "transaction_id", "source", "target", "difference", "notes"
            ]
            for field in required_result_fields:
                assert field in result

    def test_summary_calculation(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "SUM001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "匹配",
                "currency": "CNY",
            },
            {
                "transaction_id": "SUM002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2000.00"),
                "description": "金额差异",
                "currency": "CNY",
            },
            {
                "transaction_id": "SUM003",
                "date": date(2024, 1, 17),
                "amount": Decimal("3000.00"),
                "description": "日期差异",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "SUM001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "匹配",
                "currency": "CNY",
            },
            {
                "transaction_id": "SUM002",
                "date": date(2024, 1, 16),
                "amount": Decimal("2050.00"),
                "description": "金额差异",
                "currency": "CNY",
            },
            {
                "transaction_id": "SUM003",
                "date": date(2024, 1, 20),
                "amount": Decimal("3000.00"),
                "description": "日期差异",
                "currency": "CNY",
            },
            {
                "transaction_id": "SUM004",
                "date": date(2024, 1, 18),
                "amount": Decimal("4000.00"),
                "description": "源文件缺失",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_sum.csv")
        target_file = os.path.join(temp_dir, "target_sum.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.total_source == 3
        assert report.total_target == 4
        assert report.matched == 1
        assert report.amount_mismatches == 1
        assert report.date_mismatches == 1
        assert report.missing_in_source == 1
        assert report.missing_in_target == 0

    def test_golden_report_output(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "RPT-MATCH",
                "date": date(2024, 3, 1),
                "amount": Decimal("5000.00"),
                "description": "完全匹配的交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "RPT-AMT",
                "date": date(2024, 3, 2),
                "amount": Decimal("3000.00"),
                "description": "金额差异的交易",
                "currency": "CNY",
            },
            {
                "transaction_id": "RPT-DATE",
                "date": date(2024, 3, 5),
                "amount": Decimal("2000.00"),
                "description": "日期差异的交易",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "RPT-MATCH",
                "date": date(2024, 3, 1),
                "amount": Decimal("5000.00"),
                "description": "完全匹配",
                "currency": "CNY",
            },
            {
                "transaction_id": "RPT-AMT",
                "date": date(2024, 3, 2),
                "amount": Decimal("3100.00"),
                "description": "含手续费",
                "currency": "CNY",
            },
            {
                "transaction_id": "RPT-DATE",
                "date": date(2024, 3, 8),
                "amount": Decimal("2000.00"),
                "description": "银行延迟到账",
                "currency": "CNY",
            },
            {
                "transaction_id": "RPT-EXTRA",
                "date": date(2024, 3, 10),
                "amount": Decimal("1500.00"),
                "description": "源文件缺失",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_rpt_golden.csv")
        target_file = os.path.join(temp_dir, "target_rpt_golden.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("advanced_report_output")

        if not golden:
            write_golden_file("advanced_report_output", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestTransactionIdEdgeCases:
    def test_transaction_id_with_special_chars(self, temp_dir, sample_exchange_rates):
        source_trans = [
            {
                "transaction_id": "TXN-2024/001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "含特殊字符ID",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": "TXN-2024/001",
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "含特殊字符ID",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_spec.csv")
        target_file = os.path.join(temp_dir, "target_spec.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1

    def test_very_long_transaction_id(self, temp_dir, sample_exchange_rates):
        long_id = "TXN-" + "A" * 100 + "-2024-001"
        
        source_trans = [
            {
                "transaction_id": long_id,
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "长ID",
                "currency": "CNY",
            },
        ]

        target_trans = [
            {
                "transaction_id": long_id,
                "date": date(2024, 1, 15),
                "amount": Decimal("1000.00"),
                "description": "长ID",
                "currency": "CNY",
            },
        ]

        source_file = os.path.join(temp_dir, "source_long.csv")
        target_file = os.path.join(temp_dir, "target_long.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1

    def test_numeric_transaction_id(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_num.csv")
        target_file = os.path.join(temp_dir, "target_num.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow([12345, "2024-01-15", "1000.00", "数字ID"])

        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["12345", "2024-01-15", "1000.00", "字符串ID"])

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.matched == 1


class TestLargeDatasets:
    def test_medium_dataset(self, temp_dir, sample_exchange_rates):
        source_trans = []
        target_trans = []
        
        for i in range(50):
            source_trans.append({
                "transaction_id": f"BATCH-{i:04d}",
                "date": date(2024, 1, 15),
                "amount": Decimal(f"{100 + i}.00"),
                "description": f"批量交易 {i}",
                "currency": "CNY",
            })
            target_trans.append({
                "transaction_id": f"BATCH-{i:04d}",
                "date": date(2024, 1, 15),
                "amount": Decimal(f"{100 + i}.00"),
                "description": f"批量交易 {i} 目标",
                "currency": "CNY",
            })

        source_file = os.path.join(temp_dir, "source_batch.csv")
        target_file = os.path.join(temp_dir, "target_batch.csv")

        create_test_csv(source_file, source_trans, include_optional=True)
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.total_source == 50
        assert report.total_target == 50
        assert report.matched == 50
