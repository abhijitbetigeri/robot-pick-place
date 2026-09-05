# new_world

Drop the Marble export for
https://marble.worldlabs.ai/world/d113b1c8-728b-49a2-a88c-d4ad13a4bffb
here, with these exact filenames:

    scene_collider.glb    (Export -> collider mesh)
    scene_pano.png        (Export -> panorama / 360)
    scene.spz             (optional; browser only, not needed for the sim)

Then:

    python scripts/marble_to_mjcf.py public/assets/scenarios/new_world/scene_collider.glb
    python scripts/sim_from_scene.py --share-id sim --marble new_world
