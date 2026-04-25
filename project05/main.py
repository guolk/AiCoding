import sys
from PyQt5.QtWidgets import QApplication
from music_player import MusicPlayer

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    player = MusicPlayer()
    player.show()
    
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
