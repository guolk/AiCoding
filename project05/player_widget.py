from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QSlider, QFrame, QSizePolicy
)
from PyQt5.QtCore import Qt, pyqtSignal, QSize
from PyQt5.QtGui import QPixmap, QIcon, QFont, QImage, QPainter, QPainterPath, QColor, QLinearGradient

from PIL import Image
from io import BytesIO


class PlayerWidget(QWidget):
    play_pause_clicked = pyqtSignal()
    previous_clicked = pyqtSignal()
    next_clicked = pyqtSignal()
    position_changed = pyqtSignal(float)
    volume_changed = pyqtSignal(int)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_song = None
        self.is_playing = False
        self.duration = 0.0
        self.position = 0.0
        self._init_ui()
    
    def _init_ui(self):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(20, 10, 20, 10)
        layout.setSpacing(20)
        
        self.cover_label = QLabel()
        self.cover_label.setAlignment(Qt.AlignCenter)
        self.cover_label.setMinimumSize(200, 200)
        self.cover_label.setMaximumSize(250, 250)
        self.cover_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self._set_default_cover()
        layout.addWidget(self.cover_label)
        
        control_widget = QWidget()
        control_layout = QVBoxLayout(control_widget)
        control_layout.setContentsMargins(0, 0, 0, 0)
        control_layout.setSpacing(15)
        
        info_widget = QWidget()
        info_layout = QVBoxLayout(info_widget)
        info_layout.setContentsMargins(0, 0, 0, 0)
        info_layout.setSpacing(5)
        
        self.title_label = QLabel('未播放音乐')
        self.title_label.setFont(QFont('Microsoft YaHei', 16, QFont.Bold))
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setWordWrap(True)
        info_layout.addWidget(self.title_label)
        
        self.artist_label = QLabel('艺术家 - 专辑')
        self.artist_label.setFont(QFont('Microsoft YaHei', 11))
        self.artist_label.setAlignment(Qt.AlignCenter)
        info_layout.addWidget(self.artist_label)
        
        control_layout.addWidget(info_widget)
        
        progress_widget = QWidget()
        progress_layout = QVBoxLayout(progress_widget)
        progress_layout.setContentsMargins(0, 0, 0, 0)
        progress_layout.setSpacing(5)
        
        self.progress_slider = QSlider(Qt.Horizontal)
        self.progress_slider.setRange(0, 1000)
        self.progress_slider.setValue(0)
        self.progress_slider.setEnabled(False)
        self.progress_slider.sliderPressed.connect(self._on_progress_pressed)
        self.progress_slider.sliderReleased.connect(self._on_progress_released)
        self.progress_slider.sliderMoved.connect(self._on_progress_moved)
        
        progress_layout.addWidget(self.progress_slider)
        
        time_widget = QWidget()
        time_layout = QHBoxLayout(time_widget)
        time_layout.setContentsMargins(0, 0, 0, 0)
        
        self.current_time_label = QLabel('0:00')
        self.current_time_label.setFont(QFont('Consolas', 10))
        time_layout.addWidget(self.current_time_label)
        
        time_layout.addStretch()
        
        self.total_time_label = QLabel('0:00')
        self.total_time_label.setFont(QFont('Consolas', 10))
        time_layout.addWidget(self.total_time_label)
        
        progress_layout.addWidget(time_widget)
        control_layout.addWidget(progress_widget)
        
        buttons_widget = QWidget()
        buttons_layout = QHBoxLayout(buttons_widget)
        buttons_layout.setContentsMargins(0, 0, 0, 0)
        buttons_layout.setSpacing(15)
        buttons_layout.setAlignment(Qt.AlignCenter)
        
        self.prev_btn = QPushButton('⏮')
        self.prev_btn.setFont(QFont('Segoe UI Symbol', 16))
        self.prev_btn.setFixedSize(50, 50)
        self.prev_btn.setStyleSheet(self._get_button_style())
        self.prev_btn.clicked.connect(self.previous_clicked.emit)
        buttons_layout.addWidget(self.prev_btn)
        
        self.play_pause_btn = QPushButton('▶')
        self.play_pause_btn.setFont(QFont('Segoe UI Symbol', 20))
        self.play_pause_btn.setFixedSize(60, 60)
        self.play_pause_btn.setStyleSheet(self._get_play_button_style())
        self.play_pause_btn.clicked.connect(self.play_pause_clicked.emit)
        buttons_layout.addWidget(self.play_pause_btn)
        
        self.next_btn = QPushButton('⏭')
        self.next_btn.setFont(QFont('Segoe UI Symbol', 16))
        self.next_btn.setFixedSize(50, 50)
        self.next_btn.setStyleSheet(self._get_button_style())
        self.next_btn.clicked.connect(self.next_clicked.emit)
        buttons_layout.addWidget(self.next_btn)
        
        control_layout.addWidget(buttons_widget)
        
        volume_widget = QWidget()
        volume_layout = QHBoxLayout(volume_widget)
        volume_layout.setContentsMargins(0, 0, 0, 0)
        volume_layout.setSpacing(10)
        volume_layout.setAlignment(Qt.AlignCenter)
        
        self.volume_icon = QLabel('🔊')
        self.volume_icon.setFont(QFont('Segoe UI Symbol', 14))
        volume_layout.addWidget(self.volume_icon)
        
        self.volume_slider = QSlider(Qt.Horizontal)
        self.volume_slider.setRange(0, 100)
        self.volume_slider.setValue(70)
        self.volume_slider.setFixedWidth(100)
        self.volume_slider.valueChanged.connect(self._on_volume_changed)
        volume_layout.addWidget(self.volume_slider)
        
        self.volume_label = QLabel('70%')
        self.volume_label.setFont(QFont('Consolas', 10))
        volume_layout.addWidget(self.volume_label)
        
        control_layout.addWidget(volume_widget)
        control_layout.addStretch()
        
        layout.addWidget(control_widget, 1)
    
    def _get_button_style(self):
        return """
        QPushButton {
            border: none;
            border-radius: 25px;
            background-color: #f0f0f0;
            color: #333;
        }
        QPushButton:hover {
            background-color: #e0e0e0;
        }
        QPushButton:pressed {
            background-color: #d0d0d0;
        }
        """
    
    def _get_play_button_style(self):
        return """
        QPushButton {
            border: none;
            border-radius: 30px;
            background-color: #1a73e8;
            color: white;
        }
        QPushButton:hover {
            background-color: #1557b0;
        }
        QPushButton:pressed {
            background-color: #0d47a1;
        }
        """
    
    def _set_default_cover(self):
        size = self.cover_label.size()
        image = QImage(size.width(), size.height(), QImage.Format_ARGB32)
        image.fill(QColor(240, 240, 240))
        
        painter = QPainter(image)
        painter.setRenderHint(QPainter.Antialiasing)
        
        gradient = QLinearGradient(0, 0, size.width(), size.height())
        gradient.setColorAt(0, QColor(100, 150, 200))
        gradient.setColorAt(1, QColor(50, 100, 150))
        
        painter.setBrush(gradient)
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(10, 10, size.width() - 20, size.height() - 20, 20, 20)
        
        painter.setPen(QColor(200, 200, 200))
        painter.setFont(QFont('Segoe UI Symbol', 48))
        painter.drawText(image.rect(), Qt.AlignCenter, '🎵')
        
        painter.end()
        
        pixmap = QPixmap.fromImage(image)
        self.cover_label.setPixmap(pixmap)
    
    def set_current_song(self, song):
        self.current_song = song
        
        if song:
            self.title_label.setText(song.get_display_title())
            self.artist_label.setText(f'{song.get_display_artist()} - {song.get_display_album()}')
            
            if song.cover_image:
                self._set_cover_image(song.cover_image)
            else:
                self._set_default_cover()
        else:
            self.title_label.setText('未播放音乐')
            self.artist_label.setText('艺术家 - 专辑')
            self._set_default_cover()
    
    def _set_cover_image(self, image_data):
        try:
            image = Image.open(BytesIO(image_data))
            image = image.convert('RGB')
            
            size = self.cover_label.size()
            try:
                image = image.resize((size.width() - 20, size.height() - 20), Image.Resampling.LANCZOS)
            except AttributeError:
                image = image.resize((size.width() - 20, size.height() - 20), Image.LANCZOS)
            
            qimage = QImage(image.tobytes(), image.width, image.height, image.width * 3, QImage.Format_RGB888)
            pixmap = QPixmap.fromImage(qimage)
            
            rounded_pixmap = QPixmap(pixmap.size())
            rounded_pixmap.fill(Qt.transparent)
            
            painter = QPainter(rounded_pixmap)
            painter.setRenderHint(QPainter.Antialiasing)
            path = QPainterPath()
            path.addRoundedRect(0, 0, pixmap.width(), pixmap.height(), 20, 20)
            painter.setClipPath(path)
            painter.drawPixmap(0, 0, pixmap)
            painter.end()
            
            self.cover_label.setPixmap(rounded_pixmap)
        except Exception as e:
            print(f"Error setting cover image: {e}")
            self._set_default_cover()
    
    def set_playing(self, is_playing):
        self.is_playing = is_playing
        if is_playing:
            self.play_pause_btn.setText('⏸')
        else:
            self.play_pause_btn.setText('▶')
    
    def set_duration(self, duration):
        self.duration = duration
        self.total_time_label.setText(self._format_time(duration))
        self.progress_slider.setEnabled(duration > 0)
    
    def set_position(self, position):
        self.position = position
        self.current_time_label.setText(self._format_time(position))
        
        if self.duration > 0 and not self.progress_slider.isSliderDown():
            progress = int((position / self.duration) * 1000)
            self.progress_slider.setValue(progress)
    
    def _format_time(self, seconds):
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f'{minutes}:{secs:02d}'
    
    def _on_progress_pressed(self):
        pass
    
    def _on_progress_released(self):
        if self.duration > 0:
            position = (self.progress_slider.value() / 1000.0) * self.duration
            self.position_changed.emit(position)
    
    def _on_progress_moved(self, value):
        if self.duration > 0:
            position = (value / 1000.0) * self.duration
            self.current_time_label.setText(self._format_time(position))
    
    def _on_volume_changed(self, value):
        self.volume_label.setText(f'{value}%')
        if value == 0:
            self.volume_icon.setText('🔇')
        elif value < 50:
            self.volume_icon.setText('🔉')
        else:
            self.volume_icon.setText('🔊')
        self.volume_changed.emit(value)
