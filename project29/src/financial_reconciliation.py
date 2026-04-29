"""
自动化财务对账脚本
支持多币种、汇率转换、精确金额计算
"""

import csv
import os
from datetime import datetime, date
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, field
from enum import Enum


class MatchStatus(Enum):
    MATCHED = "matched"
    AMOUNT_MISMATCH = "amount_mismatch"
    DATE_MISMATCH = "date_mismatch"
    DUPLICATE = "duplicate"
    MISSING_IN_SOURCE = "missing_in_source"
    MISSING_IN_TARGET = "missing_in_target"


@dataclass
class Transaction:
    transaction_id: str
    date: date
    amount: Decimal
    description: str
    currency: str = "CNY"
    original_amount: Optional[Decimal] = None
    original_currency: Optional[str] = None
    exchange_rate: Optional[Decimal] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "transaction_id": self.transaction_id,
            "date": self.date.isoformat(),
            "amount": str(self.amount),
            "description": self.description,
            "currency": self.currency,
            "original_amount": str(self.original_amount) if self.original_amount else None,
            "original_currency": self.original_currency,
            "exchange_rate": str(self.exchange_rate) if self.exchange_rate else None,
        }


@dataclass
class MatchResult:
    status: MatchStatus
    source_transaction: Optional[Transaction] = None
    target_transaction: Optional[Transaction] = None
    difference: Optional[Decimal] = None
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status.value,
            "transaction_id": (
                self.source_transaction.transaction_id
                if self.source_transaction
                else self.target_transaction.transaction_id
                if self.target_transaction
                else None
            ),
            "source": self.source_transaction.to_dict() if self.source_transaction else None,
            "target": self.target_transaction.to_dict() if self.target_transaction else None,
            "difference": str(self.difference) if self.difference is not None else None,
            "notes": self.notes,
        }


@dataclass
class ReconciliationReport:
    total_source: int = 0
    total_target: int = 0
    matched: int = 0
    amount_mismatches: int = 0
    date_mismatches: int = 0
    duplicates: int = 0
    missing_in_source: int = 0
    missing_in_target: int = 0
    results: List[MatchResult] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "summary": {
                "total_source": self.total_source,
                "total_target": self.total_target,
                "matched": self.matched,
                "amount_mismatches": self.amount_mismatches,
                "date_mismatches": self.date_mismatches,
                "duplicates": self.duplicates,
                "missing_in_source": self.missing_in_source,
                "missing_in_target": self.missing_in_target,
            },
            "results": [r.to_dict() for r in self.results],
            "errors": self.errors,
        }


class ExchangeRateProvider:
    def __init__(self):
        self.rates: Dict[Tuple[str, str, date], Decimal] = {}

    def set_rate(self, from_currency: str, to_currency: str, rate_date: date, rate: Decimal) -> None:
        key = (from_currency.upper(), to_currency.upper(), rate_date)
        self.rates[key] = rate

    def get_rate(self, from_currency: str, to_currency: str, rate_date: date) -> Optional[Decimal]:
        if from_currency.upper() == to_currency.upper():
            return Decimal("1.0")
        
        key = (from_currency.upper(), to_currency.upper(), rate_date)
        if key in self.rates:
            return self.rates[key]
        
        reverse_key = (to_currency.upper(), from_currency.upper(), rate_date)
        if reverse_key in self.rates:
            return Decimal("1") / self.rates[reverse_key]
        
        return None

    def convert(
        self,
        amount: Decimal,
        from_currency: str,
        to_currency: str,
        rate_date: date,
        precision: int = 2,
    ) -> Tuple[Decimal, Decimal]:
        if from_currency.upper() == to_currency.upper():
            return amount, Decimal("1.0")

        rate = self.get_rate(from_currency, to_currency, rate_date)
        if rate is None:
            raise ValueError(
                f"没有找到 {from_currency} 到 {to_currency} 在 {rate_date} 的汇率"
            )

        converted = amount * rate
        rounded = converted.quantize(
            Decimal(f"0.{'0' * precision}"),
            rounding=ROUND_HALF_UP
        )
        return rounded, rate


class DateRange:
    def __init__(self, start_date: date, end_date: date):
        if start_date > end_date:
            raise ValueError(f"开始日期 {start_date} 不能晚于结束日期 {end_date}")
        self.start_date = start_date
        self.end_date = end_date

    def contains(self, check_date: date) -> bool:
        return self.start_date <= check_date <= self.end_date

    def overlaps(self, other: "DateRange") -> bool:
        return self.start_date <= other.end_date and other.start_date <= self.end_date

    def days(self) -> int:
        return (self.end_date - self.start_date).days + 1

    def crosses_month_boundary(self) -> bool:
        return self.start_date.month != self.end_date.month

    def crosses_year_boundary(self) -> bool:
        return self.start_date.year != self.end_date.year


class CSVParserError(Exception):
    pass


