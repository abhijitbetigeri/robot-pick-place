#!/usr/bin/env python3
"""Check the exported delivery artifact with ffprobe and a full decode."""
from pathlib import Path
import json
import subprocess

root = Path(__file__).resolve().parents[1]
movie = root / 'artifacts/tron-worlds-demo.mp4'
result = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(movie),
]))
video = next(stream for stream in result['streams'] if stream['codec_type'] == 'video')
audio = next(stream for stream in result['streams'] if stream['codec_type'] == 'audio')
assert video['codec_name'] == 'h264'
assert (video['width'], video['height']) == (1920, 1080)
assert video['avg_frame_rate'] == '30/1'
assert int(video['nb_frames']) == 1320
assert abs(float(result['format']['duration']) - 44) < .05
assert audio['codec_name'] == 'aac'
assert audio['channels'] == 2
quality = subprocess.run([
    'ffmpeg', '-hide_banner', '-i', str(movie),
    '-vf', 'blackdetect=d=0.1:pix_th=0.06:pic_th=0.99,freezedetect=n=-55dB:d=2',
    '-an', '-f', 'null', '-',
], capture_output=True, text=True, check=True)
assert 'black_start:' not in quality.stderr, 'Black interval in delivery artifact'
assert 'freeze_start:' not in quality.stderr, 'Frozen interval in delivery artifact'
report = {
    'file': str(movie), 'duration': float(result['format']['duration']),
    'width': video['width'], 'height': video['height'], 'fps': video['avg_frame_rate'],
    'frames': int(video['nb_frames']), 'video_codec': video['codec_name'],
    'audio_codec': audio['codec_name'], 'audio_channels': audio['channels'],
    'size_bytes': int(result['format']['size']), 'full_decode': 'passed',
    'black_intervals': 0, 'frozen_intervals': 0,
}
(root / 'artifacts/video-check.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
