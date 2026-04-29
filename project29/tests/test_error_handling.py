import csv
import json
import os
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


class TestEncodingErrors:
    def test_utf8_with_gbk_content(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_gbk.csv")
        target_file = os.path.join(temp_dir, "target_utf8.csv")

        with open(source_file, "w", encoding="gbk", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易中文"])

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
            encoding="utf-8",
            exchange_rate_provider=sample_exchange_rates,
        )

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "编码错误" in error_msg or "无法使用" in error_msg

    def test_correct_encoding_works(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_gbk2.csv")
        target_file = os.path.join(temp_dir, "target_gbk.csv")

        with open(source_file, "w", encoding="gbk", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易"])

        with open(target_file, "w", encoding="gbk", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易"])

        report = reconcile_files(
            source_file,
            target_file,
            encoding="gbk",
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.errors == []
        assert report.matched == 1

    def test_golden_encoding_error(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_encoding_golden.csv")
        target_file = os.path.join(temp_dir, "target_encoding_golden.csv")

        with open(source_file, "w", encoding="gbk", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN-GBK-001", "2024-01-15", "5000.00", "GBK编码测试"])

        target_trans = [
            {
                "transaction_id": "TXN-GBK-001",
                "date": date(2024, 1, 15),
                "amount": Decimal("5000.00"),
                "description": "UTF8测试",
                "currency": "CNY",
            },
        ]
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            encoding="utf-8",
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("error_encoding")

        if not golden:
            write_golden_file("error_encoding", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestColumnMismatch:
    def test_different_column_names(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_col.csv")
        target_file = os.path.join(temp_dir, "target_col.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["交易编号", "日期", "金额", "描述"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "缺少必需的列" in error_msg
        assert "transaction_id" in error_msg or "date" in error_msg or "amount" in error_msg

    def test_column_mapping_works(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_map.csv")
        target_file = os.path.join(temp_dir, "target_map.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["交易编号", "交易日期", "交易金额", "交易描述"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易"])

        with open(target_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["交易编号", "交易日期", "交易金额", "交易描述"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易"])

        column_mapping = {
            "transaction_id": "交易编号",
            "date": "交易日期",
            "amount": "交易金额",
            "description": "交易描述",
        }

        report = reconcile_files(
            source_file,
            target_file,
            column_mapping=column_mapping,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.errors == []
        assert report.matched == 1

    def test_partial_column_mapping(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_partial.csv")
        target_file = os.path.join(temp_dir, "target_partial.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易"])

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

        column_mapping = {
            "transaction_id": "id",
        }

        report = reconcile_files(
            source_file,
            target_file,
            column_mapping=column_mapping,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert report.errors == []
        assert report.matched == 1

    def test_golden_column_mismatch(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_col_golden.csv")
        target_file = os.path.join(temp_dir, "target_col_golden.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["编号", "时间", "价格", "备注"])
            writer.writerow(["INV-001", "2024-03-01", "15000.00", "销售发票"])

        target_trans = [
            {
                "transaction_id": "INV-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("15000.00"),
                "description": "销售发票",
                "currency": "CNY",
            },
        ]
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("error_column_mismatch")

        if not golden:
            write_golden_file("error_column_mismatch", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestMissingRequiredFields:
    def test_missing_transaction_id_column(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_no_id.csv")
        target_file = os.path.join(temp_dir, "target_no_id.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["date", "amount", "description"])
            writer.writerow(["2024-01-15", "1000.00", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "缺少必需的列" in error_msg
        assert "transaction_id" in error_msg

    def test_missing_date_column(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_no_date.csv")
        target_file = os.path.join(temp_dir, "target_no_date.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "amount", "description"])
            writer.writerow(["TXN001", "1000.00", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "缺少必需的列" in error_msg
        assert "date" in error_msg

    def test_missing_amount_column(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_no_amt.csv")
        target_file = os.path.join(temp_dir, "target_no_amt.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "description"])
            writer.writerow(["TXN001", "2024-01-15", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "缺少必需的列" in error_msg
        assert "amount" in error_msg

    def test_empty_transaction_id_value(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_empty_id.csv")
        target_file = os.path.join(temp_dir, "target_empty_id.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["", "2024-01-15", "1000.00", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "解析错误" in error_msg or "交易ID不能为空" in error_msg

    def test_golden_missing_fields(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_missing_golden.csv")
        target_file = os.path.join(temp_dir, "target_missing_golden.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "description"])
            writer.writerow(["INV-ERROR-001", "缺少日期和金额列"])

        target_trans = [
            {
                "transaction_id": "INV-ERROR-001",
                "date": date(2024, 3, 1),
                "amount": Decimal("20000.00"),
                "description": "完整数据",
                "currency": "CNY",
            },
        ]
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("error_missing_fields")

        if not golden:
            write_golden_file("error_missing_fields", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestInvalidDataFormats:
    def test_invalid_date_format(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_bad_date.csv")
        target_file = os.path.join(temp_dir, "target_bad_date.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "15/01/2024", "1000.00", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "无效的日期格式" in error_msg
        assert "YYYY-MM-DD" in error_msg

    def test_invalid_amount_format(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_bad_amt.csv")
        target_file = os.path.join(temp_dir, "target_bad_amt.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "一千元", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "无效的金额" in error_msg

    def test_amount_with_currency_symbol(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_currency_sym.csv")
        target_file = os.path.join(temp_dir, "target_currency_sym.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "¥1000.00", "测试交易"])

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "无效的金额" in error_msg

    def test_golden_invalid_data(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_invalid_golden.csv")
        target_file = os.path.join(temp_dir, "target_invalid_golden.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["INV-BAD-DATE", "2024/03/01", "10000.00", "日期格式错误"])
            writer.writerow(["INV-BAD-AMT", "2024-03-02", "壹万元", "金额格式错误"])

        target_trans = [
            {
                "transaction_id": "INV-BAD-DATE",
                "date": date(2024, 3, 1),
                "amount": Decimal("10000.00"),
                "description": "正常日期",
                "currency": "CNY",
            },
            {
                "transaction_id": "INV-BAD-AMT",
                "date": date(2024, 3, 2),
                "amount": Decimal("10000.00"),
                "description": "正常金额",
                "currency": "CNY",
            },
        ]
        create_test_csv(target_file, target_trans, include_optional=True)

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        actual_output = json.dumps(report.to_dict(), indent=2, ensure_ascii=False)
        golden = read_golden_file("error_invalid_data")

        if not golden:
            write_golden_file("error_invalid_data", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestFileNotFound:
    def test_source_file_not_found(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "nonexistent_source.csv")
        target_file = os.path.join(temp_dir, "target_exists.csv")

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

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "文件不存在" in error_msg

    def test_target_file_not_found(self, temp_dir, sample_exchange_rates):
        source_file = os.path.join(temp_dir, "source_exists.csv")
        target_file = os.path.join(temp_dir, "nonexistent_target.csv")

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

        report = reconcile_files(
            source_file,
            target_file,
            exchange_rate_provider=sample_exchange_rates,
        )

        assert len(report.errors) > 0
        error_msg = report.errors[0]
        assert "文件不存在" in error_msg


class TestErrorMessagesActionable:
    def test_error_message_includes_available_columns(self, temp_dir):
        source_file = os.path.join(temp_dir, "source_cols.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "交易日期", "price", "note"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "测试交易"])

        parser = CSVParser()
        with pytest.raises(CSVParserError) as excinfo:
            parser.parse(source_file)

        error_msg = str(excinfo.value)
        assert "id" in error_msg
        assert "交易日期" in error_msg
        assert "price" in error_msg
        assert "note" in error_msg
        assert "可用列" in error_msg

    def test_error_message_includes_row_number(self, temp_dir):
        source_file = os.path.join(temp_dir, "source_row.csv")

        with open(source_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "date", "amount", "description"])
            writer.writerow(["TXN001", "2024-01-15", "1000.00", "正常"])
            writer.writerow(["TXN002", "bad-date", "2000.00", "错误日期"])
            writer.writerow(["TXN003", "2024-01-17", "3000.00", "正常"])

        parser = CSVParser()
        with pytest.raises(CSVParserError) as excinfo:
            parser.parse(source_file)

        error_msg = str(excinfo.value)
        assert "第" in error_msg
        assert "3" in error_msg
        assert "行" in error_msg

    def test_golden_error_messages(self, temp_dir, sample_exchange_rates):
        test_cases = [
            {
                "name": "missing_columns",
                "source_content": "id,date,amount\ntxn1,2024-01-01,100\n",
                "description": "缺少description列",
            },
            {
                "name": "invalid_date",
                "source_content": "transaction_id,date,amount,description\ntxn1,01/01/2024,100,test\n",
                "description": "日期格式错误",
            },
            {
                "name": "invalid_amount",
                "source_content": "transaction_id,date,amount,description\ntxn1,2024-01-01,abc,test\n",
                "description": "金额格式错误",
            },
        ]

        results = []
        for tc in test_cases:
            source_file = os.path.join(temp_dir, f"error_{tc['name']}.csv")
            target_file = os.path.join(temp_dir, f"error_{tc['name']}_target.csv")

            with open(source_file, "w", encoding="utf-8", newline="") as f:
                f.write(tc["source_content"])

            target_trans = [
                {
                    "transaction_id": "txn1",
                    "date": date(2024, 1, 1),
                    "amount": Decimal("100.00"),
                    "description": "test",
                    "currency": "CNY",
                },
            ]
            create_test_csv(target_file, target_trans, include_optional=True)

            report = reconcile_files(
                source_file,
                target_file,
                exchange_rate_provider=sample_exchange_rates,
            )

            results.append({
                "test_name": tc["name"],
                "description": tc["description"],
                "has_errors": len(report.errors) > 0,
                "errors": report.errors,
            })

        output = {
            "test_name": "error_messages_actionable",
            "results": results,
            "all_tested": all(r["has_errors"] for r in results),
        }

        actual_output = json.dumps(output, indent=2, ensure_ascii=False)
        golden = read_golden_file("error_messages_actionable")

        if not golden:
            write_golden_file("error_messages_actionable", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden
