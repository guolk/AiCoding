import re
from PyQt5.QtWidgets import QTextEdit, QMenu, QInputDialog, QMessageBox, QAction
from PyQt5.QtCore import Qt, QTimer, pyqtSignal, QPoint
from PyQt5.QtGui import (
    QTextCursor, QColor, QTextCharFormat, QSyntaxHighlighter,
    QFont, QCursor, QTextDocument, QPainter, QPen
)

from spell_checker import SpellChecker
from vim_mode import VimMode


class MarkdownHighlighter(QSyntaxHighlighter):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.highlighting_rules = []
        
        keyword_format = QTextCharFormat()
        keyword_format.setForeground(QColor("#000080"))
        keyword_format.setFontWeight(QFont.Bold)
        
        header1_format = QTextCharFormat()
        header1_format.setForeground(QColor("#800080"))
        header1_format.setFontWeight(QFont.Bold)
        header1_format.setFontPointSize(18)
        self.highlighting_rules.append((re.compile(r'^# .+$'), header1_format))
        
        header2_format = QTextCharFormat()
        header2_format.setForeground(QColor("#800080"))
        header2_format.setFontWeight(QFont.Bold)
        header2_format.setFontPointSize(16)
        self.highlighting_rules.append((re.compile(r'^## .+$'), header2_format))
        
        header3_format = QTextCharFormat()
        header3_format.setForeground(QColor("#800080"))
        header3_format.setFontWeight(QFont.Bold)
        header3_format.setFontPointSize(14)
        self.highlighting_rules.append((re.compile(r'^### .+$'), header3_format))
        
        header_other_format = QTextCharFormat()
        header_other_format.setForeground(QColor("#800080"))
        header_other_format.setFontWeight(QFont.Bold)
        self.highlighting_rules.append((re.compile(r'^#{4,6} .+$'), header_other_format))
        
        bold_format = QTextCharFormat()
        bold_format.setFontWeight(QFont.Bold)
        self.highlighting_rules.append((re.compile(r'\*\*[^*]+\*\*'), bold_format))
        self.highlighting_rules.append((re.compile(r'__[^_]+__'), bold_format))
        
        italic_format = QTextCharFormat()
        italic_format.setFontItalic(True)
        self.highlighting_rules.append((re.compile(r'\*[^*]+\*'), italic_format))
        self.highlighting_rules.append((re.compile(r'_[^_]+_'), italic_format))
        
        code_format = QTextCharFormat()
        code_format.setForeground(QColor("#008000"))
        code_format.setFontFamily("Consolas")
        self.highlighting_rules.append((re.compile(r'`[^`]+`'), code_format))
        
        link_format = QTextCharFormat()
        link_format.setForeground(QColor("#0000FF"))
        link_format.setUnderlineStyle(QTextCharFormat.SingleUnderline)
        self.highlighting_rules.append((re.compile(r'\[.*?\]\(.*?\)'), link_format))
        
        list_format = QTextCharFormat()
        list_format.setForeground(QColor("#000080"))
        self.highlighting_rules.append((re.compile(r'^[\*\-\+] '), list_format))
        self.highlighting_rules.append((re.compile(r'^\d+\. '), list_format))
        
        quote_format = QTextCharFormat()
        quote_format.setForeground(QColor("#808080"))
        quote_format.setFontItalic(True)
        self.highlighting_rules.append((re.compile(r'^> .+$'), quote_format))
        
    def highlightBlock(self, text):
        for pattern, format in self.highlighting_rules:
            for match in pattern.finditer(text):
                self.setFormat(match.start(), match.end() - match.start(), format)


