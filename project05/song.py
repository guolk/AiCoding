class Song:
    def __init__(self, file_path='', title='', artist='', album='', 
                 duration=0.0, cover_image=None, genre='', year=''):
        self.file_path = file_path
        self.title = title
        self.artist = artist
        self.album = album
        self.duration = duration
        self.cover_image = cover_image
        self.genre = genre
        self.year = year
    
    def __str__(self):
        return f"{self.title} - {self.artist}"
    
    def get_display_title(self):
        if self.title:
            return self.title
        else:
            import os
            return os.path.basename(self.file_path)
    
    def get_display_artist(self):
        return self.artist if self.artist else '未知艺术家'
    
    def get_display_album(self):
        return self.album if self.album else '未知专辑'
    
    def get_duration_string(self):
        minutes = int(self.duration // 60)
        seconds = int(self.duration % 60)
        return f"{minutes}:{seconds:02d}"
