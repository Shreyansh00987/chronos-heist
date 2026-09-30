import asyncio
import os
import subprocess
import wave
import struct
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import edge_tts
import imageio_ffmpeg

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
OUTPUT_DIR = r"C:\Users\shrea\Documents\chronos-heist"
ARTIFACT_DIR = r"C:\Users\shrea\.gemini\antigravity\brain\986c7680-3a64-4a75-a095-260f5f1577fa"
TEMP_DIR = os.path.join(OUTPUT_DIR, "video_temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# 5 Scene definitions
SCENES = [
    {
        "id": "scene1",
        "header": "CHRONOS-HEIST // THE CLOCKMAKER'S VAULT",
        "tag": "TEMPORAL MYSTERY ENGINE",
        "badge_color": (0, 223, 143), # Neon emerald
        "text": "Welcome to Chronos-Heist, a playable temporal mystery game where changing the past rewrites the future in real time, powered entirely by Sanity Content Lake.",
        "image_path": os.path.join(ARTIFACT_DIR, "chronos_vault_intro_1790795334781.jpg"),
        "subtitles": [
            (0.0, 5.5, "Welcome to Chronos-Heist: a playable temporal mystery game,"),
            (5.5, 11.5, "where changing the past rewrites the future in real time, powered by Sanity Content Lake.")
        ]
    },
    {
        "id": "scene2",
        "header": "THREE CONCURRENT ERAS // 1920 - 1970 - 2026",
        "tag": "STRUCTURED CONTENT AS TIME",
        "badge_color": (255, 184, 0), # Amber
        "text": "Three distinct iterations of the vault exist concurrently across 1920, 1970, and 2026. Every object, room, and causal link is structured content inside Sanity.",
        "image_path": os.path.join(ARTIFACT_DIR, "chronos_three_eras_1790795352337.jpg"),
        "subtitles": [
            (0.0, 6.0, "Three iterations of the vault exist concurrently across 1920, 1970, and 2026."),
            (6.0, 12.0, "Every object, room, and causal link is structured content inside Sanity.")
        ]
    },
    {
        "id": "scene3",
        "header": "3D SPATIAL EXPLORATION & RETRO PUZZLES",
        "tag": "INTERACTIVE TEMPORAL HEIST",
        "badge_color": (0, 180, 255), # Cyan
        "text": "Explore an interactive 3D spatial room with full orbit controls. Crack the 1920 mechanical safe dial, and tune cathode resonance frequencies on the 1970 oscilloscope.",
        "image_path": os.path.join(ARTIFACT_DIR, "chronos_puzzles_3d_1790795372618.jpg"),
        "subtitles": [
            (0.0, 5.5, "Explore an interactive 3D spatial room with full 360-degree orbit controls."),
            (5.5, 12.0, "Crack the 1920 brass rotary safe dial, and tune 432 Hz cathode frequencies on the 1970 oscilloscope.")
        ]
    },
    {
        "id": "scene4",
        "header": "CAUSALITY ENGINE & REAL-TIME APP SDK",
        "tag": "ZERO-REFRESH EVENT LAKE",
        "badge_color": (240, 62, 47), # Sanity Red
        "text": "When you alter an artifact in 1920, Sanity's Live Query and our server-side Causality Engine instantly mutate the 2026 vault with zero page refresh, visualized in our live D3 graph.",
        "image_path": os.path.join(ARTIFACT_DIR, "chronos_causality_lake_1790795389298.jpg"),
        "subtitles": [
            (0.0, 6.5, "When you alter an artifact in 1920, Sanity's Live Query and Causality Engine"),
            (6.5, 12.5, "instantly mutate the 2026 vault with zero page refresh, tracked by our live D3 graph.")
        ]
    },
    {
        "id": "scene5",
        "header": "5-STAGE SANITY WORKFLOWS // LIVE ON VERCEL",
        "tag": "STAGE 5: TIMELINE SEALED",
        "badge_color": (0, 223, 143), # Neon green
        "text": "Actions advance through a structured five-stage workflow for Game Master review and timeline sealing. Chronos-Heist is live now on Vercel and GitHub. Step through the timeline today!",
        "image_path": os.path.join(ARTIFACT_DIR, "chronos_workflow_deploy_1790795405217.jpg"),
        "subtitles": [
            (0.0, 6.0, "Actions advance through a 5-stage workflow for Game Master review and timeline sealing."),
            (6.0, 12.0, "Chronos-Heist is live now on Vercel and open-source on GitHub. Step through the timeline today!")
        ]
    }
]

async def generate_speech():
    print("Generating AI voiceovers with edge-tts...")
    voice = "en-US-ChristopherNeural"
    for sc in SCENES:
        audio_file = os.path.join(TEMP_DIR, f"{sc['id']}.mp3")
        tts = edge_tts.Communicate(sc["text"], voice, rate="+2%")
        await tts.save(audio_file)
        
        # Get duration using ffprobe/ffmpeg
        res = subprocess.run([FFMPEG_EXE, "-i", audio_file], capture_output=True, text=True)
        dur = 11.0 # fallback
        for line in res.stderr.splitlines():
            if "Duration:" in line:
                part = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = part.split(":")
                dur = float(h)*3600 + float(m)*60 + float(s)
                break
        sc["audio_file"] = audio_file
        sc["duration"] = max(dur + 0.8, 11.5) # small breathing room between scenes
        print(f"[{sc['id']}] Voiceover generated: {dur:.2f}s (Allocated scene time: {sc['duration']:.2f}s)")

def generate_ambient_music(total_duration, sample_rate=44100):
    """Generates a subtle sci-fi ambient synth drone track."""
    print(f"Synthesizing background ambient score ({total_duration:.1f}s)...")
    n_samples = int(total_duration * sample_rate)
    t = np.linspace(0, total_duration, n_samples, False)
    
    # 65.4 Hz (C2) root chord with subtle fifth (98 Hz) and octave (130.8 Hz)
    drone1 = 0.12 * np.sin(2 * np.pi * 65.4 * t)
    drone2 = 0.08 * np.sin(2 * np.pi * 98.0 * t + 0.5)
    drone3 = 0.05 * np.sin(2 * np.pi * 130.81 * t + 1.0)
    
    # Slow LFO pulse (0.2 Hz)
    lfo = 0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * t)
    
    # Soft clockwork mechanical click every 1 second
    click_pulse = np.zeros(n_samples)
    for sec in range(int(total_duration)):
        idx = int(sec * sample_rate)
        if idx + 2000 < n_samples:
            env = np.exp(-np.linspace(0, 15, 2000))
            click_pulse[idx:idx+2000] = 0.04 * np.sin(2 * np.pi * 2400 * np.linspace(0, 2000/sample_rate, 2000)) * env
            
    audio = (drone1 + drone2 + drone3) * lfo + click_pulse
    
    # Fade in (2s) and fade out (3s)
    fade_in_len = min(n_samples, int(2.0 * sample_rate))
    audio[:fade_in_len] *= np.linspace(0, 1, fade_in_len)
    fade_out_len = min(n_samples, int(3.0 * sample_rate))
    audio[-fade_out_len:] *= np.linspace(1, 0, fade_out_len)
    
    # Normalize to 16-bit PCM
    audio_int16 = np.int16(audio / np.max(np.abs(audio) + 1e-6) * 16000)
    
    music_file = os.path.join(TEMP_DIR, "ambient_music.wav")
    with wave.open(music_file, "w") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(audio_int16.tobytes())
    return music_file

