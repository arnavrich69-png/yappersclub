# Brief 01 · Night 01 poster and story (do this first)

**When:** before you announce. Announcing on Saturday 10 Oct gives a full week before the night.
**Time needed:** about 10 minutes.

## Before you start

1. Put Padharo Sa's real logo file in `night01/assets/` (PNG or SVG, square, the bigger the better).
   The file there now is a crop from a phone screenshot. It is fine for checking layout, not for posting.
2. Open Claude Code in this pack's folder.

## Prompt to paste

```
Read brand/BRAND-RULES.md first. It is the source of truth and its "Fixed" sections must not change.

Then finish the Night 01 posts in night01/:

1. Replace night01/assets/padharo-sa-logo.png with the new Padharo Sa logo file I added to night01/assets/.
   Keep the file name padharo-sa-logo.png so both posters pick it up. If it is an SVG or not square,
   convert it to a square PNG of at least 800 x 800 with the logo centred. It sits inside a circle in
   the "PACKED AT" seal, so make sure nothing important is cut off by the circle.

2. [Only if I have told you the time] In both poster.html and story.html, change the #details line from
   "PADHARO SA · FREE ENTRY" to "PADHARO SA · <TIME> · FREE ENTRY". If it no longer fits on one line
   next to the big 17, reduce its font size a little. Do not move anything else.

3. Do NOT move the thread (#thread), change any colour, change any font, or add anything new.

4. Render with: python3 render.py   (install playwright and chromium first if needed)

5. Check the renders yourself before showing me: Hindi is shaped correctly (खट्टा मीठा, मीठी डोर,
   सुर, लोग, रिवाज़), nothing touches the border, the seal logo is crisp and centred, the date is readable
   at thumbnail size. Fix anything wrong, render again, then show me poster.png and story.png and tell
   me the output paths.
```

## Posting

- Feed post: `night01/poster.png` (4:5).
- Story: `night01/story.png`. It is also grid safe, so it can be the cover image of a reel.
- Profile picture: `logo/dhwanikul-profile.png`.
- Collab the feed post with Padharo Sa so it lands on both profiles.
