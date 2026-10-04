"""Generate Web CSS variables from the canonical shared design tokens."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
tokens = json.loads((ROOT / 'shared' / 'design' / 'design-tokens.json').read_text(encoding='utf-8'))
colors = tokens['colors']
body = tokens['typography']['body']
layout = tokens['layout']
css = [
    '/* Generated from shared/design/design-tokens.json. Do not edit by hand. */',
    ':root {',
    f'  --bg: {colors["background"]};',
    f'  --panel: {colors["surface"]};',
    f'  --panel-2: {colors["surfaceElevated"]};',
    f'  --ink: {colors["text"]};',
    f'  --muted: {colors["secondary"]};',
    f'  --dim: {colors["tertiary"]};',
    f'  --line: {colors["border"]};',
    f'  --gold: {colors["accent"]};',
    f'  --gold-soft: {colors["accentMuted"]};',
    f'  --reader-max: {layout["readerMaxWidthPx"]}px;',
    f'  --max: {layout["shellMaxWidthPx"]}px;',
    f'  --reader-size: {body["sizePx"]}px;',
    f'  --reader-leading: {body["lineHeight"]};',
    *[f'  --s{i+1}: {px}px;' for i, px in enumerate(layout['spacingPx'])],
    f'  --radius: {layout["cardRadiusPx"]}px;',
    '}',
]
for name, palette in tokens['tones'].items():
    css.append(f'html[data-reader-tone="{name}"] {{ --bg: {palette["background"]}; --panel: {palette["surface"]}; --panel-2: {palette["surface"]}; --ink: {palette["text"]}; --muted: {palette["secondary"]}; --line: {palette["border"]}; --gold: {palette["accent"]}; }}')
for size in body['sizeChoicesPx']:
    css.append(f'html[data-reader-size="{size}"] {{ --reader-size: {size}px; }}')
for name, value in body['lineHeightChoices'].items():
    css.append(f'html[data-reader-leading="{name}"] {{ --reader-leading: {value}; }}')
out = ROOT / 'web' / 'src' / 'app' / 'tokens.generated.css'
out.write_text('\n'.join(css) + '\n', encoding='utf-8')
print(f'Generated {out.relative_to(ROOT)} from canonical U2 design tokens')
