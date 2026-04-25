import os
import re
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QScrollArea, QFrame
)
from PyQt5.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve, QPoint
from PyQt5.QtGui import QFont, QColor, QPalette, QLinearGradient, QPainter, QPen


class LyricsLine:
    def __init__(self, time=0.0, text=''):
        self.time = time
        self.text = text
        self.label = None


class LyricsWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.lyrics_lines = []
        self.current_index = -1
        self.lrc_path = ''
        self._init_ui()
    
    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(0)
        
        title_label = QLabel('歌词')
        title_label.setFont(QFont('Microsoft YaHei', 12, QFont.Bold))
        layout.addWidget(title_label)
        
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        self.scroll_area.setFrameStyle(QFrame.NoFrame)
        
        self.scroll_content = QWidget()
        self.scroll_layout = QVBoxLayout(self.scroll_content)
        self.scroll_layout.setContentsMargins(20, 20, 20, 20)
        self.scroll_layout.setSpacing(15)
        self.scroll_layout.setAlignment(Qt.AlignTop)
        
        self.scroll_area.setWidget(self.scroll_content)
        layout.addWidget(self.scroll_area)
        
        self.no_lyrics_label = QLabel('暂无歌词')
        self.no_lyrics_label.setFont(QFont('Microsoft YaHei', 14))
        self.no_lyrics_label.setAlignment(Qt.AlignCenter)
        self.no_lyrics_label.setStyleSheet('color: #888;')
        self.scroll_layout.addWidget(self.no_lyrics_label)
    
    def load_lyrics(self, audio_path):
        self.lyrics_lines = []
        self.current_index = -1
        
        base_path = os.path.splitext(audio_path)[0]
        possible_lrc_paths = [
            base_path + '.lrc',
            base_path + '.LRC',
        ]
        
        lrc_file = None
        for path in possible_lrc_paths:
            if os.path.exists(path):
                lrc_file = path
                break
        
        if not lrc_file:
            self._show_no_lyrics()
            return
        
        try:
            with open(lrc_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(lrc_file, 'r', encoding='gbk') as f:
                    content = f.read()
            except:
                self._show_no_lyrics()
                return
        
        self._parse_lrc(content)
        self._display_lyrics()
    
    def _parse_lrc(self, content):
        lines = content.split('\n')
        
        time_pattern = r'\[(\d{2}):(\d{2})\.(\d{2,3})\]'
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            matches = re.findall(time_pattern, line)
            
            if matches:
                text = re.sub(time_pattern, '', line).strip()
                
                for match in matches:
                    minutes = int(match[0])
                    seconds = int(match[1])
                    milliseconds = int(match[2])
                    if len(match[2]) == 2:
                        milliseconds *= 10
                    
                    total_seconds = minutes * 60 + seconds + milliseconds / 1000.0
                    
                    if text:
                        self.lyrics_lines.append(LyricsLine(total_seconds, text))
        
        self.lyrics_lines.sort(key=lambda x: x.time)
    
    def _display_lyrics(self):
        for i in reversed(range(self.scroll_layout.count())):
            item = self.scroll_layout.itemAt(i)
            if item.widget():
                item.widget().deleteLater()
        
        if not self.lyrics_lines:
            self.no_lyrics_label = QLabel('暂无歌词')
            self.no_lyrics_label.setFont(QFont('Microsoft YaHei', 14))
            self.no_lyrics_label.setAlignment(Qt.AlignCenter)
            self.no_lyrics_label.setStyleSheet('color: #888;')
            self.scroll_layout.addWidget(self.no_lyrics_label)
            return
        
        for i, line in enumerate(self.lyrics_lines):
            label = QLabel(line.text)
            label.setFont(QFont('Microsoft YaHei', 13))
            label.setAlignment(Qt.AlignCenter)
            label.setWordWrap(True)
            label.setStyleSheet('color: #666; padding: 5px;')
            label.setMinimumHeight(30)
            
            line.label = label
            self.scroll_layout.addWidget(label)
        
        self.scroll_layout.addStretch()
    
    def _show_no_lyrics(self):
        self._display_lyrics()
    
    def sync_lyrics(self, current_time):
        if not self.lyrics_lines:
            return
        
        target_index = -1
        for i, line in enumerate(self.lyrics_lines):
            if line.time <= current_time:
                target_index = i
            else:
                break
        
        if target_index == self.current_index:
            return
        
        self._highlight_line(target_index)
        self.current_index = target_index
    
    def _highlight_line(self, index):
        for i, line in enumerate(self.lyrics_lines):
            if line.label:
                if i == index:
                    line.label.setStyleSheet("""
                        color: #1a73e8;
                        padding: 5px;
                        font-weight: bold;
                        background-color: rgba(26, 115, 232, 30);
                        border-radius: 5px;
                    """)
                    line.label.setFont(QFont('Microsoft YaHei', 15))
                    
                    self._scroll_to_line(line.label)
                else:
                    line.label.setStyleSheet("""
                        color: #666;
                        padding: 5px;
                        background-color: transparent;
                    """)
                    line.label.setFont(QFont('Microsoft YaHei', 13))
    
    def _scroll_to_line(self, label):
        if not label:
            return
        
        scroll_area = self.scroll_area
        viewport = scroll_area.viewport()
        
        label_rect = label.geometry()
        viewport_rect = viewport.geometry()
        
        target_y = label_rect.top() - viewport_rect.height() // 2 + label_rect.height() // 2
        target_y = max(0, target_y)
        
        current_y = scroll_area.verticalScrollBar().value()
        
        diff = target_y - current_y
        if abs(diff) > 50:
            scroll_area.verticalScrollBar().setValue(int(target_y))