class CSVParser:
    REQUIRED_COLUMNS = ["transaction_id", "date", "amount", "description"]
    OPTIONAL_COLUMNS = ["currency", "original_amount", "original_currency"]

    def __init__(self, encoding: str = "utf-8"):
        self.encoding = encoding

    def parse(
        self,
        file_path: str,
        column_mapping: Optional[Dict[str, str]] = None,
    ) -> List[Transaction]:
        column_mapping = column_mapping or {}
        
        try:
            with open(file_path, "r", encoding=self.encoding) as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames or []
                
                missing_columns = []
                for req_col in self.REQUIRED_COLUMNS:
                    mapped_col = column_mapping.get(req_col, req_col)
                    if mapped_col not in headers:
                        missing_columns.append(req_col)
                
                if missing_columns:
                    raise CSVParserError(
                        f"CSV文件缺少必需的列: {', '.join(missing_columns)}. "
                        f"可用列: {', '.join(headers)}"
                    )

                transactions: List[Transaction] = []
                seen_ids: Dict[str, int] = {}
                
                for row_num, row in enumerate(reader, start=2):
                    try:
                        trans_id = row[column_mapping.get("transaction_id", "transaction_id")].strip()
                        
                        if not trans_id:
                            raise ValueError("交易ID不能为空")
                        
                        if trans_id in seen_ids:
                            seen_ids[trans_id] += 1
                        else:
                            seen_ids[trans_id] = 1
                        
                        date_str = row[column_mapping.get("date", "date")].strip()
                        try:
                            trans_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                        except ValueError:
                            raise ValueError(f"无效的日期格式: {date_str}，预期格式: YYYY-MM-DD")
                        
                        amount_str = row[column_mapping.get("amount", "amount")].strip()
                        try:
                            amount = Decimal(amount_str)
                        except InvalidOperation:
                            raise ValueError(f"无效的金额: {amount_str}")
                        
                        description = row[column_mapping.get("description", "description")].strip()
                        
                        currency = row.get(column_mapping.get("currency", "currency"), "CNY").strip() or "CNY"
                        
                        original_amount = None
                        original_currency = None
                        if column_mapping.get("original_amount") or "original_amount" in row:
                            orig_amt_str = row.get(column_mapping.get("original_amount", "original_amount"), "").strip()
                            if orig_amt_str:
                                try:
                                    original_amount = Decimal(orig_amt_str)
                                except InvalidOperation:
                                    pass
                        
                        if column_mapping.get("original_currency") or "original_currency" in row:
                            orig_curr = row.get(column_mapping.get("original_currency", "original_currency"), "").strip()
                            if orig_curr:
                                original_currency = orig_curr
                        
                        transaction = Transaction(
                            transaction_id=trans_id,
                            date=trans_date,
                            amount=amount,
                            description=description,
                            currency=currency,
                            original_amount=original_amount,
                            original_currency=original_currency,
                        )
                        transactions.append(transaction)
                        
                    except ValueError as e:
                        raise CSVParserError(f"第 {row_num} 行解析错误: {str(e)}")
                
                for trans_id, count in seen_ids.items():
                    if count > 1:
                        pass
                
                return transactions
                
        except UnicodeDecodeError as e:
            raise CSVParserError(
                f"文件编码错误: 无法使用 {self.encoding} 编码解码文件。"
                f"请检查文件编码是否正确。错误详情: {str(e)}"
            )
        except FileNotFoundError:
            raise CSVParserError(f"文件不存在: {file_path}")
        except csv.Error as e:
            raise CSVParserError(f"CSV格式错误: {str(e)}")


