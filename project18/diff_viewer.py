import re
import difflib
from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel,
    QComboBox, QPushButton, QTextEdit, QSplitter,
    QWidget, QScrollArea, QFrame, QGroupBox
)
from PyQt5.QtCore import Qt, QSize
from PyQt5.QtGui import QFont, QColor, QTextCharFormat, QSyntaxHighlighter


class DiffHighlighter(QSyntaxHighlighter):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.added_format = QTextCharFormat()
        self.added_format.setBackground(QColor(144, 238, 144))
        
        self.removed_format = QTextCharFormat()
        self.removed_format.setBackground(QColor(255, 182, 193))
        
        self.modified_format = QTextCharFormat()
        self.modified_format.setBackground(QColor(255, 255, 153))
        
        self.context_format = QTextCharFormat()
        self.context_format.setForeground(QColor(128, 128, 128))
        
    def highlightBlock(self, text):
        if text.startswith('+'):
            self.setFormat(0, len(text), self.added_format)
        elif text.startswith('-'):
            self.setFormat(0, len(text), self.removed_format)
        elif text.startswith('?'):
            self.setFormat(0, len(text), self.modified_format)
        elif text.startswith('@@'):
            self.setFormat(0, len(text), self.context_format)
        elif text.startswith(' '):
            self.setFormat(0, len(text), self.context_format)


class SideBySideDiffWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._setup_ui()
        
    def _setup_ui(self):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        splitter = QSplitter(Qt.Horizontal)
        
        self.left_panel = self._create_panel("旧版本")
        self.right_panel = self._create_panel("新版本")
        
        splitter.addWidget(self.left_panel)
        splitter.addWidget(self.right_panel)
        splitter.setSizes([400, 400])
        
        layout.addWidget(splitter)
        
    def _create_panel(self, title):
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(5, 5, 5, 5)
        
        title_label = QLabel(title)
        title_label.setStyleSheet("font-weight: bold; font-size: 14px;")
        layout.addWidget(title_label)
        
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(0)
        
        text_edit = QTextEdit()
        text_edit.setReadOnly(True)
        text_edit.setFont(QFont("Consolas", 11))
        text_edit.setLineWrapMode(QTextEdit.NoWrap)
        
        content_layout.addWidget(text_edit)
        scroll_area.setWidget(content_widget)
        layout.addWidget(scroll_area)
        
        panel.text_edit = text_edit
        return panel
        
    def set_diff(self, old_text, new_text):
        old_lines = old_text.split('\n')
        new_lines = new_text.split('\n')
        
        matcher = difflib.SequenceMatcher(None, old_lines, new_lines)
        
        left_html = self._generate_side_html(old_lines, matcher, 'old')
        right_html = self._generate_side_html(new_lines, matcher, 'new')
        
        self.left_panel.text_edit.setHtml(left_html)
        self.right_panel.text_edit.setHtml(right_html)
        
    def _generate_side_html(self, lines, matcher, side):
        html_parts = []
        html_parts.append('<pre style="font-family: Consolas, monospace; font-size: 14px; line-height: 1.4; margin: 0; padding: 0;">')
        
        line_num = 0
        
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if side == 'old':
                start, end = i1, i2
            else:
                start, end = j1, j2
                
            for idx in range(start, end):
                line_num += 1
                line = lines[idx] if idx < len(lines) else ''
                line = self._escape_html(line)
                
                if tag == 'equal':
                    bg_color = '#ffffff'
                elif tag == 'replace':
                    bg_color = '#fffacd'
                elif tag == 'delete':
                    bg_color = '#ffcdd2' if side == 'old' else '#ffffff'
                elif tag == 'insert':
                    bg_color = '#c8e6c9' if side == 'new' else '#ffffff'
                else:
                    bg_color = '#ffffff'
                    
                line_number_str = f'<span style="color: #999; padding-right: 10px; user-select: none;">{line_num:4d}</span>'
                html_parts.append(f'<div style="background-color: {bg_color}; padding: 2px 4px;">{line_number_str}{line}</div>')
                
        html_parts.append('</pre>')
        return '\n'.join(html_parts)
        
    def _escape_html(self, text):
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        text = text.replace('"', '&quot;')
        text = text.replace(' ', '&nbsp;')
        return text


class UnifiedDiffWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._setup_ui()
        
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        title_label = QLabel("统一格式差异")
        title_label.setStyleSheet("font-weight: bold; font-size: 14px;")
        layout.addWidget(title_label)
        
        self.text_edit = QTextEdit()
        self.text_edit.setReadOnly(True)
        self.text_edit.setFont(QFont("Consolas", 11))
        self.text_edit.setLineWrapMode(QTextEdit.NoWrap)
        
        self.highlighter = DiffHighlighter(self.text_edit.document())
        
        layout.addWidget(self.text_edit)
        
    def set_diff(self, old_text, new_text):
        old_lines = old_text.split('\n')
        new_lines = new_text.split('\n')
        
        diff = difflib.unified_diff(
            old_lines,
            new_lines,
            fromfile='旧版本',
            tofile='新版本',
            lineterm=''
        )
        
        diff_lines = list(diff)
        diff_text = '\n'.join(diff_lines)
        
        self.text_edit.setPlainText(diff_text)


class DiffViewer(QDialog):
    def __init__(self, versions, parent=None):
        super().__init__(parent)
        self.versions = versions
        self._setup_ui()
        self._populate_versions()
        
    def _setup_ui(self):
        self.setWindowTitle("版本对比")
        self.setMinimumSize(900, 600)
        
        layout = QVBoxLayout(self)
        
        selection_layout = QHBoxLayout()
        
        selection_layout.addWidget(QLabel("旧版本:"))
        self.old_version_combo = QComboBox()
        self.old_version_combo.setMinimumWidth(200)
        selection_layout.addWidget(self.old_version_combo)
        
        selection_layout.addWidget(QLabel("新版本:"))
        self.new_version_combo = QComboBox()
        self.new_version_combo.setMinimumWidth(200)
        selection_layout.addWidget(self.new_version_combo)
        
        self.compare_btn = QPushButton("对比")
        self.compare_btn.clicked.connect(self._on_compare)
        selection_layout.addWidget(self.compare_btn)
        
        selection_layout.addStretch()
        
        layout.addLayout(selection_layout)
        
        self.side_by_side_widget = SideBySideDiffWidget()
        self.unified_widget = UnifiedDiffWidget()
        self.unified_widget.hide()
        
        layout.addWidget(self.side_by_side_widget)
        layout.addWidget(self.unified_widget)
        
        bottom_layout = QHBoxLayout()
        
        self.view_mode_label = QLabel("显示模式:")
        bottom_layout.addWidget(self.view_mode_label)
        
        self.side_by_side_radio = QPushButton("并排对比")
        self.side_by_side_radio.setCheckable(True)
        self.side_by_side_radio.setChecked(True)
        self.side_by_side_radio.clicked.connect(self._on_view_mode_changed)
        bottom_layout.addWidget(self.side_by_side_radio)
        
        self.unified_radio = QPushButton("统一格式")
        self.unified_radio.setCheckable(True)
        self.unified_radio.clicked.connect(self._on_view_mode_changed)
        bottom_layout.addWidget(self.unified_radio)
        
        bottom_layout.addStretch()
        
        self.close_btn = QPushButton("关闭")
        self.close_btn.clicked.connect(self.accept)
        bottom_layout.addWidget(self.close_btn)
        
        layout.addLayout(bottom_layout)
        
    def _populate_versions(self):
        for version in self.versions:
            display_text = f"{version.name} ({len(version.content)} 字符)"
            self.old_version_combo.addItem(display_text, version.id)
            self.new_version_combo.addItem(display_text, version.id)
            
        if len(self.versions) >= 2:
            self.old_version_combo.setCurrentIndex(1)
            self.new_version_combo.setCurrentIndex(0)
            self._on_compare()
            
    def _on_compare(self):
        old_id = self.old_version_combo.currentData()
        new_id = self.new_version_combo.currentData()
        
        old_version = None
        new_version = None
        
        for version in self.versions:
            if version.id == old_id:
                old_version = version
            if version.id == new_id:
                new_version = version
                
        if old_version and new_version:
            self.side_by_side_widget.set_diff(old_version.content, new_version.content)
            self.unified_widget.set_diff(old_version.content, new_version.content)
            
    def _on_view_mode_changed(self):
        sender = self.sender()
        if sender == self.side_by_side_radio:
            self.side_by_side_radio.setChecked(True)
            self.unified_radio.setChecked(False)
            self.side_by_side_widget.show()
            self.unified_widget.hide()
        else:
            self.side_by_side_radio.setChecked(False)
            self.unified_radio.setChecked(True)
            self.side_by_side_widget.hide()
            self.unified_widget.show()
