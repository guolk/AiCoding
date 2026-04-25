from enum import Enum


class ViewMode(Enum):
    SONGS = 'songs'
    ARTISTS = 'artists'
    ALBUMS = 'albums'


class PlayMode(Enum):
    SEQUENCE = 'sequence'
    LOOP_ALL = 'loop_all'
    LOOP_ONE = 'loop_one'
    RANDOM = 'random'
