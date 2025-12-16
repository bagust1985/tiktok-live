# Logo File

Silakan taruh file logo dengan nama **`logo.png`** di folder ini.

## Spesifikasi Logo:

- **Format**: PNG dengan background transparan
- **Isi**: Logo icon TiktokAsia dengan text (icon + text dalam satu file)
- **Ukuran**: 
  - Width: 800px (atau lebih tinggi untuk kualitas @2x retina)
  - Height: Menyesuaikan aspect ratio (disarankan ~200px untuk width 800px)
- **Background**: Transparan (PNG dengan alpha channel)
- **File name**: `logo.png`

Logo akan otomatis di-resize oleh Next.js Image component:
- **Landing page**: Size lebih besar (default variant)
- **Dashboard header**: Size lebih kecil (compact variant)

## Cara Menambahkan Logo:

1. Export logo dari design tool (Figma, Photoshop, dll) sebagai PNG dengan background transparan
2. Optimize file size (gunakan TinyPNG atau tools sejenis) untuk performa web
3. Simpan file sebagai `logo.png` di folder `public/`
4. Logo akan otomatis muncul di:
   - Landing page (`/`)
   - User dashboard header

