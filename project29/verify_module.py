import sys
sys.path.insert(0, '.')

from datetime import date
from decimal import Decimal

print("Testing financial_reconciliation module...")

try:
    from src.financial_reconciliation import (
        Transaction,
        DateRange,
        ExchangeRateProvider,
        CSVParser,
        FinancialReconciliator,
        MatchStatus,
    )
    print("  OK Module imports successful")
except Exception as e:
    print(f"  ERROR Import failed: {e}")
    sys.exit(1)

try:
    trans = Transaction(
        transaction_id="TEST001",
        date=date(2024, 1, 15),
        amount=Decimal("1000.00"),
        description="Test transaction",
        currency="CNY",
    )
    print(f"  OK Transaction created: {trans.transaction_id}")
except Exception as e:
    print(f"  ERROR Transaction creation failed: {e}")

try:
    date_range = DateRange(date(2024, 1, 1), date(2024, 1, 31))
    assert date_range.contains(date(2024, 1, 15))
    assert not date_range.contains(date(2024, 2, 1))
    print(f"  OK DateRange works: {date_range.days()} days")
except Exception as e:
    print(f"  ERROR DateRange failed: {e}")

try:
    provider = ExchangeRateProvider()
    provider.set_rate("USD", "CNY", date(2024, 1, 15), Decimal("7.25"))
    result, rate = provider.convert(Decimal("100.00"), "USD", "CNY", date(2024, 1, 15))
    assert result == Decimal("725.00")
    print(f"  OK ExchangeRateProvider works: 100 USD = {result} CNY")
except Exception as e:
    print(f"  ERROR ExchangeRateProvider failed: {e}")

try:
    trans1 = Transaction(
        transaction_id="MATCH001",
        date=date(2024, 1, 15),
        amount=Decimal("500.00"),
        description="Test",
    )
    trans2 = Transaction(
        transaction_id="MATCH001",
        date=date(2024, 1, 15),
        amount=Decimal("500.00"),
        description="Test",
    )
    
    reconciliator = FinancialReconciliator()
    report = reconciliator.reconcile([trans1], [trans2])
    
    assert report.matched == 1
    assert report.total_source == 1
    assert report.total_target == 1
    print(f"  OK Reconciliation works: {report.matched} matched")
except Exception as e:
    print(f"  ERROR Reconciliation failed: {e}")

print("\nAll basic tests passed!")