class FinancialReconciliator:
    def __init__(
        self,
        exchange_rate_provider: Optional[ExchangeRateProvider] = None,
        date_tolerance_days: int = 0,
        amount_tolerance: Decimal = Decimal("0.00"),
        target_currency: str = "CNY",
    ):
        self.exchange_rate_provider = exchange_rate_provider or ExchangeRateProvider()
        self.date_tolerance_days = date_tolerance_days
        self.amount_tolerance = amount_tolerance
        self.target_currency = target_currency

    def reconcile(
        self,
        source_transactions: List[Transaction],
        target_transactions: List[Transaction],
        date_range: Optional[DateRange] = None,
    ) -> ReconciliationReport:
        report = ReconciliationReport()
        report.total_source = len(source_transactions)
        report.total_target = len(target_transactions)

        if date_range:
            source_transactions = [
                t for t in source_transactions if date_range.contains(t.date)
            ]
            target_transactions = [
                t for t in target_transactions if date_range.contains(t.date)
            ]

        source_by_id: Dict[str, List[Transaction]] = {}
        target_by_id: Dict[str, List[Transaction]] = {}

        for trans in source_transactions:
            if trans.transaction_id not in source_by_id:
                source_by_id[trans.transaction_id] = []
            source_by_id[trans.transaction_id].append(trans)

        for trans in target_transactions:
            if trans.transaction_id not in target_by_id:
                target_by_id[trans.transaction_id] = []
            target_by_id[trans.transaction_id].append(trans)

        matched_ids = set()

        for trans_id, source_list in source_by_id.items():
            if trans_id in target_by_id:
                target_list = target_by_id[trans_id]
                
                if len(source_list) > 1 or len(target_list) > 1:
                    report.duplicates += 1
                    report.results.append(
                        MatchResult(
                            status=MatchStatus.DUPLICATE,
                            source_transaction=source_list[0] if source_list else None,
                            target_transaction=target_list[0] if target_list else None,
                            notes=f"交易ID {trans_id} 在源文件中有 {len(source_list)} 条记录，"
                                  f"在目标文件中有 {len(target_list)} 条记录",
                        )
                    )
                    matched_ids.add(trans_id)
                    continue

                source = source_list[0]
                target = target_list[0]

                source_converted = self._convert_transaction(source)
                target_converted = self._convert_transaction(target)

                date_diff = abs((source.date - target.date).days)
                
                if date_diff > self.date_tolerance_days:
                    report.date_mismatches += 1
                    report.results.append(
                        MatchResult(
                            status=MatchStatus.DATE_MISMATCH,
                            source_transaction=source,
                            target_transaction=target,
                            notes=f"日期差异: 源文件日期 {source.date}, "
                                  f"目标文件日期 {target.date}, 相差 {date_diff} 天",
                        )
                    )
                    matched_ids.add(trans_id)
                    continue

                amount_diff = abs(source_converted - target_converted)
                
                if amount_diff > self.amount_tolerance:
                    report.amount_mismatches += 1
                    report.results.append(
                        MatchResult(
                            status=MatchStatus.AMOUNT_MISMATCH,
                            source_transaction=source,
                            target_transaction=target,
                            difference=source_converted - target_converted,
                            notes=f"金额差异: 源文件金额 {source_converted} {self.target_currency}, "
                                  f"目标文件金额 {target_converted} {self.target_currency}, "
                                  f"差异 {source_converted - target_converted} {self.target_currency}",
                        )
                    )
                    matched_ids.add(trans_id)
                    continue

                report.matched += 1
                report.results.append(
                    MatchResult(
                        status=MatchStatus.MATCHED,
                        source_transaction=source,
                        target_transaction=target,
                        notes="交易记录完全匹配",
                    )
                )
                matched_ids.add(trans_id)

        for trans_id, source_list in source_by_id.items():
            if trans_id not in matched_ids:
                for source in source_list:
                    report.missing_in_target += 1
                    report.results.append(
                        MatchResult(
                            status=MatchStatus.MISSING_IN_TARGET,
                            source_transaction=source,
                            notes=f"交易ID {trans_id} 存在于源文件中，但在目标文件中未找到",
                        )
                    )

        for trans_id, target_list in target_by_id.items():
            if trans_id not in matched_ids:
                for target in target_list:
                    report.missing_in_source += 1
                    report.results.append(
                        MatchResult(
                            status=MatchStatus.MISSING_IN_SOURCE,
                            target_transaction=target,
                            notes=f"交易ID {trans_id} 存在于目标文件中，但在源文件中未找到",
                        )
                    )

        return report

    def _convert_transaction(self, transaction: Transaction) -> Decimal:
        if transaction.currency.upper() == self.target_currency.upper():
            return transaction.amount

        if transaction.original_amount and transaction.exchange_rate:
            return transaction.amount

        try:
            converted, _ = self.exchange_rate_provider.convert(
                transaction.amount,
                transaction.currency,
                self.target_currency,
                transaction.date,
            )
            return converted
        except ValueError:
            return transaction.amount


def reconcile_files(
    source_file: str,
    target_file: str,
    encoding: str = "utf-8",
    column_mapping: Optional[Dict[str, str]] = None,
    exchange_rate_provider: Optional[ExchangeRateProvider] = None,
    date_range: Optional[DateRange] = None,
    date_tolerance_days: int = 0,
    amount_tolerance: Decimal = Decimal("0.00"),
    target_currency: str = "CNY",
) -> ReconciliationReport:
    parser = CSVParser(encoding=encoding)
    
    try:
        source_transactions = parser.parse(source_file, column_mapping)
    except CSVParserError as e:
        report = ReconciliationReport()
        report.errors.append(f"源文件解析错误: {str(e)}")
        return report

    try:
        target_transactions = parser.parse(target_file, column_mapping)
    except CSVParserError as e:
        report = ReconciliationReport()
        report.errors.append(f"目标文件解析错误: {str(e)}")
        return report

    reconciliator = FinancialReconciliator(
        exchange_rate_provider=exchange_rate_provider,
        date_tolerance_days=date_tolerance_days,
        amount_tolerance=amount_tolerance,
        target_currency=target_currency,
    )

    return reconciliator.reconcile(source_transactions, target_transactions, date_range)
