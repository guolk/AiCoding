import os
import shutil
import tempfile
from datetime import date
from decimal import Decimal
from pathlib import Path
from typing import Dict, List, Optional

import pytest

from src.financial_reconciliation import (
    CSVParser,
    DateRange,
    ExchangeRateProvider,
    FinancialReconciliator,
    Transaction,
)


@pytest.fixture
def temp_dir():
    temp = tempfile.mkdtemp()
    yield temp
    shutil.rmtree(temp)


@pytest.fixture
def sample_exchange_rates():
    provider = ExchangeRateProvider()
    provider.set_rate("USD", "CNY", date(2024, 1, 15), Decimal("7.25"))
    provider.set_rate("USD", "CNY", date(2024, 6, 30), Decimal("7.20"))
    provider.set_rate("EUR", "CNY", date(2024, 1, 15), Decimal("7.90"))
    provider.set_rate("GBP", "CNY", date(2024, 1, 15), Decimal("9.15"))
    return provider


@pytest.fixture
def simple_transaction():
    return Transaction(
        transaction_id="TXN001",
        date=date(2024, 1, 15),
        amount=Decimal("1000.00"),
        description="测试交易",
        currency="CNY",
    )


@pytest.fixture
def multi_currency_transaction():
    return Transaction(
        transaction_id="TXN002",
        date=date(2024, 1, 15),
        amount=Decimal("100.00"),
        description="美元交易",
        currency="USD",
    )


def create_test_csv(
    filepath: str,
    transactions: List[Dict],
    include_optional: bool = False,
    encoding: str = "utf-8",
):
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


import csv


def get_golden_file_path(test_name: str) -> Path:
    golden_dir = Path(__file__).parent / "golden_files"
    golden_dir.mkdir(exist_ok=True)
    return golden_dir / f"{test_name}.json"


def read_golden_file(test_name: str) -> str:
    golden_path = get_golden_file_path(test_name)
    if golden_path.exists():
        return golden_path.read_text(encoding="utf-8")
    return ""


def write_golden_file(test_name: str, content: str):
    golden_path = get_golden_file_path(test_name)
    golden_path.write_text(content, encoding="utf-8")