class MarkdownEditor(QTextEdit):
    vim_mode_changed = pyqtSignal(str)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        self.vim_mode = VimMode(self)
        self.vim_enabled = False
        self.spell_checker = SpellChecker()
        self.spell_check_enabled = False
        
        self.highlighter = MarkdownHighlighter(self.document())
        
        self._spell_check_timer = QTimer(self)
        self._spell_check_timer.setSingleShot(True)
        self._spell_check_timer.timeout.connect(self._check_spelling)
        
        self._setup_ui()
        self._setup_connections()
        
    def _setup_ui(self):
        self.setLineWrapMode(QTextEdit.WidgetWidth)
        self.setAcceptRichText(False)
        self.setAutoFormatting(QTextEdit.AutoAll)
        
        font = QFont("Consolas", 12)
        self.setFont(font)
        
        self.setCursorWidth(2)
        
    def _setup_connections(self):
        self.textChanged.connect(self._on_text_changed)
        self.cursorPositionChanged.connect(self._on_cursor_position_changed)
        
    def set_vim_mode(self, enabled):
        self.vim_enabled = enabled
        if enabled:
            self.vim_mode.activate()
            self.vim_mode_changed.emit(self.vim_mode.current_mode)
        else:
            self.vim_mode.deactivate()
            self.vim_mode_changed.emit('normal')
            
    def set_spell_check_enabled(self, enabled):
        self.spell_check_enabled = enabled
        if enabled:
            self._check_spelling()
        else:
            self._clear_spell_check_highlights()
            
    def _on_text_changed(self):
        if self.spell_check_enabled:
            self._spell_check_timer.start(500)
            
    def _on_cursor_position_changed(self):
        if self.vim_enabled:
            self.vim_mode.on_cursor_moved()
            
    def _check_spelling(self):
        if not self.spell_check_enabled:
            return
            
        document = self.document()
        cursor = QTextCursor(document)
        
        error_format = QTextCharFormat()
        error_format.setUnderlineColor(QColor("#FF0000"))
        error_format.setUnderlineStyle(QTextCharFormat.WaveUnderline)
        
        cursor.select(QTextCursor.Document)
        cursor.setCharFormat(QTextCharFormat())
        
        text = document.toPlainText()
        words = re.finditer(r'\b[a-zA-Z]+\b', text)
        
        for match in words:
            word = match.group()
            if not self.spell_checker.check(word):
                cursor.setPosition(match.start())
                cursor.setPosition(match.end(), QTextCursor.KeepAnchor)
                cursor.mergeCharFormat(error_format)
                
    def _clear_spell_check_highlights(self):
        document = self.document()
        cursor = QTextCursor(document)
        cursor.select(QTextCursor.Document)
        cursor.setCharFormat(QTextCharFormat())
        
    def keyPressEvent(self, event):
        if self.vim_enabled and self.vim_mode.handle_key(event):
            self.vim_mode_changed.emit(self.vim_mode.current_mode)
            return
            
        super().keyPressEvent(event)
        
    def mousePressEvent(self, event):
        if event.button() == Qt.RightButton:
            cursor = self.cursorForPosition(event.pos())
            cursor.select(QTextCursor.WordUnderCursor)
            word = cursor.selectedText()
            
            if self.spell_check_enabled and word and not self.spell_checker.check(word):
                self._show_spell_context_menu(event.globalPos(), word, cursor)
                return
                
        super().mousePressEvent(event)
        
    def _show_spell_context_menu(self, pos, word, cursor):
        menu = QMenu(self)
        
        suggestions = self.spell_checker.suggest(word)
        
        if suggestions:
            for suggestion in suggestions[:10]:
                action = QAction(suggestion, self)
                action.triggered.connect(
                    lambda checked, s=suggestion, c=cursor: self._replace_word(s, c)
                )
                menu.addAction(action)
        else:
            no_suggestions = QAction("没有建议", self)
            no_suggestions.setEnabled(False)
            menu.addAction(no_suggestions)
            
        menu.addSeparator()
        
        add_action = QAction("添加到词典", self)
        add_action.triggered.connect(lambda: self._add_to_dictionary(word))
        menu.addAction(add_action)
        
        ignore_action = QAction("忽略", self)
        ignore_action.triggered.connect(lambda: self._ignore_word(word))
        menu.addAction(ignore_action)
        
        menu.exec(pos)
        
    def _replace_word(self, suggestion, cursor):
        cursor.beginEditBlock()
        cursor.removeSelectedText()
        cursor.insertText(suggestion)
        cursor.endEditBlock()
        
    def _add_to_dictionary(self, word):
        self.spell_checker.add(word)
        self._check_spelling()
        
    def _ignore_word(self, word):
        self.spell_checker.ignore(word)
        self._check_spelling()
        
    def find_header_line(self, anchor):
        anchor = anchor.lstrip('#')
        text = self.toPlainText()
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line.startswith('#'):
                header_text = line.lstrip('#').strip().lower()
                header_anchor = re.sub(r'[^a-z0-9\-]', '', header_text.replace(' ', '-'))
                if header_anchor == anchor.lower() or header_text == anchor.lower():
                    return i
        return None
        
    def go_to_line(self, line_number):
        cursor = self.textCursor()
        block = self.document().findBlockByLineNumber(line_number)
        cursor.setPosition(block.position())
        self.setTextCursor(cursor)
        self.ensureCursorVisible()
        
    def focusInEvent(self, event):
        super().focusInEvent(event)
        if self.vim_enabled:
            self.vim_mode.activate()
            
    def focusOutEvent(self, event):
        super().focusOutEvent(event)
        if self.vim_enabled:
            self.vim_mode.deactivate()
