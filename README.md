This is the simplest interactive map for players of my Pathfinder campaign made as a second-screen assistant to ease the navigation and remembering the toponyms. I don't have any further plans on this.

## Features
- Multiple maps
- Several marker types
- Built-in edit mode (available only on local launch)
- link popover to integrate with your external wiki (I use Obsidian's [Digital Garden](https://dg-docs.ole.dev/))

## Adaptation
You can easily create your own map like this:
- Fork this repo
- You need the token at the [Mapbox Studio](https://studio.mapbox.com/), with having `VITE_MAPBOX_TOKEN` in your `.env.local` file.
- You need the marker storage. I use [JsonSilo](https://jsonsilo.com/) with `VITE_SILO_JSON_KEY` and `VITE_SILO_UUID` in your `.env.local` file. Both the UUID and the manage key is available from their console, but beware that `VITE_SILO_JSON_KEY` has the expiration date.
- change `lib/maps.ts` with your own map data.
- I host the result on [Vercel](https://vercel.com/), please make sure to put env variables at Vercel's console as well.

## Map image size limit

Mapbox GL renders map images as WebGL textures. Mobile GPUs enforce a maximum texture size — images larger than the limit silently fail to load, showing a black screen instead of the map.

**Keep map images at or below 4096 × 4096 px** to be safe on all devices (mid-range and older Android GPUs cap at 4096; modern devices allow up to 8192 or 16384).

To downscale before uploading:
```bash
# ImageMagick — shrinks only if larger than 4096 on either side, preserves aspect ratio
magick input.webp -resize 4096x4096\> output.webp

# ffmpeg
ffmpeg -i input.webp -vf "scale='min(4096,iw)':-1:flags=lanczos" output.webp
```
