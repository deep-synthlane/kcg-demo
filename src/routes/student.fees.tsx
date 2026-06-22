import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Smartphone, Building2, IndianRupee, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, StatCard } from "@/components/RoleShell";
import { STUDENT_FEES } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/student/fees")({
  head: () => ({ meta: [{ title: "Fees & Payments · KCG" }] }),
  component: FeesPage,
});

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, hint: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: CreditCard, hint: "Debit / Credit Card" },
  { id: "netbanking", label: "Net Banking", icon: Building2, hint: "All major banks" },
];

function FeesPage() {
  const [payDialog, setPayDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [fees, setFees] = useState<{
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate: string;
    status: "Paid" | "Partial" | "Pending";
    breakdown: { id: string; item: string; amount: number; paid: number; status: "Paid" | "Partial" | "Pending" }[];
    history: typeof STUDENT_FEES.history;
  }>(STUDENT_FEES);

  const paidPercent = Math.round((fees.paidAmount / fees.totalFee) * 100);

  function handlePay() {
    if (!paymentMethod) return;
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPayDialog(false);
      setPaymentMethod(null);
      setFees((prev) => ({
        ...prev,
        paidAmount: prev.totalFee,
        pendingAmount: 0,
        status: "Paid" as const,
        breakdown: prev.breakdown.map((b) => ({ ...b, paid: b.amount, status: "Paid" as const })),
      }));
      toast.success("Payment successful! All dues cleared.");
    }, 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees & Payments"
        subtitle="View fee status, pending dues, and payment history"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Fee"
          value={`₹${(fees.totalFee / 1000).toFixed(0)}K`}
          icon={IndianRupee}
          tone="primary"
          hint="Academic Year 2025-26"
        />
        <StatCard
          label="Paid Amount"
          value={`₹${(fees.paidAmount / 1000).toFixed(0)}K`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Pending Amount"
          value={`₹${(fees.pendingAmount / 1000).toFixed(0)}K`}
          icon={AlertCircle}
          tone={fees.pendingAmount > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Due Date"
          value={fees.dueDate}
          icon={Clock}
          tone={fees.pendingAmount > 0 ? "destructive" : "success"}
        />
      </div>

      {/* Payment progress */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Payment Progress</h3>
            <p className="text-xs text-muted-foreground">
              ₹{fees.paidAmount.toLocaleString()} of ₹{fees.totalFee.toLocaleString()} paid
            </p>
          </div>
          <Badge
            className={
              fees.status === "Paid"
                ? "bg-success/15 text-success border-0"
                : fees.status === "Partial"
                  ? "bg-warning/20 text-warning-foreground border-0"
                  : "bg-destructive/10 text-destructive border-0"
            }
          >
            {fees.status}
          </Badge>
        </div>
        <Progress value={paidPercent} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">{paidPercent}% complete</p>
      </div>

      {/* Fee breakdown */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="font-semibold">Fee Breakdown</h3>
          {fees.pendingAmount > 0 && (
            <Button size="sm" onClick={() => setPayDialog(true)}>
              <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Pay Now — ₹{fees.pendingAmount.toLocaleString()}
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.breakdown.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.item}</TableCell>
                <TableCell>₹{b.amount.toLocaleString()}</TableCell>
                <TableCell className="text-success">₹{b.paid.toLocaleString()}</TableCell>
                <TableCell className={b.amount - b.paid > 0 ? "text-destructive" : ""}>
                  ₹{(b.amount - b.paid).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      b.status === "Paid"
                        ? "bg-success/15 text-success border-0"
                        : b.status === "Partial"
                          ? "bg-warning/20 text-warning-foreground border-0"
                          : "bg-destructive/10 text-destructive border-0"
                    }
                  >
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment history */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Payment History</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.history.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="text-muted-foreground">{h.date}</TableCell>
                <TableCell className="font-medium">{h.description}</TableCell>
                <TableCell className="text-success font-semibold">₹{h.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{h.method}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{h.ref}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pay Now dialog */}
      <Dialog open={payDialog} onOpenChange={setPayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Pending Dues</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount to pay</span>
                <span className="font-semibold text-lg">₹{fees.pendingAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Select payment method</p>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`rounded-lg border p-3 text-center transition hover:border-primary ${
                      paymentMethod === m.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : ""
                    }`}
                  >
                    <m.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs font-medium">{m.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!paymentMethod || paying}
              onClick={handlePay}
            >
              {paying ? "Processing..." : `Pay ₹${fees.pendingAmount.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
