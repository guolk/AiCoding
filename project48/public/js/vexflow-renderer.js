class VexFlowRenderer {
    constructor(canvasId, scoreModel) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found`);
        }
        
        this.scoreModel = scoreModel;
        this.ctx = this.canvas.getContext('2d');
        
        this.staveWidth = 250;
        this.staveHeight = 80;
        this.lineSpacing = 12;
        this.topPadding = 50;
        this.leftPadding = 50;
        this.systemSpacing = 160;
        
        this.noteElements = new Map();
        this.staveElements = [];
        this.selectedNoteId = null;
        
        this.noteHeadWidth = 18;
        this.noteHeadHeight = 12;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.noteElements.clear();
        this.staveElements = [];
    }

    render() {
        this.clear();
        
        try {
            const totalMeasures = this.scoreModel.getTotalMeasures();
            
            if (totalMeasures === 0) {
                this.renderEmptyScore();
                return;
            }

            this.renderScoreWithNotes();
        } catch (error) {
            console.error('Render error:', error);
            this.renderEmptyScore();
        }
    }

    renderEmptyScore() {
        this.drawStaveSystem(0, 0, true);
    }

    drawStaveSystem(systemIndex, startMeasure, showClefKeyTime = true) {
        const trackCount = this.scoreModel.tracks.length;
        const systemY = this.topPadding + systemIndex * this.systemSpacing * trackCount;
        
        for (let trackIndex = 0; trackIndex < trackCount; trackIndex++) {
            const track = this.scoreModel.tracks[trackIndex];
            const trackY = systemY + trackIndex * 120;
            
            const availableWidth = this.canvas.width - this.leftPadding - 50;
            const measuresPerSystem = Math.max(1, Math.floor(availableWidth / this.staveWidth));
            const endMeasure = Math.min(startMeasure + measuresPerSystem, this.scoreModel.getTotalMeasures());
            
            let currentX = this.leftPadding;
            
            for (let measureIndex = startMeasure; measureIndex < endMeasure; measureIndex++) {
                const isFirstMeasure = measureIndex === 0;
                const isFirstInSystem = currentX === this.leftPadding;
                
                this.drawSingleMeasure(
                    track, 
                    measureIndex, 
                    currentX, 
                    trackY, 
                    isFirstMeasure && isFirstInSystem && showClefKeyTime,
                    isFirstInSystem && showClefKeyTime
                );
                currentX += this.staveWidth;
            }
            
            return endMeasure;
        }
        
        return startMeasure + 1;
    }

    drawSingleMeasure(track, measureIndex, x, y, showClef, showKeyTime) {
        this.ctx.save();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = 'black';
        
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + i * this.lineSpacing);
            this.ctx.lineTo(x + this.staveWidth, y + i * this.lineSpacing);
            this.ctx.stroke();
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 5);
        this.ctx.lineTo(x, y + 53);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        if (showClef) {
            this.ctx.font = '32px serif';
            this.ctx.fillText('𝄞', x - 8, y + 38);
        }
        
        if (showKeyTime) {
            const keyX = showClef ? x + 40 : x + 10;
            
            const keySig = this.scoreModel.keySignature;
            const sharps = this.getKeySignatureSharps(keySig);
            const flats = this.getKeySignatureFlats(keySig);
            
            this.ctx.font = '16px serif';
            for (let i = 0; i < sharps; i++) {
                const yPos = y + this.getAccidentalYPosition(i, 'sharp');
                this.ctx.fillText('♯', keyX + i * 12, yPos);
            }
            for (let i = 0; i < flats; i++) {
                const yPos = y + this.getAccidentalYPosition(i, 'flat');
                this.ctx.fillText('♭', keyX + i * 12, yPos);
            }
            
            const timeX = keyX + Math.max(sharps, flats) * 12 + 20;
            const [numBeats, beatValue] = this.scoreModel.timeSignature.split('/');
            
            this.ctx.font = 'bold 20px sans-serif';
            this.ctx.fillText(numBeats, timeX, y + 28);
            this.ctx.fillText(beatValue, timeX, y + 48);
        }
        
        const endX = x + this.staveWidth;
        
        this.ctx.beginPath();
        this.ctx.moveTo(endX, y - 5);
        this.ctx.lineTo(endX, y + 53);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        if ((measureIndex + 1) % 4 === 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(endX - 4, y - 5);
            this.ctx.lineTo(endX - 4, y + 53);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        const staveElement = {
            stave: null,
            trackId: track.id,
            measureIndex: measureIndex,
            x: x,
            y: y,
            width: this.staveWidth,
            height: 120,
            lineSpacing: this.lineSpacing,
            staffTop: y,
            notesStartX: x + 60
        };
        
        this.staveElements.push(staveElement);
        
        const measure = track.measures[measureIndex];
        if (measure && measure.notes && measure.notes.length > 0) {
            this.renderMeasureNotes(track, measureIndex, staveElement, measure.notes);
        }
    }

    getKeySignatureSharps(keySig) {
        const sharpKeys = {
            'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5,
            'Em': 1, 'Bm': 2, 'F#m': 3, 'C#m': 4
        };
        return sharpKeys[keySig] || 0;
    }

    getKeySignatureFlats(keySig) {
        const flatKeys = {
            'F': 1, 'Bb': 2, 'Eb': 3, 'Ab': 4, 'Db': 5,
            'Dm': 1, 'Gm': 2, 'Cm': 3
        };
        return flatKeys[keySig] || 0;
    }

    getAccidentalYPosition(index, type) {
        const sharpPositions = [20, 12, 32, 8, 28, 4, 24];
        const flatPositions = [28, 40, 20, 32, 12, 24, 8];
        return type === 'sharp' ? sharpPositions[index] || 20 : flatPositions[index] || 28;
    }

    renderScoreWithNotes() {
        const totalMeasures = this.scoreModel.getTotalMeasures();
        const availableWidth = this.canvas.width - this.leftPadding - 50;
        const measuresPerSystem = Math.max(1, Math.floor(availableWidth / this.staveWidth));
        
        let currentMeasure = 0;
        let systemIndex = 0;
        
        while (currentMeasure < totalMeasures) {
            const endMeasure = this.drawStaveSystem(systemIndex, currentMeasure, true);
            currentMeasure = endMeasure;
            systemIndex++;
        }
    }

    renderMeasureNotes(track, measureIndex, staveElement, notes) {
        if (!notes || notes.length === 0) return;
        
        const [numBeats, beatValue] = this.scoreModel.timeSignature.split('/').map(Number);
        const totalBeats = numBeats;
        
        const beatWidth = (this.staveWidth - 80) / totalBeats;
        let currentBeat = 0;
        
        for (const note of notes) {
            const noteDuration = this.getDurationBeats(note.duration);
            const noteX = staveElement.notesStartX + currentBeat * beatWidth + beatWidth * noteDuration / 2;
            
            const noteY = this.getNoteYPosition(note.noteName, staveElement.staffTop);
            
            this.drawNote(note, noteX, noteY, staveElement);
            
            this.noteElements.set(note.id, {
                note: null,
                trackId: track.id,
                measureIndex: measureIndex,
                noteData: note,
                stave: staveElement,
                x: noteX,
                y: noteY,
                width: this.noteHeadWidth,
                height: this.lineSpacing
            });
            
            currentBeat += noteDuration;
            
            if (currentBeat >= totalBeats) {
                break;
            }
        }
        
        if (this.selectedNoteId) {
            this.renderSelectionHighlight();
        }
    }

    getDurationBeats(duration) {
        const beatValues = {
            'w': 4,
            'h': 2,
            'q': 1,
            '8': 0.5,
            '16': 0.25
        };
        return beatValues[duration] || 1;
    }

    getNoteYPosition(noteName, staffTop) {
        const noteIndex = this.getNoteIndex(noteName);
        const baseY = staffTop + 4 * this.lineSpacing;
        return baseY - noteIndex * (this.lineSpacing / 2);
    }

    getNoteIndex(noteName) {
        const note = noteName.match(/([A-Ga-g])([#b]?)(\d+)/);
        if (!note) return 0;
        
        const noteLetter = note[1].toUpperCase();
        const octave = parseInt(note[3]);
        
        const noteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const letterIndex = noteLetters.indexOf(noteLetter);
        
        return (octave - 4) * 7 + letterIndex;
    }

    drawNote(note, x, y, staveElement) {
        this.ctx.save();
        
        const isRest = note.isRest;
        const duration = note.duration;
        
        if (isRest) {
            this.ctx.font = '20px serif';
            const restSymbol = this.getRestSymbol(duration);
            this.ctx.fillText(restSymbol, x - 10, y);
        } else {
            const stemUp = this.getNoteIndex(note.noteName) < 0;
            
            this.ctx.fillStyle = 'black';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            
            if (duration === 'w') {
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, this.noteHeadWidth / 2, this.noteHeadHeight / 2, -0.5, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (duration === 'h') {
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, this.noteHeadWidth / 2, this.noteHeadHeight / 2, -0.5, 0, Math.PI * 2);
                this.ctx.stroke();
                this.drawStem(x, y, stemUp, duration);
            } else {
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, this.noteHeadWidth / 2, this.noteHeadHeight / 2, -0.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.drawStem(x, y, stemUp, duration);
            }
            
            if (note.accidental && note.accidental !== 'natural') {
                this.ctx.font = '14px serif';
                const accidental = note.accidental === 'sharp' ? '♯' : '♭';
                this.ctx.fillText(accidental, x - 24, y + 4);
            }
            
            this.drawLedgerLines(note, x, y, staveElement);
        }
        
        this.ctx.restore();
    }

    getRestSymbol(duration) {
        const symbols = {
            'w': '𝅝',
            'h': '𝅗𝅥',
            'q': '𝅘𝅥',
            '8': '𝅘𝅥𝅮',
            '16': '𝅘𝅥𝅯'
        };
        return symbols[duration] || '𝅘𝅥';
    }

    drawStem(x, y, stemUp, duration) {
        const stemHeight = 35;
        const stemX = stemUp ? x + this.noteHeadWidth / 2 - 1 : x - this.noteHeadWidth / 2 + 1;
        const stemStartY = stemUp ? y - this.noteHeadHeight / 2 : y + this.noteHeadHeight / 2;
        const stemEndY = stemUp ? y - stemHeight : y + stemHeight;
        
        this.ctx.beginPath();
        this.ctx.moveTo(stemX, stemStartY);
        this.ctx.lineTo(stemX, stemEndY);
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        if (duration === '8' || duration === '16') {
            this.ctx.lineWidth = 4;
            if (stemUp) {
                this.ctx.beginPath();
                this.ctx.moveTo(stemX, y - stemHeight);
                this.ctx.lineTo(stemX + 15, y - stemHeight);
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.moveTo(stemX, y + stemHeight);
                this.ctx.lineTo(stemX - 15, y + stemHeight);
                this.ctx.stroke();
            }
        }
    }

    drawLedgerLines(note, x, y, staveElement) {
        const noteIndex = this.getNoteIndex(note.noteName);
        const staffTop = staveElement.staffTop;
        const staffBottom = staffTop + 4 * this.lineSpacing;
        
        if (y < staffTop - this.lineSpacing) {
            let ledgerY = staffTop - this.lineSpacing;
            while (ledgerY >= y - this.lineSpacing) {
                this.ctx.beginPath();
                this.ctx.moveTo(x - this.noteHeadWidth, ledgerY);
                this.ctx.lineTo(x + this.noteHeadWidth, ledgerY);
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                ledgerY -= this.lineSpacing;
            }
        }
        
        if (y > staffBottom + this.lineSpacing) {
            let ledgerY = staffBottom + this.lineSpacing;
            while (ledgerY <= y + this.lineSpacing) {
                this.ctx.beginPath();
                this.ctx.moveTo(x - this.noteHeadWidth, ledgerY);
                this.ctx.lineTo(x + this.noteHeadWidth, ledgerY);
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                ledgerY += this.lineSpacing;
            }
        }
    }

    renderSelectionHighlight() {
        if (!this.selectedNoteId) return;
        
        const noteElement = this.noteElements.get(this.selectedNoteId);
        if (!noteElement) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(
            noteElement.x - this.noteHeadWidth,
            noteElement.y - this.lineSpacing,
            this.noteHeadWidth * 2.5,
            this.lineSpacing * 2
        );
        this.ctx.restore();
    }

    setSelectedNote(noteId) {
        this.selectedNoteId = noteId;
        this.render();
    }

    getNoteAtPosition(x, y) {
        for (const [noteId, noteElement] of this.noteElements.entries()) {
            const noteX = noteElement.x;
            const noteY = noteElement.y;
            
            if (x >= noteX - this.noteHeadWidth && 
                x <= noteX + this.noteHeadWidth &&
                y >= noteY - this.lineSpacing && 
                y <= noteY + this.lineSpacing) {
                return noteElement;
            }
        }
        return null;
    }

    getStaffPosition(x, y) {
        for (const staveElement of this.staveElements) {
            const track = this.scoreModel.getTrack(staveElement.trackId);
            if (!track) continue;
            
            if (x >= staveElement.x && x <= staveElement.x + staveElement.width &&
                y >= staveElement.y - 20 && y <= staveElement.y + staveElement.height) {
                
                const relativeY = y - staveElement.staffTop;
                const lineIndex = Math.round((relativeY - 4 * this.lineSpacing) / (this.lineSpacing / 2));
                
                const noteName = this.lineIndexToNoteName(lineIndex, track.clef);
                
                return {
                    trackId: staveElement.trackId,
                    measureIndex: staveElement.measureIndex,
                    noteName: noteName,
                    lineIndex: lineIndex,
                    x: x,
                    y: y
                };
            }
        }
        
        return null;
    }

    lineIndexToNoteName(lineIndex, clef = 'treble') {
        const noteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        let baseOctave = 4;
        let baseIndex = 0;
        
        if (clef === 'treble') {
            baseOctave = 4;
            baseIndex = 7;
        } else if (clef === 'bass') {
            baseOctave = 2;
            baseIndex = 7;
        }
        
        const totalIndex = baseIndex + lineIndex;
        const octaveOffset = Math.floor(totalIndex / 7);
        const letterIndex = ((totalIndex % 7) + 7) % 7;
        
        const octave = baseOctave + octaveOffset;
        return noteLetters[letterIndex] + octave;
    }

    exportToPNG() {
        return this.canvas.toDataURL('image/png');
    }
}
