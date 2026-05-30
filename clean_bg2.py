from PIL import Image

def flood_fill_transparent(img_path, out_path, tolerance=30):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # We will assume pixels near the borders that match the top-left color are background
    bg_color = pixels[0, 0]

    def color_dist(c1, c2):
        return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5

    # Since it's a checkerboard, let's just grab the two colors from (0,0) and (16,0)
    # usually checkerboard squares are 16x16 or 8x8. Let's just find the distinct colors in the top row.
    bg_colors = set()
    for x in range(32):
        c = pixels[x, 0]
        if all(color_dist(c, bc) > tolerance for bc in bg_colors):
            bg_colors.add(c)

    print("Detected bg colors:", bg_colors)

    # Let's remove any pixel that is close to ANY of the bg colors
    for x in range(width):
        for y in range(height):
            c = pixels[x, y]
            if any(color_dist(c, bc) < tolerance for bc in bg_colors):
                pixels[x, y] = (0, 0, 0, 0)
    
    img.save(out_path)
    print("Saved clean image with flood fill.")

flood_fill_transparent('images/retro_contact_char.png', 'images/retro_contact_char_clean.png')
