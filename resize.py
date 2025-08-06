from PIL import Image, ImageSequence

def compress_gif(input_path, output_path, resize_factor=0.4, max_colors=60):
    original = Image.open(input_path)

    frames = []
    for frame in ImageSequence.Iterator(original):
        # Resize the frame
        frame = frame.resize(
            (int(frame.width * resize_factor), int(frame.height * resize_factor)),
            Image.LANCZOS
        )
        # Reduce colors
        frame = frame.convert('P', palette=Image.ADAPTIVE, colors=max_colors)
        frames.append(frame)

    # Save as optimized GIF
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        optimize=True,
        duration=original.info.get('duration', 100),
        loop=original.info.get('loop', 0)
    )

# Usage
compress_gif('/home/pol/Videos/demo.gif', '/home/pol/Videos/output1.gif')