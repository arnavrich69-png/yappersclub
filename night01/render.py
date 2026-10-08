"""Re-render the Night 01 poster and story after editing poster.html / story.html.
Usage:  python3 render.py
Needs:  pip install playwright && python3 -m playwright install chromium
"""
import asyncio, os
HERE = os.path.dirname(os.path.abspath(__file__))
JOBS = [("poster.html", "poster.png", 1080, 1350), ("story.html", "story.png", 1080, 1920)]
async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for src, out, w, h in JOBS:
            pg = await b.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
            await pg.goto("file://" + os.path.join(HERE, src))
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(HERE, out))
            print("rendered", out)
        await b.close()
asyncio.run(main())
