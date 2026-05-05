const CONFIG = {
    canvas: {
        width: 1200,
        height: 800,
        padding: 50
    },
    
    staff: {
        width: 1000,
        spacing: 120,
        systemSpacing: 150,
        paddingLeft: 50,
        paddingTop: 50
    },
    
    notes: {
        durations: ['w', 'h', 'q', '8', '16'],
        defaultDuration: 'q',
        accidentalTypes: ['sharp', 'flat', 'natural'],
        defaultAccidental: 'natural'
    },
    
    keys: {
        C: { key: 'C', clef: 'treble' },
        G: { key: 'G', clef: 'treble' },
        D: { key: 'D', clef: 'treble' },
        F: { key: 'F', clef: 'treble' },
        Bb: { key: 'Bb', clef: 'treble' },
        Am: { key: 'Am', clef: 'treble' },
        Em: { key: 'Em', clef: 'treble' }
    },
    
    timeSignatures: {
        '4/4': { num_beats: 4, beat_value: 4 },
        '3/4': { num_beats: 3, beat_value: 4 },
        '2/4': { num_beats: 2, beat_value: 4 },
        '6/8': { num_beats: 6, beat_value: 8 }
    },
    
    playback: {
        defaultTempo: 120,
        minTempo: 40,
        maxTempo: 200,
        defaultInstrument: 'piano',
        instruments: ['piano', 'synth', 'amSynth', 'fmSynth']
    },
    
    tracks: {
        maxTracks: 4,
        defaultVolume: 0.7,
        defaultMuted: false
    },
    
    api: {
        baseUrl: '/api',
        endpoints: {
            save: '/save',
            load: '/load',
            list: '/list',
            delete: '/delete',
            exportPng: '/export/png'
        }
    },
    
    vexflow: {
        clef: 'treble',
        defaultKeySignature: 'C',
        defaultTimeSignature: '4/4'
    },
    
    noteNames: {
        treble: {
            notes: [
                'F6', 'E6', 'D6', 'C6', 'B5', 'A5', 'G5',
                'F5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4',
                'D4', 'C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3'
            ],
            centerLineIndex: 11
        },
        bass: {
            notes: [
                'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3',
                'A3', 'G3', 'F3', 'E3', 'D3', 'C3', 'B2', 'A2', 'G2',
                'F2', 'E2', 'D2', 'C2', 'B1', 'A1', 'G1', 'F1', 'E1'
            ],
            centerLineIndex: 11
        }
    },
    
    pianoKeys: {
        C4: 60, Csharp4: 61, D4: 62, Dsharp4: 63, E4: 64, F4: 65,
        Fsharp4: 66, G4: 67, Gsharp4: 68, A4: 69, Asharp4: 70, B4: 71,
        C5: 72, Csharp5: 73, D5: 74, Dsharp5: 75, E5: 76, F5: 77,
        Fsharp5: 78, G5: 79, Gsharp5: 80, A5: 81, Asharp5: 82, B5: 83,
        C6: 84
    },
    
    durationValues: {
        w: 1,
        h: 0.5,
        q: 0.25,
        '8': 0.125,
        '16': 0.0625
    },
    
    vexflowDurations: {
        w: 'w',
        h: 'h',
        q: 'q',
        '8': '8',
        '16': '16'
    }
};
