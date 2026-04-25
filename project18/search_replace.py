import re
from PyQt5.QtWidgets import (
    QWidget, QHBoxLayout, QVBoxLayout, QLabel,
    QLineEdit, QPushButton, QCheckBox, QGroupBox,
    QSpinBox, QFrame
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QTextCursor, QColor, QTextCharFormat, QPalette


class SearchReplaceWidget(QWidget):
    def __init__(self, editor, parent=None):
        super().__init__(parent)
        self.editor = editor
        self._matches = []
        self._current_match_index = -1
        
        self._setup_ui()
        self._setup_connections()
        
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)
        
        search_group = QGroupBox("查找")
        search_layout = QHBoxLayout(search_group)
        
        search_layout.addWidget(QLabel("查找:"))
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("输入要查找的文本...")
        search_layout.addWidget(self.search_input)
        
        self.case_sensitive_check = QCheckBox("大小写敏感")
        search_layout.addWidget(self.case_sensitive_check)
        
        self.regex_check = QCheckBox("正则表达式")
        search_layout.addWidget(self.regex_check)
        
        self.whole_word_check = QCheckBox("全字匹配")
        search_layout.addWidget(self.whole_word_check)
        
        self.find_prev_btn = QPushButton("上一个")
        search_layout.addWidget(self.find_prev_btn)
        
        self.find_next_btn = QPushButton("下一个")
        search_layout.addWidget(self.find_next_btn)
        
        self.match_count_label = QLabel("匹配: 0")
        search_layout.addWidget(self.match_count_label)
        
        layout.addWidget(search_group)
        
        replace_group = QGroupBox("替换")
        replace_layout = QHBoxLayout(replace_group)
        
        replace_layout.addWidget(QLabel("替换为:"))
        self.replace_input = QLineEdit()
        self.replace_input.setPlaceholderText("输入替换文本...")
        replace_layout.addWidget(self.replace_input)
        
        self.replace_btn = QPushButton("替换")
        replace_layout.addWidget(self.replace_btn)
        
        self.replace_all_btn = QPushButton("全部替换")
        replace_layout.addWidget(self.replace_all_btn)
        
        layout.addWidget(replace_group)
        
        self._highlight_format = QTextCharFormat()
        self._highlight_format.setBackground(QColor(255, 255, 0))
        
        self._current_format = QTextCharFormat()
        self._current_format.setBackground(QColor(255, 165, 0))
        
    def _setup_connections(self):
        self.search_input.textChanged.connect(self._on_search_text_changed)
        self.find_prev_btn.clicked.connect(self.find_previous)
        self.find_next_btn.clicked.connect(self.find_next)
        self.replace_btn.clicked.connect(self.replace_current)
        self.replace_all_btn.clicked.connect(self.replace_all)
        
        self.case_sensitive_check.stateChanged.connect(self._on_search_text_changed)
        self.regex_check.stateChanged.connect(self._on_search_text_changed)
        self.whole_word_check.stateChanged.connect(self._on_search_text_changed)
        
    def _on_search_text_changed(self, text):
        self._clear_highlights()
        self._matches = []
        self._current_match_index = -1
        
        search_text = self.search_input.text()
        if not search_text:
            self.match_count_label.setText("匹配: 0")
            return
            
        self._find_all_matches(search_text)
        self.match_count_label.setText(f"匹配: {len(self._matches)}")
        
        if self._matches:
            self._highlight_all_matches()
            self._current_match_index = 0
            self._highlight_current_match()
            
    def _find_all_matches(self, search_text):
        document = self.editor.document()
        text = document.toPlainText()
        
        flags = 0
        if not self.case_sensitive_check.isChecked():
            flags |= re.IGNORECASE
            
        if self.regex_check.isChecked():
            try:
                pattern = re.compile(search_text, flags)
            except re.error:
                return
        else:
            search_text = re.escape(search_text)
            if self.whole_word_check.isChecked():
                search_text = r'\b' + search_text + r'\b'
            pattern = re.compile(search_text, flags)
            
        self._matches = []
        for match in pattern.finditer(text):
            self._matches.append((match.start(), match.end()))
            
    def _highlight_all_matches(self):
        cursor = QTextCursor(self.editor.document())
        
        for start, end in self._matches:
            cursor.setPosition(start)
            cursor.setPosition(end, QTextCursor.KeepAnchor)
            cursor.mergeCharFormat(self._highlight_format)
            
    def _highlight_current_match(self):
        if not self._matches:
            return
            
        start, end = self._matches[self._current_match_index]
        cursor = QTextCursor(self.editor.document())
        cursor.setPosition(start)
        cursor.setPosition(end, QTextCursor.KeepAnchor)
        cursor.mergeCharFormat(self._current_format)
        
        self.editor.setTextCursor(cursor)
        self.editor.ensureCursorVisible()
        
    def _clear_highlights(self):
        cursor = QTextCursor(self.editor.document())
        cursor.select(QTextCursor.Document)
        cursor.setCharFormat(QTextCharFormat())
        
    def find_next(self):
        if not self._matches:
            return
            
        self._current_match_index = (self._current_match_index + 1) % len(self._matches)
        self._highlight_all_matches()
        self._highlight_current_match()
        
    def find_previous(self):
        if not self._matches:
            return
            
        self._current_match_index = (self._current_match_index - 1) % len(self._matches)
        self._highlight_all_matches()
        self._highlight_current_match()
        
    def replace_current(self):
        if not self._matches or self._current_match_index < 0:
            return
            
        start, end = self._matches[self._current_match_index]
        replace_text = self.replace_input.text()
        
        cursor = QTextCursor(self.editor.document())
        cursor.setPosition(start)
        cursor.setPosition(end, QTextCursor.KeepAnchor)
        cursor.removeSelectedText()
        cursor.insertText(replace_text)
        
        search_text = self.search_input.text()
        self._on_search_text_changed(search_text)
        
        if self._matches and self._current_match_index >= len(self._matches):
            self._current_match_index = len(self._matches) - 1 if self._matches else -1
            
    def replace_all(self):
        if not self._matches:
            return
            
        replace_text = self.replace_input.text()
        
        document = self.editor.document()
        text = document.toPlainText()
        search_text = self.search_input.text()
        
        flags = 0
        if not self.case_sensitive_check.isChecked():
            flags |= re.IGNORECASE
            
        if self.regex_check.isChecked():
            try:
                pattern = re.compile(search_text, flags)
            except re.error:
                return
        else:
            search_text = re.escape(search_text)
            if self.whole_word_check.isChecked():
                search_text = r'\b' + search_text + r'\b'
            pattern = re.compile(search_text, flags)
            
        new_text = pattern.sub(replace_text, text)
        self.editor.setPlainText(new_text)
        
        count = len(self._matches)
        self._matches = []
        self._current_match_index = -1
        self.match_count_label.setText(f"已替换: {count}")
        
    def focus_search(self):
        self.search_input.setFocus()
        self.search_input.selectAll()
        
    def showEvent(self, event):
        super().showEvent(event)
        self.focus_search()
        
    def hideEvent(self, event):
        self._clear_highlights()
        super().hideEvent(event)
