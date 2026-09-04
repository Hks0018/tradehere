"use client";

import { useState } from "react";
import type { MarketIndex } from "@/types";
import { IndexCard } from "@/components/market/IndexCard";
import { Tabs } from "@/components/ui/Tabs";

type Region = "All" | "India" | "Global";

export function IndicesPanel({ indices }: { indices: MarketIndex[] }) {
  const [region, setRegion] = useState<Region>("All");
  const visible = region === "All" ? indices : indices.filter((i) => i.region === region);

  return (
    <div>
      <Tabs
        ariaLabel="Filter indices by region"
        options={[
          { value: "All", label: "All", count: indices.length },
          { value: "India", label: "India", count: indices.filter((i) => i.region === "India").length },
          { value: "Global", label: "Global", count: indices.filter((i) => i.region === "Global").length },
        ]}
        value={region}
        onChange={(value) => setRegion(value as Region)}
        size="sm"
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((index) => (
          <IndexCard key={index.id} index={index} className="h-full" />
        ))}
      </div>
    </div>
  );
}
