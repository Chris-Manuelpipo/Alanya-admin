"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Country {
  pays: string;
  users: number;
}

interface TopCountriesProps {
  data: Country[];
}

export function TopCountries({ data }: TopCountriesProps) {
  const max = Math.max(...data.map((c) => c.users));

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top Pays</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((country) => (
          <div key={country.pays} className="flex items-center gap-3">
            <span className="text-lg shrink-0 w-7">{getFlag(country.pays)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium truncate">{country.pays}</span>
                <span className="text-sm text-zinc-500">{country.users.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${(country.users / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getFlag(pays: string): string {
  const flags: Record<string, string> = {
    France: "🇫🇷",
    "Côte d'Ivoire": "🇨🇮",
    Cameroun: "🇨🇲",
    Sénégal: "🇸🇳",
    Maroc: "🇲🇦",
    Algérie: "🇩🇿",
    Tunisie: "🇹🇳",
    Belgique: "🇧🇪",
    Canada: "🇨🇦",
    Suisse: "🇨🇭",
  };
  return flags[pays] || "🌍";
}
