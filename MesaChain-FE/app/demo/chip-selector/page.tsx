"use client";

import { useState } from "react";
import { ChipSelector, Option } from "@/components/ui/chip-selector";

export default function ChipSelectorDemo() {
  // Single Select State
  const [singleValue, setSingleValue] = useState<string | string[]>("15");
  
  // Multiple Select State
  const [multiValue, setMultiValue] = useState<string | string[]>(["vegan", "spicy"]);

  const tipOptions: Option[] = [
    { value: "10", label: "10%" },
    { value: "15", label: "15%" },
    { value: "20", label: "20%" },
    { value: "25", label: "25%" },
  ];

  const filterOptions: Option[] = [
    { value: "vegan", label: "Vegan" },
    { value: "gf", label: "Gluten Free" },
    { value: "spicy", label: "Spicy" },
    { value: "organic", label: "Organic" },
    { value: "local", label: "Locally Sourced" },
  ];

  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">ChipSelector Component</h1>
          <p className="text-muted-foreground">
            A reusable component for single and multiple selection.
          </p>
        </div>

        {/* Single Select Example */}
        <section className="space-y-4 p-6 border rounded-lg shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Single Select (Tip Amount)</h2>
            <p className="text-sm text-muted-foreground">
              Mode: <code>single</code>
            </p>
          </div>
          
          <ChipSelector
            options={tipOptions}
            value={singleValue}
            onChange={setSingleValue}
            mode="single"
          />
          
          <div className="bg-muted p-3 rounded text-xs font-mono">
            Current Value: {JSON.stringify(singleValue)}
          </div>
        </section>

        {/* Multiple Select Example */}
        <section className="space-y-4 p-6 border rounded-lg shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Multiple Select (Filters)</h2>
            <p className="text-sm text-muted-foreground">
              Mode: <code>multiple</code> (default) with Clear All
            </p>
          </div>

          <ChipSelector
            options={filterOptions}
            value={multiValue}
            onChange={setMultiValue}
            mode="multiple"
            onClear={() => setMultiValue([])}
          />

          <div className="bg-muted p-3 rounded text-xs font-mono">
            Current Value: {JSON.stringify(multiValue)}
          </div>
        </section>

        {/* Disabled Example */}
        <section className="space-y-4 p-6 border rounded-lg shadow-sm opacity-75">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Disabled State</h2>
            <p className="text-sm text-muted-foreground">
              <code>isDisabled={true}</code>
            </p>
          </div>

          <ChipSelector
            options={tipOptions}
            value="15"
            onChange={() => {}}
            mode="single"
            isDisabled={true}
          />
        </section>
      </div>
    </div>
  );
}
