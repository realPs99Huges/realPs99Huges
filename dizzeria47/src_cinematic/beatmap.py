"""Analyse the actual score audio: beats, downbeats, onsets, energy sections, accents -> beatmap.json."""
import json, sys, warnings
import numpy as np
import librosa
warnings.filterwarnings('ignore')
path = sys.argv[1]
y, sr = librosa.load(path, sr=22050, mono=True)
hop = 256
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, units='time', tightness=200)
tempo = float(np.atleast_1d(tempo)[0])
onsets = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, hop_length=hop, units='time', backtrack=False)
# low-band (kick/bass) onset envelope to find strong beats
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = S[freqs < 150].sum(0)
low_on = np.maximum(0, np.diff(low, prepend=low[0]))
times = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
rms_db = 20 * np.log10(rms + 1e-6)


def at(arr, t):
    return float(arr[min(int(np.searchsorted(times, t)), len(arr) - 1)])


# extend the tracked grid over the whole file (intro has no drums) using the median inter-beat interval,
# snapping each extrapolated beat to the nearest detected onset within 40 ms
ibi = float(np.median(np.diff(beats)))
grid = list(beats)
t0 = beats[0] - ibi
while t0 > 0.05:
    grid.insert(0, t0); t0 -= ibi
t1 = beats[-1] + ibi
while t1 < times[-1] - 0.3:
    grid.append(t1); t1 += ibi
on = np.array(onsets)
snapped = []
for g in grid:
    j = np.argmin(np.abs(on - g)) if len(on) else 0
    snapped.append(float(on[j]) if len(on) and abs(on[j] - g) < 0.04 else float(g))
beats = np.array(snapped)
# downbeats: harmony changes happen on bar starts -> choose the phase with the largest chroma novelty
C = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
C = librosa.util.normalize(C, axis=0)
cn = np.r_[0, np.sum(np.maximum(0, np.diff(C, axis=1)), axis=0)]
cn = np.convolve(cn, np.ones(9) / 9, mode='same')
scores = []
for ph in range(4):
    scores.append(np.mean([at(cn, b + 0.05) for b in beats[ph::4]]) + 0.5 * np.mean([at(oenv, b) for b in beats[ph::4]]) / (oenv.max() + 1e-9))
phase = int(np.argmax(scores))
print('phase scores', [round(float(x), 3) for x in scores])
downbeats = beats[phase::4]
# energy sections via smoothed RMS (1 s window) and novelty peaks
win = int(1.0 * sr / hop)
sm = np.convolve(rms_db, np.ones(win) / win, mode='same')
nov = np.abs(np.diff(sm, prepend=sm[0]))
novt = librosa.util.peak_pick(nov, pre_max=win, post_max=win, pre_avg=win, post_avg=win, delta=0.05, wait=win)
# accents: strongest broadband onsets
pk = [(float(t), at(oenv, t)) for t in onsets]
pk.sort(key=lambda x: -x[1])
accents = sorted(t for t, _ in pk[:12])
# silences (breaths): frames well below local loudness
quiet = times[(rms_db < sm - 12) & (times > 1) & (times < times[-1] - 2)]
out = dict(tempo=tempo, beats=[round(float(b), 4) for b in beats], downbeats=[round(float(b), 4) for b in downbeats],
           onsets=[round(float(o), 4) for o in onsets], accents=[round(a, 4) for a in accents],
           section_changes=[round(float(times[i]), 3) for i in novt],
           quiet=[round(float(q), 3) for q in quiet[::4]],
           energy=[[round(float(times[i]), 2), round(float(sm[i]), 1)] for i in range(0, len(times), int(0.5 * sr / hop))])
json.dump(out, open(sys.argv[2], 'w'), indent=1)
print('tempo', round(tempo, 2), 'beats', len(beats), 'downbeat phase', phase)
print('first downbeats', [round(float(d), 3) for d in downbeats[:14]])
print('accents', [round(a, 2) for a in accents])
print('section changes', out['section_changes'])
print('quiet', out['quiet'][:20])
