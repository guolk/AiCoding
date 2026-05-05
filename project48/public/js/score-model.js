class ScoreModel {
    constructor() {
        this.id = null;
        this.title = '我的乐谱';
        this.keySignature = 'C';
        this.timeSignature = '4/4';
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        this.initDefaultTrack();
    }

    initDefaultTrack() {
        this.addTrack('高音谱号', 'treble');
    }

    addTrack(name = '新轨道', clef = 'treble') {
        if (this.tracks.length >= CONFIG.tracks.maxTracks) {
            console.warn('已达到最大轨道数限制');
            return false;
        }

        const track = {
            id: Utils.generateId(),
            name: name || `轨道 ${this.tracks.length + 1}`,
            clef: clef,
            measures: [],
            volume: CONFIG.tracks.defaultVolume,
            muted: CONFIG.tracks.defaultMuted,
            instrument: CONFIG.playback.defaultInstrument
        };

        this.tracks.push(track);
        this.saveState();
        return track;
    }

    removeTrack(trackId) {
        const index = this.tracks.findIndex(t => t.id === trackId);
        if (index === -1) return false;
        if (this.tracks.length <= 1) return false;

        this.tracks.splice(index, 1);
        if (this.currentTrackIndex >= this.tracks.length) {
            this.currentTrackIndex = this.tracks.length - 1;
        }
        this.saveState();
        return true;
    }

    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }

    setCurrentTrack(trackId) {
        const index = this.tracks.findIndex(t => t.id === trackId);
        if (index !== -1) {
            this.currentTrackIndex = index;
            return true;
        }
        return false;
    }

    getTrack(trackId) {
        return this.tracks.find(t => t.id === trackId);
    }

    addMeasure(trackId = null) {
        const track = trackId ? this.getTrack(trackId) : this.getCurrentTrack();
        if (!track) return null;

        const measure = {
            id: Utils.generateId(),
            notes: [],
            isNew: true
        };

        track.measures.push(measure);
        this.saveState();
        return measure;
    }

    getOrCreateMeasure(trackId, measureIndex) {
        const track = this.getTrack(trackId);
        if (!track) return null;

        while (track.measures.length <= measureIndex) {
            this.addMeasure(trackId);
        }

        return track.measures[measureIndex];
    }

    addNote(noteData) {
        const {
            trackId,
            measureIndex,
            noteName,
            duration,
            accidental = 'natural',
            isRest = false,
            dots = 0,
            tieStart = false,
            tieEnd = false
        } = noteData;

        const track = this.getTrack(trackId) || this.getCurrentTrack();
        if (!track) return null;

        const measure = this.getOrCreateMeasure(track.id, measureIndex);
        if (!measure) return null;

        const note = {
            id: Utils.generateId(),
            noteName: noteName,
            duration: duration || 'q',
            accidental: accidental,
            isRest: isRest,
            dots: dots,
            tieStart: tieStart,
            tieEnd: tieEnd,
            measureIndex: measureIndex,
            trackId: track.id,
            position: measure.notes.length
        };

        measure.notes.push(note);
        this.saveState();
        return note;
    }

    updateNote(noteId, updates) {
        for (const track of this.tracks) {
            for (const measure of track.measures) {
                const noteIndex = measure.notes.findIndex(n => n.id === noteId);
                if (noteIndex !== -1) {
                    measure.notes[noteIndex] = {
                        ...measure.notes[noteIndex],
                        ...updates
                    };
                    this.saveState();
                    return measure.notes[noteIndex];
                }
            }
        }
        return null;
    }

    deleteNote(noteId) {
        for (const track of this.tracks) {
            for (const measure of track.measures) {
                const noteIndex = measure.notes.findIndex(n => n.id === noteId);
                if (noteIndex !== -1) {
                    measure.notes.splice(noteIndex, 1);
                    this.saveState();
                    return true;
                }
            }
        }
        return false;
    }

    getNote(noteId) {
        for (const track of this.tracks) {
            for (const measure of track.measures) {
                const note = measure.notes.find(n => n.id === noteId);
                if (note) return note;
            }
        }
        return null;
    }

    clearAll() {
        for (const track of this.tracks) {
            track.measures = [];
        }
        this.saveState();
    }

    clearTrack(trackId) {
        const track = this.getTrack(trackId);
        if (track) {
            track.measures = [];
            this.saveState();
            return true;
        }
        return false;
    }

    saveState() {
        const state = this.toJSON();
        
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(state);
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex = this.history.length - 1;
        }
    }

    undo() {
        if (this.historyIndex <= 0) return false;
        
        this.historyIndex--;
        const state = this.history[this.historyIndex];
        this.fromJSON(state);
        return true;
    }

    redo() {
        if (this.historyIndex >= this.history.length - 1) return false;
        
        this.historyIndex++;
        const state = this.history[this.historyIndex];
        this.fromJSON(state);
        return true;
    }

    canUndo() {
        return this.historyIndex > 0;
    }

    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    getTotalMeasures() {
        let maxMeasures = 0;
        for (const track of this.tracks) {
            maxMeasures = Math.max(maxMeasures, track.measures.length);
        }
        return maxMeasures || 1;
    }

    getMeasureDuration(measure) {
        let totalTicks = 0;
        for (const note of measure.notes) {
            totalTicks += Utils.durationToTicks(note.duration, this.timeSignature);
        }
        return totalTicks;
    }

    getMaxMeasureDuration() {
        const [numBeats, beatValue] = this.timeSignature.split('/').map(Number);
        const ticksPerBeat = 480;
        return numBeats * ticksPerBeat;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            keySignature: this.keySignature,
            timeSignature: this.timeSignature,
            tracks: Utils.deepClone(this.tracks),
            currentTrackIndex: this.currentTrackIndex
        };
    }

    fromJSON(data) {
        if (data.id) this.id = data.id;
        if (data.title) this.title = data.title;
        if (data.keySignature) this.keySignature = data.keySignature;
        if (data.timeSignature) this.timeSignature = data.timeSignature;
        if (data.tracks) this.tracks = Utils.deepClone(data.tracks);
        if (typeof data.currentTrackIndex === 'number') {
            this.currentTrackIndex = Math.min(data.currentTrackIndex, this.tracks.length - 1);
        }
    }

    toMusicXML() {
        const xmlParts = [];
        xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlParts.push('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">');
        xmlParts.push('<score-partwise version="3.1">');
        xmlParts.push(`  <work><work-title>${this.escapeXml(this.title)}</work-title></work>`);
        
        xmlParts.push('  <part-list>');
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i];
            xmlParts.push(`    <score-part id="P${i + 1}">`);
            xmlParts.push(`      <part-name>${this.escapeXml(track.name)}</part-name>`);
            xmlParts.push('    </score-part>');
        }
        xmlParts.push('  </part-list>');

        for (let trackIndex = 0; trackIndex < this.tracks.length; trackIndex++) {
            const track = this.tracks[trackIndex];
            xmlParts.push(`  <part id="P${trackIndex + 1}">`);
            
            const totalMeasures = this.getTotalMeasures();
            
            for (let measureIndex = 0; measureIndex < totalMeasures; measureIndex++) {
                xmlParts.push(`    <measure number="${measureIndex + 1}">`);
                
                if (measureIndex === 0) {
                    xmlParts.push('      <attributes>');
                    xmlParts.push(`        <divisions>480</divisions>`);
                    
                    const [numBeats, beatValue] = this.timeSignature.split('/').map(Number);
                    xmlParts.push('        <time>');
                    xmlParts.push(`          <beats>${numBeats}</beats>`);
                    xmlParts.push(`          <beat-type>${beatValue}</beat-type>`);
                    xmlParts.push('        </time>');
                    
                    const keyFifths = this.getKeyFifths(this.keySignature);
                    xmlParts.push(`        <key><fifths>${keyFifths}</fifths></key>`);
                    
                    xmlParts.push(`        <clef><sign>${track.clef === 'bass' ? 'F' : 'G'}</sign><line>${track.clef === 'bass' ? '4' : '2'}</line></clef>`);
                    xmlParts.push('      </attributes>');
                }

                const measure = track.measures[measureIndex];
                if (measure && measure.notes) {
                    for (const note of measure.notes) {
                        xmlParts.push(this.noteToMusicXML(note));
                    }
                }
                
                xmlParts.push('    </measure>');
            }
            
            xmlParts.push('  </part>');
        }

        xmlParts.push('</score-partwise>');
        return xmlParts.join('\n');
    }

    noteToMusicXML(note) {
        const xmlParts = [];
        xmlParts.push('      <note>');
        
        if (note.isRest) {
            xmlParts.push('        <rest/>');
        } else {
            const noteInfo = this.parseNoteName(note.noteName);
            xmlParts.push(`        <pitch>`);
            xmlParts.push(`          <step>${noteInfo.step}</step>`);
            if (noteInfo.alter !== 0) {
                xmlParts.push(`          <alter>${noteInfo.alter}</alter>`);
            }
            xmlParts.push(`          <octave>${noteInfo.octave}</octave>`);
            xmlParts.push('        </pitch>');
            
            if (note.accidental === 'sharp') {
                xmlParts.push('        <accidental>sharp</accidental>');
            } else if (note.accidental === 'flat') {
                xmlParts.push('        <accidental>flat</accidental>');
            }
        }

        const durationMap = {
            'w': 1920,
            'h': 960,
            'q': 480,
            '8': 240,
            '16': 120
        };
        xmlParts.push(`        <duration>${durationMap[note.duration] || 480}</duration>`);
        
        const typeMap = {
            'w': 'whole',
            'h': 'half',
            'q': 'quarter',
            '8': 'eighth',
            '16': '16th'
        };
        xmlParts.push(`        <type>${typeMap[note.duration] || 'quarter'}</type>`);

        if (note.tieStart) {
            xmlParts.push('        <tie type="start"/>');
        }
        if (note.tieEnd) {
            xmlParts.push('        <tie type="stop"/>');
        }

        if (note.dots > 0) {
            for (let i = 0; i < note.dots; i++) {
                xmlParts.push('        <dot/>');
            }
        }

        xmlParts.push('      </note>');
        return xmlParts.join('\n');
    }

    parseNoteName(noteName) {
        const match = noteName.match(/([A-Ga-g])([#b]?)(\d+)/);
        if (!match) {
            return { step: 'C', alter: 0, octave: 4 };
        }

        const step = match[1].toUpperCase();
        const accidental = match[2];
        const octave = parseInt(match[3]);

        let alter = 0;
        if (accidental === '#') alter = 1;
        else if (accidental === 'b') alter = -1;

        return { step, alter, octave };
    }

    getKeyFifths(keySignature) {
        const keyMap = {
            'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5,
            'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5,
            'Am': 0, 'Em': 1, 'Bm': 2, 'F#m': 3, 'C#m': 4,
            'Dm': -1, 'Gm': -2, 'Cm': -3
        };
        return keyMap[keySignature] || 0;
    }

    escapeXml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
