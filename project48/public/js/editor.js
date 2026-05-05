class ScoreEditor {
    constructor(scoreModel, renderer, player) {
        this.scoreModel = scoreModel;
        this.renderer = renderer;
        this.player = player;
        
        this.canvas = document.getElementById('scoreCanvas');
        this.overlay = document.getElementById('clickOverlay');
        
        this.selectedDuration = 'q';
        this.selectedType = 'note';
        this.selectedAccidental = 'natural';
        this.selectedTie = 'none';
        
        this.selectedNoteId = null;
        this.isDragging = false;
        this.dragStartPos = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
            this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
            this.canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
            this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        }

        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDuration(e.target.dataset.duration);
                this.updateDurationButtons();
            });
        });

        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setType(e.target.dataset.type);
                this.updateTypeButtons();
            });
        });

        document.querySelectorAll('.accidental-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setAccidental(e.target.dataset.accidental);
                this.updateAccidentalButtons();
            });
        });

        document.querySelectorAll('.tie-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTie(e.target.dataset.tie);
                this.updateTieButtons();
            });
        });

        document.getElementById('playBtn')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('stopBtn')?.addEventListener('click', () => this.stopPlay());
        document.getElementById('tempoSlider')?.addEventListener('input', (e) => this.setTempo(parseInt(e.target.value)));
        document.getElementById('instrumentSelect')?.addEventListener('change', (e) => this.setInstrument(e.target.value));

        document.getElementById('deleteBtn')?.addEventListener('click', () => this.deleteSelected());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearAll());
        document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
        document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());

        document.getElementById('addTrackBtn')?.addEventListener('click', () => this.addTrack());

        document.getElementById('keySignature')?.addEventListener('change', (e) => {
            this.scoreModel.keySignature = e.target.value;
            this.render();
        });

        document.getElementById('timeSignature')?.addEventListener('change', (e) => {
            this.scoreModel.timeSignature = e.target.value;
            this.render();
        });

        document.getElementById('scoreTitle')?.addEventListener('change', (e) => {
            this.scoreModel.title = e.target.value;
        });

        this.updateAllButtons();
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedNote = this.renderer.getNoteAtPosition(x, y);
        if (clickedNote) {
            this.selectNote(clickedNote.noteData.id);
            this.player.playNote(clickedNote.noteData.noteName);
            return;
        }

        const staffPosition = this.renderer.getStaffPosition(x, y);
        if (staffPosition) {
            this.insertNote(staffPosition);
        }
    }

    handleCanvasMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const staffPosition = this.renderer.getStaffPosition(x, y);
        if (staffPosition) {
            this.updateCursorPosition(staffPosition);
        }
    }

    handleCanvasMouseDown(e) {
        if (e.button === 0) {
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            this.dragStartPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }

    handleCanvasMouseUp(e) {
        this.isDragging = false;
        this.dragStartPos = null;
    }

    handleContextMenu(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedNote = this.renderer.getNoteAtPosition(x, y);
        if (clickedNote) {
            this.selectNote(clickedNote.noteData.id);
            this.showContextMenu(e.clientX, e.clientY, clickedNote);
        }
    }

    showContextMenu(x, y, noteElement) {
        console.log('Context menu requested for:', noteElement);
    }

    insertNote(staffPosition) {
        const { trackId, measureIndex, noteName } = staffPosition;

        const noteData = {
            trackId: trackId,
            measureIndex: measureIndex,
            noteName: noteName,
            duration: this.selectedDuration,
            accidental: this.selectedAccidental,
            isRest: this.selectedType === 'rest',
            dots: 0,
            tieStart: this.selectedTie === 'start',
            tieEnd: this.selectedTie === 'end'
        };

        const note = this.scoreModel.addNote(noteData);
        
        if (note && !note.isRest) {
            this.player.playNote(note.noteName);
        }

        this.render();
        this.updateStatusBar();
    }

    selectNote(noteId) {
        this.selectedNoteId = noteId;
        this.renderer.setSelectedNote(noteId);
        this.updateStatusBar();
    }

    deleteSelected() {
        if (this.selectedNoteId) {
            this.scoreModel.deleteNote(this.selectedNoteId);
            this.selectedNoteId = null;
            this.render();
            this.updateStatusBar();
        }
    }

    clearAll() {
        if (confirm('确定要清空所有音符吗？')) {
            this.scoreModel.clearAll();
            this.selectedNoteId = null;
            this.render();
            this.updateStatusBar();
        }
    }

    undo() {
        if (this.scoreModel.undo()) {
            this.render();
            this.selectedNoteId = null;
            this.updateStatusBar();
        }
    }

    redo() {
        if (this.scoreModel.redo()) {
            this.render();
            this.selectedNoteId = null;
            this.updateStatusBar();
        }
    }

    setDuration(duration) {
        this.selectedDuration = duration;
    }

    setType(type) {
        this.selectedType = type;
    }

    setAccidental(accidental) {
        this.selectedAccidental = accidental;
    }

    setTie(tie) {
        this.selectedTie = tie;
    }

    setTempo(bpm) {
        this.player.setTempo(bpm);
        document.getElementById('tempoValue').textContent = bpm;
    }

    setInstrument(instrumentType) {
        const currentTrack = this.scoreModel.getCurrentTrack();
        if (currentTrack) {
            this.player.setTrackInstrument(currentTrack.id, instrumentType);
        }
    }

    togglePlay() {
        if (this.player.isPlaying) {
            this.stopPlay();
        } else {
            this.startPlay();
        }
    }

    async startPlay() {
        try {
            await this.player.start();
            document.getElementById('playBtn').textContent = '⏸ 暂停';
        } catch (error) {
            console.error('Playback error:', error);
        }
    }

    stopPlay() {
        this.player.stop();
        document.getElementById('playBtn').textContent = '▶ 播放';
    }

    addTrack() {
        if (this.scoreModel.tracks.length >= CONFIG.tracks.maxTracks) {
            alert(`最多只能添加 ${CONFIG.tracks.maxTracks} 个轨道`);
            return;
        }

        const trackName = prompt('输入轨道名称:', `轨道 ${this.scoreModel.tracks.length + 1}`);
        if (trackName === null) return;

        const track = this.scoreModel.addTrack(trackName || '新轨道', 'treble');
        if (track) {
            this.player.createTrackInstrument(track.id, this.player.currentInstrument);
            this.updateTrackList();
            this.render();
        }
    }

    removeTrack(trackId) {
        if (this.scoreModel.tracks.length <= 1) {
            alert('至少需要保留一个轨道');
            return;
        }

        if (confirm('确定要删除这个轨道吗？')) {
            this.scoreModel.removeTrack(trackId);
            this.updateTrackList();
            this.render();
        }
    }

    setCurrentTrack(trackId) {
        this.scoreModel.setCurrentTrack(trackId);
        this.updateTrackList();
        this.updateStatusBar();
    }

    setTrackVolume(trackId, volume) {
        this.player.setTrackVolume(trackId, volume);
        const track = this.scoreModel.getTrack(trackId);
        if (track) {
            track.volume = volume;
        }
    }

    setTrackMuted(trackId, muted) {
        this.player.setTrackMuted(trackId, muted);
        const track = this.scoreModel.getTrack(trackId);
        if (track) {
            track.muted = muted;
        }
    }

    updateTrackList() {
        const trackList = document.getElementById('trackList');
        if (!trackList) return;

        trackList.innerHTML = '';

        for (const track of this.scoreModel.tracks) {
            const trackItem = document.createElement('div');
            trackItem.className = `track-item ${track.id === this.scoreModel.getCurrentTrack()?.id ? 'active' : ''}`;
            
            trackItem.innerHTML = `
                <span class="track-name" data-track-id="${track.id}">${track.name}</span>
                <input type="range" class="track-volume" 
                    data-track-id="${track.id}" 
                    min="0" max="1" step="0.1" 
                    value="${track.volume || 0.7}">
                <button class="track-mute btn ${track.muted ? 'btn-danger' : 'btn-info'}" 
                    data-track-id="${track.id}">
                    ${track.muted ? '🔇' : '🔊'}
                </button>
            `;

            trackItem.querySelector('.track-name').addEventListener('click', () => {
                this.setCurrentTrack(track.id);
            });

            trackItem.querySelector('.track-volume').addEventListener('input', (e) => {
                this.setTrackVolume(track.id, parseFloat(e.target.value));
            });

            trackItem.querySelector('.track-mute').addEventListener('click', (e) => {
                const isMuted = !track.muted;
                this.setTrackMuted(track.id, isMuted);
                e.target.textContent = isMuted ? '🔇' : '🔊';
                e.target.className = `track-mute btn ${isMuted ? 'btn-danger' : 'btn-info'}`;
            });

            trackList.appendChild(trackItem);
        }
    }

    updateCursorPosition(staffPosition) {
        const cursorEl = document.getElementById('cursorPosition');
        if (cursorEl && staffPosition) {
            cursorEl.textContent = `位置: 小节 ${staffPosition.measureIndex + 1}, 音符 ${staffPosition.noteName}`;
        }
    }

    updateStatusBar() {
        const selectedEl = document.getElementById('selectedNote');
        const trackInfoEl = document.getElementById('trackInfo');

        if (selectedEl) {
            if (this.selectedNoteId) {
                const note = this.scoreModel.getNote(this.selectedNoteId);
                if (note) {
                    selectedEl.textContent = `选中: ${note.noteName} (${note.duration})`;
                }
            } else {
                selectedEl.textContent = '选中: 无';
            }
        }

        if (trackInfoEl) {
            const currentTrack = this.scoreModel.getCurrentTrack();
            if (currentTrack) {
                trackInfoEl.textContent = `当前轨道: ${currentTrack.name}`;
            }
        }
    }

    updateDurationButtons() {
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.duration === this.selectedDuration);
        });
    }

    updateTypeButtons() {
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === this.selectedType);
        });
    }

    updateAccidentalButtons() {
        document.querySelectorAll('.accidental-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.accidental === this.selectedAccidental);
        });
    }

    updateTieButtons() {
        document.querySelectorAll('.tie-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tie === this.selectedTie);
        });
    }

    updateAllButtons() {
        this.updateDurationButtons();
        this.updateTypeButtons();
        this.updateAccidentalButtons();
        this.updateTieButtons();
        this.updateTrackList();
        this.updateStatusBar();
    }

    render() {
        this.renderer.render();
    }

    resize(width, height) {
        this.renderer.resize(width, height);
        this.render();
    }
}
