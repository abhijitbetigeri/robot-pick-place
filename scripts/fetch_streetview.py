#!/usr/bin/env python3
"""
Fetch 360 equirectangular panoramas from Google Street View using coordinates.
Default location: 4th St Bridge at Mission Creek, San Francisco.
"""

import argparse
import os
from PIL import Image

try:
    from streetlevel import streetview
except ImportError:
    print("streetlevel not installed. Run: pip install streetlevel pillow")
    exit(1)

def fetch_panorama(lat: float, lon: float, output_path: str, zoom: int = 3):
    print(f"Searching for Street View panorama near ({lat}, {lon})...")
    pano = streetview.find_panorama(lat, lon)
    
    if not pano:
        print(f"Error: No Street View panorama found at {lat}, {lon}")
        return False
        
    print(f"Found Panorama ID: {pano.id}")
    print(f"Capture Date: {pano.date}")
    print(f"Downloading high-resolution 360 panorama (zoom={zoom})...")
    
    image = streetview.get_panorama(pano, zoom=zoom)
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    image.save(output_path, "JPEG")
    print(f"Successfully saved 360 panorama to: {output_path}")
    print(f"Image dimensions: {image.size}")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download 360 Street View Panorama for World Labs Marble")
    # Default: Mission Creek 4th St Bridge, San Francisco
    parser.add_argument("--lat", type=float, default=37.776043, help="Latitude")
    parser.add_argument("--lon", type=float, default=-122.394017, help="Longitude")
    parser.add_argument("--out", type=str, default="data/bridge_360.jpg", help="Output file path")
    parser.add_argument("--zoom", type=int, default=3, help="Zoom level (3 = approx 3328x1664)")
    
    args = parser.parse_args()
    fetch_panorama(args.lat, args.lon, args.out, args.zoom)
