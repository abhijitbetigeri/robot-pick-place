import { RealEstateListing } from '../types';

export const HOUSES_DATASET_LISTINGS: RealEstateListing[] = [
  {
    "id": "house_dataset_1",
    "title": "4BD / 4BA California Residence",
    "address": "114 Meadowbrook Blvd",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$869,500",
    "bedrooms": 4,
    "bathrooms": 4.0,
    "sqft": 4053,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.0 bathrooms, and 4,053 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-1",
    "photos": [
      "/houses/house_1/frontal.jpg",
      "/houses/house_1/kitchen.jpg",
      "/houses/house_1/bedroom.jpg",
      "/houses/house_1/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.6,
      "depthMeters": 10.8,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_1",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.425,
          "z": 1.62
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_1",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_1",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.65,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_1",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.55,
          "z": -2.7
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_1",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.24
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_2",
    "title": "4BD / 3BA California Residence",
    "address": "128 Sunset Crest",
    "city": "California",
    "state": "CA",
    "zipCode": "36372",
    "price": "$865,200",
    "bedrooms": 4,
    "bathrooms": 3.0,
    "sqft": 3343,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 3.0 bathrooms, and 3,343 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-2",
    "photos": [
      "/houses/house_2/frontal.jpg",
      "/houses/house_2/kitchen.jpg",
      "/houses/house_2/bedroom.jpg",
      "/houses/house_2/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 13.3,
      "depthMeters": 9.8,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_2",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.66,
          "y": 0.425,
          "z": 1.47
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_2",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.66,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_2",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.325,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_2",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.66,
          "y": 0.55,
          "z": -2.45
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_2",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.94
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_3",
    "title": "3BD / 4BA California Residence",
    "address": "142 Highland Terrace",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$889,000",
    "bedrooms": 3,
    "bathrooms": 4.0,
    "sqft": 3923,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 4.0 bathrooms, and 3,923 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-3",
    "photos": [
      "/houses/house_3/frontal.jpg",
      "/houses/house_3/kitchen.jpg",
      "/houses/house_3/bedroom.jpg",
      "/houses/house_3/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.4,
      "depthMeters": 10.6,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_3",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.8800000000000003,
          "y": 0.425,
          "z": 1.5899999999999999
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_3",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.8800000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_3",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.6,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_3",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.8800000000000003,
          "y": 0.55,
          "z": -2.65
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_3",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.1799999999999997
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_4",
    "title": "5BD / 5BA California Residence",
    "address": "156 Ocean Vista Dr",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$910,000",
    "bedrooms": 5,
    "bathrooms": 5.0,
    "sqft": 4022,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 5.0 bathrooms, and 4,022 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-4",
    "photos": [
      "/houses/house_4/frontal.jpg",
      "/houses/house_4/kitchen.jpg",
      "/houses/house_4/bedroom.jpg",
      "/houses/house_4/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.6,
      "depthMeters": 10.7,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_4",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.425,
          "z": 1.6049999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_4",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_4",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.65,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_4",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.55,
          "z": -2.675
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_4",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.2099999999999995
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_5",
    "title": "3BD / 4BA California Residence",
    "address": "170 Hillside Ave",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$971,226",
    "bedrooms": 3,
    "bathrooms": 4.0,
    "sqft": 4116,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 4.0 bathrooms, and 4,116 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-5",
    "photos": [
      "/houses/house_5/frontal.jpg",
      "/houses/house_5/kitchen.jpg",
      "/houses/house_5/bedroom.jpg",
      "/houses/house_5/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.7,
      "depthMeters": 10.9,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_5",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.94,
          "y": 0.425,
          "z": 1.635
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_5",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.94,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_5",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.675,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_5",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.94,
          "y": 0.55,
          "z": -2.725
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_5",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.27
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_6",
    "title": "4BD / 5BA California Residence",
    "address": "184 Pinewood Trail",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$1,249,000",
    "bedrooms": 4,
    "bathrooms": 5.0,
    "sqft": 4581,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 5.0 bathrooms, and 4,581 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-6",
    "photos": [
      "/houses/house_6/frontal.jpg",
      "/houses/house_6/kitchen.jpg",
      "/houses/house_6/bedroom.jpg",
      "/houses/house_6/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 15.5,
      "depthMeters": 11.5,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_6",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.1,
          "y": 0.425,
          "z": 1.7249999999999999
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_6",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.1,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_6",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.875,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_6",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.1,
          "y": 0.55,
          "z": -2.875
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_6",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.4499999999999997
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_7",
    "title": "3BD / 4BA California Residence",
    "address": "198 Canyon View",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$799,000",
    "bedrooms": 3,
    "bathrooms": 4.0,
    "sqft": 2544,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 4.0 bathrooms, and 2,544 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-7",
    "photos": [
      "/houses/house_7/frontal.jpg",
      "/houses/house_7/kitchen.jpg",
      "/houses/house_7/bedroom.jpg",
      "/houses/house_7/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 11.6,
      "depthMeters": 8.6,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_7",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.32,
          "y": 0.425,
          "z": 1.2899999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_7",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.32,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_7",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.9,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_7",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.32,
          "y": 0.55,
          "z": -2.15
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_7",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.5799999999999996
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_8",
    "title": "4BD / 5BA California Residence",
    "address": "212 Oakridge Way",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$1,698,000",
    "bedrooms": 4,
    "bathrooms": 5.0,
    "sqft": 5524,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 5.0 bathrooms, and 5,524 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-8",
    "photos": [
      "/houses/house_8/frontal.jpg",
      "/houses/house_8/kitchen.jpg",
      "/houses/house_8/bedroom.jpg",
      "/houses/house_8/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 17.1,
      "depthMeters": 12.6,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_8",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.4200000000000004,
          "y": 0.425,
          "z": 1.89
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_8",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.4200000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_8",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 4.275,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_8",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.4200000000000004,
          "y": 0.55,
          "z": -3.15
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_8",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.78
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_9",
    "title": "3BD / 4BA California Residence",
    "address": "226 Meadowbrook Blvd",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$1,749,000",
    "bedrooms": 3,
    "bathrooms": 4.0,
    "sqft": 4229,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 4.0 bathrooms, and 4,229 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-9",
    "photos": [
      "/houses/house_9/frontal.jpg",
      "/houses/house_9/kitchen.jpg",
      "/houses/house_9/bedroom.jpg",
      "/houses/house_9/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.9,
      "depthMeters": 11.1,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_9",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.425,
          "z": 1.6649999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_9",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_9",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.725,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_9",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.55,
          "z": -2.775
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_9",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.3299999999999996
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_10",
    "title": "4BD / 5BA California Residence",
    "address": "240 Sunset Crest",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$1,500,000",
    "bedrooms": 4,
    "bathrooms": 5.0,
    "sqft": 3550,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 5.0 bathrooms, and 3,550 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-10",
    "photos": [
      "/houses/house_10/frontal.jpg",
      "/houses/house_10/kitchen.jpg",
      "/houses/house_10/bedroom.jpg",
      "/houses/house_10/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 13.7,
      "depthMeters": 10.1,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_10",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.74,
          "y": 0.425,
          "z": 1.515
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_10",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.74,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_10",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.425,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_10",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.74,
          "y": 0.55,
          "z": -2.525
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_10",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.03
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_11",
    "title": "5BD / 5BA California Residence",
    "address": "254 Highland Terrace",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$519,200",
    "bedrooms": 5,
    "bathrooms": 5.0,
    "sqft": 4829,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 5.0 bathrooms, and 4,829 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-11",
    "photos": [
      "/houses/house_11/frontal.jpg",
      "/houses/house_11/kitchen.jpg",
      "/houses/house_11/bedroom.jpg",
      "/houses/house_11/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 15.9,
      "depthMeters": 11.9,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_11",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.18,
          "y": 0.425,
          "z": 1.785
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_11",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.18,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_11",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.975,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_11",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.18,
          "y": 0.55,
          "z": -2.975
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_11",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.57
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_12",
    "title": "4BD / 4BA California Residence",
    "address": "268 Ocean Vista Dr",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$1,039,000",
    "bedrooms": 4,
    "bathrooms": 4.0,
    "sqft": 3428,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.0 bathrooms, and 3,428 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-12",
    "photos": [
      "/houses/house_12/frontal.jpg",
      "/houses/house_12/kitchen.jpg",
      "/houses/house_12/bedroom.jpg",
      "/houses/house_12/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 13.4,
      "depthMeters": 10.0,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_12",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.68,
          "y": 0.425,
          "z": 1.5
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_12",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.68,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_12",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.35,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_12",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.68,
          "y": 0.55,
          "z": -2.5
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_12",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.0
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_13",
    "title": "5BD / 3BA California Residence",
    "address": "282 Hillside Ave",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$799,000",
    "bedrooms": 5,
    "bathrooms": 3.0,
    "sqft": 5462,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 3.0 bathrooms, and 5,462 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-13",
    "photos": [
      "/houses/house_13/frontal.jpg",
      "/houses/house_13/kitchen.jpg",
      "/houses/house_13/bedroom.jpg",
      "/houses/house_13/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 17.0,
      "depthMeters": 12.5,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_13",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.4000000000000004,
          "y": 0.425,
          "z": 1.875
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_13",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.4000000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_13",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 4.25,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_13",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.4000000000000004,
          "y": 0.55,
          "z": -3.125
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_13",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.75
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_14",
    "title": "4BD / 4BA California Residence",
    "address": "296 Pinewood Trail",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$889,000",
    "bedrooms": 4,
    "bathrooms": 4.0,
    "sqft": 4021,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.0 bathrooms, and 4,021 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-14",
    "photos": [
      "/houses/house_14/frontal.jpg",
      "/houses/house_14/kitchen.jpg",
      "/houses/house_14/bedroom.jpg",
      "/houses/house_14/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.6,
      "depthMeters": 10.7,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_14",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.425,
          "z": 1.6049999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_14",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_14",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.65,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_14",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.55,
          "z": -2.675
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_14",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.2099999999999995
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_15",
    "title": "5BD / 5BA California Residence",
    "address": "310 Canyon View",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$700,000",
    "bedrooms": 5,
    "bathrooms": 5.0,
    "sqft": 4406,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 5.0 bathrooms, and 4,406 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-15",
    "photos": [
      "/houses/house_15/frontal.jpg",
      "/houses/house_15/kitchen.jpg",
      "/houses/house_15/bedroom.jpg",
      "/houses/house_15/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 15.2,
      "depthMeters": 11.3,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_15",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.04,
          "y": 0.425,
          "z": 1.695
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_15",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.04,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_15",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.8,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_15",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.04,
          "y": 0.55,
          "z": -2.825
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_15",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.39
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_16",
    "title": "4BD / 4BA California Residence",
    "address": "324 Oakridge Way",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$500,000",
    "bedrooms": 4,
    "bathrooms": 4.0,
    "sqft": 3721,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.0 bathrooms, and 3,721 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-16",
    "photos": [
      "/houses/house_16/frontal.jpg",
      "/houses/house_16/kitchen.jpg",
      "/houses/house_16/bedroom.jpg",
      "/houses/house_16/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.0,
      "depthMeters": 10.4,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_16",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.8000000000000003,
          "y": 0.425,
          "z": 1.56
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_16",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.8000000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_16",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.5,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_16",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.8000000000000003,
          "y": 0.55,
          "z": -2.6
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_16",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.12
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_17",
    "title": "5BD / 3BA California Residence",
    "address": "338 Meadowbrook Blvd",
    "city": "California",
    "state": "CA",
    "zipCode": "85331",
    "price": "$740,000",
    "bedrooms": 5,
    "bathrooms": 3.0,
    "sqft": 3710,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 3.0 bathrooms, and 3,710 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-17",
    "photos": [
      "/houses/house_17/frontal.jpg",
      "/houses/house_17/kitchen.jpg",
      "/houses/house_17/bedroom.jpg",
      "/houses/house_17/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.0,
      "depthMeters": 10.3,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_17",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.8000000000000003,
          "y": 0.425,
          "z": 1.5450000000000002
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_17",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.8000000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_17",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.5,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_17",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.8000000000000003,
          "y": 0.55,
          "z": -2.575
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_17",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.0900000000000003
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_18",
    "title": "3BD / 4BA California Residence",
    "address": "352 Sunset Crest",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$725,000",
    "bedrooms": 3,
    "bathrooms": 4.0,
    "sqft": 2748,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 4.0 bathrooms, and 2,748 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-18",
    "photos": [
      "/houses/house_18/frontal.jpg",
      "/houses/house_18/kitchen.jpg",
      "/houses/house_18/bedroom.jpg",
      "/houses/house_18/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 12.0,
      "depthMeters": 8.9,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_18",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.4000000000000004,
          "y": 0.425,
          "z": 1.335
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_18",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.4000000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_18",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.0,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_18",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.4000000000000004,
          "y": 0.55,
          "z": -2.225
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_18",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.67
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_19",
    "title": "5BD / 4BA California Residence",
    "address": "366 Highland Terrace",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$1,199,000",
    "bedrooms": 5,
    "bathrooms": 4.0,
    "sqft": 4190,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 4.0 bathrooms, and 4,190 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-19",
    "photos": [
      "/houses/house_19/frontal.jpg",
      "/houses/house_19/kitchen.jpg",
      "/houses/house_19/bedroom.jpg",
      "/houses/house_19/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.9,
      "depthMeters": 11.0,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_19",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.425,
          "z": 1.65
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_19",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_19",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.725,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_19",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.55,
          "z": -2.75
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_19",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.3
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_20",
    "title": "3BD / 3BA California Residence",
    "address": "380 Ocean Vista Dr",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$925,000",
    "bedrooms": 3,
    "bathrooms": 3.5,
    "sqft": 4143,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.5 bathrooms, and 4,143 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-20",
    "photos": [
      "/houses/house_20/frontal.jpg",
      "/houses/house_20/kitchen.jpg",
      "/houses/house_20/bedroom.jpg",
      "/houses/house_20/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.8,
      "depthMeters": 10.9,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_20",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.9600000000000004,
          "y": 0.425,
          "z": 1.635
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_20",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.9600000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_20",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.7,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_20",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.9600000000000004,
          "y": 0.55,
          "z": -2.725
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_20",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.27
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_21",
    "title": "3BD / 3BA California Residence",
    "address": "394 Hillside Ave",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$1,749,000",
    "bedrooms": 3,
    "bathrooms": 3.5,
    "sqft": 4229,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.5 bathrooms, and 4,229 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-21",
    "photos": [
      "/houses/house_21/frontal.jpg",
      "/houses/house_21/kitchen.jpg",
      "/houses/house_21/bedroom.jpg",
      "/houses/house_21/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.9,
      "depthMeters": 11.1,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_21",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.425,
          "z": 1.6649999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_21",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_21",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.725,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_21",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.55,
          "z": -2.775
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_21",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.3299999999999996
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_22",
    "title": "6BD / 6BA California Residence",
    "address": "408 Pinewood Trail",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$1,595,000",
    "bedrooms": 6,
    "bathrooms": 6.5,
    "sqft": 5963,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 6 bedrooms, 6.5 bathrooms, and 5,963 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-22",
    "photos": [
      "/houses/house_22/frontal.jpg",
      "/houses/house_22/kitchen.jpg",
      "/houses/house_22/bedroom.jpg",
      "/houses/house_22/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 17.7,
      "depthMeters": 13.1,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_22",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.54,
          "y": 0.425,
          "z": 1.9649999999999999
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_22",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.54,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_22",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 4.425,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_22",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.54,
          "y": 0.55,
          "z": -3.275
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_22",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.9299999999999997
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_23",
    "title": "3BD / 3BA California Residence",
    "address": "422 Canyon View",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$799,900",
    "bedrooms": 3,
    "bathrooms": 3.0,
    "sqft": 2685,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.0 bathrooms, and 2,685 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-23",
    "photos": [
      "/houses/house_23/frontal.jpg",
      "/houses/house_23/kitchen.jpg",
      "/houses/house_23/bedroom.jpg",
      "/houses/house_23/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 11.9,
      "depthMeters": 8.8,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_23",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.3800000000000003,
          "y": 0.425,
          "z": 1.32
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_23",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.3800000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_23",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.975,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_23",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.3800000000000003,
          "y": 0.55,
          "z": -2.2
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_23",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.64
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_24",
    "title": "5BD / 5BA California Residence",
    "address": "436 Oakridge Way",
    "city": "California",
    "state": "CA",
    "zipCode": "85377",
    "price": "$1,375,000",
    "bedrooms": 5,
    "bathrooms": 5.0,
    "sqft": 5677,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 5.0 bathrooms, and 5,677 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-24",
    "photos": [
      "/houses/house_24/frontal.jpg",
      "/houses/house_24/kitchen.jpg",
      "/houses/house_24/bedroom.jpg",
      "/houses/house_24/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 17.3,
      "depthMeters": 12.8,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_24",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.4600000000000004,
          "y": 0.425,
          "z": 1.92
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_24",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.4600000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_24",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 4.325,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_24",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.4600000000000004,
          "y": 0.55,
          "z": -3.2
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_24",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.84
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_25",
    "title": "4BD / 4BA California Residence",
    "address": "450 Meadowbrook Blvd",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$1,345,000",
    "bedrooms": 4,
    "bathrooms": 4.5,
    "sqft": 4031,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.5 bathrooms, and 4,031 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-25",
    "photos": [
      "/houses/house_25/frontal.jpg",
      "/houses/house_25/kitchen.jpg",
      "/houses/house_25/bedroom.jpg",
      "/houses/house_25/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.6,
      "depthMeters": 10.8,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_25",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.425,
          "z": 1.62
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_25",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_25",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.65,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_25",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.92,
          "y": 0.55,
          "z": -2.7
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_25",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.24
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_26",
    "title": "4BD / 4BA California Residence",
    "address": "464 Sunset Crest",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$1,290,000",
    "bedrooms": 4,
    "bathrooms": 4.0,
    "sqft": 4954,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.0 bathrooms, and 4,954 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-26",
    "photos": [
      "/houses/house_26/frontal.jpg",
      "/houses/house_26/kitchen.jpg",
      "/houses/house_26/bedroom.jpg",
      "/houses/house_26/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 16.2,
      "depthMeters": 11.9,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_26",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.24,
          "y": 0.425,
          "z": 1.785
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_26",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.24,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_26",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 4.05,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_26",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.24,
          "y": 0.55,
          "z": -2.975
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_26",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.57
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_27",
    "title": "4BD / 4BA California Residence",
    "address": "478 Highland Terrace",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$962,500",
    "bedrooms": 4,
    "bathrooms": 4.5,
    "sqft": 3550,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.5 bathrooms, and 3,550 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-27",
    "photos": [
      "/houses/house_27/frontal.jpg",
      "/houses/house_27/kitchen.jpg",
      "/houses/house_27/bedroom.jpg",
      "/houses/house_27/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 13.7,
      "depthMeters": 10.1,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_27",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.74,
          "y": 0.425,
          "z": 1.515
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_27",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.74,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_27",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.425,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_27",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.74,
          "y": 0.55,
          "z": -2.525
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_27",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.03
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_28",
    "title": "5BD / 4BA California Residence",
    "address": "492 Ocean Vista Dr",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$875,000",
    "bedrooms": 5,
    "bathrooms": 4.5,
    "sqft": 4180,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 4.5 bathrooms, and 4,180 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-28",
    "photos": [
      "/houses/house_28/frontal.jpg",
      "/houses/house_28/kitchen.jpg",
      "/houses/house_28/bedroom.jpg",
      "/houses/house_28/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.8,
      "depthMeters": 11.0,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_28",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.9600000000000004,
          "y": 0.425,
          "z": 1.65
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_28",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.9600000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_28",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.7,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_28",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.9600000000000004,
          "y": 0.55,
          "z": -2.75
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_28",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.3
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_29",
    "title": "4BD / 4BA California Residence",
    "address": "506 Hillside Ave",
    "city": "California",
    "state": "CA",
    "zipCode": "85377",
    "price": "$1,650,000",
    "bedrooms": 4,
    "bathrooms": 4.0,
    "sqft": 4464,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.0 bathrooms, and 4,464 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-29",
    "photos": [
      "/houses/house_29/frontal.jpg",
      "/houses/house_29/kitchen.jpg",
      "/houses/house_29/bedroom.jpg",
      "/houses/house_29/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 15.3,
      "depthMeters": 11.4,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_29",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.0600000000000005,
          "y": 0.425,
          "z": 1.71
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_29",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.0600000000000005,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_29",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.825,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_29",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.0600000000000005,
          "y": 0.55,
          "z": -2.85
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_29",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.42
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_30",
    "title": "5BD / 4BA California Residence",
    "address": "520 Pinewood Trail",
    "city": "California",
    "state": "CA",
    "zipCode": "85266",
    "price": "$1,199,000",
    "bedrooms": 5,
    "bathrooms": 4.5,
    "sqft": 4829,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 4.5 bathrooms, and 4,829 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-30",
    "photos": [
      "/houses/house_30/frontal.jpg",
      "/houses/house_30/kitchen.jpg",
      "/houses/house_30/bedroom.jpg",
      "/houses/house_30/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 15.9,
      "depthMeters": 11.9,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_30",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.18,
          "y": 0.425,
          "z": 1.785
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_30",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.18,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_30",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.975,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_30",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.18,
          "y": 0.55,
          "z": -2.975
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_30",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.57
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_31",
    "title": "5BD / 3BA Paso Robles Residence",
    "address": "534 Canyon View",
    "city": "Paso Robles",
    "state": "CA",
    "zipCode": "93446",
    "price": "$789,000",
    "bedrooms": 5,
    "bathrooms": 3.0,
    "sqft": 2520,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 3.0 bathrooms, and 2,520 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-31",
    "photos": [
      "/houses/house_31/frontal.jpg",
      "/houses/house_31/kitchen.jpg",
      "/houses/house_31/bedroom.jpg",
      "/houses/house_31/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 11.5,
      "depthMeters": 8.6,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_31",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.3000000000000003,
          "y": 0.425,
          "z": 1.2899999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_31",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.3000000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_31",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.875,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_31",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.3000000000000003,
          "y": 0.55,
          "z": -2.15
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_31",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.5799999999999996
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_32",
    "title": "4BD / 3BA California Residence",
    "address": "548 Oakridge Way",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$1,039,000",
    "bedrooms": 4,
    "bathrooms": 3.5,
    "sqft": 3428,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 3.5 bathrooms, and 3,428 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-32",
    "photos": [
      "/houses/house_32/frontal.jpg",
      "/houses/house_32/kitchen.jpg",
      "/houses/house_32/bedroom.jpg",
      "/houses/house_32/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 13.4,
      "depthMeters": 10.0,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_32",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.68,
          "y": 0.425,
          "z": 1.5
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_32",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.68,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_32",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.35,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_32",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.68,
          "y": 0.55,
          "z": -2.5
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_32",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.0
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_33",
    "title": "3BD / 2BA Paso Robles Residence",
    "address": "562 Meadowbrook Blvd",
    "city": "Paso Robles",
    "state": "CA",
    "zipCode": "93446",
    "price": "$365,000",
    "bedrooms": 3,
    "bathrooms": 2.0,
    "sqft": 1802,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 2.0 bathrooms, and 1,802 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-33",
    "photos": [
      "/houses/house_33/frontal.jpg",
      "/houses/house_33/kitchen.jpg",
      "/houses/house_33/bedroom.jpg",
      "/houses/house_33/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 9.7,
      "depthMeters": 7.2,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_33",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -1.94,
          "y": 0.425,
          "z": 1.08
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_33",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -1.94,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_33",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.425,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_33",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -1.94,
          "y": 0.55,
          "z": -1.8
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_33",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.16
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_34",
    "title": "3BD / 3BA California Residence",
    "address": "576 Sunset Crest",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$1,695,000",
    "bedrooms": 3,
    "bathrooms": 3.5,
    "sqft": 2873,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.5 bathrooms, and 2,873 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-34",
    "photos": [
      "/houses/house_34/frontal.jpg",
      "/houses/house_34/kitchen.jpg",
      "/houses/house_34/bedroom.jpg",
      "/houses/house_34/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 12.3,
      "depthMeters": 9.1,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_34",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.4600000000000004,
          "y": 0.425,
          "z": 1.365
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_34",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.4600000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_34",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.075,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_34",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.4600000000000004,
          "y": 0.55,
          "z": -2.275
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_34",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.73
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_35",
    "title": "4BD / 4BA California Residence",
    "address": "590 Highland Terrace",
    "city": "California",
    "state": "CA",
    "zipCode": "85377",
    "price": "$999,000",
    "bedrooms": 4,
    "bathrooms": 4.0,
    "sqft": 3260,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 4.0 bathrooms, and 3,260 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-35",
    "photos": [
      "/houses/house_35/frontal.jpg",
      "/houses/house_35/kitchen.jpg",
      "/houses/house_35/bedroom.jpg",
      "/houses/house_35/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 13.1,
      "depthMeters": 9.7,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_35",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.62,
          "y": 0.425,
          "z": 1.4549999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_35",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.62,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_35",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.275,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_35",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.62,
          "y": 0.55,
          "z": -2.425
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_35",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.9099999999999997
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_36",
    "title": "3BD / 4BA California Residence",
    "address": "604 Ocean Vista Dr",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$1,294,000",
    "bedrooms": 3,
    "bathrooms": 4.5,
    "sqft": 3893,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 4.5 bathrooms, and 3,893 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-36",
    "photos": [
      "/houses/house_36/frontal.jpg",
      "/houses/house_36/kitchen.jpg",
      "/houses/house_36/bedroom.jpg",
      "/houses/house_36/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.3,
      "depthMeters": 10.6,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_36",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.8600000000000003,
          "y": 0.425,
          "z": 1.5899999999999999
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_36",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.8600000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_36",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.575,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_36",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.8600000000000003,
          "y": 0.55,
          "z": -2.65
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_36",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.1799999999999997
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_37",
    "title": "5BD / 5BA California Residence",
    "address": "618 Hillside Ave",
    "city": "California",
    "state": "CA",
    "zipCode": "85262",
    "price": "$1,089,000",
    "bedrooms": 5,
    "bathrooms": 5.5,
    "sqft": 3932,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 5.5 bathrooms, and 3,932 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-37",
    "photos": [
      "/houses/house_37/frontal.jpg",
      "/houses/house_37/kitchen.jpg",
      "/houses/house_37/bedroom.jpg",
      "/houses/house_37/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.4,
      "depthMeters": 10.7,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_37",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.8800000000000003,
          "y": 0.425,
          "z": 1.6049999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_37",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.8800000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_37",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.6,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_37",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.8800000000000003,
          "y": 0.55,
          "z": -2.675
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_37",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.2099999999999995
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_38",
    "title": "3BD / 3BA California Residence",
    "address": "632 Pinewood Trail",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$799,900",
    "bedrooms": 3,
    "bathrooms": 3.5,
    "sqft": 2792,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.5 bathrooms, and 2,792 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-38",
    "photos": [
      "/houses/house_38/frontal.jpg",
      "/houses/house_38/kitchen.jpg",
      "/houses/house_38/bedroom.jpg",
      "/houses/house_38/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 12.1,
      "depthMeters": 9.0,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_38",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.42,
          "y": 0.425,
          "z": 1.3499999999999999
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_38",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.42,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_38",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.025,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_38",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.42,
          "y": 0.55,
          "z": -2.25
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_38",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.6999999999999997
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_39",
    "title": "3BD / 4BA California Residence",
    "address": "646 Canyon View",
    "city": "California",
    "state": "CA",
    "zipCode": "85255",
    "price": "$1,229,000",
    "bedrooms": 3,
    "bathrooms": 4.5,
    "sqft": 4228,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 4.5 bathrooms, and 4,228 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-39",
    "photos": [
      "/houses/house_39/frontal.jpg",
      "/houses/house_39/kitchen.jpg",
      "/houses/house_39/bedroom.jpg",
      "/houses/house_39/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.9,
      "depthMeters": 11.1,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_39",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.425,
          "z": 1.6649999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_39",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_39",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.725,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_39",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.9800000000000004,
          "y": 0.55,
          "z": -2.775
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_39",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.3299999999999996
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_40",
    "title": "3BD / 3BA Paso Robles Residence",
    "address": "660 Oakridge Way",
    "city": "Paso Robles",
    "state": "CA",
    "zipCode": "93446",
    "price": "$455,000",
    "bedrooms": 3,
    "bathrooms": 3.0,
    "sqft": 2146,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.0 bathrooms, and 2,146 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-40",
    "photos": [
      "/houses/house_40/frontal.jpg",
      "/houses/house_40/kitchen.jpg",
      "/houses/house_40/bedroom.jpg",
      "/houses/house_40/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 10.6,
      "depthMeters": 7.9,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_40",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.425,
          "z": 1.185
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_40",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_40",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.65,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_40",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.55,
          "z": -1.975
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_40",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.37
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_41",
    "title": "4BD / 1BA California Residence",
    "address": "674 Meadowbrook Blvd",
    "city": "California",
    "state": "CA",
    "zipCode": "98021",
    "price": "$395,000",
    "bedrooms": 4,
    "bathrooms": 1.0,
    "sqft": 9583,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 1.0 bathrooms, and 9,583 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-41",
    "photos": [
      "/houses/house_41/frontal.jpg",
      "/houses/house_41/kitchen.jpg",
      "/houses/house_41/bedroom.jpg",
      "/houses/house_41/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 18.0,
      "depthMeters": 14.0,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_41",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.6,
          "y": 0.425,
          "z": 2.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_41",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.6,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_41",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 4.5,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_41",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.6,
          "y": 0.55,
          "z": -3.5
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_41",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 4.2
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_42",
    "title": "5BD / 2BA California Residence",
    "address": "688 Sunset Crest",
    "city": "California",
    "state": "CA",
    "zipCode": "98021",
    "price": "$638,940",
    "bedrooms": 5,
    "bathrooms": 2.0,
    "sqft": 7627,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 5 bedrooms, 2.0 bathrooms, and 7,627 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-42",
    "photos": [
      "/houses/house_42/frontal.jpg",
      "/houses/house_42/kitchen.jpg",
      "/houses/house_42/bedroom.jpg",
      "/houses/house_42/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 18.0,
      "depthMeters": 14.0,
      "ceilingHeightMeters": 3.2
    },
    "initialObjects": [
      {
        "id": "obj_sofa_42",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -3.6,
          "y": 0.425,
          "z": 2.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_42",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -3.6,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_42",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 4.5,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_42",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -3.6,
          "y": 0.55,
          "z": -3.5
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_42",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 4.2
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_43",
    "title": "3BD / 2BA California Residence",
    "address": "702 Highland Terrace",
    "city": "California",
    "state": "CA",
    "zipCode": "98021",
    "price": "$435,000",
    "bedrooms": 3,
    "bathrooms": 2.0,
    "sqft": 2153,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 2.0 bathrooms, and 2,153 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-43",
    "photos": [
      "/houses/house_43/frontal.jpg",
      "/houses/house_43/kitchen.jpg",
      "/houses/house_43/bedroom.jpg",
      "/houses/house_43/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 10.6,
      "depthMeters": 7.9,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_43",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.425,
          "z": 1.185
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_43",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_43",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.65,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_43",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.55,
          "z": -1.975
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_43",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.37
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_44",
    "title": "3BD / 2BA California Residence",
    "address": "716 Ocean Vista Dr",
    "city": "California",
    "state": "CA",
    "zipCode": "98021",
    "price": "$528,800",
    "bedrooms": 3,
    "bathrooms": 2.5,
    "sqft": 2014,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 2.5 bathrooms, and 2,014 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-44",
    "photos": [
      "/houses/house_44/frontal.jpg",
      "/houses/house_44/kitchen.jpg",
      "/houses/house_44/bedroom.jpg",
      "/houses/house_44/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 10.3,
      "depthMeters": 7.6,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_44",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.06,
          "y": 0.425,
          "z": 1.14
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_44",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.06,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_44",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.575,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_44",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.06,
          "y": 0.55,
          "z": -1.9
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_44",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.28
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_45",
    "title": "4BD / 2BA California Residence",
    "address": "730 Hillside Ave",
    "city": "California",
    "state": "CA",
    "zipCode": "81524",
    "price": "$350,000",
    "bedrooms": 4,
    "bathrooms": 2.0,
    "sqft": 1928,
    "yearBuilt": 2021,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 2.0 bathrooms, and 1,928 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-45",
    "photos": [
      "/houses/house_45/frontal.jpg",
      "/houses/house_45/kitchen.jpg",
      "/houses/house_45/bedroom.jpg",
      "/houses/house_45/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 10.1,
      "depthMeters": 7.4,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_45",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.02,
          "y": 0.425,
          "z": 1.11
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_45",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.02,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_45",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.525,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_45",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.02,
          "y": 0.55,
          "z": -1.85
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_45",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.22
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_46",
    "title": "3BD / 3BA California Residence",
    "address": "744 Pinewood Trail",
    "city": "California",
    "state": "CA",
    "zipCode": "81524",
    "price": "$425,000",
    "bedrooms": 3,
    "bathrooms": 3.0,
    "sqft": 2134,
    "yearBuilt": 2022,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.0 bathrooms, and 2,134 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-46",
    "photos": [
      "/houses/house_46/frontal.jpg",
      "/houses/house_46/kitchen.jpg",
      "/houses/house_46/bedroom.jpg",
      "/houses/house_46/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 10.6,
      "depthMeters": 7.9,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_46",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.425,
          "z": 1.185
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_46",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_46",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.65,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_46",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.12,
          "y": 0.55,
          "z": -1.975
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_46",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.37
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_47",
    "title": "4BD / 3BA California Residence",
    "address": "758 Canyon View",
    "city": "California",
    "state": "CA",
    "zipCode": "81524",
    "price": "$500,000",
    "bedrooms": 4,
    "bathrooms": 3.0,
    "sqft": 2504,
    "yearBuilt": 2023,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 3.0 bathrooms, and 2,504 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-47",
    "photos": [
      "/houses/house_47/frontal.jpg",
      "/houses/house_47/kitchen.jpg",
      "/houses/house_47/bedroom.jpg",
      "/houses/house_47/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 11.5,
      "depthMeters": 8.5,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_47",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.3000000000000003,
          "y": 0.425,
          "z": 1.275
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_47",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.3000000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_47",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.875,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_47",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.3000000000000003,
          "y": 0.55,
          "z": -2.125
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_47",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.55
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_48",
    "title": "3BD / 3BA California Residence",
    "address": "772 Oakridge Way",
    "city": "California",
    "state": "CA",
    "zipCode": "81524",
    "price": "$589,900",
    "bedrooms": 3,
    "bathrooms": 3.0,
    "sqft": 2462,
    "yearBuilt": 2018,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 3.0 bathrooms, and 2,462 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-48",
    "photos": [
      "/houses/house_48/frontal.jpg",
      "/houses/house_48/kitchen.jpg",
      "/houses/house_48/bedroom.jpg",
      "/houses/house_48/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 11.4,
      "depthMeters": 8.4,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_48",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.2800000000000002,
          "y": 0.425,
          "z": 1.26
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_48",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.2800000000000002,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_48",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.85,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_48",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.2800000000000002,
          "y": 0.55,
          "z": -2.1
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_48",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.52
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_49",
    "title": "4BD / 3BA California Residence",
    "address": "786 Meadowbrook Blvd",
    "city": "California",
    "state": "CA",
    "zipCode": "81418",
    "price": "$419,000",
    "bedrooms": 4,
    "bathrooms": 3.0,
    "sqft": 3904,
    "yearBuilt": 2019,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 4 bedrooms, 3.0 bathrooms, and 3,904 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-49",
    "photos": [
      "/houses/house_49/frontal.jpg",
      "/houses/house_49/kitchen.jpg",
      "/houses/house_49/bedroom.jpg",
      "/houses/house_49/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 14.3,
      "depthMeters": 10.7,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_49",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.8600000000000003,
          "y": 0.425,
          "z": 1.6049999999999998
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#047857"
      },
      {
        "id": "obj_table_49",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.8600000000000003,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_49",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 3.575,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_49",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.8600000000000003,
          "y": 0.55,
          "z": -2.675
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_49",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 3.2099999999999995
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  },
  {
    "id": "house_dataset_50",
    "title": "3BD / 2BA California Residence",
    "address": "800 Sunset Crest",
    "city": "California",
    "state": "CA",
    "zipCode": "81418",
    "price": "$415,000",
    "bedrooms": 3,
    "bathrooms": 2.0,
    "sqft": 2034,
    "yearBuilt": 2020,
    "propertyType": "Single Family",
    "description": "Verified listing from Ahmed & Moustafa benchmark dataset. Features 3 bedrooms, 2.0 bathrooms, and 2,034 sqft. Multi-view RGB camera dataset with frontal exterior, kitchen, bedroom, and bathroom imagery.",
    "source": "mls",
    "sourceUrl": "https://github.com/emanhamed/Houses-dataset#house-50",
    "photos": [
      "/houses/house_50/frontal.jpg",
      "/houses/house_50/kitchen.jpg",
      "/houses/house_50/bedroom.jpg",
      "/houses/house_50/bathroom.jpg"
    ],
    "metricBounds": {
      "widthMeters": 10.4,
      "depthMeters": 7.6,
      "ceilingHeightMeters": 2.9
    },
    "initialObjects": [
      {
        "id": "obj_sofa_50",
        "assetId": "modern_sofa",
        "name": "Living Room Sectional",
        "category": "living_room",
        "position": {
          "x": -2.08,
          "y": 0.425,
          "z": 1.14
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.3,
          "height": 0.85,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 45,
          "friction": [
            0.8,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#1d4ed8"
      },
      {
        "id": "obj_table_50",
        "assetId": "coffee_table",
        "name": "Oak Coffee Table",
        "category": "living_room",
        "position": {
          "x": -2.08,
          "y": 0.225,
          "z": -0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.2,
          "height": 0.45,
          "depth": 0.65
        },
        "physics": {
          "isStatic": false,
          "mass": 18,
          "friction": [
            0.6,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "box"
        },
        "color": "#d97706"
      },
      {
        "id": "obj_island_50",
        "assetId": "kitchen_island",
        "name": "Kitchen Island Counter",
        "category": "kitchen_dining",
        "position": {
          "x": 2.6,
          "y": 0.46,
          "z": 0.5
        },
        "rotation": {
          "x": 0,
          "y": 1.57,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 2.1,
          "height": 0.92,
          "depth": 1.0
        },
        "physics": {
          "isStatic": true,
          "mass": 85,
          "friction": [
            0.9,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#e2e8f0"
      },
      {
        "id": "obj_tv_50",
        "assetId": "tv_console",
        "name": "Media Credenza & TV",
        "category": "living_room",
        "position": {
          "x": -2.08,
          "y": 0.55,
          "z": -1.9
        },
        "rotation": {
          "x": 0,
          "y": 3.14,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 1.6,
          "height": 1.1,
          "depth": 0.45
        },
        "physics": {
          "isStatic": true,
          "mass": 35,
          "friction": [
            0.7,
            0.1,
            0.1
          ],
          "restitution": 0.1,
          "geomType": "box"
        },
        "color": "#0f172a"
      },
      {
        "id": "obj_robot_50",
        "assetId": "stretch_re1_robot",
        "name": "Stretch RE1 Mobile Manipulator",
        "category": "robotics_fixtures",
        "position": {
          "x": 0.0,
          "y": 0.725,
          "z": 2.28
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "dimensions": {
          "width": 0.45,
          "height": 1.45,
          "depth": 0.45
        },
        "physics": {
          "isStatic": false,
          "mass": 24.5,
          "friction": [
            0.5,
            0.1,
            0.1
          ],
          "restitution": 0.2,
          "geomType": "cylinder"
        },
        "color": "#00f0ff"
      }
    ]
  }
];
