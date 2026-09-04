"""Build the portfolio's story machine in Blender.

Run in Blender's scripting workspace with Blender 3.6+:
  blender --background --python operations_story_scene.py

The web portfolio uses a lightweight CSS version of the same composition.
This script is the source for a future rendered hero loop or a still image.
"""

import math
import bpy
from mathutils import Vector


def material(name, color, metallic=0.0, roughness=0.42):
    item = bpy.data.materials.new(name)
    item.diffuse_color = (*color, 1.0)
    item.metallic = metallic
    item.roughness = roughness
    return item


def cylinder(name, location, radius, depth, mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=location)
    item = bpy.context.object
    item.name = name
    item.data.materials.append(mat)
    return item


def torus(name, location, major, minor, mat, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=96, location=location, rotation=rotation)
    item = bpy.context.object
    item.name = name
    item.data.materials.append(mat)
    return item


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def build():
    clear_scene()
    ink = material("Ink", (0.035, 0.04, 0.045), metallic=0.3)
    paper = material("Paper", (0.82, 0.79, 0.70), roughness=0.58)
    coral = material("Operations / Coral", (0.93, 0.28, 0.22), metallic=0.05)
    orange = material("Automation / Orange", (0.95, 0.52, 0.16), metallic=0.05)
    yellow = material("AI / Yellow", (0.94, 0.76, 0.22), metallic=0.05)

    bpy.world.color = (0.012, 0.014, 0.017)
    bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, -0.12))
    bpy.context.object.data.materials.append(ink)

    # The loop is a low triangular system: pressure -> repeatability -> judgement.
    stages = [(-3.6, 0, 0.42, coral), (0, 0.65, 0.72, orange), (3.6, 0, 0.42, yellow)]
    for index, (x, y, z, mat) in enumerate(stages, 1):
        cylinder(f"Stage_{index:02d}", (x, y, z), 0.72, 0.22, mat)
        torus(f"Orbit_{index:02d}", (x, y, z + 0.15), 0.93, 0.025, mat, rotation=(math.radians(68), 0, 0))
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.16, location=(x, y, z + 0.35))
        bpy.context.object.data.materials.append(paper)

    # A physical rail joins the three stages; the glowing signal travels this route in animation.
    for x in (-1.8, 1.8):
        cylinder("Connection_Rail", (x, 0.3, 0.25), 0.055, 2.45, paper).rotation_euler[1] = math.radians(90)
    signal = bpy.data.objects.new("Signal", None)
    bpy.context.collection.objects.link(signal)
    signal.location = (-3.6, 0, 0.92)
    signal.keyframe_insert(data_path="location", frame=1)
    signal.location = (0, 0.65, 1.25)
    signal.keyframe_insert(data_path="location", frame=48)
    signal.location = (3.6, 0, 0.92)
    signal.keyframe_insert(data_path="location", frame=96)
    signal.location = (-3.6, 0, 0.92)
    signal.keyframe_insert(data_path="location", frame=144)
    for curve in signal.animation_data.action.fcurves:
        for key in curve.keyframe_points:
            key.interpolation = "BEZIER"
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 144
    bpy.context.scene.render.fps = 24
    bpy.context.scene.render.resolution_x = 1000
    bpy.context.scene.render.resolution_y = 700
    bpy.context.scene.render.resolution_percentage = 60
    bpy.context.scene.camera = None
    bpy.ops.object.camera_add(location=(0, -13, 8), rotation=(math.radians(64), 0, 0))
    camera = bpy.context.object
    camera.data.lens = 52
    bpy.context.scene.camera = camera
    bpy.ops.object.light_add(type="AREA", location=(0, -2, 8))
    bpy.context.object.data.energy = 1100
    bpy.context.object.data.shape = "DISK"
    bpy.context.object.data.size = 8
    bpy.ops.wm.save_as_mainfile(filepath="operations-story-machine.blend")


if __name__ == "__main__":
    build()
