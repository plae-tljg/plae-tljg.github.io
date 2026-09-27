# Image credits

Photographs used on the site, with their sources and licences. Anything that is
not public domain is attributed on the page where it appears as well.

| Where | File | Title | Author | Licence | Source |
|---|---|---|---|---|---|
| Home hero | `src/assets/hero-formulas.jpg` | Pure mathematics formulæ blackboard | Wallpoper | Public domain | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pure-mathematics-formul%C3%A6-blackboard.jpg) |
| Series: Why I Already Knew AI Would Take Over Mathematics | `src/assets/series-math.jpg` | Einstein's theory of relative blackboard | thepatrick | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Flickr](https://www.flickr.com/photos/93529274@N00/1508924823) |
| Series: AI-Maintainable Systems | `src/assets/series-systems.jpg` | edifício acal, são paulo, april 2006 | seier+seier | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Flickr](https://www.flickr.com/photos/94852245@N00/866397659) |

## Adding a new image

1. Put the file in `src/assets/`.
2. Register it in `src/lib/assets.ts` (and in `COVERS` if it is a series cover).
3. Add an entry to `IMAGE_CREDITS` in `src/site.mjs` so the page caption and this
   table stay correct.
4. Add the row to the table above.

Prefer public-domain or CC0 sources. For CC BY / CC BY-SA, the author, title,
licence and a link to both the source and the licence must appear on the page —
the series header renders this automatically from `IMAGE_CREDITS`.
