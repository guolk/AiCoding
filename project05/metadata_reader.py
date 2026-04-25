import os
from song import Song

MUTAGEN_AVAILABLE = False
File = None
MP3 = None
FLAC = None
WAVE = None
ID3 = None
APIC = None
Picture = None

try:
    from mutagen import File as MutagenFile
    from mutagen.mp3 import MP3
    from mutagen.flac import FLAC, Picture
    from mutagen.wave import WAVE
    from mutagen.id3 import ID3, APIC
    File = MutagenFile
    MUTAGEN_AVAILABLE = True
    print("mutagen 库加载成功")
except ImportError as e:
    print(f"mutagen 库导入失败: {e}")
    MUTAGEN_AVAILABLE = False


class MetadataReader:
    SUPPORTED_FORMATS = ['.mp3', '.flac', '.wav', '.wave', '.m4a', '.ogg']
    
    def __init__(self):
        pass
    
    def scan_folder(self, folder_path):
        songs = []
        if not os.path.exists(folder_path):
            print(f"文件夹不存在: {folder_path}")
            return songs
        
        print(f"开始扫描文件夹: {folder_path}")
        
        file_count = 0
        matched_count = 0
        
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_count += 1
                ext = os.path.splitext(file)[1].lower()
                if ext in self.SUPPORTED_FORMATS:
                    matched_count += 1
                    file_path = os.path.join(root, file)
                    print(f"  发现支持的文件: {file_path}")
                    song = self.read_metadata(file_path)
                    if song:
                        print(f"  成功读取: {song.get_display_title()}")
                        songs.append(song)
                    else:
                        print(f"  读取失败: {file_path}")
        
        print(f"扫描完成: 共检查 {file_count} 个文件, 匹配 {matched_count} 个支持的格式, 成功读取 {len(songs)} 个")
        return songs
    
    def read_metadata(self, file_path):
        if not MUTAGEN_AVAILABLE:
            print(f"mutagen 不可用, 创建基本歌曲信息: {file_path}")
            return self._create_basic_song(file_path)
        
        try:
            ext = os.path.splitext(file_path)[1].lower()
            
            try:
                return self._read_with_generic_file(file_path, ext)
            except Exception as e1:
                print(f"通用读取失败 (尝试专用方法): {e1}")
                
                if ext == '.mp3':
                    return self._read_mp3_specific(file_path)
                elif ext == '.flac':
                    return self._read_flac_specific(file_path)
                elif ext in ['.wav', '.wave']:
                    return self._read_wav_specific(file_path)
                else:
                    return self._create_basic_song(file_path)
        
        except Exception as e:
            print(f"读取元数据时出错 {file_path}: {e}")
            import traceback
            traceback.print_exc()
            return self._create_basic_song(file_path)
    
    def _read_with_generic_file(self, file_path, ext):
        song = Song(file_path)
        
        try:
            audio = File(file_path, easy=False)
        except:
            audio = File(file_path, easy=True)
        
        if audio is None:
            print(f"File() 返回 None, 使用基本信息")
            return self._create_basic_song(file_path)
        
        try:
            if hasattr(audio, 'info') and hasattr(audio.info, 'length'):
                song.duration = audio.info.length
                print(f"  时长: {song.duration}")
        except:
            pass
        
        try:
            if hasattr(audio, 'tags') and audio.tags:
                tags = audio.tags
                
                if hasattr(tags, 'get'):
                    title = self._get_tag_easy(tags, ['title', 'TIT2', 'Title'], '')
                    artist = self._get_tag_easy(tags, ['artist', 'TPE1', 'Artist', 'AlbumArtist'], '')
                    album = self._get_tag_easy(tags, ['album', 'TALB', 'Album'], '')
                    genre = self._get_tag_easy(tags, ['genre', 'TCON', 'Genre'], '')
                    year = self._get_tag_easy(tags, ['date', 'year', 'TYER', 'TDRC', 'Date'], '')
                    
                    song.title = title
                    song.artist = artist
                    song.album = album
                    song.genre = genre
                    song.year = year
                    
                    print(f"  标题: {title}, 艺术家: {artist}, 专辑: {album}")
                
                try:
                    if ext == '.mp3':
                        song.cover_image = self._extract_cover_mp3_generic(audio)
                    elif ext == '.flac':
                        song.cover_image = self._extract_cover_flac_generic(audio)
                except Exception as ce:
                    print(f"  封面提取失败: {ce}")
        
        except Exception as te:
            print(f"  标签读取失败: {te}")
        
        if not song.title:
            song.title = os.path.splitext(os.path.basename(file_path))[0]
        
        return song
    
    def _get_tag_easy(self, tags, possible_names, default):
        for name in possible_names:
            try:
                if name in tags:
                    value = tags[name]
                    if isinstance(value, list):
                        if value:
                            return str(value[0])
                    elif hasattr(value, 'text'):
                        if value.text:
                            return str(value.text[0])
                    else:
                        return str(value)
            except:
                continue
        return default
    
    def _extract_cover_mp3_generic(self, audio):
        try:
            if hasattr(audio, 'tags') and audio.tags:
                tags = audio.tags
                if hasattr(tags, 'getall'):
                    try:
                        apics = tags.getall('APIC')
                        for apic in apics:
                            if apic.data:
                                print("  找到封面 (APIC)")
                                return apic.data
                    except:
                        pass
                
                for key, value in tags.items():
                    if 'APIC' in key or hasattr(value, 'data'):
                        try:
                            if value.data:
                                print(f"  找到封面 ({key})")
                                return value.data
                        except:
                            pass
        except Exception as e:
            print(f"  封面提取错误: {e}")
        return None
    
    def _extract_cover_flac_generic(self, audio):
        try:
            if hasattr(audio, 'pictures') and audio.pictures:
                for pic in audio.pictures:
                    if pic.data:
                        print("  找到封面 (FLAC pictures)")
                        return pic.data
        except:
            pass
        
        try:
            if hasattr(audio, 'tags') and audio.tags:
                tags = audio.tags
                if 'metadata_block_picture' in tags:
                    try:
                        from mutagen.flac import Picture
                        pic_data = tags['metadata_block_picture'][0]
                        pic = Picture(pic_data)
                        if pic.data:
                            print("  找到封面 (metadata_block_picture)")
                            return pic.data
                    except:
                        pass
        except:
            pass
        
        return None
    
    def _read_mp3_specific(self, file_path):
        song = Song(file_path)
        
        try:
            audio = MP3(file_path)
            if audio and hasattr(audio, 'info'):
                song.duration = audio.info.length
            
            if audio and hasattr(audio, 'tags') and audio.tags:
                song.title = self._get_tag_value(audio.tags, 'TIT2', '')
                song.artist = self._get_tag_value(audio.tags, 'TPE1', '')
                song.album = self._get_tag_value(audio.tags, 'TALB', '')
                song.genre = self._get_tag_value(audio.tags, 'TCON', '')
                song.year = self._get_tag_value(audio.tags, 'TYER', '')
                
                song.cover_image = self._extract_cover_mp3(audio.tags)
        
        except Exception as e:
            print(f"MP3专用读取错误: {e}")
        
        if not song.title:
            song.title = os.path.splitext(os.path.basename(file_path))[0]
        
        return song
    
    def _read_flac_specific(self, file_path):
        song = Song(file_path)
        
        try:
            audio = FLAC(file_path)
            if audio and hasattr(audio, 'info'):
                song.duration = audio.info.length
            
            if audio and hasattr(audio, 'tags') and audio.tags:
                song.title = self._get_flac_tag(audio.tags, 'title', '')
                song.artist = self._get_flac_tag(audio.tags, 'artist', '')
                song.album = self._get_flac_tag(audio.tags, 'album', '')
                song.genre = self._get_flac_tag(audio.tags, 'genre', '')
                song.year = self._get_flac_tag(audio.tags, 'date', '')
                
                song.cover_image = self._extract_cover_flac(audio)
        
        except Exception as e:
            print(f"FLAC专用读取错误: {e}")
        
        if not song.title:
            song.title = os.path.splitext(os.path.basename(file_path))[0]
        
        return song
    
    def _read_wav_specific(self, file_path):
        song = Song(file_path)
        
        try:
            audio = WAVE(file_path)
            if audio and hasattr(audio, 'info'):
                song.duration = audio.info.length
            
            if audio and hasattr(audio, 'tags') and audio.tags:
                song.title = self._get_tag_value(audio.tags, 'TIT2', '')
                song.artist = self._get_tag_value(audio.tags, 'TPE1', '')
                song.album = self._get_tag_value(audio.tags, 'TALB', '')
                song.genre = self._get_tag_value(audio.tags, 'TCON', '')
                song.year = self._get_tag_value(audio.tags, 'TYER', '')
        
        except Exception as e:
            print(f"WAV专用读取错误: {e}")
        
        if not song.title:
            song.title = os.path.splitext(os.path.basename(file_path))[0]
        
        return song
    
    def _get_tag_value(self, tags, tag_name, default):
        try:
            if tag_name in tags:
                tag = tags[tag_name]
                if hasattr(tag, 'text') and tag.text:
                    return str(tag.text[0])
                elif isinstance(tag, list) and tag:
                    return str(tag[0])
        except:
            pass
        return default
    
    def _get_flac_tag(self, tags, tag_name, default):
        try:
            tag_name_lower = tag_name.lower()
            for key in tags.keys():
                if key.lower() == tag_name_lower:
                    value = tags[key]
                    if isinstance(value, list) and value:
                        return value[0]
                    return str(value)
        except:
            pass
        return default
    
    def _extract_cover_mp3(self, tags):
        try:
            for tag in tags.values():
                if hasattr(tag, '__class__') and 'APIC' in tag.__class__.__name__:
                    if hasattr(tag, 'data'):
                        return tag.data
        except:
            pass
        return None
    
    def _extract_cover_flac(self, audio):
        try:
            if hasattr(audio, 'pictures') and audio.pictures:
                return audio.pictures[0].data
        except:
            pass
        return None
    
    def _create_basic_song(self, file_path):
        song = Song(file_path)
        song.title = os.path.splitext(os.path.basename(file_path))[0]
        print(f"  使用基本信息: {song.title}")
        return song
