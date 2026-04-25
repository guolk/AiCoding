import tkinter as tk
from tkinter import ttk, messagebox
import psutil
import time
import threading
from datetime import datetime, timedelta
from collections import deque
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import winreg
import os
import sys

plt.style.use('dark_background')

MAX_HISTORY = 300  # 5分钟 = 300秒


class ResourceMonitor:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("System Monitor")
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        self.root.attributes('-alpha', 0.8)
        
        self.transparency = 0.8
        self.is_expanded = False
        self.min_width = 320
        self.expanded_width = 720
        self.expanded_height = 580
        self.screen_margin = 5
        self.position = (self.root.winfo_screenwidth() - self.min_width - self.screen_margin, self.screen_margin)
        
        self.prev_net_io = psutil.net_io_counters()
        self.prev_disk_io = psutil.disk_io_counters()
        self.prev_time = time.time()
        
        self.cpu_history = deque(maxlen=MAX_HISTORY)
        self.cpu_per_core_history = []
        self.mem_history = deque(maxlen=MAX_HISTORY)
        self.net_up_history = deque(maxlen=MAX_HISTORY)
        self.net_down_history = deque(maxlen=MAX_HISTORY)
        self.disk_read_history = deque(maxlen=MAX_HISTORY)
        self.disk_write_history = deque(maxlen=MAX_HISTORY)
        
        cpu_count = psutil.cpu_count(logical=True)
        for _ in range(cpu_count):
            self.cpu_per_core_history.append(deque(maxlen=MAX_HISTORY))
        
        self._setup_ui()
        self._setup_context_menu()
        self._set_window_position()
        
        self.update_thread = threading.Thread(target=self._update_loop, daemon=True)
        self.update_thread.start()
        
        self.root.mainloop()
    
    def _setup_ui(self):
        self.main_frame = tk.Frame(self.root, bg='#1a1a2e')
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        self.label_frame = tk.Frame(self.main_frame, bg='#1a1a2e')
        self.label_frame.pack(padx=20, pady=15, fill=tk.BOTH, expand=True)
        
        self.title_label = tk.Label(
            self.label_frame, 
            text="[系统资源监控]", 
            font=("Microsoft YaHei", 10, "bold"),
            fg='#00ff88',
            bg='#1a1a2e'
        )
        self.title_label.pack(anchor='w')
        
        self.cpu_label = tk.Label(
            self.label_frame,
            text="CPU: 加载中...",
            font=("Microsoft YaHei", 9),
            fg='#ffffff',
            bg='#1a1a2e',
            justify='left',
            anchor='w'
        )
        self.cpu_label.pack(anchor='w', pady=(5, 0), fill='x')
        
        self.mem_label = tk.Label(
            self.label_frame,
            text="内存: 加载中...",
            font=("Microsoft YaHei", 9),
            fg='#ffffff',
            bg='#1a1a2e',
            anchor='w'
        )
        self.mem_label.pack(anchor='w', pady=(5, 0), fill='x')
        
        self.net_label = tk.Label(
            self.label_frame,
            text="网络: 加载中...",
            font=("Microsoft YaHei", 9),
            fg='#ffffff',
            bg='#1a1a2e',
            anchor='w'
        )
        self.net_label.pack(anchor='w', pady=(5, 0), fill='x')
        
        self.disk_label = tk.Label(
            self.label_frame,
            text="磁盘: 加载中...",
            font=("Microsoft YaHei", 9),
            fg='#ffffff',
            bg='#1a1a2e',
            anchor='w'
        )
        self.disk_label.pack(anchor='w', pady=(5, 0), fill='x')
        
        self.expanded_frame = tk.Frame(self.main_frame, bg='#1a1a2e')
        
        self.fig = Figure(figsize=(9, 6.5), dpi=80, facecolor='#1a1a2e')
        self.fig.subplots_adjust(left=0.12, right=0.94, top=0.90, bottom=0.15, hspace=0.45, wspace=0.3)
        
        self.ax_cpu = self.fig.add_subplot(2, 2, 1)
        self.ax_mem = self.fig.add_subplot(2, 2, 2)
        self.ax_net = self.fig.add_subplot(2, 2, 3)
        self.ax_disk = self.fig.add_subplot(2, 2, 4)
        
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.expanded_frame)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        self.main_frame.bind('<Button-1>', self._on_click)
        self.label_frame.bind('<Button-1>', self._on_click)
        self.title_label.bind('<Button-1>', self._on_click)
        self.cpu_label.bind('<Button-1>', self._on_click)
        self.mem_label.bind('<Button-1>', self._on_click)
        self.net_label.bind('<Button-1>', self._on_click)
        self.disk_label.bind('<Button-1>', self._on_click)
        
        self._make_draggable()
    
    def _make_draggable(self):
        def on_drag_start(event):
            self.drag_x = event.x
            self.drag_y = event.y
        
        def on_drag_motion(event):
            x = self.root.winfo_x() + (event.x - self.drag_x)
            y = self.root.winfo_y() + (event.y - self.drag_y)
            self.root.geometry(f"+{x}+{y}")
            self.position = (x, y)
        
        self.main_frame.bind('<Button-3>', on_drag_start)
        self.main_frame.bind('<B3-Motion>', on_drag_motion)
        self.label_frame.bind('<Button-3>', on_drag_start)
        self.label_frame.bind('<B3-Motion>', on_drag_motion)
    
    def _setup_context_menu(self):
        self.context_menu = tk.Menu(self.root, tearoff=0, bg='#2a2a4e', fg='#ffffff')
        
        transparency_menu = tk.Menu(self.context_menu, tearoff=0, bg='#2a2a4e', fg='#ffffff')
        for alpha in [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]:
            transparency_menu.add_command(
                label=f"{int(alpha*100)}%",
                command=lambda a=alpha: self._set_transparency(a)
            )
        self.context_menu.add_cascade(label="透明度", menu=transparency_menu)
        
        position_menu = tk.Menu(self.context_menu, tearoff=0, bg='#2a2a4e', fg='#ffffff')
        position_menu.add_command(label="左上角", command=lambda: self._move_to_corner('top_left'))
        position_menu.add_command(label="右上角", command=lambda: self._move_to_corner('top_right'))
        position_menu.add_command(label="左下角", command=lambda: self._move_to_corner('bottom_left'))
        position_menu.add_command(label="右下角", command=lambda: self._move_to_corner('bottom_right'))
        self.context_menu.add_cascade(label="位置", menu=position_menu)
        
        self.autostart_var = tk.BooleanVar(value=self._check_autostart())
        self.context_menu.add_checkbutton(
            label="开机自启",
            variable=self.autostart_var,
            command=self._toggle_autostart
        )
        
        self.context_menu.add_separator()
        self.context_menu.add_command(label="退出", command=self.root.quit)
        
        self.root.bind('<Button-3>', self._show_context_menu)
        self.main_frame.bind('<Button-3>', self._show_context_menu)
        self.label_frame.bind('<Button-3>', self._show_context_menu)
    
    def _show_context_menu(self, event):
        try:
            self.context_menu.tk_popup(event.x_root, event.y_root)
        finally:
            self.context_menu.grab_release()
    
    def _set_transparency(self, alpha):
        self.transparency = alpha
        self.root.attributes('-alpha', alpha)
    
    def _move_to_corner(self, corner):
        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        
        if self.is_expanded:
            win_w = self.expanded_width
            win_h = self.expanded_height
        else:
            self.root.update_idletasks()
            win_w = max(self.root.winfo_width(), self.min_width)
            win_h = max(self.root.winfo_height(), 100)
        
        margin = self.screen_margin
        
        if corner == 'top_left':
            x, y = margin, margin
        elif corner == 'top_right':
            x, y = screen_w - win_w - margin, margin
        elif corner == 'bottom_left':
            x, y = margin, screen_h - win_h - margin
        else:
            x, y = screen_w - win_w - margin, screen_h - win_h - margin
        
        x = max(margin, min(x, screen_w - win_w - margin))
        y = max(margin, min(y, screen_h - win_h - margin))
        
        if self.is_expanded:
            self.root.geometry(f"{win_w}x{win_h}+{x}+{y}")
        else:
            self.root.geometry(f"+{x}+{y}")
        
        self.position = (x, y)
    
    def _set_window_position(self):
        x, y = self.position
        self.root.geometry(f"+{x}+{y}")
    
    def _check_autostart(self):
        try:
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Run",
                0,
                winreg.KEY_READ
            )
            try:
                winreg.QueryValueEx(key, "SystemResourceMonitor")
                return True
            except FileNotFoundError:
                return False
            finally:
                winreg.CloseKey(key)
        except Exception:
            return False
    
    def _toggle_autostart(self):
        should_autostart = self.autostart_var.get()
        script_path = os.path.abspath(sys.argv[0])
        
        if script_path.endswith('.py'):
            python_exe = sys.executable
            command = f'"{python_exe}" "{script_path}"'
        else:
            command = f'"{script_path}"'
        
        try:
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Run",
                0,
                winreg.KEY_SET_VALUE
            )
            
            if should_autostart:
                winreg.SetValueEx(key, "SystemResourceMonitor", 0, winreg.REG_SZ, command)
            else:
                try:
                    winreg.DeleteValue(key, "SystemResourceMonitor")
                except FileNotFoundError:
                    pass
            
            winreg.CloseKey(key)
        except Exception as e:
            messagebox.showerror("错误", f"无法设置开机自启: {e}")
    
    def _on_click(self, event):
        self._toggle_expanded()
    
    def _toggle_expanded(self):
        self.is_expanded = not self.is_expanded
        
        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        margin = self.screen_margin
        
        current_x = self.root.winfo_x()
        current_y = self.root.winfo_y()
        
        if self.is_expanded:
            self.collapsed_pos = (current_x, current_y)
            
            self.expanded_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            new_x = max(margin, min(current_x, screen_w - self.expanded_width - margin))
            new_y = max(margin, min(current_y, screen_h - self.expanded_height - margin))
            
            self.root.geometry(f"{self.expanded_width}x{self.expanded_height}+{new_x}+{new_y}")
            self.position = (new_x, new_y)
            self._update_chart()
        else:
            self.expanded_frame.pack_forget()
            
            if hasattr(self, 'collapsed_pos'):
                base_x, base_y = self.collapsed_pos
            else:
                base_x, base_y = current_x, current_y
            
            self.root.geometry("")
            self.root.update_idletasks()
            
            actual_w = max(self.root.winfo_width(), self.min_width)
            actual_h = self.root.winfo_height()
            
            new_x = max(margin, min(base_x, screen_w - actual_w - margin))
            new_y = max(margin, min(base_y, screen_h - actual_h - margin))
            
            self.root.geometry(f"+{new_x}+{new_y}")
            self.position = (new_x, new_y)
    
    def _update_loop(self):
        while True:
            try:
                self._collect_data()
                self.root.after(0, self._update_display)
            except Exception as e:
                print(f"更新错误: {e}")
            time.sleep(1)
    
    def _collect_data(self):
        cpu_percent = psutil.cpu_percent(interval=None)
        cpu_per_core = psutil.cpu_percent(interval=None, percpu=True)
        
        memory = psutil.virtual_memory()
        mem_percent = memory.percent
        
        current_net_io = psutil.net_io_counters()
        current_disk_io = psutil.disk_io_counters()
        current_time = time.time()
        
        time_delta = current_time - self.prev_time
        if time_delta > 0:
            net_up = (current_net_io.bytes_sent - self.prev_net_io.bytes_sent) / time_delta
            net_down = (current_net_io.bytes_recv - self.prev_net_io.bytes_recv) / time_delta
            disk_read = (current_disk_io.read_bytes - self.prev_disk_io.read_bytes) / time_delta
            disk_write = (current_disk_io.write_bytes - self.prev_disk_io.write_bytes) / time_delta
        else:
            net_up = net_down = disk_read = disk_write = 0
        
        self.prev_net_io = current_net_io
        self.prev_disk_io = current_disk_io
        self.prev_time = current_time
        
        self.cpu_history.append(cpu_percent)
        for i, core_pct in enumerate(cpu_per_core):
            if i < len(self.cpu_per_core_history):
                self.cpu_per_core_history[i].append(core_pct)
        self.mem_history.append(mem_percent)
        self.net_up_history.append(net_up)
        self.net_down_history.append(net_down)
        self.disk_read_history.append(disk_read)
        self.disk_write_history.append(disk_write)
        
        self.latest_data = {
            'cpu_percent': cpu_percent,
            'cpu_per_core': cpu_per_core,
            'mem_percent': mem_percent,
            'mem_used': memory.used / (1024**3),
            'mem_total': memory.total / (1024**3),
            'net_up': net_up,
            'net_down': net_down,
            'disk_read': disk_read,
            'disk_write': disk_write
        }
    
    def _update_display(self):
        if not hasattr(self, 'latest_data'):
            return
        
        data = self.latest_data
        
        cpu_text = f"CPU: {data['cpu_percent']:.1f}%\n"
        for i, core in enumerate(data['cpu_per_core']):
            cpu_text += f"  核{i+1}: {core:.1f}%  "
            if (i + 1) % 4 == 0 and i < len(data['cpu_per_core']) - 1:
                cpu_text += "\n"
        self.cpu_label.config(text=cpu_text)
        
        mem_text = f"内存: {data['mem_percent']:.1f}% ({data['mem_used']:.1f}GB/{data['mem_total']:.1f}GB)"
        self.mem_label.config(text=mem_text)
        
        net_text = f"网络: ↑ {self._format_speed(data['net_up'])}  ↓ {self._format_speed(data['net_down'])}"
        self.net_label.config(text=net_text)
        
        disk_text = f"磁盘: 读 {self._format_speed(data['disk_read'])}  写 {self._format_speed(data['disk_write'])}"
        self.disk_label.config(text=disk_text)
        
        if self.is_expanded:
            self._update_chart()
    
    def _format_speed(self, bytes_per_sec):
        if bytes_per_sec < 1024:
            return f"{bytes_per_sec:.0f} B/s"
        elif bytes_per_sec < 1024**2:
            return f"{bytes_per_sec/1024:.1f} KB/s"
        else:
            return f"{bytes_per_sec/(1024**2):.1f} MB/s"
    
    def _update_chart(self):
        for ax in [self.ax_cpu, self.ax_mem, self.ax_net, self.ax_disk]:
            ax.clear()
            ax.set_facecolor('#1a1a2e')
            ax.tick_params(colors='#aaaaaa', labelsize=8)
            ax.spines['top'].set_color('#444444')
            ax.spines['bottom'].set_color('#444444')
            ax.spines['left'].set_color('#444444')
            ax.spines['right'].set_color('#444444')
        
        x = list(range(len(self.cpu_history)))
        n_points = len(x)
        
        if n_points > 1:
            tick_step = max(1, n_points // 6)
            xticks = x[::tick_step]
            xlabels = [f'-{n_points - i}s' for i in xticks]
            
            for ax in [self.ax_cpu, self.ax_mem, self.ax_net, self.ax_disk]:
                ax.set_xticks(xticks)
                ax.set_xticklabels(xlabels, rotation=0, ha='center')
                ax.set_xlim(0, n_points - 1 if n_points > 1 else 1)
        
        self.ax_cpu.set_title('CPU使用率 (%)', color='#00ff88', fontsize=10, pad=8)
        self.ax_cpu.set_ylim(0, 105)
        self.ax_cpu.set_yticks([0, 25, 50, 75, 100])
        colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe']
        for i, core_history in enumerate(self.cpu_per_core_history):
            if len(core_history) > 1:
                color = colors[i % len(colors)]
                self.ax_cpu.plot(list(range(len(core_history))), list(core_history), 
                                color=color, linewidth=1, alpha=0.7, label=f'核{i+1}')
        if len(self.cpu_history) > 1:
            self.ax_cpu.plot(x, list(self.cpu_history), color='#ff9f43', linewidth=2, label='总体')
        if len(self.cpu_per_core_history) <= 4:
            self.ax_cpu.legend(loc='upper left', fontsize=7, facecolor='#1a1a2e', edgecolor='#444444')
        
        self.ax_mem.set_title('内存使用率 (%)', color='#00ff88', fontsize=10, pad=8)
        self.ax_mem.set_ylim(0, 105)
        self.ax_mem.set_yticks([0, 25, 50, 75, 100])
        if len(self.mem_history) > 1:
            self.ax_mem.plot(x, list(self.mem_history), color='#e74c3c', linewidth=2)
        self.ax_mem.fill_between(x, list(self.mem_history), alpha=0.3, color='#e74c3c')
        
        self.ax_net.set_title('网络速率 (MB/s)', color='#00ff88', fontsize=10, pad=8)
        if len(self.net_up_history) > 1:
            net_up_mb = [v / (1024**2) for v in self.net_up_history]
            net_down_mb = [v / (1024**2) for v in self.net_down_history]
            self.ax_net.plot(x, net_up_mb, color='#3498db', linewidth=1.5, label='上传')
            self.ax_net.plot(x, net_down_mb, color='#2ecc71', linewidth=1.5, label='下载')
            self.ax_net.legend(loc='upper left', fontsize=7, facecolor='#1a1a2e', edgecolor='#444444')
        
        self.ax_disk.set_title('磁盘速率 (MB/s)', color='#00ff88', fontsize=10, pad=8)
        if len(self.disk_read_history) > 1:
            disk_read_mb = [v / (1024**2) for v in self.disk_read_history]
            disk_write_mb = [v / (1024**2) for v in self.disk_write_history]
            self.ax_disk.plot(x, disk_read_mb, color='#9b59b6', linewidth=1.5, label='读取')
            self.ax_disk.plot(x, disk_write_mb, color='#f39c12', linewidth=1.5, label='写入')
            self.ax_disk.legend(loc='upper left', fontsize=7, facecolor='#1a1a2e', edgecolor='#444444')
        
        self.canvas.draw()


if __name__ == "__main__":
    ResourceMonitor()
