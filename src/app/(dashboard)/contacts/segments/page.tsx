'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { Plus, Filter, Trash2, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SegmentItem {
  id: string;
  name: string;
  description?: string | null;
  ruleDefinition: Record<string, unknown>;
  createdAt: string;
}

interface RuleRow {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const FIELD_OPTIONS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'carrier', label: 'Network / Carrier' },
  { value: 'email', label: 'Email' },
  { value: 'city', label: 'City' },
  { value: 'optedOut', label: 'Opted Out' },
  { value: 'consentGiven', label: 'Consent Given' },
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Does Not Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts With' },
];

export default function SegmentsPage() {
  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupOperator, setGroupOperator] = useState<'AND' | 'OR'>('AND');
  const [rules, setRules] = useState<RuleRow[]>([
    { id: '1', field: 'city', operator: 'equals', value: 'Kampala' },
  ]);
  const [saving, setSaving] = useState(false);

  // Unsaved changes protection
  const isSegmentDirty =
    builderOpen &&
    (name.trim().length > 0 ||
      description.trim().length > 0 ||
      rules.length > 1 ||
      rules[0]?.value !== 'Kampala');

  const { confirmDiscard } = useUnsavedChanges({
    id: 'segment-builder',
    isDirty: isSegmentDirty,
    title: 'Unsaved changes',
    message: 'You have unsaved changes in this segment builder. If you leave now, your segment rules will be lost.',
    onDiscard: () => {
      setBuilderOpen(false);
      setName('');
      setDescription('');
      setRules([{ id: '1', field: 'city', operator: 'equals', value: 'Kampala' }]);
    },
  });

  // Audience Evaluation State
  const [evaluating, setEvaluating] = useState(false);
  const [evaluatedCount, setEvaluatedCount] = useState<number | null>(null);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<SegmentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contacts/segments');
      if (res.ok) {
        const json = await res.json();
        setSegments(json.data || []);
      } else {
        toast.error('Failed to load segments');
      }
    } catch {
      toast.error('Network error loading segments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { id: String(Date.now()), field: 'city', operator: 'equals', value: '' },
    ]);
  };

  const removeRule = (id: string) => {
    if (rules.length === 1) {
      toast.error('A segment must contain at least one rule');
      return;
    }
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, field: keyof RuleRow, val: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
    setEvaluatedCount(null); // Invalidate evaluated count
  };

  const constructDsl = () => {
    return {
      operator: groupOperator,
      rules: rules.map((r) => {
        let val: string | boolean = r.value;
        if (r.field === 'optedOut' || r.field === 'consentGiven') {
          val = r.value === 'true';
        }
        return {
          field: r.field,
          operator: r.operator,
          value: val,
        };
      }),
    };
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const dsl = constructDsl();
      const res = await fetch('/api/contacts/segments/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleDefinition: dsl }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvaluatedCount(data.totalMatches ?? 0);
        toast.success(`Evaluated: ${data.totalMatches} contacts match this rule set`);
      } else {
        toast.error(data.error || 'Failed to evaluate audience');
      }
    } catch {
      toast.error('Network error evaluating audience');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSaveSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a segment name');
      return;
    }

    setSaving(true);
    try {
      const dsl = constructDsl();
      const res = await fetch('/api/contacts/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          ruleDefinition: dsl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save segment');
        return;
      }

      toast.success('Dynamic segment saved successfully!');
      setBuilderOpen(false);
      setName('');
      setDescription('');
      setEvaluatedCount(null);
      fetchSegments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error saving segment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSegment = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/segments/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Segment "${deleteTarget.name}" deleted`);
        setDeleteTarget(null);
        fetchSegments();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to delete segment');
      }
    } catch {
      toast.error('Network error deleting segment');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Dynamic Audience Segments"
        description="Build real-time, rule-based audience segments using contact attributes, tags, and locations."
        action={
          <Button onClick={() => setBuilderOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create Dynamic Segment
          </Button>
        }
      />

      {/* Segments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Segments</CardTitle>
          <CardDescription>
            Segments are dynamically re-calculated whenever a campaign is launched or evaluated.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading segments...
            </div>
          ) : segments.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <Filter className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="font-semibold text-base">No Dynamic Segments Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Build segments using rules like &quot;City is Kampala&quot; or &quot;Consent Given is true&quot; to target specific demographics without managing static lists.
              </p>
              <Button onClick={() => setBuilderOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> Create Segment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Rule Logic</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((seg) => (
                    <TableRow key={seg.id}>
                      <TableCell className="font-semibold">{seg.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {seg.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {String(seg.ruleDefinition?.operator || 'AND')} (
                          {Array.isArray(seg.ruleDefinition?.rules)
                            ? seg.ruleDefinition.rules.length
                            : 1}{' '}
                          rules)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(seg.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(seg)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segment Builder Dialog */}
      <Dialog
        open={builderOpen}
        onOpenChange={(open) => {
          if (!open) {
            confirmDiscard(() => {
              setBuilderOpen(false);
              setName('');
              setDescription('');
              setRules([{ id: '1', field: 'city', operator: 'equals', value: 'Kampala' }]);
            });
          } else {
            setBuilderOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveSegment}>
            <DialogHeader>
              <DialogTitle>Create Dynamic Segment</DialogTitle>
              <DialogDescription>
                Define rule conditions to filter contacts automatically in real-time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="segName">Segment Name</Label>
                <Input
                  id="segName"
                  placeholder="e.g. Kampala VIP Clients"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="segDesc">Description (Optional)</Label>
                <Input
                  id="segDesc"
                  placeholder="e.g. Contacts located in Kampala with confirmed opt-in"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Group Operator */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-medium text-muted-foreground">Match contacts where:</span>
                <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setGroupOperator('AND')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      groupOperator === 'AND'
                        ? 'bg-background shadow-xs text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ALL rules match (AND)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupOperator('OR')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      groupOperator === 'OR'
                        ? 'bg-background shadow-xs text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ANY rule matches (OR)
                  </button>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3 pt-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-muted/30 border rounded-xl"
                  >
                    <div className="sm:w-[150px]">
                      <Select
                        value={rule.field}
                        onValueChange={(val) => updateRule(rule.id, 'field', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value} className="text-xs">
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:w-[140px]">
                      <Select
                        value={rule.operator}
                        onValueChange={(val) => updateRule(rule.id, 'operator', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATOR_OPTIONS.map((op) => (
                            <SelectItem key={op.value} value={op.value} className="text-xs">
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      {rule.field === 'optedOut' || rule.field === 'consentGiven' ? (
                        <Select
                          value={rule.value || 'true'}
                          onValueChange={(val) => updateRule(rule.id, 'value', val)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True / Yes</SelectItem>
                            <SelectItem value="false">False / No</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Value..."
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRule(rule.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRule}
                  className="w-full text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
                </Button>
              </div>

              {/* Real-Time Live Audience Evaluation */}
              <div className="p-3 bg-secondary/5 dark:bg-primary/5 rounded-xl border border-secondary/20 dark:border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Audience Estimation</span>
                  <div className="text-sm font-semibold">
                    {evaluatedCount !== null ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {evaluatedCount.toLocaleString()} contacts match
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Click evaluate to calculate live count</span>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleEvaluate}
                  disabled={evaluating}
                  className="h-8 text-xs shrink-0"
                >
                  {evaluating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 mr-1.5 text-secondary dark:text-primary" />
                  )}
                  Evaluate Audience
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  confirmDiscard(() => {
                    setBuilderOpen(false);
                    setName('');
                    setDescription('');
                    setRules([{ id: '1', field: 'city', operator: 'equals', value: 'Kampala' }]);
                  });
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Segment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Segment"
        description={`Are you sure you want to delete the segment "${deleteTarget?.name}"? Campaigns using this segment will no longer be able to resolve it.`}
        confirmLabel="Yes, Delete Segment"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDeleteSegment}
      />
    </div>
  );
}
