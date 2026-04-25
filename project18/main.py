import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QSplitter, QMenuBar, QMenu,
    QFileDialog, QMessageBox, QToolBar, QStatusBar, QWidget,
    QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QDialog,
    QCheckBox, QSpinBox, QGroupBox, QFormLayout, QAction
)
from PyQt5.QtCore import Qt, QSettings, pyqtSignal
from PyQt5.QtGui import QKeySequence, QFont

from editor import MarkdownEditor
from preview import MarkdownPreview
from search_replace import SearchReplaceWidget
from diff_viewer import DiffViewer
from settings import SettingsDialog
from version_manager import VersionManager


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Markdown Editor")
        self.setGeometry(100, 100, 1200, 800)
        
        self.settings = QSettings("MarkdownEditor", "MarkdownEditor")
        self.current_file = None
        self.version_manager = VersionManager()
        
        self.init_ui()
        self.load_settings()
        self.create_connections()
        
    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.splitter = QSplitter(Qt.Horizontal)
        
        self.editor = MarkdownEditor()
        self.preview = MarkdownPreview()
        
        self.splitter.addWidget(self.editor)
        self.splitter.addWidget(self.preview)
        self.splitter.setSizes([600, 600])
        
        layout.addWidget(self.splitter)
        
        self.search_replace_widget = SearchReplaceWidget(self.editor)
        layout.addWidget(self.search_replace_widget)
        self.search_replace_widget.hide()
        
        self.create_menu_bar()
        self.create_tool_bar()
        self.create_status_bar()
        
    def create_menu_bar(self):
        menubar = self.menuBar()
        
        file_menu = menubar.addMenu("文件(&F)")
        
        new_action = QAction("新建(&N)", self)
        new_action.setShortcut(QKeySequence.New)
        new_action.triggered.connect(self.new_file)
        file_menu.addAction(new_action)
        
        open_action = QAction("打开(&O)", self)
        open_action.setShortcut(QKeySequence.Open)
        open_action.triggered.connect(self.open_file)
        file_menu.addAction(open_action)
        
        save_action = QAction("保存(&S)", self)
        save_action.setShortcut(QKeySequence.Save)
        save_action.triggered.connect(self.save_file)
        file_menu.addAction(save_action)
        
        save_as_action = QAction("另存为(&A)", self)
        save_as_action.setShortcut(QKeySequence.SaveAs)
        save_as_action.triggered.connect(self.save_file_as)
        file_menu.addAction(save_as_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("退出(&X)", self)
        exit_action.setShortcut(QKeySequence.Quit)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        edit_menu = menubar.addMenu("编辑(&E)")
        
        undo_action = QAction("撤销(&U)", self)
        undo_action.setShortcut(QKeySequence.Undo)
        undo_action.triggered.connect(self.editor.undo)
        edit_menu.addAction(undo_action)
        
        redo_action = QAction("重做(&R)", self)
        redo_action.setShortcut(QKeySequence.Redo)
        redo_action.triggered.connect(self.editor.redo)
        edit_menu.addAction(redo_action)
        
        edit_menu.addSeparator()
        
        cut_action = QAction("剪切(&T)", self)
        cut_action.setShortcut(QKeySequence.Cut)
        cut_action.triggered.connect(self.editor.cut)
        edit_menu.addAction(cut_action)
        
        copy_action = QAction("复制(&C)", self)
        copy_action.setShortcut(QKeySequence.Copy)
        copy_action.triggered.connect(self.editor.copy)
        edit_menu.addAction(copy_action)
        
        paste_action = QAction("粘贴(&P)", self)
        paste_action.setShortcut(QKeySequence.Paste)
        paste_action.triggered.connect(self.editor.paste)
        edit_menu.addAction(paste_action)
        
        edit_menu.addSeparator()
        
        find_replace_action = QAction("查找替换(&F)", self)
        find_replace_action.setShortcut(QKeySequence.Find)
        find_replace_action.triggered.connect(self.toggle_search_replace)
        edit_menu.addAction(find_replace_action)
        
        view_menu = menubar.addMenu("视图(&V)")
        
        toggle_editor_action = QAction("显示编辑器(&E)", self)
        toggle_editor_action.setCheckable(True)
        toggle_editor_action.setChecked(True)
        toggle_editor_action.triggered.connect(self.toggle_editor)
        view_menu.addAction(toggle_editor_action)
        
        toggle_preview_action = QAction("显示预览(&P)", self)
        toggle_preview_action.setCheckable(True)
        toggle_preview_action.setChecked(True)
        toggle_preview_action.triggered.connect(self.toggle_preview)
        view_menu.addAction(toggle_preview_action)
        
        version_menu = menubar.addMenu("版本(&V)")
        
        save_version_action = QAction("保存当前版本(&S)", self)
        save_version_action.triggered.connect(self.save_version)
        version_menu.addAction(save_version_action)
        
        compare_versions_action = QAction("对比版本(&C)", self)
        compare_versions_action.triggered.connect(self.show_version_comparison)
        version_menu.addAction(compare_versions_action)
        
        settings_menu = menubar.addMenu("设置(&S)")
        
        toggle_vim_action = QAction("Vim模式(&V)", self)
        toggle_vim_action.setCheckable(True)
        toggle_vim_action.triggered.connect(self.toggle_vim_mode)
        settings_menu.addAction(toggle_vim_action)
        self.toggle_vim_action = toggle_vim_action
        
        toggle_spell_check_action = QAction("拼写检查(&S)", self)
        toggle_spell_check_action.setCheckable(True)
        toggle_spell_check_action.triggered.connect(self.toggle_spell_check)
        settings_menu.addAction(toggle_spell_check_action)
        self.toggle_spell_check_action = toggle_spell_check_action
        
        settings_menu.addSeparator()
        
        preferences_action = QAction("首选项(&P)", self)
        preferences_action.triggered.connect(self.show_settings)
        settings_menu.addAction(preferences_action)
        
    def create_tool_bar(self):
        toolbar = self.addToolBar("主工具栏")
        toolbar.setMovable(False)
        
        new_action = QAction("新建", self)
        new_action.triggered.connect(self.new_file)
        toolbar.addAction(new_action)
        
        open_action = QAction("打开", self)
        open_action.triggered.connect(self.open_file)
        toolbar.addAction(open_action)
        
        save_action = QAction("保存", self)
        save_action.triggered.connect(self.save_file)
        toolbar.addAction(save_action)
        
        toolbar.addSeparator()
        
        self.vim_mode_label = QLabel("模式: 普通")
        toolbar.addWidget(self.vim_mode_label)
        
    def create_status_bar(self):
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        self.cursor_position_label = QLabel("行: 1, 列: 1")
        self.status_bar.addWidget(self.cursor_position_label)
        
        self.vim_status_label = QLabel("Vim: 关闭")
        self.status_bar.addPermanentWidget(self.vim_status_label)
        
        self.spell_status_label = QLabel("拼写检查: 关闭")
        self.status_bar.addPermanentWidget(self.spell_status_label)
        
    def create_connections(self):
        self.editor.textChanged.connect(self.on_text_changed)
        self.editor.cursorPositionChanged.connect(self.on_cursor_position_changed)
        self.editor.vim_mode_changed.connect(self.on_vim_mode_changed)
        self.preview.anchor_clicked.connect(self.on_anchor_clicked)
        
    def load_settings(self):
        vim_enabled = self.settings.value("vim_mode", False, type=bool)
        spell_check_enabled = self.settings.value("spell_check", False, type=bool)
        
        self.toggle_vim_action.setChecked(vim_enabled)
        self.editor.set_vim_mode(vim_enabled)
        
        self.toggle_spell_check_action.setChecked(spell_check_enabled)
        self.editor.set_spell_check_enabled(spell_check_enabled)
        
        self.update_status_labels()
        
    def save_settings(self):
        self.settings.setValue("vim_mode", self.toggle_vim_action.isChecked())
        self.settings.setValue("spell_check", self.toggle_spell_check_action.isChecked())
        
    def new_file(self):
        if self.maybe_save():
            self.editor.clear()
            self.current_file = None
            self.version_manager.clear_versions()
            self.setWindowTitle("Markdown Editor - 未命名")
            
    def open_file(self):
        if self.maybe_save():
            file_path, _ = QFileDialog.getOpenFileName(
                self, "打开文件", "", "Markdown文件 (*.md);;所有文件 (*)"
            )
            if file_path:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    self.editor.setPlainText(content)
                    self.current_file = file_path
                    self.version_manager.set_current_file(file_path)
                    self.setWindowTitle(f"Markdown Editor - {file_path}")
                except Exception as e:
                    QMessageBox.critical(self, "错误", f"无法打开文件: {str(e)}")
                    
    def save_file(self):
        if self.current_file:
            return self._save_to_file(self.current_file)
        else:
            return self.save_file_as()
            
    def save_file_as(self):
        file_path, _ = QFileDialog.getSaveFileName(
            self, "另存为", "", "Markdown文件 (*.md);;所有文件 (*)"
        )
        if file_path:
            if self._save_to_file(file_path):
                self.current_file = file_path
                self.version_manager.set_current_file(file_path)
                self.setWindowTitle(f"Markdown Editor - {file_path}")
                return True
        return False
        
    def _save_to_file(self, file_path):
        try:
            content = self.editor.toPlainText()
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.status_bar.showMessage(f"已保存到 {file_path}", 3000)
            return True
        except Exception as e:
            QMessageBox.critical(self, "错误", f"无法保存文件: {str(e)}")
            return False
            
    def maybe_save(self):
        if self.editor.document().isModified():
            reply = QMessageBox.question(
                self, "确认",
                "文档已修改，是否保存更改？",
                QMessageBox.Save |
                QMessageBox.Discard |
                QMessageBox.Cancel
            )
            if reply == QMessageBox.Save:
                return self.save_file()
            elif reply == QMessageBox.Cancel:
                return False
        return True
        
    def on_text_changed(self):
        content = self.editor.toPlainText()
        self.preview.set_markdown(content)
        
    def on_cursor_position_changed(self):
        cursor = self.editor.textCursor()
        line = cursor.blockNumber() + 1
        col = cursor.columnNumber() + 1
        self.cursor_position_label.setText(f"行: {line}, 列: {col}")
        
    def on_vim_mode_changed(self, mode):
        mode_names = {
            'normal': '普通',
            'insert': '插入',
            'visual': '可视',
            'visual_line': '可视行'
        }
        self.vim_mode_label.setText(f"模式: {mode_names.get(mode, mode)}")
        
    def on_anchor_clicked(self, anchor):
        line_number = self.editor.find_header_line(anchor)
        if line_number is not None:
            self.editor.go_to_line(line_number)
            
    def toggle_search_replace(self):
        if self.search_replace_widget.isVisible():
            self.search_replace_widget.hide()
        else:
            self.search_replace_widget.show()
            self.search_replace_widget.focus_search()
            
    def toggle_editor(self, checked):
        if checked:
            self.editor.show()
        else:
            self.editor.hide()
            
    def toggle_preview(self, checked):
        if checked:
            self.preview.show()
        else:
            self.preview.hide()
            
    def toggle_vim_mode(self, checked):
        self.editor.set_vim_mode(checked)
        self.update_status_labels()
        self.save_settings()
        
    def toggle_spell_check(self, checked):
        self.editor.set_spell_check_enabled(checked)
        self.update_status_labels()
        self.save_settings()
        
    def update_status_labels(self):
        vim_status = "开启" if self.toggle_vim_action.isChecked() else "关闭"
        spell_status = "开启" if self.toggle_spell_check_action.isChecked() else "关闭"
        self.vim_status_label.setText(f"Vim: {vim_status}")
        self.spell_status_label.setText(f"拼写检查: {spell_status}")
        
    def save_version(self):
        if not self.current_file:
            QMessageBox.warning(self, "警告", "请先保存文件")
            return
        content = self.editor.toPlainText()
        version_name = self.version_manager.save_version(content)
        if version_name:
            self.status_bar.showMessage(f"已保存版本: {version_name}", 3000)
        else:
            QMessageBox.warning(self, "警告", "保存版本失败")
            
    def show_version_comparison(self):
        versions = self.version_manager.get_versions()
        if len(versions) < 2:
            QMessageBox.warning(self, "警告", "需要至少两个版本才能进行对比")
            return
            
        dialog = DiffViewer(versions, self)
        dialog.exec()
        
    def show_settings(self):
        dialog = SettingsDialog(self.settings, self)
        if dialog.exec() == QDialog.Accepted:
            self.load_settings()
            
    def closeEvent(self, event):
        if self.maybe_save():
            self.save_settings()
            event.accept()
        else:
            event.ignore()


def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    font = QFont("Microsoft YaHei", 10)
    app.setFont(font)
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
