"""
内存稳定性独立测试
直接测试OptimizedDataManager的内存稳定性
"""
import sys
import time
import gc
import psutil
from datetime import datetime

sys.path.insert(0, '.')

from config import Config
from data_manager import OptimizedDataManager


class MemoryStabilityTest:
    def __init__(self):
        self.process = psutil.Process()
        self.initial_memory = 0
        self.peak_memory = 0
        self.memory_samples = []
        self.data_manager = OptimizedDataManager(max_points=Config.MAX_DATA_POINTS)

    def get_memory_mb(self):
        return self.process.memory_info().rss / (1024 * 1024)

    def run_test(self, duration_seconds=3600, tick_rate_ms=100):
        print("=" * 60)
        print("内存稳定性测试 - 独立版本")
        print("=" * 60)
        print(f"测试时长: {duration_seconds} 秒 ({duration_seconds/3600:.1f} 小时)")
        print(f"滚动窗口: {Config.MAX_DATA_POINTS} 数据点")
        print(f"Tick速率: {tick_rate_ms}ms")
        print("-" * 60)

        self.initial_memory = self.get_memory_mb()
        self.peak_memory = self.initial_memory
        start_time = time.time()
        tick_count = 0
        check_interval = 60
        next_check = check_interval

        print(f"\n初始内存: {self.initial_memory:.2f} MB")
        print("\n开始测试...\n")

        end_time = start_time + duration_seconds

        while time.time() < end_time:
            elapsed = time.time() - start_time

            tick = {
                'symbol': Config.STOCK_SYMBOLS[tick_count % len(Config.STOCK_SYMBOLS)],
                'timestamp': datetime.now(),
                'price': 100 + (tick_count % 1000) * 0.01,
                'volume': 1000 + (tick_count % 100),
                'bid': 100 + (tick_count % 1000) * 0.01 - 0.001,
                'ask': 100 + (tick_count % 1000) * 0.01 + 0.001
            }

            self.data_manager.add_tick(tick['symbol'], tick)
            tick_count += 1

            if elapsed >= next_check:
                current_memory = self.get_memory_mb()
                self.memory_samples.append({
                    'elapsed': elapsed,
                    'memory_mb': current_memory,
                    'ticks': tick_count
                })

                growth = current_memory - self.initial_memory
                rate = growth / (elapsed / 3600) if elapsed > 0 else 0

                print(f"[{int(elapsed)//60}m {int(elapsed)%60}s] "
                      f"Ticks: {tick_count:,} | "
                      f"Memory: {current_memory:.2f} MB | "
                      f"Growth: {growth:.2f} MB | "
                      f"Rate: {rate:.2f} MB/h")

                self.peak_memory = max(self.peak_memory, current_memory)
                next_check += check_interval

            time.sleep(tick_rate_ms / 1000)

        final_memory = self.get_memory_mb()
        total_elapsed = time.time() - start_time

        return self.generate_report(total_elapsed, final_memory, tick_count)

    def generate_report(self, elapsed, final_memory, tick_count):
        memory_growth = final_memory - self.initial_memory
        growth_rate = memory_growth / (elapsed / 3600) if elapsed > 0 else 0

        print("\n" + "=" * 60)
        print("测试报告")
        print("=" * 60)
        print(f"测试时长: {elapsed:.0f} 秒 ({elapsed/3600:.2f} 小时)")
        print(f"处理Tick数: {tick_count:,}")
        print("-" * 60)
        print("内存统计:")
        print(f"  初始内存: {self.initial_memory:.2f} MB")
        print(f"  最终内存: {final_memory:.2f} MB")
        print(f"  峰值内存: {self.peak_memory:.2f} MB")
        print(f"  内存增长: {memory_growth:.2f} MB")
        print(f"  增长率: {growth_rate:.2f} MB/小时")
        print("-" * 60)

        if memory_growth < 100:
            status = "[PASS] EXCELLENT - 内存稳定，增长极小"
            result = "PASS"
        elif memory_growth < 500:
            status = "[PASS] GOOD - 内存增长可接受"
            result = "PASS"
        elif memory_growth < 2000:
            status = "[WARNING] MODERATE - 内存增长较大，需关注"
            result = "WARNING"
        else:
            status = "[FAIL] FAIL - 检测到内存泄漏"
            result = "FAIL"

        print(f"判定结果: {status}")
        print("=" * 60)
        print(f"最终结果: {result}")
        print("=" * 60)

        return {
            'elapsed': elapsed,
            'tick_count': tick_count,
            'initial_memory_mb': self.initial_memory,
            'final_memory_mb': final_memory,
            'peak_memory_mb': self.peak_memory,
            'memory_growth_mb': memory_growth,
            'growth_rate_mb_per_hour': growth_rate,
            'result': result
        }


def run_short_test():
    print("\n运行短时测试 (60秒)...\n")
    test = MemoryStabilityTest()
    return test.run_test(duration_seconds=60)


def run_full_test():
    print("\n运行完整测试 (1小时)...\n")
    print("注意: 完整测试需要1小时运行时间")
    confirm = input("是否继续? (y/n): ").strip().lower()
    if confirm != 'y':
        print("已取消")
        return None

    test = MemoryStabilityTest()
    return test.run_test(duration_seconds=3600)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='内存稳定性测试')
    parser.add_argument('--duration', type=int, default=60,
                        help='测试时长（秒），默认60秒')
    args = parser.parse_args()

    test = MemoryStabilityTest()
    result = test.run_test(duration_seconds=args.duration)

    if result:
        print("\n测试完成!")
