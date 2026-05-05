const Utils = {
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },

    noteNameToMidi(noteName) {
        const noteMap = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11
        };
        
        const match = noteName.match(/([A-Ga-g])([#b]?)(\d+)/);
        if (!match) return null;
        
        const note = match[1].toUpperCase();
        const accidental = match[2];
        const octave = parseInt(match[3]);
        
        let noteValue = noteMap[note + accidental] || noteMap[note];
        if (noteValue === undefined) return null;
        
        return noteValue + (octave + 1) * 12;
    },

    midiToNoteName(midiNote, preferSharp = true) {
        const notes = preferSharp 
            ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        
        const octave = Math.floor(midiNote / 12) - 1;
        const noteIndex = midiNote % 12;
        
        return notes[noteIndex] + octave;
    },

    vexflowNoteToMidi(vexflowNote) {
        const noteMap = {
            'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11
        };
        
        const accidentalMap = {
            '#': 1, '##': 2, 'n': 0, 'b': -1, 'bb': -2
        };
        
        let note = vexflowNote.toLowerCase();
        let accidental = 0;
        let octave = 4;
        
        const accidentalMatch = note.match(/([#bn]+)/);
        if (accidentalMatch) {
            accidental = accidentalMap[accidentalMatch[1]] || 0;
            note = note.replace(accidentalMatch[1], '');
        }
        
        const octaveMatch = note.match(/(\d+)/);
        if (octaveMatch) {
            octave = parseInt(octaveMatch[1]);
            note = note.replace(octaveMatch[1], '');
        }
        
        const noteValue = noteMap[note];
        if (noteValue === undefined) return null;
        
        return noteValue + accidental + (octave + 1) * 12;
    },

    durationToTicks(duration, timeSignature = '4/4') {
        const [numBeats, beatValue] = timeSignature.split('/').map(Number);
        const ticksPerBeat = 480;
        
        const durationMap = {
            'w': 4 * ticksPerBeat,
            'h': 2 * ticksPerBeat,
            'q': 1 * ticksPerBeat,
            '8': 0.5 * ticksPerBeat,
            '16': 0.25 * ticksPerBeat
        };
        
        return durationMap[duration] || durationMap['q'];
    },

    ticksToDuration(ticks) {
        const ticksPerBeat = 480;
        const durations = [
            { name: 'w', ticks: 4 * ticksPerBeat },
            { name: 'h', ticks: 2 * ticksPerBeat },
            { name: 'q', ticks: 1 * ticksPerBeat },
            { name: '8', ticks: 0.5 * ticksPerBeat },
            { name: '16', ticks: 0.25 * ticksPerBeat }
        ];
        
        for (const dur of durations) {
            if (Math.abs(ticks - dur.ticks) < 10) {
                return dur.name;
            }
        }
        return 'q';
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    getBoundingBox(element) {
        const rect = element.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
            right: rect.right + window.scrollX,
            bottom: rect.bottom + window.scrollY
        };
    },

    pixelToNotePosition(y, staffTop, lineSpacing = 10) {
        const relativeY = y - staffTop;
        const lineIndex = Math.round(relativeY / lineSpacing);
        return lineIndex;
    },

    lineIndexToNoteName(lineIndex, clef = 'treble') {
        const noteConfig = CONFIG.noteNames[clef];
        if (!noteConfig) return 'B4';
        
        const centerIndex = noteConfig.centerLineIndex || 11;
        const notes = noteConfig.notes;
        
        const targetIndex = centerIndex + lineIndex;
        
        if (targetIndex >= 0 && targetIndex < notes.length) {
            return notes[targetIndex];
        }
        
        if (targetIndex < 0) {
            const firstNote = notes[0];
            const octave = parseInt(firstNote.match(/\d+/)?.[0] || '4');
            const noteLetter = firstNote.match(/[A-Ga-g]/)?.[0] || 'F';
            const octavesAbove = Math.ceil(Math.abs(targetIndex) / 7);
            const noteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            const currentNoteIndex = noteLetters.indexOf(noteLetter);
            const newNoteIndex = (currentNoteIndex - Math.abs(targetIndex) % 7 + 7) % 7;
            return noteLetters[newNoteIndex] + (octave + octavesAbove);
        }
        
        const lastNote = notes[notes.length - 1];
        const octave = parseInt(lastNote.match(/\d+/)?.[0] || '4');
        const noteLetter = lastNote.match(/[A-Ga-g]/)?.[0] || 'C';
        const octavesBelow = Math.ceil((targetIndex - notes.length + 1) / 7);
        const noteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const currentNoteIndex = noteLetters.indexOf(noteLetter);
        const newNoteIndex = (currentNoteIndex + (targetIndex - notes.length + 1) % 7) % 7;
        return noteLetters[newNoteIndex] + (octave - octavesBelow);
    },

    noteNameToLineIndex(noteName, clef = 'treble') {
        const noteConfig = CONFIG.noteNames[clef];
        if (!noteConfig) return 0;
        
        const centerIndex = noteConfig.centerLineIndex || 11;
        const notes = noteConfig.notes;
        
        const index = notes.indexOf(noteName);
        if (index !== -1) {
            return index - centerIndex;
        }
        
        return 0;
    },

    exportToSVG(canvasElement) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', canvasElement.width);
        svg.setAttribute('height', canvasElement.height);
        svg.setAttribute('xmlns', svgNS);
        
        const image = document.createElementNS(svgNS, 'image');
        image.setAttribute('width', canvasElement.width);
        image.setAttribute('height', canvasElement.height);
        image.setAttribute('href', canvasElement.toDataURL('image/png'));
        svg.appendChild(image);
        
        return svg.outerHTML;
    },

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
