class TonePlayer {
    constructor(scoreModel) {
        this.scoreModel = scoreModel;
        this.isPlaying = false;
        this.tempo = CONFIG.playback.defaultTempo;
        this.currentInstrument = CONFIG.playback.defaultInstrument;
        this.trackInstruments = new Map();
        this.scheduledEvents = [];
        this.currentTime = 0;
        this.playbackStart = 0;
        
        this.initInstruments();
    }

    initInstruments() {
        for (const track of this.scoreModel.tracks) {
            this.createTrackInstrument(track.id, track.instrument || this.currentInstrument);
        }
    }

    createTrackInstrument(trackId, instrumentType) {
        let instrument;
        
        switch (instrumentType) {
            case 'piano':
                instrument = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: 'triangle' },
                    envelope: {
                        attack: 0.02,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1
                    }
                });
                break;
                
            case 'synth':
                instrument = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: 'sine' },
                    envelope: {
                        attack: 0.05,
                        decay: 0.2,
                        sustain: 0.4,
                        release: 0.8
                    }
                });
                break;
                
            case 'amSynth':
                instrument = new Tone.PolySynth(Tone.AMSynth, {
                    harmonicity: 3,
                    detune: 0,
                    oscillator: { type: 'sine' },
                    envelope: {
                        attack: 0.1,
                        decay: 0.2,
                        sustain: 0.5,
                        release: 0.5
                    }
                });
                break;
                
            case 'fmSynth':
                instrument = new Tone.PolySynth(Tone.FMSynth, {
                    harmonicity: 1,
                    modulationIndex: 10,
                    oscillator: { type: 'sine' },
                    envelope: {
                        attack: 0.01,
                        decay: 0.5,
                        sustain: 0.1,
                        release: 0.5
                    }
                });
                break;
                
            default:
                instrument = new Tone.PolySynth(Tone.Synth);
        }

        const gain = new Tone.Gain();
        instrument.connect(gain);
        gain.connect(Tone.getDestination());

        this.trackInstruments.set(trackId, {
            instrument: instrument,
            gain: gain,
            volume: 0.7,
            muted: false
        });

        return instrument;
    }

    async start() {
        if (this.isPlaying) return;

        await Tone.start();
        Tone.Transport.bpm.value = this.tempo;
        
        this.scheduleAllTracks();
        
        Tone.Transport.start();
        this.isPlaying = true;
        this.playbackStart = Tone.now();
    }

    stop() {
        if (!this.isPlaying) return;

        Tone.Transport.stop();
        Tone.Transport.cancel();
        
        for (const [trackId, trackInstrument] of this.trackInstruments) {
            trackInstrument.instrument.releaseAll();
        }

        this.scheduledEvents = [];
        this.isPlaying = false;
    }

    scheduleAllTracks() {
        Tone.Transport.cancel();
        this.scheduledEvents = [];

        for (const track of this.scoreModel.tracks) {
            this.scheduleTrack(track);
        }
    }

    scheduleTrack(track) {
        if (track.muted) return;

        const trackInstrument = this.trackInstruments.get(track.id);
        if (!trackInstrument) return;

        const instrument = trackInstrument.instrument;
        let time = 0;

        const [numBeats, beatValue] = this.scoreModel.timeSignature.split('/').map(Number);
        const measureDuration = numBeats * (4 / beatValue);

        for (let measureIndex = 0; measureIndex < track.measures.length; measureIndex++) {
            const measure = track.measures[measureIndex];
            if (!measure || !measure.notes) continue;

            for (const note of measure.notes) {
                const noteDuration = this.getNoteDuration(note.duration);
                
                if (!note.isRest) {
                    const midiNote = Utils.noteNameToMidi(note.noteName);
                    if (midiNote) {
                        const frequency = Tone.Frequency(midiNote, 'midi');
                        const velocity = trackInstrument.muted ? 0 : trackInstrument.volume;

                        const event = {
                            time: time,
                            note: note,
                            trackId: track.id,
                            frequency: frequency,
                            duration: noteDuration,
                            velocity: velocity
                        };

                        this.scheduledEvents.push(event);

                        Tone.Transport.schedule((transportTime) => {
                            if (!trackInstrument.muted) {
                                instrument.triggerAttackRelease(
                                    frequency,
                                    noteDuration,
                                    transportTime,
                                    velocity
                                );
                            }
                        }, time);
                    }
                }

                time += noteDuration;
            }
        }

        Tone.Transport.schedule(() => {
            this.stop();
        }, time);
    }

    getNoteDuration(duration) {
        const durationMap = {
            'w': '1n',
            'h': '2n',
            'q': '4n',
            '8': '8n',
            '16': '16n'
        };
        return durationMap[duration] || '4n';
    }

    setTempo(bpm) {
        this.tempo = Math.max(CONFIG.playback.minTempo, Math.min(CONFIG.playback.maxTempo, bpm));
        Tone.Transport.bpm.value = this.tempo;
    }

    getTempo() {
        return this.tempo;
    }

    setTrackVolume(trackId, volume) {
        const trackInstrument = this.trackInstruments.get(trackId);
        if (trackInstrument) {
            trackInstrument.volume = Math.max(0, Math.min(1, volume));
            trackInstrument.gain.gain.value = trackInstrument.muted ? 0 : trackInstrument.volume;
        }
    }

    setTrackMuted(trackId, muted) {
        const trackInstrument = this.trackInstruments.get(trackId);
        if (trackInstrument) {
            trackInstrument.muted = muted;
            trackInstrument.gain.gain.value = muted ? 0 : trackInstrument.volume;
        }
    }

    setTrackInstrument(trackId, instrumentType) {
        const oldInstrument = this.trackInstruments.get(trackId);
        if (oldInstrument) {
            oldInstrument.instrument.dispose();
            oldInstrument.gain.dispose();
        }

        this.createTrackInstrument(trackId, instrumentType);
        const track = this.scoreModel.getTrack(trackId);
        if (track) {
            track.instrument = instrumentType;
        }
    }

    setGlobalInstrument(instrumentType) {
        this.currentInstrument = instrumentType;
        
        for (const [trackId, trackInstrument] of this.trackInstruments) {
            this.setTrackInstrument(trackId, instrumentType);
        }
    }

    getCurrentTime() {
        if (!this.isPlaying) return 0;
        return Tone.now() - this.playbackStart;
    }

    playNote(noteName, duration = '8n', velocity = 0.7) {
        const midiNote = Utils.noteNameToMidi(noteName);
        if (!midiNote) return;

        const frequency = Tone.Frequency(midiNote, 'midi');
        
        const firstTrackInstrument = this.trackInstruments.values().next().value;
        if (firstTrackInstrument) {
            firstTrackInstrument.instrument.triggerAttackRelease(
                frequency,
                duration,
                Tone.now(),
                velocity
            );
        }
    }

    dispose() {
        this.stop();
        
        for (const [trackId, trackInstrument] of this.trackInstruments) {
            trackInstrument.instrument.dispose();
            trackInstrument.gain.dispose();
        }
        
        this.trackInstruments.clear();
    }
}
