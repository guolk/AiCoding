import os
import json
from datetime import datetime
from pathlib import Path


class Version:
    def __init__(self, version_id, content, timestamp=None, name=None):
        self.id = version_id
        self.content = content
        self.timestamp = timestamp or datetime.now()
        self.name = name or self._generate_name()
        
    def _generate_name(self):
        return self.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'name': self.name
        }
        
    @classmethod
    def from_dict(cls, data):
        return cls(
            version_id=data['id'],
            content=data['content'],
            timestamp=datetime.fromisoformat(data['timestamp']),
            name=data.get('name')
        )


class VersionManager:
    def __init__(self, max_versions=20):
        self.max_versions = max_versions
        self._versions = {}
        self._current_file = None
        self._data_dir = self._get_data_dir()
        
    def _get_data_dir(self):
        app_data = Path.home() / '.markdown_editor' / 'versions'
        app_data.mkdir(parents=True, exist_ok=True)
        return app_data
        
    def set_current_file(self, file_path):
        self._current_file = file_path
        if file_path:
            self._load_versions(file_path)
            
    def _get_versions_file(self, source_file):
        if not source_file:
            return None
        source_path = Path(source_file)
        filename = source_path.stem + '_versions.json'
        return self._data_dir / filename
        
    def _load_versions(self, source_file):
        versions_file = self._get_versions_file(source_file)
        if not versions_file or not versions_file.exists():
            self._versions = {}
            return
            
        try:
            with open(versions_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            self._versions = {}
            for version_data in data.get('versions', []):
                version = Version.from_dict(version_data)
                self._versions[version.id] = version
        except Exception:
            self._versions = {}
            
    def _save_versions(self, source_file):
        if not source_file:
            return
            
        versions_file = self._get_versions_file(source_file)
        if not versions_file:
            return
            
        sorted_versions = sorted(
            self._versions.values(),
            key=lambda v: v.timestamp,
            reverse=True
        )
        
        if len(sorted_versions) > self.max_versions:
            sorted_versions = sorted_versions[:self.max_versions]
            self._versions = {v.id: v for v in sorted_versions}
            
        data = {
            'source_file': source_file,
            'versions': [v.to_dict() for v in sorted_versions]
        }
        
        try:
            with open(versions_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception:
            pass
            
    def save_version(self, content, name=None):
        if not self._current_file:
            return None
            
        version_id = datetime.now().strftime("%Y%m%d%H%M%S%f")
        version = Version(
            version_id=version_id,
            content=content,
            name=name
        )
        
        self._versions[version_id] = version
        self._save_versions(self._current_file)
        
        return version.name
        
    def get_versions(self):
        sorted_versions = sorted(
            self._versions.values(),
            key=lambda v: v.timestamp,
            reverse=True
        )
        return sorted_versions
        
    def get_version(self, version_id):
        return self._versions.get(version_id)
        
    def delete_version(self, version_id):
        if version_id in self._versions:
            del self._versions[version_id]
            if self._current_file:
                self._save_versions(self._current_file)
            return True
        return False
        
    def clear_versions(self):
        if self._current_file:
            versions_file = self._get_versions_file(self._current_file)
            if versions_file and versions_file.exists():
                versions_file.unlink()
        self._versions = {}
        
    def rename_version(self, version_id, new_name):
        if version_id in self._versions:
            self._versions[version_id].name = new_name
            if self._current_file:
                self._save_versions(self._current_file)
            return True
        return False
