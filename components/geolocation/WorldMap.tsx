"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from "react-leaflet";
import { useTheme } from "next-themes";
import { getColorForCount, getRadiusForCount, matchGeoToCountry, fetchWorldGeoJSON } from "@/lib/geo-utils";
import type { GeoCountryData } from "@/hooks/useGeoData";
import { getFlag } from "@/lib/geo-utils";
import type { FeatureCollection } from "geojson";
import type L from "leaflet";

interface WorldMapProps {
  countries: GeoCountryData[];
  maxCount: number;
  countryRecord: Record<string, number>;
}

export default function WorldMap({ countries, maxCount, countryRecord }: WorldMapProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetchWorldGeoJSON()
      .then((data) => setGeoJsonData(data))
      .catch(console.error);
  }, []);

  const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png";
  const lightTiles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png";
  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const geoJsonStyle = useMemo(
    () => ({
      fillColor: "#1e1b4b",
      weight: 0.8,
      opacity: 0.6,
      color: isDark ? "#3f3f46" : "#d4d4d8",
      fillOpacity: 0.15,
    }),
    [isDark],
  );

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <MapContainer
        center={[10, 5]}
        zoom={2}
        minZoom={2}
        maxZoom={8}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: isDark ? "#09090b" : "#fafafa" }}
        worldCopyJump={true}
      >
        <TileLayer
          key={isDark ? "dark" : "light"}
          url={isDark ? darkTiles : lightTiles}
          attribution={attribution}
          subdomains="abcd"
        />

        {geoJsonData && (
          <GeoJSON
            key={`geo-${isDark ? "dark" : "light"}`}
            data={geoJsonData}
            style={() => geoJsonStyle}
            onEachFeature={(feature, layer) => {
              const geoLayer = layer as L.Path;
              const name =
                feature.properties?.NAME ||
                feature.properties?.ADMIN ||
                feature.properties?.name ||
                "Unknown";
              const count = matchGeoToCountry(name, countryRecord);
              geoLayer.bindTooltip(
                `<div style="text-align:center;font-family:system-ui;font-size:13px;font-weight:600">
                  ${getFlag(name)} ${name}<br/>
                  <span style="color:${count > 0 ? "#818cf8" : "#71717a"};font-size:12px">
                    ${count > 0 ? `${count.toLocaleString()} utilisateurs` : "Aucun utilisateur"}
                  </span>
                </div>`,
                { sticky: true, direction: "top" as const, offset: [0, -10] as [number, number] },
              );
              if (count > 0) {
                const ratio = count / maxCount;
                geoLayer.on("mouseover", function () {
                  geoLayer.setStyle({ fillOpacity: 0.35 + ratio * 0.3, weight: 1.5 });
                });
                geoLayer.on("mouseout", function () {
                  geoLayer.setStyle({ ...geoJsonStyle, fillOpacity: 0.15, weight: 0.8 });
                });
              }
            }}
          />
        )}

        {countries.map((country) => (
          <CircleMarker
            key={country.name}
            center={[country.lat, country.lng]}
            radius={getRadiusForCount(country.count, maxCount)}
            fillColor={getColorForCount(country.count, maxCount)}
            fillOpacity={0.85}
            color={isDark ? "#6366f1" : "#4f46e5"}
            weight={1.5}
          >
            <Popup>
              <div className="text-center p-1 min-w-[140px]">
                <div className="text-lg mb-1">{getFlag(country.name)}</div>
                <div className="font-semibold text-sm">{country.name}</div>
                <div className="text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  {country.count.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {country.percentage}% du total
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Légende</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-indigo-300" />
            <span>Peu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <span>Moyen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span>Beaucoup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
