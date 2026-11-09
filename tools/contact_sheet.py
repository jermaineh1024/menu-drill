import sys
from PIL import Image
src, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv)>3 else 4
im = Image.open(src); W,H = im.size; sl = 900
n = (H + sl - 1)//sl
pages = []
for start in range(0, n, cols):
    k = min(cols, n-start)
    sheet = Image.new('RGB', (k*W + (k-1)*12, sl), 'white')
    for j in range(k):
        y0 = (start+j)*sl
        sheet.paste(im.crop((0,y0,W,min(H,y0+sl))), (j*(W+12),0))
    name = f"{out}-{start//cols+1}.png"; sheet.save(name); pages.append(name)
print(src, im.size, pages)
