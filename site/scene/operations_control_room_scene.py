"""Build an original Systems Control Room in Blender 5.x.

Run from this folder:
  blender --background --python operations_control_room_scene.py
"""

import math
import bpy
from mathutils import Vector


def mat(name, color, metallic=0.0, roughness=0.42, emission=None):
    item = bpy.data.materials.new(name)
    item.diffuse_color = (*color, 1.0)
    item.use_nodes = True
    shader = item.node_tree.nodes.get("Principled BSDF")
    if shader:
        shader.inputs["Base Color"].default_value = (*color, 1.0)
        shader.inputs["Metallic"].default_value = metallic
        shader.inputs["Roughness"].default_value = roughness
        if emission:
            socket = shader.inputs.get("Emission Color") or shader.inputs.get("Emission")
            if socket:
                socket.default_value = (*emission, 1.0)
                strength = shader.inputs.get("Emission Strength")
                if strength:
                    strength.default_value = 2.8
    return item


def cube(name, location, scale, material, bevel=0.08):
    bpy.ops.mesh.primitive_cube_add(location=location)
    item = bpy.context.object
    item.name = name
    item.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    item.data.materials.append(material)
    if bevel:
        modifier = item.modifiers.new("Soft edges", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3
    return item


def sphere(name, location, radius, material):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=radius, location=location)
    item = bpy.context.object
    item.name = name
    item.data.materials.append(material)
    return item


def torus(name, location, major, minor, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=72, minor_segments=12, location=location, rotation=rotation)
    item = bpy.context.object
    item.name = name
    item.data.materials.append(material)
    return item


def label(name, body, location, size, material, rotation=(math.pi / 2, 0, 0)):
    bpy.ops.object.text_add(location=location, rotation=rotation)
    item = bpy.context.object
    item.name = name
    item.data.body = body
    item.data.align_x = "CENTER"
    item.data.align_y = "CENTER"
    item.data.size = size
    item.data.extrude = 0.012
    item.data.bevel_depth = 0.004
    item.data.materials.append(material)
    return item


def look_at(item, target):
    item.rotation_euler = (Vector(target) - item.location).to_track_quat("-Z", "Y").to_euler()


def build():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 70
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 144
    scene.world.color = (0.008, 0.01, 0.014)
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.008, 0.01, 0.014, 1.0)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.12

    ink = mat("Charcoal", (0.025, 0.032, 0.042), metallic=0.25, roughness=0.48)
    wall = mat("Warm wall", (0.10, 0.09, 0.085), roughness=0.7)
    paper = mat("Paper", (0.72, 0.68, 0.58), roughness=0.5)
    white = mat("Lettering", (0.82, 0.88, 0.91), roughness=0.3)
    coral = mat("Operations coral", (0.95, 0.16, 0.12), emission=(0.95, 0.06, 0.03))
    orange = mat("Automation orange", (0.98, 0.39, 0.08), emission=(0.85, 0.16, 0.02))
    yellow = mat("AI yellow", (0.95, 0.72, 0.12), emission=(0.72, 0.38, 0.02))

    cube("Floor", (0, 0, -0.2), (7.5, 5.5, 0.2), ink, 0.12)
    cube("Back wall", (0, 5.2, 3.4), (7.5, 0.18, 3.8), wall, 0.04)
    cube("Left return", (-7.3, 1.8, 3.4), (0.18, 3.4, 3.8), wall, 0.04)
    cube("Header beam", (0, 4.85, 7.1), (7.5, 0.38, 0.22), paper, 0.08)
    label("Room title", "SYSTEMS CONTROL ROOM", (0, 4.8, 6.7), 0.42, white)
    label("Room subtitle", "OPERATIONS  /  AUTOMATION  /  AI", (0, 4.77, 6.2), 0.18, paper)

    stations = [(-4.5, "01  OPERATIONS", coral, "SEE THE WORK"), (0, "02  AUTOMATION", orange, "MAKE IT REPEATABLE"), (4.5, "03  AI SYSTEMS", yellow, "IMPROVE THE DECISION")]
    for x, station_label, accent, caption in stations:
        cube("Desk", (x, 1.5, 1.25), (2.0, 1.0, 0.16), paper, 0.1)
        cube("Desk leg", (x - 1.5, 1.5, 0.55), (0.12, 0.12, 0.55), ink, 0.04)
        cube("Desk leg", (x + 1.5, 1.5, 0.55), (0.12, 0.12, 0.55), ink, 0.04)
        cube("Display", (x, 3.45, 3.55), (1.65, 0.12, 1.0), ink, 0.12)
        cube("Display glow", (x, 3.27, 3.55), (1.35, 0.025, 0.72), accent, 0.04)
        cube("Display stand", (x, 3.1, 2.15), (0.12, 0.12, 0.55), ink, 0.03)
        torus("Station orbit", (x, 3.05, 3.55), 1.65, 0.035, accent, rotation=(math.pi / 2, 0, 0))
        label(f"Station label {x}", station_label, (x, 3.06, 3.56), 0.25, white)
        label(f"Station caption {x}", caption, (x, 1.48, 1.52), 0.16, ink, rotation=(0, 0, 0))

    for x, z in [(-5.3, 4.0), (-4.5, 4.5), (-3.7, 4.0), (-4.5, 3.7)]:
        sphere("Scale signal node", (x, 3.18, z), 0.13, coral)
    label("Scale proof", "40K+   /   500+   /   27", (-4.5, 3.16, 4.75), 0.2, white)

    for index in range(4):
        cube("Workflow block", (-1.25 + index * 0.82, 3.15, 3.15), (0.27, 0.035, 0.18), orange, 0.03)
        if index < 3:
            cube("Workflow connector", (-0.82 + index * 0.82, 3.1, 3.15), (0.12, 0.02, 0.025), paper, 0.01)

    sphere("Decision core", (4.5, 3.08, 3.55), 0.35, yellow)
    torus("Decision orbit", (4.5, 3.05, 3.55), 0.78, 0.045, yellow, rotation=(math.pi / 3, 0, math.pi / 5))
    torus("Decision orbit", (4.5, 3.05, 3.55), 0.62, 0.035, white, rotation=(math.pi / 2.8, 0, -math.pi / 4))

    signal = sphere("Story signal", (-6.2, 1.7, 1.95), 0.12, coral)
    signal.keyframe_insert(data_path="location", frame=1)
    signal.location = (0, 1.7, 1.95)
    signal.keyframe_insert(data_path="location", frame=48)
    signal.location = (6.2, 1.7, 1.95)
    signal.keyframe_insert(data_path="location", frame=96)
    signal.location = (-6.2, 1.7, 1.95)
    signal.keyframe_insert(data_path="location", frame=144)

    bpy.ops.object.camera_add(location=(11.8, -16.5, 10.4))
    camera = bpy.context.object
    camera.data.lens = 52
    look_at(camera, (0, 2.6, 2.8))
    scene.camera = camera
    for location, color, energy, size in [((0, -2, 10), (1.0, 0.45, 0.3), 1250, 7), ((-7, 1, 5), (1.0, 0.18, 0.08), 650, 4), ((6, 4, 7), (1.0, 0.62, 0.22), 900, 5)]:
        bpy.ops.object.light_add(type="AREA", location=location)
        light = bpy.context.object
        light.data.energy = energy
        light.data.color = color
        light.data.shape = "DISK"
        light.data.size = size
        look_at(light, (0, 2.5, 2.5))
    bpy.ops.wm.save_as_mainfile(filepath="D:/portoflio/final/site/scene/operations_control_room.blend")


if __name__ == "__main__":
    build()
