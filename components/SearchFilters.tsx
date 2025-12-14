import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button, Input } from './ui/Shared';
import { PostType } from '../types';

export interface FilterState {
    category: string;
    author: string;
    dateRange: 'all' | 'today' | 'week' | 'month';
    tags: string[];
}

interface SearchFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    categories: Record<string, string[]>;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange, categories }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        category: 'all',
        author: '',
        dateRange: 'all',
        tags: []
    });

    useEffect(() => {
        onFilterChange(filters);
    }, [filters]);

    const handleReset = () => {
        setFilters({
            category: 'all',
            author: '',
            dateRange: 'all',
            tags: []
        });
    };

    // Aggregate all categories efficiently
    const allCategories = Array.from(new Set(Object.values(categories).flat()));

    if (!isOpen) {
        return (
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-2 text-space-muted hover:text-white">
                <Filter size={16} /> Filtros Avançados
            </Button>
        );
    }

    return (
        <div className="bg-space-dark/30 border border-space-steel rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-mono text-space-neon uppercase">Filtros de Busca</h4>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-space-muted hover:text-white">
                        Limpar
                    </Button>
                    <button onClick={() => setIsOpen(false)} className="text-space-muted hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                    <label className="block text-xs font-mono text-space-muted mb-1">Categoria</label>
                    <select
                        value={filters.category}
                        onChange={e => setFilters({ ...filters, category: e.target.value })}
                        className="w-full bg-space-black border border-space-steel rounded p-2 text-sm text-white focus:border-space-neon outline-none"
                    >
                        <option value="all">Todas</option>
                        {allCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Date Filter */}
                <div>
                    <label className="block text-xs font-mono text-space-muted mb-1">Data</label>
                    <select
                        value={filters.dateRange}
                        onChange={e => setFilters({ ...filters, dateRange: e.target.value as any })}
                        className="w-full bg-space-black border border-space-steel rounded p-2 text-sm text-white focus:border-space-neon outline-none"
                    >
                        <option value="all">Todo o período</option>
                        <option value="today">Hoje</option>
                        <option value="week">Última Semana</option>
                        <option value="month">Último Mês</option>
                    </select>
                </div>

                {/* Author Filter */}
                <div>
                    <label className="block text-xs font-mono text-space-muted mb-1">Autor</label>
                    <Input
                        placeholder="Nome do autor..." // Simple text match for now
                        value={filters.author}
                        onChange={e => setFilters({ ...filters, author: e.target.value })}
                        className="h-[38px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;
