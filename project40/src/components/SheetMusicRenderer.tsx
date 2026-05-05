import { useEffect, useRef } from 'react';
import * as Vex from 'vexflow';
import type { SheetMusic, Note, NotationType } from '@/types';

interface SheetMusicRendererProps {
  sheetMusic: SheetMusic;
  notationType?: NotationType;
  width?: number;
  height?: number;
  highlightMeasures?: number[];
}

const { Factory, Barline } = Vex.Flow;

function vexflowDuration(duration: string, dotted?: boolean): string {
  let result = duration;
  if (dotted) {
    result += 'd';
  }
  return result;
}

function vexflowNoteKey(pitch: string, octave: number): string {
  const pitchMap: Record<string, string> = {
    'C#': 'C#', 'Db': 'C#',
    'D#': 'D#', 'Eb': 'D#',
    'F#': 'F#', 'Gb': 'F#',
    'G#': 'G#', 'Ab': 'G#',
    'A#': 'A#', 'Bb': 'A#',
  };
  
  const mappedPitch = pitchMap[pitch] || pitch;
  return `${mappedPitch.toLowerCase()}/${octave}`;
}

function durationToVex(duration: string): string {
  const map: Record<string, string> = {
    'w': 'w',
    'h': 'h',
    'q': 'q',
    '8': '8',
    '16': '16',
    '32': '32',
  };
  return map[duration] || 'q';
}

