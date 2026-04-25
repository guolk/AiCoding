import os
import sys

print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

try:
    from mutagen import File
    from mutagen.mp3 import MP3
    print("mutagen imported successfully")
    MUTAGEN_AVAILABLE = True
except ImportError as e:
    print(f"mutagen import failed: {e}")
    MUTAGEN_AVAILABLE = False

if MUTAGEN_AVAILABLE:
    test_folder = input("请输入一个包含MP3文件的文件夹路径: ").strip()
    if test_folder and os.path.exists(test_folder):
        print(f"\nScanning: {test_folder}")
        for root, dirs, files in os.walk(test_folder):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                print(f"\nFile: {file}, ext: {ext}")
                
                if ext == '.mp3':
                    file_path = os.path.join(root, file)
                    print(f"  Full path: {file_path}")
                    
                    try:
                        print("  Testing with MP3 class...")
                        audio = MP3(file_path)
                        print(f"    Duration: {audio.info.length}")
                        print(f"    Tags: {audio.tags}")
                        
                        if audio.tags:
                            print(f"    Tag keys: {list(audio.tags.keys())}")
                            if 'TIT2' in audio.tags:
                                print(f"    Title: {audio.tags['TIT2']}")
                        else:
                            print("    No tags found!")
                            
                    except Exception as e:
                        print(f"    MP3 error: {e}")
                        import traceback
                        traceback.print_exc()
                    
                    try:
                        print("  Testing with generic File class...")
                        audio2 = File(file_path, easy=True)
                        if audio2:
                            print(f"    Type: {type(audio2)}")
                            print(f"    Easy keys: {list(audio2.keys()) if audio2 else 'None'}")
                            
                            if 'title' in audio2:
                                print(f"    Easy title: {audio2['title']}")
                            if 'artist' in audio2:
                                print(f"    Easy artist: {audio2['artist']}")
                        else:
                            print("    File() returned None")
                    except Exception as e:
                        print(f"    File() error: {e}")
    else:
        print("Folder not found")
else:
    print("Cannot test without mutagen")
