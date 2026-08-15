"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { sortOptions } from "../../sort";
import { useProductFilters } from "../../hooks/use-product-filters"

export const ProductSort = () => {
    const [filters, setFilters] = useProductFilters();

    return (
        <div className="flex items-center gap-2">
            {sortOptions.map((option) => (
                <Button
                    key={option.value}
                    size="sm"
                    className={cn(
                        "rounded-full bg-white hover:bg-white",
                        filters.sort !== option.value &&
                        "bg-transparent border-transparent hover:border-border hover:bg-transparent"
                    )}
                    variant="secondary"
                    onClick={() => setFilters({ sort: option.value })}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
};