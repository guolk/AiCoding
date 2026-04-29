import json
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

import pytest

from src.financial_reconciliation import (
    DateRange,
    ExchangeRateProvider,
    FinancialReconciliator,
    Transaction,
)
from tests.conftest import read_golden_file, write_golden_file


class TestDecimalPrecision:
    def test_decimal_vs_float_precision(self):
        float_sum = 0.1 + 0.2
        decimal_sum = Decimal("0.1") + Decimal("0.2")
        
        assert float_sum != 0.3
        assert decimal_sum == Decimal("0.3")

    def test_currency_calculation_precision(self):
        amounts = [
            Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"),
            Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"), Decimal("0.1"),
        ]
        
        total = sum(amounts)
        assert total == Decimal("1.0")

    def test_decimal_rounding_half_up(self):
        amounts = [
            (Decimal("1.234"), Decimal("1.23")),
            (Decimal("1.235"), Decimal("1.24")),
            (Decimal("1.236"), Decimal("1.24")),
            (Decimal("-1.235"), Decimal("-1.24")),
        ]
        
        for amount, expected in amounts:
            rounded = amount.quantize(Decimal("0.00"), rounding=ROUND_HALF_UP)
            assert rounded == expected

    def test_transaction_amount_precision(self):
        trans1 = Transaction(
            transaction_id="T1",
            date=date(2024, 1, 1),
            amount=Decimal("100.00"),
            description="Test",
        )
        trans2 = Transaction(
            transaction_id="T1",
            date=date(2024, 1, 1),
            amount=Decimal("100.00"),
            description="Test",
        )
        
        assert trans1.amount == trans2.amount
        assert trans1.amount + Decimal("0.01") == Decimal("100.01")

    def test_golden_decimal_calculations(self, tmp_path):
        test_cases = {
            "test_name": "decimal_precision",
            "calculations": [
                {
                    "operation": "addition",
                    "operands": ["0.1", "0.2"],
                    "expected": "0.3",
                },
                {
                    "operation": "multiplication",
                    "operands": ["0.1", "3"],
                    "expected": "0.3",
                },
                {
                    "operation": "division",
                    "operands": ["1.0", "3"],
                    "expected": "0.3333333333333333333333333333",
                },
                {
                    "operation": "rounding",
                    "operands": ["1.235"],
                    "expected": "1.24",
                },
            ],
        }

        results = []
        for calc in test_cases["calculations"]:
            op = calc["operation"]
            operands = [Decimal(o) for o in calc["operands"]]
            
            if op == "addition":
                result = sum(operands)
            elif op == "multiplication":
                result = operands[0] * operands[1]
            elif op == "division":
                result = operands[0] / operands[1]
            elif op == "rounding":
                result = operands[0].quantize(Decimal("0.00"), rounding=ROUND_HALF_UP)
            
            results.append({
                "operation": op,
                "operands": calc["operands"],
                "result": str(result),
                "expected": calc["expected"],
                "match": str(result) == calc["expected"],
            })

        output = {
            "test_name": "decimal_precision",
            "results": results,
            "all_passed": all(r["match"] for r in results),
        }

        actual_output = json.dumps(output, indent=2, ensure_ascii=False)
        golden = read_golden_file("unit_decimal_precision")

        if not golden:
            write_golden_file("unit_decimal_precision", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestExchangeRateConversion:
    def test_same_currency_conversion(self, sample_exchange_rates):
        amount = Decimal("100.00")
        result, rate = sample_exchange_rates.convert(
            amount, "CNY", "CNY", date(2024, 1, 15)
        )
        
        assert result == amount
        assert rate == Decimal("1.0")

    def test_usd_to_cny_conversion(self, sample_exchange_rates):
        amount = Decimal("100.00")
        result, rate = sample_exchange_rates.convert(
            amount, "USD", "CNY", date(2024, 1, 15)
        )
        
        assert rate == Decimal("7.25")
        assert result == Decimal("725.00")

    def test_cny_to_usd_conversion(self, sample_exchange_rates):
        amount = Decimal("725.00")
        result, rate = sample_exchange_rates.convert(
            amount, "CNY", "USD", date(2024, 1, 15)
        )
        
        assert result == Decimal("100.00")

    def test_missing_rate_raises_error(self, sample_exchange_rates):
        with pytest.raises(ValueError) as excinfo:
            sample_exchange_rates.convert(
                Decimal("100.00"), "JPY", "CNY", date(2024, 1, 15)
            )
        
        assert "没有找到" in str(excinfo.value)
        assert "JPY" in str(excinfo.value)
        assert "CNY" in str(excinfo.value)

    def test_rate_changes_over_time(self, sample_exchange_rates):
        amount = Decimal("100.00")
        
        result_jan, rate_jan = sample_exchange_rates.convert(
            amount, "USD", "CNY", date(2024, 1, 15)
        )
        result_jun, rate_jun = sample_exchange_rates.convert(
            amount, "USD", "CNY", date(2024, 6, 30)
        )
        
        assert rate_jan == Decimal("7.25")
        assert rate_jun == Decimal("7.20")
        assert result_jan > result_jun

    def test_golden_exchange_rates(self, sample_exchange_rates):
        test_cases = [
            {
                "from": "USD",
                "to": "CNY",
                "date": "2024-01-15",
                "amount": "100.00",
                "expected_result": "725.00",
                "expected_rate": "7.25",
            },
            {
                "from": "EUR",
                "to": "CNY",
                "date": "2024-01-15",
                "amount": "50.00",
                "expected_result": "395.00",
                "expected_rate": "7.90",
            },
            {
                "from": "CNY",
                "to": "USD",
                "date": "2024-01-15",
                "amount": "725.00",
                "expected_result": "100.00",
            },
            {
                "from": "CNY",
                "to": "CNY",
                "date": "2024-01-15",
                "amount": "1000.00",
                "expected_result": "1000.00",
                "expected_rate": "1.0",
            },
        ]

        results = []
        for tc in test_cases:
            try:
                result, rate = sample_exchange_rates.convert(
                    Decimal(tc["amount"]),
                    tc["from"],
                    tc["to"],
                    date.fromisoformat(tc["date"]),
                )
                results.append({
                    "from": tc["from"],
                    "to": tc["to"],
                    "date": tc["date"],
                    "amount": tc["amount"],
                    "result": str(result),
                    "rate": str(rate),
                    "expected_result": tc["expected_result"],
                    "match": str(result) == tc["expected_result"],
                })
            except Exception as e:
                results.append({
                    "from": tc["from"],
                    "to": tc["to"],
                    "date": tc["date"],
                    "amount": tc["amount"],
                    "error": str(e),
                    "match": False,
                })

        output = {
            "test_name": "exchange_rate_conversion",
            "results": results,
            "all_passed": all(r.get("match", False) for r in results),
        }

        actual_output = json.dumps(output, indent=2, ensure_ascii=False)
        golden = read_golden_file("unit_exchange_rate")

        if not golden:
            write_golden_file("unit_exchange_rate", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestDateRangeCalculations:
    def test_date_range_contains(self):
        date_range = DateRange(date(2024, 1, 1), date(2024, 1, 31))
        
        assert date_range.contains(date(2024, 1, 1))
        assert date_range.contains(date(2024, 1, 15))
        assert date_range.contains(date(2024, 1, 31))
        
        assert not date_range.contains(date(2023, 12, 31))
        assert not date_range.contains(date(2024, 2, 1))

    def test_date_range_days(self):
        range1 = DateRange(date(2024, 1, 1), date(2024, 1, 1))
        assert range1.days() == 1
        
        range2 = DateRange(date(2024, 1, 1), date(2024, 1, 7))
        assert range2.days() == 7
        
        range3 = DateRange(date(2024, 2, 1), date(2024, 2, 29))
        assert range3.days() == 29

    def test_date_range_overlaps(self):
        range1 = DateRange(date(2024, 1, 1), date(2024, 1, 15))
        range2 = DateRange(date(2024, 1, 10), date(2024, 1, 20))
        range3 = DateRange(date(2024, 1, 20), date(2024, 1, 31))
        range4 = DateRange(date(2024, 2, 1), date(2024, 2, 28))
        
        assert range1.overlaps(range2)
        assert range2.overlaps(range3)
        assert not range1.overlaps(range4)
        assert range3.overlaps(range2)

    def test_crosses_month_boundary(self):
        range1 = DateRange(date(2024, 1, 15), date(2024, 1, 20))
        assert not range1.crosses_month_boundary()
        
        range2 = DateRange(date(2024, 1, 25), date(2024, 2, 5))
        assert range2.crosses_month_boundary()

    def test_crosses_year_boundary(self):
        range1 = DateRange(date(2024, 12, 20), date(2024, 12, 31))
        assert not range1.crosses_year_boundary()
        
        range2 = DateRange(date(2024, 12, 25), date(2025, 1, 5))
        assert range2.crosses_year_boundary()

    def test_invalid_date_range(self):
        with pytest.raises(ValueError) as excinfo:
            DateRange(date(2024, 2, 1), date(2024, 1, 1))
        
        assert "开始日期" in str(excinfo.value)
        assert "不能晚于结束日期" in str(excinfo.value)

    def test_golden_date_ranges(self):
        test_cases = [
            {
                "range": {"start": "2024-01-01", "end": "2024-01-31"},
                "tests": [
                    {"date": "2024-01-15", "expected_contains": True},
                    {"date": "2023-12-31", "expected_contains": False},
                ],
                "expected_days": 31,
                "expected_crosses_month": False,
                "expected_crosses_year": False,
            },
            {
                "range": {"start": "2024-12-25", "end": "2025-01-05"},
                "tests": [
                    {"date": "2024-12-31", "expected_contains": True},
                    {"date": "2025-01-01", "expected_contains": True},
                ],
                "expected_days": 12,
                "expected_crosses_month": True,
                "expected_crosses_year": True,
            },
            {
                "range": {"start": "2024-02-01", "end": "2024-02-29"},
                "tests": [
                    {"date": "2024-02-29", "expected_contains": True},
                ],
                "expected_days": 29,
                "expected_crosses_month": False,
                "expected_crosses_year": False,
            },
        ]

        results = []
        for tc in test_cases:
            start = date.fromisoformat(tc["range"]["start"])
            end = date.fromisoformat(tc["range"]["end"])
            date_range = DateRange(start, end)
            
            test_results = []
            for t in tc["tests"]:
                test_date = date.fromisoformat(t["date"])
                contains = date_range.contains(test_date)
                test_results.append({
                    "date": t["date"],
                    "contains": contains,
                    "expected": t["expected_contains"],
                    "match": contains == t["expected_contains"],
                })
            
            results.append({
                "range": tc["range"],
                "days": date_range.days(),
                "expected_days": tc["expected_days"],
                "days_match": date_range.days() == tc["expected_days"],
                "crosses_month": date_range.crosses_month_boundary(),
                "expected_crosses_month": tc["expected_crosses_month"],
                "crosses_month_match": date_range.crosses_month_boundary() == tc["expected_crosses_month"],
                "crosses_year": date_range.crosses_year_boundary(),
                "expected_crosses_year": tc["expected_crosses_year"],
                "crosses_year_match": date_range.crosses_year_boundary() == tc["expected_crosses_year"],
                "date_tests": test_results,
            })

        all_passed = all(
            r["days_match"] and r["crosses_month_match"] and r["crosses_year_match"] and
            all(t["match"] for t in r["date_tests"])
            for r in results
        )

        output = {
            "test_name": "date_range_calculations",
            "results": results,
            "all_passed": all_passed,
        }

        actual_output = json.dumps(output, indent=2, ensure_ascii=False)
        golden = read_golden_file("unit_date_range")

        if not golden:
            write_golden_file("unit_date_range", actual_output)
            pytest.fail("Golden file created, please review")

        assert actual_output == golden


class TestTransactionMatching:
    def test_exact_match(self, sample_exchange_rates):
        source = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 15),
            amount=Decimal("1000.00"),
            description="测试交易",
            currency="CNY",
        )
        target = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 15),
            amount=Decimal("1000.00"),
            description="测试交易",
            currency="CNY",
        )

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates
        )
        report = reconciliator.reconcile([source], [target])

        assert report.matched == 1
        assert report.total_source == 1
        assert report.total_target == 1
        assert report.results[0].status.value == "matched"

    def test_amount_mismatch(self, sample_exchange_rates):
        source = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 15),
            amount=Decimal("1000.00"),
            description="测试交易",
            currency="CNY",
        )
        target = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 15),
            amount=Decimal("1050.00"),
            description="测试交易",
            currency="CNY",
        )

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates
        )
        report = reconciliator.reconcile([source], [target])

        assert report.amount_mismatches == 1
        assert report.matched == 0
        assert report.results[0].difference == Decimal("-50.00")

    def test_date_mismatch(self, sample_exchange_rates):
        source = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 10),
            amount=Decimal("1000.00"),
            description="测试交易",
            currency="CNY",
        )
        target = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 15),
            amount=Decimal("1000.00"),
            description="测试交易",
            currency="CNY",
        )

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates
        )
        report = reconciliator.reconcile([source], [target])

        assert report.date_mismatches == 1
        assert report.matched == 0

    def test_date_tolerance(self, sample_exchange_rates):
        source = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 10),
            amount=Decimal("1000.00"),
            description="测试交易",
            currency="CNY",
        )
        target = Transaction(
            transaction_id="T001",
            date=date(2024, 1, 12),
            amount=Decimal("1000.00"),
            description="测试交易",
            currency="CNY",
        )

        reconciliator = FinancialReconciliator(
            exchange_rate_provider=sample_exchange_rates,
            date_tolerance_days=2,
        )
        report = reconciliator.reconcile([source], [target])

        assert report.matched == 1
        assert report.date_mismatches == 0
