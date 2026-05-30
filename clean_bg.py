from PIL import Image

img = Image.open('images/retro_contact_char.png')
img = img.convert("RGBA")
pixels = img.load()

# Assuming top-left 10x10 area is background, let's grab the two most common colors there.
from collections import Counter
bg_colors = []
for x in range(20):
    for y in range(20):
        bg_colors.append(pixels[x, y])

common = [c[0] for c in Counter(bg_colors).most_common(2)]
print("Background colors:", common)

# Remove those exact colors everywhere
for x in range(img.width):
    for y in range(img.height):
        if pixels[x, y] in common:
            pixels[x, y] = (0, 0, 0, 0)

img.save('images/retro_contact_char_clean.png')
print("Saved clean image.")