def load_fonts():
    font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 40)
    font_tag = ImageFont.truetype(r"C:\Windows\Fonts\consolab.ttf", 22)
    font_subtitle = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 36)
    font_meta = ImageFont.truetype(r"C:\Windows\Fonts\consolab.ttf", 20)
    return font_title, font_tag, font_subtitle, font_meta

def render_video():
    total_time = sum(sc["duration"] for sc in SCENES)
    print(f"Total video length: {total_time:.2f} seconds")
    
    music_file = generate_ambient_music(total_time)
    
    # Concatenate all scene voiceovers into one narration track with silence gaps
    print("Stitching narration voiceover track...")
    concat_list_file = os.path.join(TEMP_DIR, "voice_concat.txt")
    with open(concat_list_file, "w") as f:
        for sc in SCENES:
            f.write(f"file '{sc['audio_file'].replace(chr(92), '/')}'\n")
            # If scene duration is longer than audio, we add padded silence via an aevalsrc or similar
            # In ffmpeg we can pad or filter, but simpler is to assemble audio per scene or stream
    
    # Let's create an audio filter pipeline in ffmpeg
    # Combine individual scene audio with exact delays
    inputs = []
    filter_parts = []
    cumulative_time = 0.0
    for idx, sc in enumerate(SCENES):
        inputs.extend(["-i", sc["audio_file"]])
        delay_ms = int(cumulative_time * 1000)
        filter_parts.append(f"[{idx}]adelay={delay_ms}|{delay_ms}[a{idx}]")
        cumulative_time += sc["duration"]
    
    amix_inputs = "".join(f"[a{i}]" for i in range(len(SCENES)))
    filter_complex = f"{';'.join(filter_parts)};{amix_inputs}amix=inputs={len(SCENES)}:dropout_transition=0:normalize=0[vo];"
    
    # Add music track
    inputs.extend(["-i", music_file])
    music_idx = len(SCENES)
    filter_complex += f"[{music_idx}]volume=0.35[bgm];[vo][bgm]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]"
    
    final_audio_file = os.path.join(TEMP_DIR, "final_soundtrack.wav")
    cmd_audio = [FFMPEG_EXE, "-y"] + inputs + ["-filter_complex", filter_complex, "-map", "[aout]", final_audio_file]
    subprocess.run(cmd_audio, check=True)
    print("Master soundtrack generated successfully!")

    # Now render video frames at 24 fps and pipe directly to ffmpeg
    fps = 24
    width, height = 1920, 1080
    font_title, font_tag, font_subtitle, font_meta = load_fonts()
    
    final_video_file = os.path.join(OUTPUT_DIR, "chronos_heist_demo.mp4")
    artifact_video_file = os.path.join(ARTIFACT_DIR, "chronos_heist_demo.mp4")
    
    cmd_ffmpeg = [
        FFMPEG_EXE, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{width}x{height}",
        "-pix_fmt", "bgr24",
        "-r", str(fps),
        "-i", "-", # stdin
        "-i", final_audio_file,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_video_file
    ]
    
    pipe = subprocess.Popen(cmd_ffmpeg, stdin=subprocess.PIPE)
    
    global_time = 0.0
    frame_idx = 0
    total_frames = int(total_time * fps)
    
    print(f"Rendering {total_frames} frames ({width}x{height} @ {fps}fps)...")
    
    for scene_idx, sc in enumerate(SCENES):
        scene_dur = sc["duration"]
        n_scene_frames = int(scene_dur * fps)
        
        # Load high-res background image
        raw_img = Image.open(sc["image_path"]).convert("RGBA")
        
        for sf in range(n_scene_frames):
            t_in_scene = sf / fps
            current_global_time = global_time + t_in_scene
            
            # Ken Burns pan/zoom: subtle scale from 1.0 to 1.06
            scale = 1.0 + 0.06 * (sf / n_scene_frames)
            crop_w = int(raw_img.width / scale)
            crop_h = int(raw_img.height / scale)
            
            # Subtle pan direction alternating per scene
            if scene_idx % 2 == 0:
                crop_x = int((raw_img.width - crop_w) * (sf / n_scene_frames))
                crop_y = int((raw_img.height - crop_h) * 0.5)
            else:
                crop_x = int((raw_img.width - crop_w) * (1.0 - sf / n_scene_frames))
                crop_y = int((raw_img.height - crop_h) * 0.3)
                
            cropped = raw_img.crop((crop_x, crop_y, crop_x + crop_w, crop_y + crop_h))
            frame_img = cropped.resize((width, height), Image.Resampling.BILINEAR)
            
            # Create overlay canvas
            overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Top HUD Bar (Frosted glass)
            draw.rectangle([(0, 0), (width, 80)], fill=(10, 14, 23, 210))
            draw.line([(0, 80), (width, 80)], fill=(sc["badge_color"][0], sc["badge_color"][1], sc["badge_color"][2], 180), width=2)
            
            # Blinking REC dot
            is_blink = (int(current_global_time * 2) % 2 == 0)
            dot_color = (255, 40, 40, 255) if is_blink else (100, 20, 20, 180)
            draw.ellipse([(40, 30), (58, 48)], fill=dot_color)
            draw.text((68, 28), "LIVE FEED // REC", font=font_tag, fill=(255, 255, 255, 240))
            
            # Scene Title & Tag
            draw.text((360, 24), sc["header"], font=font_title, fill=(255, 255, 255, 255))
            
            # Tag badge on top right
            tag_text = f"[{sc['tag']}]"
            tag_bbox = font_tag.getbbox(tag_text)
            tag_w = tag_bbox[2] - tag_bbox[0]
            draw.text((width - 40 - tag_w, 28), tag_text, font=font_tag, fill=sc["badge_color"])
            
            # Corner HUD Reticles
            reticle_color = (sc["badge_color"][0], sc["badge_color"][1], sc["badge_color"][2], 120)
            margin = 30
            rl = 25
            # Top-left corner
            draw.line([(margin, 100), (margin + rl, 100)], fill=reticle_color, width=2)
            draw.line([(margin, 100), (margin, 100 + rl)], fill=reticle_color, width=2)
            # Top-right corner
            draw.line([(width - margin - rl, 100), (width - margin, 100)], fill=reticle_color, width=2)
            draw.line([(width - margin, 100), (width - margin, 100 + rl)], fill=reticle_color, width=2)
            # Bottom-left corner
            draw.line([(margin, height - 120 - rl), (margin, height - 120)], fill=reticle_color, width=2)
            draw.line([(margin, height - 120), (margin + rl, height - 120)], fill=reticle_color, width=2)
            # Bottom-right corner
            draw.line([(width - margin, height - 120 - rl), (width - margin, height - 120)], fill=reticle_color, width=2)
            draw.line([(width - margin - rl, height - 120), (width - margin, height - 120)], fill=reticle_color, width=2)
            
            # Subtitle Card (Bottom centered)
            cur_subtitle = ""
            for sub_start, sub_end, sub_txt in sc["subtitles"]:
                if sub_start <= t_in_scene <= sub_end:
                    cur_subtitle = sub_txt
                    break
            if not cur_subtitle and sc["subtitles"]:
                cur_subtitle = sc["subtitles"][-1][2]
                
            if cur_subtitle:
                sub_bbox = font_subtitle.getbbox(cur_subtitle)
                sub_w = sub_bbox[2] - sub_bbox[0]
                card_w = max(sub_w + 60, 600)
                card_h = 70
                card_x1 = (width - card_w) // 2
                card_y1 = height - 180
                card_x2 = card_x1 + card_w
                card_y2 = card_y1 + card_h
                
                # Card background with border
                draw.rounded_rectangle([(card_x1, card_y1), (card_x2, card_y2)], radius=12, fill=(8, 12, 20, 220), outline=(sc["badge_color"][0], sc["badge_color"][1], sc["badge_color"][2], 180), width=2)
                sub_x = card_x1 + (card_w - sub_w) // 2
                sub_y = card_y1 + (card_h - (sub_bbox[3] - sub_bbox[1])) // 2 - 4
                draw.text((sub_x, sub_y), cur_subtitle, font=font_subtitle, fill=(255, 255, 255, 255))
            
            # Bottom Status Bar & Ticker
            draw.rectangle([(0, height - 60), (width, height)], fill=(8, 12, 18, 230))
            draw.line([(0, height - 60), (width, height - 60)], fill=(40, 50, 70, 200), width=1)
            
            # Timecode on bottom-left
            total_sec = int(current_global_time)
            frames_rem = int((current_global_time - total_sec) * fps)
            tc_str = f"TC: 00:{total_sec:02d}:{frames_rem:02d}"
            draw.text((40, height - 42), tc_str, font=font_meta, fill=(0, 223, 143))
            
            # Tech badges in center/right
            ticker = "NEXT.JS 16 TURBOPACK  |  SANITY CONTENT LAKE  |  3D SPATIAL VAULT  |  APP SDK  |  VERCEL PRODUCTION"
            draw.text((360, height - 42), ticker, font=font_meta, fill=(160, 180, 210))
            draw.text((width - 320, height - 42), "VERIFIED PRODUCTION BUILD", font=font_meta, fill=(255, 184, 0))
            
            # Alpha composite overlay onto frame
            final_composite = Image.alpha_composite(frame_img, overlay).convert("RGB")
            
            # Convert to bgr24 raw bytes for ffmpeg
            bgr_bytes = np.array(final_composite)[:, :, ::-1].tobytes()
            pipe.stdin.write(bgr_bytes)
            
            frame_idx += 1
            if frame_idx % 120 == 0:
                print(f"Rendered {frame_idx}/{total_frames} frames ({frame_idx/total_frames*100:.1f}%)...")
                
        global_time += scene_dur
        
    pipe.stdin.close()
    pipe.wait()
    print(f"Video encoded successfully to: {final_video_file}")
    
    # Also copy to artifact directory so it's directly accessible
    import shutil
    shutil.copy2(final_video_file, artifact_video_file)
    print(f"Copied to artifact directory: {artifact_video_file}")

async def main():
    await generate_speech()
    render_video()

if __name__ == "__main__":
    asyncio.run(main())
