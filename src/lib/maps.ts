import type { MapDefinition } from "@/types/map";

export const MAPS: MapDefinition[] = [
  {
    id: "kandarian",
    label: "Kandarian",
    imageUrl:
      "https://vtt-kandarian-world-info.vercel.app/img/user/%D0%9A%D0%B0%D0%BD%D0%B4%D0%B0%D1%80%D0%B8%D0%B0%D0%BD/%D0%93%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F/kandarian_final_v2.webp",
    // Coordinates calculated to match image aspect ratio (6000x4000, 3:2)
    // Lat span: 2.125°, Lon span corrected for Mercator at ~42°N: 2.125 * 1.5 / cos(42°) ≈ 4.289°
    imageCoordinates: [
      [-78.114, 43.249], // Top Left
      [-73.826, 43.249], // Top Right
      [-73.826, 41.124], // Bottom Right
      [-78.114, 41.124], // Bottom Left
    ],
    center: [-75.97, 42.187],
    zoom: 9,
  },
  {
    id: "arnen",
    label: "Arnen",
    imageUrl:
      "https://vtt-kandarian-world-info.vercel.app/img/user/%D0%9A%D0%B0%D0%BD%D0%B4%D0%B0%D1%80%D0%B8%D0%B0%D0%BD/assets/arnen_large.WEBP",
    // Placeholder — replace with real bounds once known
    // Lat span: 0.0068°, Lon span: 0.0136°
    imageCoordinates: [
      [-75.9768, 42.1904], // Top Left
      [-75.9632, 42.1904], // Top Right
      [-75.9632, 42.1836], // Bottom Right
      [-75.9768, 42.1836], // Bottom Left
    ],
    center: [-75.97, 42.187],
    zoom: 17,
  },
];

export const DEFAULT_MAP_ID = MAPS[0].id;
