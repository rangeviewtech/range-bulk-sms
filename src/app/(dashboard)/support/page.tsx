'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  RefreshCw,
  LifeBuoy,
  Clock,
  CheckCircle,
  Send,
  User,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface TicketMessage {
  id: string;
  userId?: string | null;
  message: string;
  isAdminResponse: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Ticket Modal State
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Sender ID');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active View/Thread Modal State
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/support/tickets');
      if (!res.ok) throw new Error('Failed to load support tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
      // If an active ticket is open, update its messages
      if (activeTicket) {
        const found = (data.tickets || []).find((t: Ticket) => t.id === activeTicket.id);
        if (found) setActiveTicket(found);
      }
    } catch {
      toast.error('Unable to fetch support tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTicket]);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error('Please enter both a subject and details');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject.trim(),
          category: newCategory,
          priority: newPriority,
          message: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');

      toast.success('Support ticket created successfully');
      setIsNewOpen(false);
      setNewSubject('');
      setNewMessage('');
      fetchTickets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating ticket';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await fetch(`/api/support/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');

      toast.success('Reply posted');
      setReplyText('');
      fetchTickets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending reply';
      toast.error(msg);
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="default" className="bg-primary text-primary-foreground font-semibold">OPEN</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary" className="bg-secondary text-white">IN PROGRESS</Badge>;
      case 'RESOLVED':
        return <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">RESOLVED</Badge>;
      case 'CLOSED':
        return <Badge variant="outline" className="text-muted-foreground">CLOSED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-xs font-semibold text-red-600 dark:text-red-400">● Urgent</span>;
      case 'HIGH':
        return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">● High</span>;
      case 'MEDIUM':
        return <span className="text-xs text-muted-foreground">● Medium</span>;
      case 'LOW':
        return <span className="text-xs text-muted-foreground">● Low</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Support & Help Desk</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Open inquiries for sender ID approvals, carrier delivery, billing questions, or API integration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh tickets"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Open New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Open Support Ticket</DialogTitle>
                <DialogDescription>
                  Our telecom support specialists will review and reply within 1-2 hours.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Sender ID approval for RANGEBRAND"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sender ID">Sender ID Registration</SelectItem>
                        <SelectItem value="Billing & Wallet">Billing & Wallet</SelectItem>
                        <SelectItem value="SMS Delivery">SMS Delivery & DLR</SelectItem>
                        <SelectItem value="API & Webhooks">API & Developer</SelectItem>
                        <SelectItem value="Account & Security">Account & Security</SelectItem>
                        <SelectItem value="General">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newPriority} onValueChange={setNewPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent (Service Outage)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Description / Details</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Provide details, campaign IDs, or error codes..."
                    required
                  />
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tickets</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <LifeBuoy className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requiring resolution or pending response</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary dark:text-primary">&lt; 45 mins</div>
            <p className="text-xs text-muted-foreground mt-1">24/7 priority support desk</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Tickets</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tickets Table Card */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Ticket Queue</CardTitle>
            <CardDescription>Track status and updates on your inquiries.</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-lg border">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs px-2.5 py-1 h-7 ${
                  statusFilter === s ? 'bg-primary text-primary-foreground font-bold shadow-none' : ''
                }`}
                onClick={() => setStatusFilter(s)}
              >
                {s.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="space-y-3 p-4 sm:p-0 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 m-4 sm:m-0 border border-dashed rounded-lg">
              <LifeBuoy className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No support tickets found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Have an inquiry about routing, delivery, or pricing? Open a ticket.
              </p>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                onClick={() => setIsNewOpen(true)}
              >
                Open Ticket Now
              </Button>
            </div>
          ) : (
            <div className="w-full">
              <Table className="min-w-[750px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs font-semibold text-secondary dark:text-primary">
                        #{ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate text-foreground">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-normal">
                          {ticket.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTicket(ticket)}
                          className="hover:text-secondary"
                        >
                          View ({ticket.messages?.length || 0})
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

      {/* Ticket Conversation Detail Dialog */}
      <Dialog open={!!activeTicket} onOpenChange={(open) => !open && setActiveTicket(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] flex flex-col p-4 sm:p-6">
          {activeTicket && (
            <>
              <DialogHeader className="border-b pb-3">
                <div className="flex items-center justify-between pr-6">
                  <div className="space-y-1">
                    <DialogTitle className="text-lg flex items-center gap-2">
                      <span>{activeTicket.subject}</span>
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">#{activeTicket.id.slice(0, 8)}</span>
                      <span>•</span>
                      <span>{activeTicket.category}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(activeTicket.status)}</div>
                </div>
              </DialogHeader>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
                {activeTicket.messages?.map((msg) => {
                  const isAdmin = msg.isAdminResponse;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-sm ${
                        isAdmin ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl p-3 shadow-xs space-y-1 ${
                          isAdmin
                            ? 'bg-secondary/10 border border-secondary/20 text-foreground'
                            : 'bg-muted border text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          {isAdmin ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                              <span className="text-secondary font-semibold">Range Telecom Support</span>
                            </>
                          ) : (
                            <>
                              <User className="h-3.5 w-3.5" />
                              <span>You</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="border-t pt-3 space-y-2">
                <div className="flex gap-2">
                  <Textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to support..."
                    className="text-sm resize-none"
                    disabled={submittingReply || activeTicket.status === 'CLOSED'}
                  />
                  <Button
                    type="submit"
                    disabled={submittingReply || !replyText.trim() || activeTicket.status === 'CLOSED'}
                    className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {activeTicket.status === 'CLOSED' && (
                  <p className="text-xs text-muted-foreground text-center">
                    This ticket is closed. Open a new ticket if you have further inquiries.
                  </p>
                )}
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
