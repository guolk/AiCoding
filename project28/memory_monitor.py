import psutil
import time
import threading
import csv
from datetime import datetime
from typing import Dict, List, Optional
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config


class MemoryMonitor:
    def __init__(self, process_name: str = None, check_interval: int = 1):
        self.process = self._get_process(process_name)
        self.check_interval = check_interval
        self.memory_history: List[Dict] = []
        self.running = False
        self.monitor_thread: Optional[threading.Thread] = None
        
        self.peak_memory_mb = 0
        self.initial_memory_mb = 0
        self.start_time: Optional[float] = None
    
    def _get_process(self, process_name: str = None) -> psutil.Process:
        if process_name:
            for proc in psutil.process_iter(['pid', 'name']):
                if process_name.lower() in proc.info['name'].lower():
                    return psutil.Process(proc.info['pid'])
        
        return psutil.Process()
    
    def get_memory_info(self) -> Dict:
        if not self.process:
            return {}
        
        try:
            memory_info = self.process.memory_info()
            memory_percent = self.process.memory_percent()
            
            return {
                'timestamp': datetime.now().isoformat(),
                'rss_mb': round(memory_info.rss / (1024 * 1024), 2),
                'vms_mb': round(memory_info.vms / (1024 * 1024), 2),
                'percent': round(memory_percent, 2)
            }
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return {}
    
    def _monitor_loop(self):
        self.initial_memory_mb = self.get_memory_info().get('rss_mb', 0)
        
        while self.running:
            info = self.get_memory_info()
            if info:
                self.memory_history.append(info)
                if info['rss_mb'] > self.peak_memory_mb:
                    self.peak_memory_mb = info['rss_mb']
                
                if len(self.memory_history) % 60 == 0:
                    self._log_memory_stats(info)
            
            time.sleep(self.check_interval)
    
    def _log_memory_stats(self, info: Dict):
        elapsed = time.time() - self.start_time
        hours = int(elapsed // 3600)
        minutes = int((elapsed % 3600) // 60)
        
        growth = info['rss_mb'] - self.initial_memory_mb
        growth_rate = growth / (elapsed / 3600) if elapsed > 0 else 0
        
        print(
            f"[{hours}h {minutes}m] "
            f"Memory: {info['rss_mb']} MB | "
            f"Peak: {self.peak_memory_mb} MB | "
            f"Growth: {growth:.2f} MB | "
            f"Rate: {growth_rate:.2f} MB/hour"
        )
    
    def start(self):
        if self.running:
            return
        
        self.running = True
        self.start_time = time.time()
        self.memory_history = []
        self.peak_memory_mb = 0
        
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        print(f"Memory monitor started. Initial memory: {self.initial_memory_mb} MB")
    
    def stop(self) -> Dict:
        self.running = False
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=2)
        
        final_info = self.get_memory_info()
        elapsed = time.time() - self.start_time if self.start_time else 0
        
        stats = {
            'elapsed_seconds': round(elapsed, 2),
            'initial_memory_mb': self.initial_memory_mb,
            'final_memory_mb': final_info.get('rss_mb', 0),
            'peak_memory_mb': self.peak_memory_mb,
            'memory_growth_mb': final_info.get('rss_mb', 0) - self.initial_memory_mb,
            'data_points': len(self.memory_history)
        }
        
        print("\n" + "=" * 60)
        print("MEMORY MONITOR SUMMARY")
        print("=" * 60)
        print(f"Elapsed time: {stats['elapsed_seconds']} seconds")
        print(f"Initial memory: {stats['initial_memory_mb']} MB")
        print(f"Final memory: {stats['final_memory_mb']} MB")
        print(f"Peak memory: {stats['peak_memory_mb']} MB")
        print(f"Memory growth: {stats['memory_growth_mb']} MB")
        
        if stats['memory_growth_mb'] < 50:
            print("STATUS: [OK] Memory stable (growth < 50 MB)")
        elif stats['memory_growth_mb'] < 200:
            print("STATUS: [WARNING] Memory moderate (growth 50-200 MB)")
        else:
            print("STATUS: [FAIL] Memory leak detected (growth > 200 MB)")
        
        print("=" * 60)
        
        return stats
    
    def save_to_csv(self, filename: str = None):
        if not self.memory_history:
            print("No data to save")
            return
        
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'memory_report_{timestamp}.csv'
        
        with open(filename, 'w', newline='') as f:
            fieldnames = ['timestamp', 'rss_mb', 'vms_mb', 'percent']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for record in self.memory_history:
                writer.writerow(record)
        
        print(f"Memory data saved to: {filename}")


class PerformanceBenchmark:
    def __init__(self):
        self.memory_monitor = MemoryMonitor()
        self.start_time = None
        self.end_time = None
    
    def run_benchmark(self, duration_seconds: int = 3600, check_interval: int = 60):
        print(f"Starting performance benchmark for {duration_seconds} seconds...")
        print(f"Checking memory every {check_interval} seconds")
        print(f"Max allowed memory: {Config.MAX_ALLOWED_MEMORY_MB} MB")
        print("-" * 60)
        
        self.start_time = time.time()
        self.memory_monitor.start()
        
        warnings = []
        check_count = 0
        
        try:
            while time.time() - self.start_time < duration_seconds:
                elapsed = time.time() - self.start_time
                remaining = duration_seconds - elapsed
                
                if int(elapsed) % check_interval == 0 and int(elapsed) // check_interval > check_count:
                    check_count = int(elapsed) // check_interval
                    
                    current_info = self.memory_monitor.get_memory_info()
                    if current_info:
                        current_mb = current_info['rss_mb']
                        
                        hours_remaining = int(remaining // 3600)
                        mins_remaining = int((remaining % 3600) // 60)
                        
                        print(
                            f"[Checkpoint {check_count}] "
                            f"Elapsed: {int(elapsed // 60)}m | "
                            f"Remaining: {hours_remaining}h {mins_remaining}m | "
                            f"Memory: {current_mb} MB | "
                            f"Peak: {self.memory_monitor.peak_memory_mb} MB"
                        )
                        
                        if current_mb > Config.MAX_ALLOWED_MEMORY_MB:
                            warning = (
                                f"WARNING: Memory exceeded limit at {int(elapsed)}s. "
                                f"Current: {current_mb} MB, Limit: {Config.MAX_ALLOWED_MEMORY_MB} MB"
                            )
                            warnings.append(warning)
                            print(warning)
                
                time.sleep(1)
        
        except KeyboardInterrupt:
            print("\nBenchmark interrupted by user")
        
        self.end_time = time.time()
        
        stats = self.memory_monitor.stop()
        self.memory_monitor.save_to_csv()
        
        print("\n" + "=" * 60)
        print("BENCHMARK SUMMARY")
        print("=" * 60)
        print(f"Duration: {stats['elapsed_seconds']} seconds")
        print(f"Initial memory: {stats['initial_memory_mb']} MB")
        print(f"Final memory: {stats['final_memory_mb']} MB")
        print(f"Peak memory: {stats['peak_memory_mb']} MB")
        print(f"Memory growth: {stats['memory_growth_mb']} MB")
        
        if warnings:
            print(f"\nWarnings ({len(warnings)}):")
            for w in warnings:
                print(f"  - {w}")
        
        growth_per_hour = stats['memory_growth_mb'] / (stats['elapsed_seconds'] / 3600)
        
        print(f"\nMemory stability analysis:")
        print(f"  Growth rate: {growth_per_hour:.2f} MB/hour")
        
        if stats['memory_growth_mb'] < 100:
            print("  [OK] EXCELLENT: Memory is stable with minimal growth")
            result = "PASS"
        elif stats['memory_growth_mb'] < 500:
            print("  [OK] GOOD: Memory growth is acceptable for long-term operation")
            result = "PASS"
        elif stats['memory_growth_mb'] < 2000:
            print("  [WARNING] MODERATE: Memory growth detected, monitor for long-term usage")
            result = "WARNING"
        else:
            print("  [FAIL] Memory leak detected - requires investigation")
            result = "FAIL"
        
        print("=" * 60)
        print(f"FINAL RESULT: {result}")
        print("=" * 60)
        
        return {
            'stats': stats,
            'warnings': warnings,
            'growth_per_hour': growth_per_hour,
            'result': result
        }


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Memory Monitor and Performance Benchmark')
    parser.add_argument('--mode', choices=['monitor', 'benchmark'], default='benchmark',
                        help='Mode: monitor (real-time) or benchmark (scheduled)')
    parser.add_argument('--duration', type=int, default=3600,
                        help='Benchmark duration in seconds (default: 3600 = 1 hour)')
    parser.add_argument('--interval', type=int, default=60,
                        help='Memory check interval in seconds (default: 60)')
    
    args = parser.parse_args()
    
    if args.mode == 'benchmark':
        benchmark = PerformanceBenchmark()
        result = benchmark.run_benchmark(
            duration_seconds=args.duration,
            check_interval=args.interval
        )
    else:
        monitor = MemoryMonitor(check_interval=args.interval)
        print("Starting real-time memory monitor... (Press Ctrl+C to stop)")
        try:
            monitor.start()
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping monitor...")
            monitor.stop()
            monitor.save_to_csv()
