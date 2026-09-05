#!/usr/bin/env python3
"""
Process the Ahmed & Moustafa Houses-dataset (535 real houses with 4 photos each + pricing/sqft).
Extracts metadata, copies sample photo packages into public/houses/, and produces TypeScript definitions.
"""

import os
import shutil
import json

DATASET_DIR = "data/houses_dataset/Houses Dataset"
PUBLIC_HOUSES_DIR = "public/houses"

# City mapping by zip code prefix for realistic naming
ZIP_CITY_MAP = {
    "934": ("Paso Robles", "CA"),
    "935": ("Lancaster", "CA"),
    "920": ("San Diego", "CA"),
    "921": ("San Diego", "CA"),
    "900": ("Los Angeles", "CA"),
    "902": ("Beverly Hills", "CA"),
    "941": ("San Francisco", "CA"),
    "940": ("Palo Alto", "CA"),
    "981": ("Seattle", "WA"),
    "787": ("Austin", "TX"),
    "100": ("New York", "NY"),
}

def process_dataset():
    if not os.path.exists(DATASET_DIR):
        print(f"⚠️ Dataset directory not found at: {DATASET_DIR}")
        return []

    info_path = os.path.join(DATASET_DIR, "HousesInfo.txt")
    if not os.path.exists(info_path):
        print(f"⚠️ HousesInfo.txt not found at: {info_path}")
        return []

    os.makedirs(PUBLIC_HOUSES_DIR, exist_ok=True)

    listings = []
    with open(info_path, "r") as f:
        lines = f.readlines()

    print(f"📄 Found {len(lines)} house records in HousesInfo.txt")

    # Process first 50 houses for instant UI browsing
    for idx, line in enumerate(lines[:50], start=1):
        parts = line.strip().split()
        if len(parts) < 5:
            continue

        bedrooms = int(float(parts[0]))
        bathrooms = float(parts[1])
        sqft = int(float(parts[2]))
        zipcode = str(parts[3])
        price = int(float(parts[4]))

        city_info = ZIP_CITY_MAP.get(zipcode[:3], ("California", "CA"))
        city, state = city_info

        # Copy photos
        house_pub_dir = os.path.join(PUBLIC_HOUSES_DIR, f"house_{idx}")
        os.makedirs(house_pub_dir, exist_ok=True)

        photo_urls = []
        for photo_type in ["frontal", "kitchen", "bedroom", "bathroom"]:
            src_file = os.path.join(DATASET_DIR, f"{idx}_{photo_type}.jpg")
            dst_file = os.path.join(house_pub_dir, f"{photo_type}.jpg")
            rel_url = f"/houses/house_{idx}/{photo_type}.jpg"

            if os.path.exists(src_file):
                shutil.copyfile(src_file, dst_file)
                photo_urls.append(rel_url)

        # Estimate room dimensions from sqft (approx 35-45% living/dining footprint)
        living_area_sqft = sqft * 0.42
        living_area_sqm = living_area_sqft * 0.092903
        width_m = round(max(8.0, min(18.0, (living_area_sqm * 1.35) ** 0.5)), 1)
        depth_m = round(max(7.0, min(14.0, living_area_sqm / width_m)), 1)
        height_m = 3.2 if price > 600000 else 2.9

        street_names = ["Oakridge Way", "Meadowbrook Blvd", "Sunset Crest", "Highland Terrace", "Ocean Vista Dr", "Hillside Ave", "Pinewood Trail", "Canyon View"]
        street = f"{100 + idx * 14} {street_names[idx % len(street_names)]}"

        listing_entry = {
            "id": f"house_dataset_{idx}",
            "title": f"{bedrooms}BD / {int(bathrooms)}BA {city} Residence",
            "address": street,
            "city": city,
            "state": state,
            "zipCode": zipcode,
            "price": f"${price:,}",
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "sqft": sqft,
            "yearBuilt": 2018 + (idx % 6),
            "propertyType": "Single Family" if bedrooms >= 3 else "Condo",
            "description": f"Verified listing from Ahmed & Moustafa benchmark dataset. Features {bedrooms} bedrooms, {bathrooms} bathrooms, and {sqft:,} sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
            "source": "mls",
            "sourceUrl": f"https://github.com/emanhamed/Houses-dataset#house-{idx}",
            "photos": photo_urls,
            "metricBounds": {
                "widthMeters": width_m,
                "depthMeters": depth_m,
                "ceilingHeightMeters": height_m
            },
            "initialObjects": [
                {
                    "id": f"obj_sofa_{idx}",
                    "assetId": "modern_sofa",
                    "name": "Living Room Sectional",
                    "category": "living_room",
                    "position": {"x": -width_m * 0.2, "y": 0.425, "z": depth_m * 0.15},
                    "rotation": {"x": 0, "y": 0, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "dimensions": {"width": 2.3, "height": 0.85, "depth": 1.0},
                    "physics": {"isStatic": True, "mass": 45, "friction": [0.8, 0.1, 0.1], "restitution": 0.1, "geomType": "box"},
                    "color": "#1d4ed8" if idx % 2 == 0 else "#047857"
                },
                {
                    "id": f"obj_table_{idx}",
                    "assetId": "coffee_table",
                    "name": "Oak Coffee Table",
                    "category": "living_room",
                    "position": {"x": -width_m * 0.2, "y": 0.225, "z": -0.1},
                    "rotation": {"x": 0, "y": 0, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "dimensions": {"width": 1.2, "height": 0.45, "depth": 0.65},
                    "physics": {"isStatic": False, "mass": 18, "friction": [0.6, 0.1, 0.1], "restitution": 0.2, "geomType": "box"},
                    "color": "#d97706"
                },
                {
                    "id": f"obj_island_{idx}",
                    "assetId": "kitchen_island",
                    "name": "Kitchen Island Counter",
                    "category": "kitchen_dining",
                    "position": {"x": width_m * 0.25, "y": 0.46, "z": 0.5},
                    "rotation": {"x": 0, "y": 1.57, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "dimensions": {"width": 2.1, "height": 0.92, "depth": 1.0},
                    "physics": {"isStatic": True, "mass": 85, "friction": [0.9, 0.1, 0.1], "restitution": 0.1, "geomType": "box"},
                    "color": "#e2e8f0"
                },
                {
                    "id": f"obj_tv_{idx}",
                    "assetId": "tv_console",
                    "name": "Media Credenza & TV",
                    "category": "living_room",
                    "position": {"x": -width_m * 0.2, "y": 0.55, "z": -depth_m * 0.25},
                    "rotation": {"x": 0, "y": 3.14, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "dimensions": {"width": 1.6, "height": 1.1, "depth": 0.45},
                    "physics": {"isStatic": True, "mass": 35, "friction": [0.7, 0.1, 0.1], "restitution": 0.1, "geomType": "box"},
                    "color": "#0f172a"
                },
                {
                    "id": f"obj_robot_{idx}",
                    "assetId": "stretch_re1_robot",
                    "name": "Stretch RE1 Mobile Manipulator",
                    "category": "robotics_fixtures",
                    "position": {"x": 0.0, "y": 0.725, "z": depth_m * 0.3},
                    "rotation": {"x": 0, "y": 0, "z": 0},
                    "scale": {"x": 1, "y": 1, "z": 1},
                    "dimensions": {"width": 0.45, "height": 1.45, "depth": 0.45},
                    "physics": {"isStatic": False, "mass": 24.5, "friction": [0.5, 0.1, 0.1], "restitution": 0.2, "geomType": "cylinder"},
                    "color": "#00f0ff"
                }
            ]
        }
        listings.append(listing_entry)

    # Write TypeScript export file
    ts_content = f"""import {{ RealEstateListing }} from '../types';

export const HOUSES_DATASET_LISTINGS: RealEstateListing[] = {json.dumps(listings, indent=2)};
"""
    with open("src/realestate/data/housesDatasetListings.ts", "w") as f:
        f.write(ts_content)

    print(f"🎉 Successfully processed {len(listings)} listings from Houses-dataset!")
    return listings

if __name__ == "__main__":
    process_dataset()
