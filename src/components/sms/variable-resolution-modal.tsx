'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface VariableResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: string[];
  variables: string[];
  templateMessage: string;
  onConfirm: (
    personalizedMessages: { phone: string; message: string }[],
    hasFallback: boolean
  ) => void | Promise<void>;
  isLoading?: boolean;
}

interface RecipientVariableData {
  phone: string;
  values: Record<string, string>;
  skipVariables: boolean;
}

export function VariableResolutionModal({
  open,
  onOpenChange,
  recipients,
  variables,
  templateMessage,
  onConfirm,
  isLoading,
}: VariableResolutionModalProps) {
  const [data, setData] = React.useState<RecipientVariableData[]>([]);

  // Initialize data when modal opens
  React.useEffect(() => {
    if (open) {
      setData(
        recipients.map((phone) => ({
          phone,
          values: variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {}),
          skipVariables: false,
        }))
      );
    }
  }, [open, recipients, variables]);

  const handleValueChange = (phone: string, variable: string, value: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.phone === phone
          ? { ...item, values: { ...item.values, [variable]: value } }
          : item
      )
    );
  };

  const handleSkipChange = (phone: string, skip: boolean) => {
    setData((prev) =>
      prev.map((item) =>
        item.phone === phone ? { ...item, skipVariables: skip } : item
      )
    );
  };

  const isFormValid = React.useMemo(() => {
    return data.every((item) => {
      if (item.skipVariables) return true;
      return variables.every((v) => item.values[v]?.trim().length > 0);
    });
  }, [data, variables]);

  const handleSend = () => {
    if (!isFormValid) {
      toast.error('Please fill in all missing variables or skip them.');
      return;
    }

    const personalizedMessages = data.map((item) => {
      let customMessage = templateMessage;

      if (item.skipVariables) {
        // Remove variables from the message if skipped
        variables.forEach((v) => {
          // Simplistic fallback: remove the variable token completely. 
          // For a better fallback, we just replace with empty string.
          const regex = new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, 'g');
          customMessage = customMessage.replace(regex, '');
        });
        // Clean up double spaces that might result from removal
        customMessage = customMessage.replace(/\s{2,}/g, ' ').trim();
      } else {
        // Replace variables with actual values
        variables.forEach((v) => {
          const regex = new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, 'g');
          customMessage = customMessage.replace(regex, item.values[v] || '');
        });
      }

      return { phone: item.phone, message: customMessage };
    });

    const hasFallback = data.some((item) => item.skipVariables);
    onConfirm(personalizedMessages, hasFallback);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-muted/20">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Resolve Message Variables
          </DialogTitle>
          <DialogDescription>
            Your message contains <strong>{variables.length} variable(s)</strong> (
            {variables.map((v) => `{{${v}}}`).join(', ')}). 
            Please provide the values for each recipient, or choose to send a plain message without them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-0">
          <div className="min-w-max">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/40 sticky top-0 z-10 shadow-sm border-b border-border/80">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground border-r border-border/40 w-48">
                    Recipient
                  </th>
                  {variables.map((v) => (
                    <th key={v} className="px-4 py-3 font-semibold text-foreground border-r border-border/40 min-w-[150px]">
                      {`{{${v}}}`}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-foreground text-center w-32">
                    Send Plain
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.map((item) => {
                  
                  return (
                    <tr
                      key={item.phone}
                      className={cn(
                        'transition-colors hover:bg-muted/20',
                        item.skipVariables && 'bg-muted/10 opacity-75'
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs border-r border-border/40">
                        {item.phone}
                      </td>
                      {variables.map((v) => (
                        <td key={v} className="px-4 py-2 border-r border-border/40">
                          <Input
                            value={item.values[v]}
                            onChange={(e) => handleValueChange(item.phone, v, e.target.value)}
                            disabled={item.skipVariables}
                            placeholder={`Enter ${v}...`}
                            className={cn(
                              'h-8 text-xs',
                              !item.skipVariables && !item.values[v]?.trim() && 'border-amber-500/50 focus-visible:ring-amber-500/50'
                            )}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={item.skipVariables}
                            onCheckedChange={(checked) => handleSkipChange(item.phone, checked)}
                            aria-label="Skip variables"
                            title="Send without variables"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {!isFormValid && (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-500 font-medium">Missing variable data required</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!isFormValid || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-w-[140px]"
            >
              {isLoading ? 'Sending...' : 'Send Messages'}
              {!isLoading && <Send className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
