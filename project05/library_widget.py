from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QTreeWidget, QTreeWidgetItem,
    QHeaderView, QButtonGroup
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont

from enums import ViewMode


class LibraryWidget(QWidget):
    song_double_clicked = pyqtSignal(object)
    view_mode_changed = pyqtSignal(object)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.library = []
        self.current_mode = ViewMode.SONGS
        self._init_ui()
    
    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)
        
        mode_layout = QHBoxLayout()
        mode_layout.setSpacing(2)
        
        self.songs_btn = QPushButton('歌曲')
        self.songs_btn.setCheckable(True)
        self.songs_btn.setChecked(True)
        self.songs_btn.clicked.connect(lambda: self._change_mode(ViewMode.SONGS))
        
        self.artists_btn = QPushButton('艺术家')
        self.artists_btn.setCheckable(True)
        self.artists_btn.clicked.connect(lambda: self._change_mode(ViewMode.ARTISTS))
        
        self.albums_btn = QPushButton('专辑')
        self.albums_btn.setCheckable(True)
        self.albums_btn.clicked.connect(lambda: self._change_mode(ViewMode.ALBUMS))
        
        self.mode_group = QButtonGroup(self)
        self.mode_group.addButton(self.songs_btn)
        self.mode_group.addButton(self.artists_btn)
        self.mode_group.addButton(self.albums_btn)
        
        mode_layout.addWidget(self.songs_btn)
        mode_layout.addWidget(self.artists_btn)
        mode_layout.addWidget(self.albums_btn)
        
        layout.addLayout(mode_layout)
        
        self.tree = QTreeWidget()
        self.tree.setHeaderLabels(['标题', '艺术家', '专辑', '时长'])
        self.tree.setAlternatingRowColors(True)
        self.tree.setSelectionMode(QTreeWidget.ExtendedSelection)
        self.tree.setSortingEnabled(True)
        self.tree.sortByColumn(0, Qt.AscendingOrder)
        self.tree.itemDoubleClicked.connect(self._on_item_double_clicked)
        
        header = self.tree.header()
        header.setSectionResizeMode(0, QHeaderView.Stretch)
        header.setSectionResizeMode(1, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(2, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(3, QHeaderView.ResizeToContents)
        
        layout.addWidget(self.tree)
    
    def set_library(self, library):
        self.library = library
        self._refresh_view()
    
    def _change_mode(self, mode):
        if self.current_mode != mode:
            self.current_mode = mode
            self.view_mode_changed.emit(mode)
            self._refresh_view()
    
    def _refresh_view(self):
        self.tree.clear()
        self.tree.setColumnHidden(1, False)
        self.tree.setColumnHidden(2, False)
        self.tree.setColumnHidden(3, False)
        
        if self.current_mode == ViewMode.SONGS:
            self._show_songs_view()
        elif self.current_mode == ViewMode.ARTISTS:
            self._show_artists_view()
        elif self.current_mode == ViewMode.ALBUMS:
            self._show_albums_view()
    
    def _show_songs_view(self):
        for song in self.library:
            item = QTreeWidgetItem()
            item.setText(0, song.get_display_title())
            item.setText(1, song.get_display_artist())
            item.setText(2, song.get_display_album())
            item.setText(3, song.get_duration_string())
            item.setData(0, Qt.UserRole, song)
            item.setData(0, Qt.UserRole + 1, 'song')
            self.tree.addTopLevelItem(item)
        
        self.tree.setHeaderLabels(['标题', '艺术家', '专辑', '时长'])
    
    def _show_artists_view(self):
        artists = {}
        for song in self.library:
            artist = song.get_display_artist()
            if artist not in artists:
                artists[artist] = []
            artists[artist].append(song)
        
        for artist, songs in sorted(artists.items()):
            artist_item = QTreeWidgetItem()
            artist_item.setText(0, artist)
            artist_item.setData(0, Qt.UserRole + 1, 'artist')
            
            album_count = len(set(s.get_display_album() for s in songs))
            artist_item.setText(1, f'{album_count} 张专辑')
            artist_item.setText(2, f'{len(songs)} 首歌曲')
            
            font = QFont()
            font.setBold(True)
            artist_item.setFont(0, font)
            
            for song in songs:
                song_item = QTreeWidgetItem(artist_item)
                song_item.setText(0, song.get_display_title())
                song_item.setText(1, song.get_display_album())
                song_item.setText(2, song.get_duration_string())
                song_item.setData(0, Qt.UserRole, song)
                song_item.setData(0, Qt.UserRole + 1, 'song')
            
            self.tree.addTopLevelItem(artist_item)
        
        self.tree.setHeaderLabels(['名称', '信息', '时长'])
        self.tree.expandToDepth(0)
    
    def _show_albums_view(self):
        albums = {}
        for song in self.library:
            album = song.get_display_album()
            if album not in albums:
                albums[album] = []
            albums[album].append(song)
        
        for album, songs in sorted(albums.items()):
            album_item = QTreeWidgetItem()
            album_item.setText(0, album)
            album_item.setData(0, Qt.UserRole + 1, 'album')
            
            artists = set(s.get_display_artist() for s in songs)
            album_item.setText(1, ', '.join(artists) if len(artists) <= 3 else f'{len(artists)} 位艺术家')
            album_item.setText(2, f'{len(songs)} 首歌曲')
            
            font = QFont()
            font.setBold(True)
            album_item.setFont(0, font)
            
            for song in songs:
                song_item = QTreeWidgetItem(album_item)
                song_item.setText(0, song.get_display_title())
                song_item.setText(1, song.get_display_artist())
                song_item.setText(2, song.get_duration_string())
                song_item.setData(0, Qt.UserRole, song)
                song_item.setData(0, Qt.UserRole + 1, 'song')
            
            self.tree.addTopLevelItem(album_item)
        
        self.tree.setHeaderLabels(['名称', '艺术家', '时长'])
        self.tree.expandToDepth(0)
    
    def _on_item_double_clicked(self, item, column):
        item_type = item.data(0, Qt.UserRole + 1)
        if item_type == 'song':
            song = item.data(0, Qt.UserRole)
            if song:
                self.song_double_clicked.emit(song)
    
    def get_selected_songs(self):
        selected_songs = []
        items = self.tree.selectedItems()
        
        for item in items:
            item_type = item.data(0, Qt.UserRole + 1)
            if item_type == 'song':
                song = item.data(0, Qt.UserRole)
                if song and song not in selected_songs:
                    selected_songs.append(song)
            elif item_type in ['artist', 'album']:
                for i in range(item.childCount()):
                    child = item.child(i)
                    song = child.data(0, Qt.UserRole)
                    if song and song not in selected_songs:
                        selected_songs.append(song)
        
        return selected_songs
