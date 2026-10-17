"""Misst die Gesichtsposition im Originalvideo (5x pro Sekunde) -> face_track.json.

Wird von engine.py genutzt, damit Punch-ins immer um das Gesicht herum zoomen,
auch wenn sich die Sprecherin vor- und zurücklehnt.
Benötigt OpenCV 4 mit Haar-Cascades (OpenCV 5 enthält sie nicht mehr), z. B.:
    pip install --target /tmp/cv4 "opencv-python-headless==4.11.0.86"
    python3 face_track.py source/original_overthinking.mov face_track.json /tmp/cv4
"""
import sys, json, subprocess, numpy as np
sys.path.insert(0, sys.argv[3])
import cv2
cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
raw = subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-vf","fps=5,scale=360:640","-f","rawvideo","-pix_fmt","gray","-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 640, 360)
pts = []
for i, f in enumerate(fr):
    faces = cc.detectMultiScale(f, 1.1, 6, minSize=(60, 60))
    if len(faces):
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        pts.append((i / 5, float(x + w / 2) * 2, float(y + h / 2) * 2, float(w) * 2))
print(len(fr), "frames,", len(pts), "with face")
for t, x, y, w in pts[::12]:
    print(f"{t:5.1f}  x={x:5.0f} y={y:5.0f} w={w:4.0f}")
json.dump(pts, open(sys.argv[2], "w"))
