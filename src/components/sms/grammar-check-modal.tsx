'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface GrammarCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onApply: (correctedText: string) => void;
}

interface Suggestion {
  original: string;
  replacement: string;
  reason: string;
}

interface GrammarResult {
  status: 'perfect' | 'corrections_needed';
  sense: boolean;
  language: string;
  corrected_text: string;
  suggestions: Suggestion[];
  feedback: string;
}

export function GrammarCheckModal({ isOpen, onClose, originalText, onApply }: GrammarCheckModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarResult | null>(null);

  const runCheck = React.useCallback(async () => {
    if (!originalText.trim()) {
      toast.error('Message is empty');
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to check grammar');
      }

      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error running grammar check');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [originalText, onClose]);

  React.useEffect(() => {
    if (isOpen && !result && !loading) {
      runCheck();
    }
  }, [isOpen, result, loading, runCheck]);


  const handleApply = () => {
    if (result?.corrected_text) {
      onApply(result.corrected_text);
    }
    onClose();
    setResult(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setResult(null), 300); // clear after animation
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grammar & Sense Check</DialogTitle>
          <DialogDescription>
            AI-powered analysis for grammar, spelling, and sentence logic.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Analyzing your message...</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <span className="text-muted-foreground">Detected Language:</span>
                <span className="capitalize">{result.language}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm font-medium">
                <span className="text-muted-foreground">Logical Sense:</span>
                {result.sense ? (
                  <span className="text-emerald-500 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Makes sense</span>
                ) : (
                  <span className="text-amber-500 flex items-center"><AlertTriangle className="h-4 w-4 mr-1" /> Might not make sense</span>
                )}
              </div>

              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium mb-1">Feedback:</p>
                <p className="text-muted-foreground">{result.feedback}</p>
              </div>

              {result.status === 'perfect' ? (
                <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-md">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Your message is perfectly written!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium text-sm">Suggested Corrections:</p>
                  <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-sm bg-muted/50 p-2 rounded-md">
                        <div className="flex flex-col gap-1">
                          <span className="line-through text-red-500/70">{s.original}</span>
                          <span className="text-emerald-500 font-medium">{s.replacement}</span>
                          <span className="text-xs text-muted-foreground mt-1">{s.reason}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <p className="font-medium text-sm mb-2">Preview:</p>
                    <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                      {result.corrected_text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-24" /> // placeholder
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {result?.status === 'perfect' ? 'Close' : 'Cancel'}
          </Button>
          {!loading && result?.status === 'corrections_needed' && (
            <Button onClick={handleApply}>
              Apply Corrections
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
