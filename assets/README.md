# SGEN website assets

Các asset trong thư mục này đã được chuẩn bị từ bộ ảnh tham chiếu để dùng trực tiếp ở bước dựng website.

## Nhóm asset

- `backgrounds/`: ba nền toàn chiều rộng — tối có hành tinh, tối không hành tinh và nền sáng — không có chữ/card.
- `brand/`: logo dùng trên nền sáng và nền tối.
- `illustrations/`: tượng Pythagoras và minh họa số 1 có nền trong suốt.
- `methods/`: ba biểu tượng tròn cho section Tầm nhìn & phương pháp.
- `programs/`: sáu minh họa tròn cho chương trình đào tạo.
- `blog/`: bốn thumbnail bài viết.
- `team/`: chân dung Ths. Phạm Bá Nha đã tách nền và nền vũ trụ đặt phía sau, dùng cho hero trang chủ.

## Trạng thái nền/alpha

- `backgrounds/` và `blog/` cố ý là ảnh nền/thumbnail opaque, không cần alpha.
- `brand/` và `illustrations/` có nền trong suốt quanh logo/chủ thể; minh họa lớn dùng WebP alpha để giảm dung lượng.
- `methods/` và `programs/` trong suốt ở bên ngoài huy hiệu tròn. Phần đĩa tím bên trong được giữ lại vì đó là một phần của thiết kế, không phải nền card bị sót.
- Các crop chương trình thô được giữ riêng trong `_source-crops/programs/` để đối chiếu; code website chỉ dùng file `*-v2.png` được khai báo trong manifest.

Danh sách đường dẫn và vai trò cụ thể nằm trong `manifest.json`.

## Nguồn và cách tạo

- Background và hai minh họa đặc biệt được tạo/tách bằng built-in ImageGen, sử dụng các ảnh trong `sections/` làm style/edit reference.
- Logo, hình chương trình, biểu tượng phương pháp và thumbnail blog được crop từ chính ảnh tham chiếu để giữ đúng hình dáng.
- `scripts/extract_assets.py` là quy trình tái tạo asset crop/conversion. Chạy lại script sẽ ghi lại các asset cùng tên từ nguồn hiện có.

## Prompt ImageGen đã dùng

### Dark cosmic background

```text
Use case: stylized-concept
Asset type: reusable full-width website section background
Primary request: Create a clean dark cosmic numerology background inspired by the supplied SGEN Education reference sections.
Scene/backdrop: deep midnight indigo outer space with subtle violet nebula clouds, tiny stars, delicate glowing constellation lines and faint flowing dotted energy waves near the top and bottom edges; include a soft magenta-violet planetary horizon glow along the bottom edge.
Composition/framing: wide landscape background, visual detail concentrated around outer edges, center and central upper area kept quiet and readable for website text/cards, seamless enough for background-size cover.
Constraints: background only; no text, no logo, no numbers, no cards, no people, no icons, no diagrams, no watermark.
```

### Light cosmic background

```text
Use case: stylized-concept
Asset type: reusable full-width light website section background
Primary request: Create a clean luminous pale cosmic background inspired by the supplied SGEN Education reference sections.
Scene/backdrop: soft white to very pale lavender canvas, diffused violet glow along lower edges, sparse tiny stars, nearly transparent constellation lines, and delicate flowing dotted energy waves at the top and bottom.
Composition/framing: wide landscape, center kept very clean for dark text and white cards, subtle visual accents restricted to perimeter and corners, background-size cover friendly.
Constraints: background only; no text, no logo, no numbers, no cards, no people, no icons, no diagrams, no watermark; maintain high contrast usability for dark navy text.
```

### Dark cosmic background without planet

```text
Use case: stylized-concept
Asset type: reusable full-width dark website background for middle content sections
Primary request: Create a clean dark cosmic numerology background inspired by the supplied SGEN Education sections, specifically without a planet or planetary horizon.
Scene/backdrop: deep midnight indigo and violet star field, restrained purple nebula clusters near outer edges, delicate glowing constellation lines in the corners, and faint flowing dotted energy waves along the top and bottom edges.
Composition/framing: wide landscape background; central 65 percent quiet and low-detail for headings, tabs and cards; edge decoration subtle; background-size cover friendly.
Constraints: background only; absolutely no planet, no planetary horizon, no sunrise, no text, no logo, no numbers, no cards, no people, no icons, no geometry diagrams, no watermark.
```

### Pythagoras cutout

```text
Use case: background-extraction
Asset type: transparent website illustration
Primary request: Isolate and faithfully recreate only the violet cosmic bust of Pythagoras shown in the right-hand artwork of the reference image.
Subject: classical bearded Pythagoras bust from chest upward, three-quarter view facing left, formed from luminous violet constellation lines, star points and subtle nebula texture.
Constraints: genuinely transparent background; keep only the bust and its internal constellation texture; remove the dark rectangular panel, all headings, body text, formulas, geometry diagrams, border and decorative objects; no added text, no logo, no watermark.
```

### Numeral 1 cutout

```text
Use case: background-extraction
Asset type: transparent hero illustration for a numerology content card
Primary request: Isolate and faithfully recreate the luminous cosmic numeral 1 artwork from the left half of the reference card.
Subject: one large elegant serif numeral "1" made of translucent lavender stardust and internal glowing particles, encircled by thin elliptical orbital rings, small luminous spheres, constellation dots and a focused light halo beneath.
Constraints: genuinely transparent background; keep only the numeral, orbit rings, particles and local glow; remove the card, dark rectangular background, headings, body text, buttons and borders; no additional numbers, no words, no logo, no watermark.
```

### Chân dung Ths. Phạm Bá Nha (tách nền)

Dựng lại bằng built-in ImageGen từ ảnh gốc 200×200 trên sgen.vn/gioi-thieu; bản PNG 1024×1536 lưu ở `_source-crops/team/`, website dùng bản WebP 760×1140.

```text
Use case: identity-preserve (edit) + background-extraction
Asset type: website hero portrait for a tall arch frame about 380x460 CSS pixels at retina resolution.
Primary request: recreate this same man as a high-resolution, sharp professional studio portrait, preserving his identity as faithfully as possible. Keep the same face shape, eyes, nose, mouth, hairline, skin tone and age. No beautification that alters identity.
Subject: waist-up standing portrait, body slightly turned three-quarter, facing the camera with a calm confident smile, one hand gently at chest level like the reference. Dark navy suit, crisp white shirt, red patterned tie.
Style: photorealistic corporate portrait, realistic skin texture, soft studio key light and subtle violet rim light along hair and shoulders.
Composition: 1024x1536, vertical 2:3, centered, head in upper third with small headroom, body cropped at waist.
Background: genuinely transparent PNG with real alpha channel, clean cutout edges including hair.
Avoid: changing the face or age, extra people, text, logos, watermarks, microphones.
```

### Nền phía sau chân dung

```text
Use case: stylized-concept
Asset type: website hero background plate behind a founder portrait within a tall arch frame.
Primary request: a deep cosmic purple space scene, 1024x1536, vertical 2:3.
Color palette: night navy #07032e, violet #5a22e8, bright violet #7a3cff, magenta accent #e81491.
Scene: soft nebula clouds, fine stars, a glowing curved planet horizon near the bottom third with pink-violet atmospheric glow, a gentle diffuse halo in the upper-middle area behind the portrait's head and shoulders, center kept calm and uncluttered.
Avoid: people, faces, silhouettes, text, logos, watermarks, hard bright objects in the center.
```
