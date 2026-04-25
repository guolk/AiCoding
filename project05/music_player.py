import os
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QSplitter, QFileDialog, QMessageBox, QToolBar
)
from PyQt5.QtCore import Qt, QTimer, QUrl
from PyQt5.QtMultimedia import QMediaPlayer, QMediaPlaylist, QMediaContent

from metadata_reader import MetadataReader
from library_widget import LibraryWidget
from player_widget import PlayerWidget
from playlist_widget import PlaylistWidget
from lyrics_widget import LyricsWidget
from enums import ViewMode, PlayMode


class MusicPlayer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('本地音乐播放器')
        self.setMinimumSize(1200, 700)
        self.resize(1400, 800)
        
        self.library = []
        self.current_index = -1
        self.current_song = None
        self.play_mode = PlayMode.LOOP_ALL
        
        self.metadata_reader = MetadataReader()
        
        self._init_player()
        self._init_ui()
        self._init_toolbar()
        self._init_connections()
        self._init_timer()
    
    def _init_player(self):
        self.media_player = QMediaPlayer()
        self.playlist = QMediaPlaylist()
        self.media_player.setPlaylist(self.playlist)
        self.media_player.setVolume(70)
    
    def _init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        content_splitter = QSplitter(Qt.Horizontal)
        
        self.library_widget = LibraryWidget()
        content_splitter.addWidget(self.library_widget)
        
        middle_widget = QWidget()
        middle_layout = QVBoxLayout(middle_widget)
        middle_layout.setContentsMargins(10, 10, 10, 10)
        middle_layout.setSpacing(10)
        
        self.player_widget = PlayerWidget()
        middle_layout.addWidget(self.player_widget, 2)
        
        self.lyrics_widget = LyricsWidget()
        middle_layout.addWidget(self.lyrics_widget, 3)
        
        content_splitter.addWidget(middle_widget)
        
        self.playlist_widget = PlaylistWidget()
        content_splitter.addWidget(self.playlist_widget)
        
        content_splitter.setSizes([300, 600, 300])
        main_layout.addWidget(content_splitter)
    
    def _init_toolbar(self):
        toolbar = QToolBar('主工具栏')
        toolbar.setMovable(False)
        self.addToolBar(toolbar)
        
        scan_action = toolbar.addAction('扫描文件夹')
        scan_action.triggered.connect(self.scan_folder)
        
        toolbar.addSeparator()
        
        add_to_playlist_action = toolbar.addAction('添加到播放队列')
        add_to_playlist_action.triggered.connect(self.add_to_playlist)
        
        toolbar.addSeparator()
        
        self.shuffle_action = toolbar.addAction('随机播放')
        self.shuffle_action.setCheckable(True)
        self.shuffle_action.triggered.connect(self.toggle_shuffle)
        
        self.repeat_action = toolbar.addAction('单曲循环')
        self.repeat_action.setCheckable(True)
        self.repeat_action.triggered.connect(self.toggle_repeat)
    
    def _init_connections(self):
        self.library_widget.song_double_clicked.connect(self.play_song)
        self.library_widget.view_mode_changed.connect(self.on_view_mode_changed)
        
        self.playlist_widget.song_double_clicked.connect(self.play_from_playlist)
        self.playlist_widget.song_selected.connect(self.play_from_playlist)
        
        self.player_widget.play_pause_clicked.connect(self.play_pause)
        self.player_widget.previous_clicked.connect(self.play_previous)
        self.player_widget.next_clicked.connect(self.play_next)
        self.player_widget.position_changed.connect(self.set_position)
        self.player_widget.volume_changed.connect(self.set_volume)
        
        self.media_player.positionChanged.connect(self.on_position_changed)
        self.media_player.durationChanged.connect(self.on_duration_changed)
        self.media_player.stateChanged.connect(self.on_playback_state_changed)
        self.media_player.mediaStatusChanged.connect(self.on_media_status_changed)
    
    def _init_timer(self):
        self.position_timer = QTimer()
        self.position_timer.setInterval(100)
        self.position_timer.timeout.connect(self.update_position)
    
    def scan_folder(self):
        folder = QFileDialog.getExistingDirectory(self, '选择音乐文件夹')
        if folder:
            songs = self.metadata_reader.scan_folder(folder)
            if songs:
                existing_paths = set(s.file_path for s in self.library)
                new_songs = []
                duplicate_count = 0
                
                for song in songs:
                    if song.file_path in existing_paths:
                        duplicate_count += 1
                    else:
                        new_songs.append(song)
                        existing_paths.add(song.file_path)
                
                if new_songs:
                    self.library.extend(new_songs)
                    self.library_widget.set_library(self.library)
                    
                    if duplicate_count > 0:
                        QMessageBox.information(self, '扫描完成', f'成功添加 {len(new_songs)} 首歌曲\n(跳过 {duplicate_count} 首已存在的歌曲)')
                    else:
                        QMessageBox.information(self, '扫描完成', f'成功添加 {len(new_songs)} 首歌曲')
                else:
                    if duplicate_count > 0:
                        QMessageBox.information(self, '扫描完成', f'所有 {duplicate_count} 首歌曲已存在于音乐库中')
                    else:
                        QMessageBox.warning(self, '扫描失败', '未找到支持的音频文件')
            else:
                QMessageBox.warning(self, '扫描失败', '未找到支持的音频文件')
    
    def add_to_playlist(self):
        selected_songs = self.library_widget.get_selected_songs()
        if selected_songs:
            added_count, duplicate_count = self.playlist_widget.add_songs(selected_songs)
            
            if added_count > 0:
                if duplicate_count > 0:
                    QMessageBox.information(self, '添加完成', f'成功添加 {added_count} 首歌曲到播放队列\n(跳过 {duplicate_count} 首已存在的歌曲)')
                else:
                    QMessageBox.information(self, '添加完成', f'成功添加 {added_count} 首歌曲到播放队列')
            else:
                if duplicate_count > 0:
                    QMessageBox.information(self, '添加完成', f'所有 {duplicate_count} 首歌曲已存在于播放队列中')
    
    def play_song(self, song):
        if not song:
            return
        
        self.current_song = song
        
        songs = self.playlist_widget.get_all_songs()
        
        existing_index = -1
        for i, s in enumerate(songs):
            if s.file_path == song.file_path:
                existing_index = i
                break
        
        if existing_index >= 0:
            self.current_index = existing_index
        else:
            added = self.playlist_widget.add_song(song)
            if added:
                songs = self.playlist_widget.get_all_songs()
                self.current_index = len(songs) - 1
            else:
                for i, s in enumerate(songs):
                    if s.file_path == song.file_path:
                        self.current_index = i
                        break
        
        self._play_current_song()
    
    def play_from_playlist(self, index):
        songs = self.playlist_widget.get_all_songs()
        if 0 <= index < len(songs):
            self.current_index = index
            self.current_song = songs[index]
            self._play_current_song()
    
    def _play_current_song(self):
        if not self.current_song:
            return
        
        self.playlist.clear()
        media_content = QMediaContent(QUrl.fromLocalFile(self.current_song.file_path))
        self.playlist.addMedia(media_content)
        self.playlist.setCurrentIndex(0)
        self.media_player.play()
        
        self.player_widget.set_current_song(self.current_song)
        self.playlist_widget.set_current_index(self.current_index)
        self.lyrics_widget.load_lyrics(self.current_song.file_path)
        
        self.position_timer.start()
    
    def play_pause(self):
        if self.media_player.state() == QMediaPlayer.PlayingState:
            self.media_player.pause()
            self.position_timer.stop()
        else:
            if self.current_song:
                self.media_player.play()
                self.position_timer.start()
            else:
                songs = self.playlist_widget.get_all_songs()
                if songs:
                    self.play_from_playlist(0)
    
    def play_previous(self):
        songs = self.playlist_widget.get_all_songs()
        if not songs:
            return
        
        if self.play_mode == PlayMode.RANDOM:
            import random
            self.current_index = random.randint(0, len(songs) - 1)
        else:
            if self.current_index > 0:
                self.current_index -= 1
            else:
                self.current_index = len(songs) - 1
        
        self.current_song = songs[self.current_index]
        self._play_current_song()
    
    def play_next(self):
        songs = self.playlist_widget.get_all_songs()
        if not songs:
            return
        
        if self.play_mode == PlayMode.LOOP_ONE:
            self._play_current_song()
            return
        
        if self.play_mode == PlayMode.RANDOM:
            import random
            self.current_index = random.randint(0, len(songs) - 1)
        else:
            if self.current_index < len(songs) - 1:
                self.current_index += 1
            else:
                if self.play_mode == PlayMode.LOOP_ALL:
                    self.current_index = 0
                else:
                    return
        
        self.current_song = songs[self.current_index]
        self._play_current_song()
    
    def set_position(self, position):
        self.media_player.setPosition(int(position * 1000))
        self.lyrics_widget.sync_lyrics(position)
    
    def set_volume(self, volume):
        self.media_player.setVolume(volume)
    
    def on_position_changed(self, position):
        pass
    
    def on_duration_changed(self, duration):
        self.player_widget.set_duration(duration / 1000.0)
    
    def on_media_status_changed(self, status):
        if status == QMediaPlayer.EndOfMedia:
            self.play_next()
    
    def on_playback_state_changed(self, state):
        is_playing = state == QMediaPlayer.PlayingState
        self.player_widget.set_playing(is_playing)
    
    def on_view_mode_changed(self, mode):
        pass
    
    def update_position(self):
        position = self.media_player.position() / 1000.0
        self.player_widget.set_position(position)
        self.lyrics_widget.sync_lyrics(position)
    
    def toggle_shuffle(self, checked):
        if checked:
            self.play_mode = PlayMode.RANDOM
            self.repeat_action.setChecked(False)
        else:
            if self.repeat_action.isChecked():
                self.play_mode = PlayMode.LOOP_ONE
            else:
                self.play_mode = PlayMode.SEQUENCE
    
    def toggle_repeat(self, checked):
        if checked:
            self.play_mode = PlayMode.LOOP_ONE
            self.shuffle_action.setChecked(False)
        else:
            if self.shuffle_action.isChecked():
                self.play_mode = PlayMode.RANDOM
            else:
                self.play_mode = PlayMode.SEQUENCE
