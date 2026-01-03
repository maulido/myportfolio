"use client";

import { Filter } from "lucide-react";

interface CareerFilterProps {
    currentFilter: 'all' | 'work' | 'education' | 'achievement';
    onFilterChange: (filter: 'all' | 'work' | 'education' | 'achievement') => void;
}

export default function CareerFilter({ currentFilter, onFilterChange }: CareerFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
                value={currentFilter}
                onChange={(e) => onFilterChange(e.target.value as 'all' | 'work' | 'education' | 'achievement')}
                className="rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <option value="all">All Types</option>
                <option value="work">Work Experience</option>
                <option value="education">Education</option>
                <option value="achievement">Achievements</option>
            </select>
        </div>
    );
}
