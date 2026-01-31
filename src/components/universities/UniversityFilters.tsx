import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/types/profile";
import type { UniversityFilters } from "@/types/university";
import { X } from "lucide-react";

interface UniversityFiltersProps {
  filters: UniversityFilters;
  onChange: (filters: UniversityFilters) => void;
  onClear: () => void;
  preferredCountries?: string[];
}

const CATEGORIES = [
  { value: "dream", label: "Dream" },
  { value: "target", label: "Target" },
  { value: "safe", label: "Safe" },
];

export function UniversityFiltersComponent({
  filters,
  onChange,
  onClear,
  preferredCountries = [],
}: UniversityFiltersProps) {
  const hasFilters = filters.country || filters.category;

  // Show preferred countries first, then others
  const sortedCountries = [
    ...COUNTRIES.filter((c) => preferredCountries.includes(c.value)),
    ...COUNTRIES.filter((c) => !preferredCountries.includes(c.value)),
  ];

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Country Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Country</Label>
          <select
            value={filters.country || ""}
            onChange={(e) => onChange({ ...filters, country: e.target.value || undefined })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Countries</option>
            {preferredCountries.length > 0 && (
              <optgroup label="Your Preferred">
                {sortedCountries
                  .filter((c) => preferredCountries.includes(c.value))
                  .map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
              </optgroup>
            )}
            <optgroup label="Other Countries">
              {sortedCountries
                .filter((c) => !preferredCountries.includes(c.value))
                .map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <select
            value={filters.category || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value as "dream" | "target" | "safe" | undefined,
              })
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
