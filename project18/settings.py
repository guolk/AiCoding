from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QGroupBox, QCheckBox, QSpinBox,
    QComboBox, QFormLayout, QTabWidget, QWidget,
    QFontComboBox, QSlider, QColorDialog, QFrame
)
from PyQt5.QtCore import Qt, QSettings
from PyQt5.QtGui import QFont, QColor


class SettingsDialog(QDialog):
    def __init__(self, settings, parent=None):
        super().__init__(parent)
        self.settings = settings
        self._temp_settings = {}
        
        self._setup_ui()
        self._load_settings()
        
    def _setup_ui(self):
        self.setWindowTitle("设置")
        self.setMinimumSize(500, 400)
        
        layout = QVBoxLayout(self)
        
        tabs = QTabWidget()
        
        general_tab = self._create_general_tab()
        tabs.addTab(general_tab, "常规")
        
        editor_tab = self._create_editor_tab()
        tabs.addTab(editor_tab, "编辑器")
        
        vim_tab = self._create_vim_tab()
        tabs.addTab(vim_tab, "Vim模式")
        
        preview_tab = self._create_preview_tab()
        tabs.addTab(preview_tab, "预览")
        
        layout.addWidget(tabs)
        
        button_layout = QHBoxLayout()
        
        self.reset_btn = QPushButton("恢复默认")
        self.reset_btn.clicked.connect(self._reset_to_defaults)
        button_layout.addWidget(self.reset_btn)
        
        button_layout.addStretch()
        
        self.cancel_btn = QPushButton("取消")
        self.cancel_btn.clicked.connect(self.reject)
        button_layout.addWidget(self.cancel_btn)
        
        self.ok_btn = QPushButton("确定")
        self.ok_btn.clicked.connect(self._save_and_accept)
        button_layout.addWidget(self.ok_btn)
        
        layout.addLayout(button_layout)
        
    def _create_general_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        startup_group = QGroupBox("启动")
        startup_layout = QVBoxLayout(startup_group)
        
        self.restore_session_check = QCheckBox("恢复上次会话")
        startup_layout.addWidget(self.restore_session_check)
        
        self.show_splash_check = QCheckBox("显示启动画面")
        startup_layout.addWidget(self.show_splash_check)
        
        layout.addWidget(startup_group)
        
        auto_save_group = QGroupBox("自动保存")
        auto_save_layout = QFormLayout(auto_save_group)
        
        self.auto_save_check = QCheckBox("启用自动保存")
        auto_save_layout.addRow(self.auto_save_check)
        
        self.auto_save_interval = QSpinBox()
        self.auto_save_interval.setRange(1, 60)
        self.auto_save_interval.setSuffix(" 分钟")
        self.auto_save_interval.setValue(5)
        auto_save_layout.addRow("自动保存间隔:", self.auto_save_interval)
        
        layout.addWidget(auto_save_group)
        
        layout.addStretch()
        
        return widget
        
    def _create_editor_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        font_group = QGroupBox("字体")
        font_layout = QFormLayout(font_group)
        
        self.font_combo = QFontComboBox()
        self.font_combo.setCurrentFont(QFont("Consolas", 12))
        font_layout.addRow("字体:", self.font_combo)
        
        self.font_size_spin = QSpinBox()
        self.font_size_spin.setRange(8, 48)
        self.font_size_spin.setValue(12)
        font_layout.addRow("字号:", self.font_size_spin)
        
        layout.addWidget(font_group)
        
        display_group = QGroupBox("显示")
        display_layout = QFormLayout(display_group)
        
        self.line_numbers_check = QCheckBox("显示行号")
        display_layout.addRow(self.line_numbers_check)
        
        self.highlight_line_check = QCheckBox("高亮当前行")
        display_layout.addRow(self.highlight_line_check)
        
        self.word_wrap_check = QCheckBox("自动换行")
        self.word_wrap_check.setChecked(True)
        display_layout.addRow(self.word_wrap_check)
        
        layout.addWidget(display_group)
        
        tabs_group = QGroupBox("制表符")
        tabs_layout = QFormLayout(tabs_group)
        
        self.tab_width_spin = QSpinBox()
        self.tab_width_spin.setRange(1, 16)
        self.tab_width_spin.setValue(4)
        tabs_layout.addRow("制表符宽度:", self.tab_width_spin)
        
        self.replace_tabs_check = QCheckBox("用空格替换制表符")
        self.replace_tabs_check.setChecked(True)
        tabs_layout.addRow(self.replace_tabs_check)
        
        layout.addWidget(tabs_group)
        
        layout.addStretch()
        
        return widget
        
    def _create_vim_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        enable_group = QGroupBox("Vim模式")
        enable_layout = QVBoxLayout(enable_group)
        
        self.vim_mode_check = QCheckBox("启用Vim键位模式")
        enable_layout.addWidget(self.vim_mode_check)
        
        layout.addWidget(enable_group)
        
        behavior_group = QGroupBox("行为设置")
        behavior_layout = QFormLayout(behavior_group)
        
        self.start_in_insert_check = QCheckBox("启动时进入插入模式")
        behavior_layout.addRow(self.start_in_insert_check)
        
        self.show_mode_indicator_check = QCheckBox("显示模式指示器")
        self.show_mode_indicator_check.setChecked(True)
        behavior_layout.addRow(self.show_mode_indicator_check)
        
        layout.addWidget(behavior_group)
        
        keybindings_group = QGroupBox("快捷键")
        keybindings_layout = QVBoxLayout(keybindings_group)
        
        info_label = QLabel(
            "可用的Vim命令:\n"
            "• 普通模式: h/j/k/l 移动光标\n"
            "• i/a/A/o/O 进入插入模式\n"
            "• dd 删除行, yy 复制行, p 粘贴\n"
            "• u 撤销, Ctrl+R 重做\n"
            "• v 进入可视模式, V 进入可视行模式\n"
        )
        info_label.setStyleSheet("color: #666;")
        keybindings_layout.addWidget(info_label)
        
        layout.addWidget(keybindings_group)
        
        layout.addStretch()
        
        return widget
        
    def _create_preview_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        sync_group = QGroupBox("同步")
        sync_layout = QVBoxLayout(sync_group)
        
        self.sync_scroll_check = QCheckBox("编辑器和预览同步滚动")
        self.sync_scroll_check.setChecked(True)
        sync_layout.addWidget(self.sync_scroll_check)
        
        self.auto_update_check = QCheckBox("实时更新预览")
        self.auto_update_check.setChecked(True)
        sync_layout.addWidget(self.auto_update_check)
        
        layout.addWidget(sync_group)
        
        style_group = QGroupBox("样式")
        style_layout = QFormLayout(style_group)
        
        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["浅色主题", "深色主题", "GitHub风格"])
        style_layout.addRow("主题:", self.theme_combo)
        
        layout.addWidget(style_group)
        
        layout.addStretch()
        
        return widget
        
    def _load_settings(self):
        self.restore_session_check.setChecked(
            self.settings.value("restore_session", True, type=bool)
        )
        self.show_splash_check.setChecked(
            self.settings.value("show_splash", False, type=bool)
        )
        self.auto_save_check.setChecked(
            self.settings.value("auto_save", False, type=bool)
        )
        self.auto_save_interval.setValue(
            self.settings.value("auto_save_interval", 5, type=int)
        )
        
        font_name = self.settings.value("font_name", "Consolas")
        font_size = self.settings.value("font_size", 12, type=int)
        self.font_combo.setCurrentFont(QFont(font_name))
        self.font_size_spin.setValue(font_size)
        
        self.line_numbers_check.setChecked(
            self.settings.value("show_line_numbers", False, type=bool)
        )
        self.highlight_line_check.setChecked(
            self.settings.value("highlight_current_line", True, type=bool)
        )
        self.word_wrap_check.setChecked(
            self.settings.value("word_wrap", True, type=bool)
        )
        
        self.tab_width_spin.setValue(
            self.settings.value("tab_width", 4, type=int)
        )
        self.replace_tabs_check.setChecked(
            self.settings.value("replace_tabs", True, type=bool)
        )
        
        self.vim_mode_check.setChecked(
            self.settings.value("vim_mode", False, type=bool)
        )
        self.start_in_insert_check.setChecked(
            self.settings.value("start_in_insert", False, type=bool)
        )
        self.show_mode_indicator_check.setChecked(
            self.settings.value("show_mode_indicator", True, type=bool)
        )
        
        self.sync_scroll_check.setChecked(
            self.settings.value("sync_scroll", True, type=bool)
        )
        self.auto_update_check.setChecked(
            self.settings.value("auto_update", True, type=bool)
        )
        
        theme_index = self.settings.value("theme", 0, type=int)
        self.theme_combo.setCurrentIndex(theme_index)
        
    def _save_settings(self):
        self.settings.setValue("restore_session", self.restore_session_check.isChecked())
        self.settings.setValue("show_splash", self.show_splash_check.isChecked())
        self.settings.setValue("auto_save", self.auto_save_check.isChecked())
        self.settings.setValue("auto_save_interval", self.auto_save_interval.value())
        
        self.settings.setValue("font_name", self.font_combo.currentFont().family())
        self.settings.setValue("font_size", self.font_size_spin.value())
        
        self.settings.setValue("show_line_numbers", self.line_numbers_check.isChecked())
        self.settings.setValue("highlight_current_line", self.highlight_line_check.isChecked())
        self.settings.setValue("word_wrap", self.word_wrap_check.isChecked())
        
        self.settings.setValue("tab_width", self.tab_width_spin.value())
        self.settings.setValue("replace_tabs", self.replace_tabs_check.isChecked())
        
        self.settings.setValue("vim_mode", self.vim_mode_check.isChecked())
        self.settings.setValue("start_in_insert", self.start_in_insert_check.isChecked())
        self.settings.setValue("show_mode_indicator", self.show_mode_indicator_check.isChecked())
        
        self.settings.setValue("sync_scroll", self.sync_scroll_check.isChecked())
        self.settings.setValue("auto_update", self.auto_update_check.isChecked())
        
        self.settings.setValue("theme", self.theme_combo.currentIndex())
        
    def _reset_to_defaults(self):
        self.restore_session_check.setChecked(True)
        self.show_splash_check.setChecked(False)
        self.auto_save_check.setChecked(False)
        self.auto_save_interval.setValue(5)
        
        self.font_combo.setCurrentFont(QFont("Consolas", 12))
        self.font_size_spin.setValue(12)
        
        self.line_numbers_check.setChecked(False)
        self.highlight_line_check.setChecked(True)
        self.word_wrap_check.setChecked(True)
        
        self.tab_width_spin.setValue(4)
        self.replace_tabs_check.setChecked(True)
        
        self.vim_mode_check.setChecked(False)
        self.start_in_insert_check.setChecked(False)
        self.show_mode_indicator_check.setChecked(True)
        
        self.sync_scroll_check.setChecked(True)
        self.auto_update_check.setChecked(True)
        
        self.theme_combo.setCurrentIndex(0)
        
    def _save_and_accept(self):
        self._save_settings()
        self.accept()
