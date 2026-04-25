from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QListWidget, QListWidgetItem,
    QMenu, QMessageBox, QAction
)
from PyQt5.QtCore import Qt, pyqtSignal, QPoint
from PyQt5.QtGui import QFont, QColor


class PlaylistWidget(QWidget):
    song_double_clicked = pyqtSignal(int)
    song_selected = pyqtSignal(int)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.songs = []
        self.current_index = -1
        self._init_ui()
    
    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)
        
        header_widget = QWidget()
        header_layout = QHBoxLayout(header_widget)
        header_layout.setContentsMargins(0, 0, 0, 0)
        
        title_label = QLabel('播放队列')
        title_label.setFont(QFont('Microsoft YaHei', 12, QFont.Bold))
        header_layout.addWidget(title_label)
        
        header_layout.addStretch()
        
        self.count_label = QLabel('0 首歌曲')
        self.count_label.setFont(QFont('Microsoft YaHei', 9))
        header_layout.addWidget(self.count_label)
        
        clear_btn = QPushButton('清空')
        clear_btn.setMaximumWidth(60)
        clear_btn.clicked.connect(self._clear_playlist)
        header_layout.addWidget(clear_btn)
        
        layout.addWidget(header_widget)
        
        self.list_widget = QListWidget()
        self.list_widget.setAlternatingRowColors(True)
        self.list_widget.setSelectionMode(QListWidget.SingleSelection)
        self.list_widget.setDragDropMode(QListWidget.InternalMove)
        self.list_widget.setDefaultDropAction(Qt.MoveAction)
        self.list_widget.setAcceptDrops(True)
        self.list_widget.setDropIndicatorShown(True)
        
        self.list_widget.itemDoubleClicked.connect(self._on_item_double_clicked)
        self.list_widget.itemClicked.connect(self._on_item_clicked)
        self.list_widget.setContextMenuPolicy(Qt.CustomContextMenu)
        self.list_widget.customContextMenuRequested.connect(self._show_context_menu)
        
        self.list_widget.model().rowsMoved.connect(self._on_rows_moved)
        
        layout.addWidget(self.list_widget)
    
    def add_song(self, song):
        existing_paths = set(s.file_path for s in self.songs)
        if song.file_path in existing_paths:
            return False
        self.songs.append(song)
        self._add_item(song, len(self.songs) - 1)
        self._update_count()
        return True
    
    def add_songs(self, songs):
        existing_paths = set(s.file_path for s in self.songs)
        added_count = 0
        duplicate_count = 0
        
        for song in songs:
            if song.file_path in existing_paths:
                duplicate_count += 1
            else:
                self.songs.append(song)
                self._add_item(song, len(self.songs) - 1)
                existing_paths.add(song.file_path)
                added_count += 1
        
        self._update_count()
        return added_count, duplicate_count
    
    def _add_item(self, song, index):
        item = QListWidgetItem()
        item.setData(Qt.UserRole, index)
        
        title = song.get_display_title()
        artist = song.get_display_artist()
        duration = song.get_duration_string()
        
        display_text = f"{title}\n{artist} - {duration}"
        item.setText(display_text)
        
        font = QFont('Microsoft YaHei', 9)
        item.setFont(font)
        
        self.list_widget.addItem(item)
    
    def _update_count(self):
        self.count_label.setText(f'{len(self.songs)} 首歌曲')
    
    def get_all_songs(self):
        return self.songs.copy()
    
    def set_current_index(self, index):
        self.current_index = index
        
        for i in range(self.list_widget.count()):
            item = self.list_widget.item(i)
            song_index = item.data(Qt.UserRole)
            
            if song_index == index:
                item.setSelected(True)
                self.list_widget.scrollToItem(item)
                font = QFont('Microsoft YaHei', 9, QFont.Bold)
                item.setFont(font)
                item.setBackground(QColor(220, 235, 255))
            else:
                item.setSelected(False)
                font = QFont('Microsoft YaHei', 9)
                item.setFont(font)
                item.setBackground(QColor('transparent'))
    
    def _on_item_double_clicked(self, item):
        index = item.data(Qt.UserRole)
        if 0 <= index < len(self.songs):
            self.song_double_clicked.emit(index)
    
    def _on_item_clicked(self, item):
        index = item.data(Qt.UserRole)
        if 0 <= index < len(self.songs):
            self.song_selected.emit(index)
    
    def _on_rows_moved(self, parent, start, end, destination, row):
        if row < 0:
            return
        
        moved_item = self.songs.pop(start)
        if row > start:
            row -= 1
        self.songs.insert(row, moved_item)
        
        self._refresh_display()
    
    def _refresh_display(self):
        current_selection = self.current_index
        
        self.list_widget.clear()
        for i, song in enumerate(self.songs):
            self._add_item(song, i)
        
        if current_selection >= 0:
            self.set_current_index(current_selection)
    
    def _show_context_menu(self, pos: QPoint):
        item = self.list_widget.itemAt(pos)
        if not item:
            return
        
        menu = QMenu(self)
        
        play_action = QAction('播放', self)
        play_action.triggered.connect(lambda: self._play_item(item))
        menu.addAction(play_action)
        
        menu.addSeparator()
        
        remove_action = QAction('从队列中移除', self)
        remove_action.triggered.connect(lambda: self._remove_item(item))
        menu.addAction(remove_action)
        
        menu.exec(self.list_widget.mapToGlobal(pos))
    
    def _play_item(self, item):
        index = item.data(Qt.UserRole)
        if 0 <= index < len(self.songs):
            self.song_double_clicked.emit(index)
    
    def _remove_item(self, item):
        index = item.data(Qt.UserRole)
        if 0 <= index < len(self.songs):
            if index == self.current_index:
                QMessageBox.warning(self, '警告', '不能移除正在播放的歌曲')
                return
            
            if index < self.current_index:
                self.current_index -= 1
            
            self.songs.pop(index)
            self._refresh_display()
            self._update_count()
    
    def _clear_playlist(self):
        if not self.songs:
            return
        
        reply = QMessageBox.question(
            self,
            '确认清空',
            '确定要清空播放队列吗？',
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            self.songs = []
            self.current_index = -1
            self.list_widget.clear()
            self._update_count()
