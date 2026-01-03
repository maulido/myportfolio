"use client";

import { useState } from 'react';
import { Search, Tag, Clock } from 'lucide-react';

interface BlogSearchProps {
    onSearchChange: (query: string) => void;
    onTagsChange: (tags: string[]) => void;
    availableTags: string[];
    selectedTags: string[];
}

export function BlogSearch({
    onSearchChange,
    onTagsChange,
    availableTags,
    selectedTags
}: BlogSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearchChange(value);
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search posts by title or content..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg bg-card/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
            </div>

            {/* Tag Filter */}
            {availableTags.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <span>Filter by tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTags.includes(tag)
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Filters */}
            {(searchQuery || selectedTags.length > 0) && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Active filters:</span>
                    {searchQuery && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                            Search: "{searchQuery}"
                        </span>
                    )}
                    {selectedTags.length > 0 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                            {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                        </span>
                    )}
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            onSearchChange('');
                            onTagsChange([]);
                        }}
                        className="text-primary hover:underline"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

interface ReadingTimeProps {
    content: string;
}

export function ReadingTime({ content }: ReadingTimeProps) {
    const minutes = calculateReadingTime(content);

    return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{minutes} min read</span>
        </div>
    );
}
