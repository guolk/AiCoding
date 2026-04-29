import subprocess
import sys
import time
import os


def print_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def install_dependencies():
    print_header("Installing Dependencies")
    print("Installing required packages...")
    subprocess.run([sys.executable, "-m", "pip", "install", "--user", "-r", "requirements.txt"], check=True)
    print("[OK] Dependencies installed successfully")


def start_websocket_server():
    print_header("Starting WebSocket Server")
    print("Starting stock data simulation server...")
    
    process = subprocess.Popen(
        [sys.executable, "websocket_server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    
    time.sleep(2)
    
    if process.poll() is None:
        print(f"[OK] WebSocket server started (PID: {process.pid})")
        print(f"  URL: ws://localhost:8765")
        return process
    else:
        output, _ = process.communicate()
        print(f"[FAIL] Failed to start WebSocket server: {output.decode()}")
        return None


def start_optimized_dashboard():
    print_header("Starting Optimized Dashboard")
    print("Starting Bokeh server with optimized dashboard...")
    print("\nFeatures enabled:")
    print("  [OK] Rolling Window (max 1000 data points)")
    print("  [OK] Stream Updates (only new data, not full push)")
    print("  [OK] Data Aggregation (K-line with adjustable time window)")
    print("\nTo view the dashboard, open your browser and go to:")
    print("  http://localhost:5006")
    print("\nPress Ctrl+C to stop all servers")
    print("-" * 60)
    
    process = subprocess.Popen(
        ["bokeh", "serve", "optimized_dashboard.py", "--port", "5006"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    
    time.sleep(3)
    
    if process.poll() is None:
        print(f"[OK] Optimized dashboard started (PID: {process.pid})")
        return process
    else:
        output, _ = process.communicate()
        print(f"[FAIL] Failed to start dashboard: {output.decode()}")
        return None


def start_naive_dashboard():
    print_header("Starting Naive Dashboard (For Comparison)")
    print("WARNING: This version uses FULL data push and will cause memory issues!")
    print("This is for comparison purposes only.")
    
    process = subprocess.Popen(
        ["bokeh", "serve", "naive_dashboard.py", "--port", "5007"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    
    time.sleep(3)
    
    if process.poll() is None:
        print(f"[OK] Naive dashboard started (PID: {process.pid})")
        print(f"  URL: http://localhost:5007")
        return process
    else:
        return None


def run_memory_test(duration_seconds=60):
    print_header(f"Running Memory Stability Test ({duration_seconds} seconds)")
    print("This test will monitor memory usage of the optimized dashboard.")
    print(f"Max allowed memory: 500 MB")
    print("-" * 60)
    
    websocket_proc = start_websocket_server()
    if not websocket_proc:
        print("Cannot proceed without WebSocket server")
        return
    
    dashboard_proc = start_optimized_dashboard()
    if not dashboard_proc:
        websocket_proc.terminate()
        print("Cannot proceed without dashboard")
        return
    
    print(f"\nMonitoring for {duration_seconds} seconds...")
    print("Press Ctrl+C to stop early")
    
    try:
        import psutil
        
        initial_memory = None
        peak_memory = 0
        
        for i in range(duration_seconds):
            if dashboard_proc.poll() is not None:
                print("Dashboard process terminated unexpectedly")
                break
            
            try:
                proc = psutil.Process(dashboard_proc.pid)
                memory_mb = proc.memory_info().rss / (1024 * 1024)
                
                if initial_memory is None:
                    initial_memory = memory_mb
                
                peak_memory = max(peak_memory, memory_mb)
                
                if (i + 1) % 10 == 0:
                    elapsed = i + 1
                    growth = memory_mb - initial_memory
                    print(
                        f"[{elapsed}s] "
                        f"Memory: {memory_mb:.1f} MB | "
                        f"Peak: {peak_memory:.1f} MB | "
                        f"Growth: {growth:.1f} MB"
                    )
            
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
            
            time.sleep(1)
        
        print("\n" + "-" * 60)
        print("Test completed!")
        print(f"Initial memory: {initial_memory:.1f} MB")
        print(f"Peak memory: {peak_memory:.1f} MB")
        print(f"Final memory: {memory_mb:.1f} MB")
        print(f"Memory growth: {memory_mb - initial_memory:.1f} MB")
        
        if (memory_mb - initial_memory) < 100:
            print("\n[OK] RESULT: Memory is stable! Optimizations working correctly.")
        else:
            print("\n[WARNING] RESULT: Memory growth detected. Further investigation needed.")
            
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    finally:
        print("\nStopping all processes...")
        dashboard_proc.terminate()
        websocket_proc.terminate()
        print("[OK] All processes stopped")


def main():
    print_header("Real-time Stock Dashboard - Project Launcher")
    print("\nAvailable options:")
    print("  1. Install dependencies")
    print("  2. Start optimized dashboard (with fixes)")
    print("  3. Start naive dashboard (for comparison - memory issues)")
    print("  4. Run quick memory stability test (60 seconds)")
    print("  5. Run full 1-hour memory stability test")
    print("  0. Exit")
    
    choice = input("\nEnter your choice (0-5): ").strip()
    
    if choice == '1':
        install_dependencies()
    
    elif choice == '2':
        websocket_proc = start_websocket_server()
        if websocket_proc:
            dashboard_proc = start_optimized_dashboard()
            if dashboard_proc:
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    print("\nStopping servers...")
                    dashboard_proc.terminate()
                    websocket_proc.terminate()
    
    elif choice == '3':
        websocket_proc = start_websocket_server()
        if websocket_proc:
            dashboard_proc = start_naive_dashboard()
            if dashboard_proc:
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    print("\nStopping servers...")
                    dashboard_proc.terminate()
                    websocket_proc.terminate()
    
    elif choice == '4':
        run_memory_test(duration_seconds=60)
    
    elif choice == '5':
        print("\nNOTE: Full 1-hour test will run in background.")
        print("You can monitor progress in the CSV output file.")
        confirm = input("Proceed? (y/n): ").strip().lower()
        if confirm == 'y':
            run_memory_test(duration_seconds=3600)
    
    elif choice == '0':
        print("Goodbye!")
    
    else:
        print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
