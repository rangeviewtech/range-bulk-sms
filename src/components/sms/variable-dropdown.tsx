'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, ExternalLink, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SmsVariable, getAllVariablesList } from '@/lib/sms/custom-variables';
import { getVariableColorTheme } from '@/components/sms/variable-textarea';
import { QuickAddVariable } from '@/components/sms/quick-add-variable';

interface VariableDropdownProps {
  onSelect: (variableKey: string) => void;
}

export function VariableDropdown({ onSelect }: VariableDropdownProps) {
  const [availableVariables, setAvailableVariables] = useState<SmsVariable[]>([]);
  const [search, setSearch] = useState('');
  const [showAddVar, setShowAddVar] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refreshVariables = () => {
      try {
        setAvailableVariables(getAllVariablesList());
      } catch {
        // fallback
      }
    };
    refreshVariables();

    if (typeof window !== 'undefined') {
      window.addEventListener('range_custom_variables_updated', refreshVariables);
      return () => window.removeEventListener('range_custom_variables_updated', refreshVariables);
    }
  }, []);

  const handleVariableCreated = (newVar: SmsVariable) => {
    setAvailableVariables((prev) => {
      if (prev.some(v => v.key === newVar.key)) return prev;
      return [...prev, newVar];
    });
    onSelect(newVar.key);
  };

  const filtered = availableVariables.filter(v => 
    v.label.toLowerCase().includes(search.toLowerCase()) || 
    v.key.toLowerCase().includes(search.toLowerCase())
  );
  
  const builtIn = filtered.filter(v => v.isSystem);
  const custom = filtered.filter(v => !v.isSystem);

  return (
    <>
      <div className="relative inline-flex items-center">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-medium gap-1.5 rounded-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insert Variable</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            portalled={false}
            align="end" 
            className="w-80 p-1.5 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50 flex flex-col"
          >
            {/* Header & Search */}
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Variables</span>
              <Link 
                href="/sms/variables" 
                target="_blank" 
              rel="noopener noreferrer" 
              className="text-secondary dark:text-primary hover:underline flex items-center gap-0.5 text-[10px] font-medium"
            >
              Manage all <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
          
          <div className="relative px-1 pb-2 border-b border-border/50 mb-1">
            <Search className="absolute left-3 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full rounded-lg bg-muted/60 py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#04648C] dark:focus:ring-[#FBCA07] focus:bg-muted transition-all"
            />
          </div>

          {/* List Area */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scroll flex-1">
            {filtered.length === 0 ? (
              <div className="py-3 text-center text-xs text-muted-foreground">
                No variables found
              </div>
            ) : (
              <>
                {builtIn.length > 0 && (
                  <>
                    <div className="px-2 py-1 mt-1 text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                      Built-in
                    </div>
                    {builtIn.map((v) => {
                      const theme = getVariableColorTheme(v.key);
                      return (
                        <DropdownMenuItem
                          key={v.key}
                          onClick={() => {
                            onSelect(v.key);
                            setOpen(false);
                          }}
                          className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground group"
                          title={`${v.label} ({{${v.key}}})${v.sampleValue ? ` · e.g. ${v.sampleValue}` : ''}`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={cn('text-[11px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 transition-all', theme.badgeClass)}>
                              {`{{${v.key}}}`}
                            </span>
                            <span className="text-xs font-medium text-foreground/85 truncate font-sans">
                              {v.label}
                            </span>
                          </div>
                          {v.sampleValue && (
                            <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0 hidden sm:inline-block max-w-[70px] truncate">
                              {v.sampleValue}
                            </span>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}

                {builtIn.length > 0 && custom.length > 0 && (
                  <DropdownMenuSeparator className="my-1" />
                )}

                {custom.length > 0 && (
                  <>
                    <div className="px-2 py-1 mt-1 text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                      Custom
                    </div>
                    {custom.map((v) => {
                      const theme = getVariableColorTheme(v.key);
                      return (
                        <DropdownMenuItem
                          key={v.key}
                          onClick={() => {
                            onSelect(v.key);
                            setOpen(false);
                          }}
                          className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground group"
                          title={`${v.label} ({{${v.key}}})${v.sampleValue ? ` · e.g. ${v.sampleValue}` : ''}`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={cn('text-[11px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 transition-all', theme.badgeClass)}>
                              {`{{${v.key}}}`}
                            </span>
                            <span className="text-xs font-medium text-foreground/85 truncate font-sans">
                              {v.label}
                            </span>
                          </div>
                          {v.sampleValue && (
                            <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0 hidden sm:inline-block max-w-[70px] truncate">
                              {v.sampleValue}
                            </span>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="pt-1 mt-1 border-t border-border/50">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setShowAddVar(true);
                setOpen(false);
              }}
              className="text-[11.5px] font-sans text-secondary dark:text-primary cursor-pointer flex items-center justify-center gap-1.5 py-2 font-semibold w-full rounded-lg hover:bg-secondary/10 dark:hover:bg-primary/10 focus:bg-secondary/10 dark:focus:bg-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Variable</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

      <QuickAddVariable 
        isOpen={showAddVar} 
        onClose={() => setShowAddVar(false)} 
        onSuccess={handleVariableCreated} 
      />
    </>
  );
}
