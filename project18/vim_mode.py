from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QTextCursor, QKeyEvent, QTextCharFormat, QColor
from PyQt5.QtWidgets import QApplication


class VimMode:
    NORMAL_MODE = 'normal'
    INSERT_MODE = 'insert'
    VISUAL_MODE = 'visual'
    VISUAL_LINE_MODE = 'visual_line'
    
    def __init__(self, editor):
        self.editor = editor
        self.current_mode = self.NORMAL_MODE
        self._pending_keys = ''
        self._count = 0
        self._active = False
        self._original_cursor_width = 2
        
    def activate(self):
        self._active = True
        self._original_cursor_width = self.editor.cursorWidth()
        self._update_cursor_appearance()
        
    def deactivate(self):
        self._active = False
        self.editor.setCursorWidth(self._original_cursor_width)
        self._pending_keys = ''
        self._count = 0
        
    def _update_cursor_appearance(self):
        if self.current_mode == self.INSERT_MODE:
            self.editor.setCursorWidth(1)
        else:
            self.editor.setCursorWidth(self._original_cursor_width)
            
    def handle_key(self, event):
        if not self._active:
            return False
            
        key = event.key()
        modifiers = event.modifiers()
        
        if modifiers & Qt.ControlModifier:
            return self._handle_control_key(key)
            
        if self.current_mode == self.NORMAL_MODE:
            return self._handle_normal_mode(key, event.text())
        elif self.current_mode == self.INSERT_MODE:
            return self._handle_insert_mode(key)
        elif self.current_mode in [self.VISUAL_MODE, self.VISUAL_LINE_MODE]:
            return self._handle_visual_mode(key, event.text())
            
        return False
        
    def _handle_normal_mode(self, key, text):
        cursor = self.editor.textCursor()
        
        if text.isdigit() and text != '0':
            self._count = self._count * 10 + int(text)
            return True
        elif text == '0' and self._count > 0:
            self._count = self._count * 10
            return True
            
        count = self._count if self._count > 0 else 1
        self._count = 0
        
        if text == 'h' or key == Qt.Key_Left:
            self._move_cursor(cursor, QTextCursor.Left, count)
            return True
        elif text == 'l' or key == Qt.Key_Right:
            self._move_cursor(cursor, QTextCursor.Right, count)
            return True
        elif text == 'j' or key == Qt.Key_Down:
            self._move_cursor(cursor, QTextCursor.Down, count)
            return True
        elif text == 'k' or key == Qt.Key_Up:
            self._move_cursor(cursor, QTextCursor.Up, count)
            return True
        elif text == 'w':
            self._move_cursor(cursor, QTextCursor.NextWord, count)
            return True
        elif text == 'b':
            self._move_cursor(cursor, QTextCursor.PreviousWord, count)
            return True
        elif text == 'e':
            for _ in range(count):
                cursor.movePosition(QTextCursor.NextWord, QTextCursor.MoveAnchor)
                cursor.movePosition(QTextCursor.Left, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            return True
        elif text == '0':
            cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            return True
        elif text == '$':
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'g':
            if self._pending_keys == 'g':
                cursor.movePosition(QTextCursor.Start, QTextCursor.MoveAnchor)
                self.editor.setTextCursor(cursor)
                self._pending_keys = ''
                return True
            self._pending_keys = 'g'
            return True
        elif text == 'G':
            cursor.movePosition(QTextCursor.End, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'i':
            self._enter_insert_mode()
            return True
        elif text == 'a':
            cursor.movePosition(QTextCursor.Right, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            self._enter_insert_mode()
            return True
        elif text == 'A':
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            self._enter_insert_mode()
            return True
        elif text == 'o':
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.MoveAnchor)
            cursor.insertText('\n')
            self.editor.setTextCursor(cursor)
            self._enter_insert_mode()
            return True
        elif text == 'O':
            cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.MoveAnchor)
            cursor.insertText('\n')
            cursor.movePosition(QTextCursor.Up, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            self._enter_insert_mode()
            return True
        elif text == 's':
            cursor.deleteChar()
            self._enter_insert_mode()
            return True
        elif text == 'x':
            for _ in range(count):
                cursor.deleteChar()
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'X':
            for _ in range(count):
                cursor.deletePreviousChar()
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'd':
            if self._pending_keys == 'd':
                self._delete_line(cursor, count)
                self._pending_keys = ''
                return True
            self._pending_keys = 'd'
            return True
        elif text == 'D':
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.KeepAnchor)
            cursor.removeSelectedText()
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'c':
            if self._pending_keys == 'c':
                self._change_line(cursor, count)
                self._pending_keys = ''
                return True
            self._pending_keys = 'c'
            return True
        elif text == 'C':
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.KeepAnchor)
            cursor.removeSelectedText()
            self.editor.setTextCursor(cursor)
            self._enter_insert_mode()
            return True
        elif text == 'y':
            if self._pending_keys == 'y':
                self._yank_line(cursor, count)
                self._pending_keys = ''
                return True
            self._pending_keys = 'y'
            return True
        elif text == 'Y':
            self._yank_line(cursor, count)
            return True
        elif text == 'p':
            cursor.insertText(self.editor.toPlainText().count('\n') - 1 == cursor.blockNumber() and '\n' or '')
            cursor.insertText(QApplication.clipboard().text() or '')
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'P':
            cursor.movePosition(QTextCursor.Left, QTextCursor.MoveAnchor)
            cursor.insertText(QApplication.clipboard().text() or '')
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'u':
            for _ in range(count):
                self.editor.undo()
            return True
        elif text == 'r':
            self._pending_keys = 'r'
            return True
        elif self._pending_keys == 'r':
            char = text if text else chr(key)
            if char:
                cursor.deleteChar()
                cursor.insertText(char)
                self.editor.setTextCursor(cursor)
            self._pending_keys = ''
            return True
        elif text == 'v':
            self._enter_visual_mode(self.VISUAL_MODE)
            return True
        elif text == 'V':
            self._enter_visual_mode(self.VISUAL_LINE_MODE)
            cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.MoveAnchor)
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.KeepAnchor)
            self.editor.setTextCursor(cursor)
            return True
        elif text == '~':
            self._swap_case(cursor, count)
            return True
        elif text == '>':
            if self._pending_keys == '>':
                self._indent(cursor, count)
                self._pending_keys = ''
                return True
            self._pending_keys = '>'
            return True
        elif text == '<':
            if self._pending_keys == '<':
                self._unindent(cursor, count)
                self._pending_keys = ''
                return True
            self._pending_keys = '<'
            return True
        elif text == 'J':
            self._join_lines(cursor, count)
            return True
        elif text == '.':
            pass
        elif key == Qt.Key_Escape:
            self._pending_keys = ''
            self._count = 0
            return True
            
        self._pending_keys = ''
        return False
        
    def _handle_insert_mode(self, key):
        if key == Qt.Key_Escape:
            self._enter_normal_mode()
            return True
        return False
        
    def _handle_visual_mode(self, key, text):
        cursor = self.editor.textCursor()
        
        if text == 'h' or key == Qt.Key_Left:
            cursor.movePosition(QTextCursor.Left, QTextCursor.KeepAnchor)
        elif text == 'l' or key == Qt.Key_Right:
            cursor.movePosition(QTextCursor.Right, QTextCursor.KeepAnchor)
        elif text == 'j' or key == Qt.Key_Down:
            cursor.movePosition(QTextCursor.Down, QTextCursor.KeepAnchor)
        elif text == 'k' or key == Qt.Key_Up:
            cursor.movePosition(QTextCursor.Up, QTextCursor.KeepAnchor)
        elif text == 'w':
            cursor.movePosition(QTextCursor.NextWord, QTextCursor.KeepAnchor)
        elif text == 'b':
            cursor.movePosition(QTextCursor.PreviousWord, QTextCursor.KeepAnchor)
        elif text == '0':
            cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.KeepAnchor)
        elif text == '$':
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.KeepAnchor)
        elif text == 'g':
            if self._pending_keys == 'g':
                cursor.movePosition(QTextCursor.Start, QTextCursor.KeepAnchor)
                self._pending_keys = ''
            else:
                self._pending_keys = 'g'
            self.editor.setTextCursor(cursor)
            return True
        elif text == 'G':
            cursor.movePosition(QTextCursor.End, QTextCursor.KeepAnchor)
        elif text == 'd':
            text = cursor.selectedText()
            QApplication.clipboard().setText(text)
            cursor.removeSelectedText()
            self._enter_normal_mode()
        elif text == 'c':
            text = cursor.selectedText()
            QApplication.clipboard().setText(text)
            cursor.removeSelectedText()
            self._enter_insert_mode()
        elif text == 'y':
            text = cursor.selectedText()
            QApplication.clipboard().setText(text)
            cursor.clearSelection()
            self._enter_normal_mode()
        elif text == '>':
            self._indent_selection(cursor)
            self._enter_normal_mode()
        elif text == '<':
            self._unindent_selection(cursor)
            self._enter_normal_mode()
        elif key == Qt.Key_Escape:
            cursor.clearSelection()
            self._enter_normal_mode()
            return True
        else:
            self.editor.setTextCursor(cursor)
            return False
            
        self.editor.setTextCursor(cursor)
        return True
        
    def _handle_control_key(self, key):
        cursor = self.editor.textCursor()
        
        if self.current_mode == self.NORMAL_MODE:
            if key == Qt.Key_F:
                for _ in range(20):
                    cursor.movePosition(QTextCursor.Down, QTextCursor.MoveAnchor)
                self.editor.setTextCursor(cursor)
                return True
            elif key == Qt.Key_B:
                for _ in range(20):
                    cursor.movePosition(QTextCursor.Up, QTextCursor.MoveAnchor)
                self.editor.setTextCursor(cursor)
                return True
            elif key == Qt.Key_D:
                for _ in range(10):
                    cursor.movePosition(QTextCursor.Down, QTextCursor.MoveAnchor)
                self.editor.setTextCursor(cursor)
                return True
            elif key == Qt.Key_U:
                for _ in range(10):
                    cursor.movePosition(QTextCursor.Up, QTextCursor.MoveAnchor)
                self.editor.setTextCursor(cursor)
                return True
            elif key == Qt.Key_R:
                self.editor.redo()
                return True
                
        return False
        
    def _move_cursor(self, cursor, operation, count):
        for _ in range(count):
            cursor.movePosition(operation, QTextCursor.MoveAnchor)
        self.editor.setTextCursor(cursor)
        
    def _enter_normal_mode(self):
        self.current_mode = self.NORMAL_MODE
        self._update_cursor_appearance()
        cursor = self.editor.textCursor()
        if cursor.positionInBlock() > 0:
            cursor.movePosition(QTextCursor.Left, QTextCursor.MoveAnchor)
            self.editor.setTextCursor(cursor)
            
    def _enter_insert_mode(self):
        self.current_mode = self.INSERT_MODE
        self._update_cursor_appearance()
        
    def _enter_visual_mode(self, mode):
        self.current_mode = mode
        cursor = self.editor.textCursor()
        cursor.movePosition(QTextCursor.NoMove, QTextCursor.KeepAnchor)
        
    def _delete_line(self, cursor, count):
        start_pos = cursor.position()
        cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.MoveAnchor)
        for _ in range(count - 1):
            cursor.movePosition(QTextCursor.Down, QTextCursor.KeepAnchor)
        cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.KeepAnchor)
        if cursor.atEnd():
            pass
        else:
            cursor.movePosition(QTextCursor.Right, QTextCursor.KeepAnchor)
            
        text = cursor.selectedText()
        QApplication.clipboard().setText(text)
        cursor.removeSelectedText()
        self.editor.setTextCursor(cursor)
        
    def _change_line(self, cursor, count):
        self._delete_line(cursor, count)
        self._enter_insert_mode()
        
    def _yank_line(self, cursor, count):
        start_pos = cursor.position()
        cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.MoveAnchor)
        for _ in range(count - 1):
            cursor.movePosition(QTextCursor.Down, QTextCursor.KeepAnchor)
        cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.KeepAnchor)
        
        text = cursor.selectedText()
        QApplication.clipboard().setText(text + '\n')
        cursor.setPosition(start_pos)
        self.editor.setTextCursor(cursor)
        
    def _swap_case(self, cursor, count):
        for _ in range(count):
            char = cursor.selectedText() if cursor.hasSelection() else ''
            if not char:
                cursor.movePosition(QTextCursor.Right, QTextCursor.KeepAnchor)
                char = cursor.selectedText()
                
            if char:
                if char.isupper():
                    new_char = char.lower()
                else:
                    new_char = char.upper()
                cursor.removeSelectedText()
                cursor.insertText(new_char)
            self.editor.setTextCursor(cursor)
        
    def _indent(self, cursor, count):
        for _ in range(count):
            cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.MoveAnchor)
            cursor.insertText('    ')
            cursor.movePosition(QTextCursor.Down, QTextCursor.MoveAnchor)
        self.editor.setTextCursor(cursor)
        
    def _unindent(self, cursor, count):
        for _ in range(count):
            cursor.movePosition(QTextCursor.StartOfLine, QTextCursor.MoveAnchor)
            line_text = cursor.block().text()
            if line_text.startswith('    '):
                for _ in range(4):
                    cursor.deleteChar()
            elif line_text.startswith('\t'):
                cursor.deleteChar()
            cursor.movePosition(QTextCursor.Down, QTextCursor.MoveAnchor)
        self.editor.setTextCursor(cursor)
        
    def _indent_selection(self, cursor):
        start = cursor.selectionStart()
        end = cursor.selectionEnd()
        
        cursor.setPosition(start)
        start_block = cursor.blockNumber()
        cursor.setPosition(end)
        end_block = cursor.blockNumber()
        
        for block_num in range(start_block, end_block + 1):
            cursor.setPosition(self.editor.document().findBlockByNumber(block_num).position())
            cursor.insertText('    ')
            
    def _unindent_selection(self, cursor):
        start = cursor.selectionStart()
        end = cursor.selectionEnd()
        
        cursor.setPosition(start)
        start_block = cursor.blockNumber()
        cursor.setPosition(end)
        end_block = cursor.blockNumber()
        
        for block_num in range(start_block, end_block + 1):
            block = self.editor.document().findBlockByNumber(block_num)
            line_text = block.text()
            cursor.setPosition(block.position())
            if line_text.startswith('    '):
                for _ in range(4):
                    cursor.deleteChar()
            elif line_text.startswith('\t'):
                cursor.deleteChar()
                
    def _join_lines(self, cursor, count):
        for _ in range(count):
            cursor.movePosition(QTextCursor.EndOfLine, QTextCursor.MoveAnchor)
            if cursor.atEnd():
                break
            cursor.deleteChar()
            cursor.deleteChar()
            cursor.insertText(' ')
        self.editor.setTextCursor(cursor)
        
    def on_cursor_moved(self):
        pass