export function SheetMusicRenderer({
  sheetMusic,
  notationType = 'staff',
  width = 800,
  height = 400,
  highlightMeasures = [],
}: SheetMusicRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    if (notationType === 'jianpu') {
      renderJianpu(containerRef.current);
      return;
    }

    try {
      const containerId = `sheet-music-${Date.now()}`;
      containerRef.current.id = containerId;
      
      const vf = new Factory({
        renderer: { elementId: containerId, width, height: Math.max(height, 300) },
      });

      const score = vf.EasyScore();
      const system = vf.System();

      const clefMap: Record<string, string> = {
        'treble': 'treble',
        'bass': 'bass',
        'alto': 'alto',
        'tenor': 'tenor',
      };

      const keyMap: Record<string, string> = {
        'C': 'C', 'G': 'G', 'D': 'D', 'A': 'A', 'E': 'E', 'B': 'B',
        'F#': 'F#', 'C#': 'C#', 'F': 'F', 'Bb': 'Bb', 'Eb': 'Eb',
        'Ab': 'Ab', 'Db': 'Db', 'Gb': 'Gb', 'Cb': 'Cb',
      };

      const timeMap: Record<string, string> = {
        '4/4': 'C', '3/4': '3/4', '2/4': '2/4',
        '6/8': '6/8', '3/8': '3/8', '2/2': 'C|',
      };

      const staveWidth = (width - 100) / Math.min(sheetMusic.measures.length, 4);

      sheetMusic.measures.forEach((measure, measureIndex) => {
        const x = 50 + (measureIndex % 4) * staveWidth;
        const y = 100 + Math.floor(measureIndex / 4) * 150;

        const stave = vf.Stave({ x, y, width: staveWidth - 10 });

        if (measureIndex === 0) {
          stave.addClef(clefMap[sheetMusic.clef] || 'treble');
          stave.addKeySignature(keyMap[sheetMusic.keySignature] || 'C');
          stave.addTimeSignature(timeMap[sheetMusic.timeSignature] || 'C');
        }

        if (measureIndex === sheetMusic.measures.length - 1) {
          stave.setEndBarType(Barline.type.END);
        }

        if (highlightMeasures.includes(measureIndex)) {
          const context = vf.getContext();
          if (context) {
            context.save();
            context.setFillStyle('rgba(255, 200, 0, 0.3)');
            context.fillRect(x - 5, y - 30, staveWidth, 120);
            context.restore();
          }
        }

        const notes: any[] = [];
        let totalDuration = 0;
        const maxDuration = 4;

        measure.notes.forEach((note) => {
          const duration = durationToVex(note.duration);
          const durValue = noteDurationToValue(note.duration);
          
          if (totalDuration + durValue <= maxDuration || notes.length === 0) {
            if (note.rest) {
              const restNote = score.notes(`${vexflowDuration(duration, note.dotted)}[B/4]`, {
                clef: clefMap[sheetMusic.clef] || 'treble',
              })[0] as any;
              restNote.setKeyStyle(0, { fillStyle: 'black' });
              notes.push(restNote);
            } else {
              const key = vexflowNoteKey(note.pitch, note.octave);
              const staveNote = score.notes(`${vexflowDuration(duration, note.dotted)}[${key}]`, {
                clef: clefMap[sheetMusic.clef] || 'treble',
              })[0] as any;
              
              notes.push(staveNote);
            }
            totalDuration += durValue;
          }
        });

        system.addStave({
          voices: [score.voice(notes, { time: sheetMusic.timeSignature })],
        });

        stave.setContext(vf.getContext()).draw();
      });

      vf.draw();
    } catch (error) {
      console.error('VexFlow rendering error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">乐谱预览</p>
              <p class="text-xs text-gray-400">${sheetMusic.title}</p>
            </div>
          </div>
        `;
      }
    }
  }, [sheetMusic, notationType, width, height, highlightMeasures]);

  function noteDurationToValue(duration: string): number {
    const values: Record<string, number> = {
      'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25, '32': 0.125,
    };
    return values[duration] || 1;
  }

  function renderJianpu(container: HTMLDivElement) {
    const pitchToNumber: Record<string, string> = {
      'C': '1', 'C#': '1#', 'Db': '1b',
      'D': '2', 'D#': '2#', 'Eb': '2b',
      'E': '3',
      'F': '4', 'F#': '4#', 'Gb': '4b',
      'G': '5', 'G#': '5#', 'Ab': '5b',
      'A': '6', 'A#': '6#', 'Bb': '6b',
      'B': '7',
    };

    const getOctaveMarker = (octave: number, baseOctave: number = 4): { above: number; below: number } => {
      const diff = octave - baseOctave;
      if (diff > 0) return { above: diff, below: 0 };
      if (diff < 0) return { above: 0, below: Math.abs(diff) };
      return { above: 0, below: 0 };
    };

    const renderNote = (note: Note) => {
      if (note.rest) {
        return `<span class="inline-block w-8 text-center text-gray-500 font-bold">0</span>`;
      }
      
      const number = pitchToNumber[note.pitch] || note.pitch;
      const { above, below } = getOctaveMarker(note.octave);
      
      const aboveDots = above > 0 ? `<span class="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs">${'·'.repeat(above)}</span>` : '';
      const belowDots = below > 0 ? `<span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs">${'·'.repeat(below)}</span>` : '';
      
      return `<span class="relative inline-block w-8 text-center font-bold text-lg">${number}${aboveDots}${belowDots}</span>`;
    };

    let html = `<div class="jianpu-container p-4 bg-white rounded-lg border border-gray-200">`;
    html += `<div class="text-center mb-4"><h3 class="text-lg font-bold">${sheetMusic.title}</h3><p class="text-sm text-gray-500">${sheetMusic.keySignature}调 ${sheetMusic.timeSignature}</p></div>`;
    html += `<div class="flex flex-wrap gap-2 items-center">`;

    sheetMusic.measures.forEach((measure, idx) => {
      if (idx > 0) {
        html += `<span class="text-gray-400 mx-2">|</span>`;
      }
      html += `<div class="flex items-center gap-1">`;
      measure.notes.forEach(note => {
        html += renderNote(note);
      });
      html += `</div>`;
    });

    html += `</div></div>`;
    container.innerHTML = html;
  }

  return (
    <div className="sheet-music-container">
      <div ref={containerRef} className="bg-white rounded-lg overflow-hidden" />
    </div>
  );
}

export default SheetMusicRenderer;
