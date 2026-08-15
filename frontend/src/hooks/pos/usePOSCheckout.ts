import { useRef, useState } from 'react';
import { Invoice } from '@/types/pos';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useTill } from '@/context/TillContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { invoiceApi } from '@/lib/api/invoice.api';
import { buildOrderFromCart } from '@/utils/order';

const normalizeBigIntId = (value?: string | null): string | undefined =>
  value && /^\d+$/.test(value) ? value : undefined;

export function usePOSCheckout() {
  const {
    generateInvoice,
    saveInvoice,
    state,
    deleteInvoice,
    orderType,
    paymentMethod,
    managerApprovalToken,
  } = useCart();
  const { createOrder, confirmOrder, startPreparing } = useOrders();
  const { user } = useAuth();
  const { isOpen: tillOpen, session: tillSession } = useTill();
  const { toast } = useToast();

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [isConfirmingInvoice, setIsConfirmingInvoice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [thermalReceiptInvoice, setThermalReceiptInvoice] = useState<Invoice | null>(null);

  const pendingCardInvoice = useRef<Invoice | null>(null);
  const pendingOrderId = useRef<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const activeBranchId = tillSession?.branchId || user?.branchId || '';
  const activeTerminalId = tillSession?.terminalId || user?.terminalId || '';

  const handleCheckout = (onOpenTill: () => void) => {
    if (!tillOpen) {
      toast({
        title: 'Till is closed',
        description: 'Please open the till before processing a sale.',
        variant: 'destructive',
      });
      onOpenTill();
      return;
    }
    const invoice = generateInvoice();
    if (invoice) setPreviewInvoice(invoice);
  };

  const handleConfirmInvoice = async (
    onOpenTill: () => void,
    onCloseCart: () => void,
    invoiceToSave: Invoice | null = previewInvoice
  ): Promise<boolean> => {
    if (!invoiceToSave) return false;
    if (isConfirmingInvoice) return false;

    if (!tillSession?.id) {
      toast({
        title: 'Till is closed',
        description: 'Open the till before confirming and sending orders to kitchen.',
        variant: 'destructive',
      });
      onOpenTill();
      return false;
    }

    const isCodOrder = paymentMethod === 'cash-on-delivery' || paymentMethod === 'card-on-delivery';
    if (isCodOrder) {
      const codInvoice: Invoice = {
        ...invoiceToSave,
        paymentMethod,
        paymentStatus: 'pending',
        paidAt: null,
      };
      setIsConfirmingInvoice(true);
      try {
        const serverItems = codInvoice.items.map((item) => {
          const p = item.product;
          const d = item.deal;
          return {
            productId: normalizeBigIntId(p?.id),
            dealId: normalizeBigIntId(d?.id),
            productName: p?.name ?? d?.name ?? 'Unknown',
            productCode: p?.code ?? d?.code ?? '',
            category: p?.category ?? 'deals',
            quantity: item.quantity,
            unitPricePaisa: Math.round((p?.price ?? d?.price ?? 0) * 100),
            discountPercent: item.discountPercent,
            lumpDiscountPaisa: Math.round(item.lumpSumDiscount * 100),
          };
        });
        const savedInvoice = await invoiceApi.create({
          tillSessionId: tillSession.id,
          branchId: activeBranchId,
          terminalId: activeTerminalId,
          orderType,
          paymentMethod,
          customerId: normalizeBigIntId(codInvoice.customer?.customerId),
          customerName: codInvoice.customer?.name ?? undefined,
          customerPhone: codInvoice.customer?.phone ?? undefined,
          orderNotes: undefined,
          managerApprovalToken: managerApprovalToken ?? undefined,
          covers: undefined,
          items: serverItems,
        });
        const order = buildOrderFromCart({
          items: state.items,
          orderType,
          paymentMethod,
          source: 'counter',
          branchId: activeBranchId,
          terminalId: activeTerminalId,
          customerId: state.activeCustomer?.customerId ?? null,
          customerName: state.activeCustomer?.name ?? null,
          customerPhone: state.activeCustomer?.phone ?? null,
        });
        if (savedInvoice?.id) {
          order.id = String(savedInvoice.id);
          order.invoiceId = String(savedInvoice.id);
        }
        createOrder(order);
        confirmOrder(order.id);
        startPreparing(order.id);
        pendingOrderId.current = order.id;
        saveInvoice(codInvoice);
        toast({ title: 'Delivery order confirmed', description: `Token ${order.token} — payment on delivery.` });
        setPreviewInvoice(null);
        onCloseCart();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast({ title: 'Order not sent', description: error?.message ?? 'Retry.', variant: 'destructive' });
      } finally {
        setIsConfirmingInvoice(false);
      }
      return true;
    }

    pendingCardInvoice.current = invoiceToSave;
    setShowPaymentModal(true);
    return false;
  };

  const handlePaymentConfirmed = async (
    allocations: import('@/types/pos').PaymentAllocation[],
    onCloseCart: () => void
  ) => {
    setShowPaymentModal(false);
    const invoiceToSave = pendingCardInvoice.current;
    pendingCardInvoice.current = null;
    if (!invoiceToSave || !tillSession?.id) return;

    const chosenMethod = allocations[0]?.method ?? 'cash';
    const paidInvoice: Invoice = {
      ...invoiceToSave,
      paymentMethod: chosenMethod,
      paymentStatus: 'paid',
      paidAt: new Date(),
    };
    setPreviewInvoice(paidInvoice);
    setIsConfirmingInvoice(true);

    try {
      const serverItems = paidInvoice.items.map((item) => {
        const p = item.product;
        const d = item.deal;
        const unitPrice = p?.price ?? d?.price ?? 0;
        return {
          productId: normalizeBigIntId(p?.id),
          dealId: normalizeBigIntId(d?.id),
          productName: p?.name ?? d?.name ?? 'Unknown',
          productCode: p?.code ?? d?.code ?? '',
          category: p?.category ?? 'deals',
          quantity: item.quantity,
          unitPricePaisa: Math.round(unitPrice * 100),
          discountPercent: item.discountPercent,
          lumpDiscountPaisa: Math.round(item.lumpSumDiscount * 100),
        };
      });

      await invoiceApi.create({
        tillSessionId: tillSession.id,
        branchId: activeBranchId,
        terminalId: activeTerminalId,
        orderType,
        paymentMethod: chosenMethod,
        customerId: normalizeBigIntId(paidInvoice.customer?.customerId),
        customerName: paidInvoice.customer?.name ?? undefined,
        customerPhone: paidInvoice.customer?.phone ?? undefined,
        orderNotes: undefined,
        managerApprovalToken: managerApprovalToken ?? undefined,
        covers: undefined,
        items: serverItems,
      });

      const order = buildOrderFromCart({
        items: state.items,
        orderType,
        paymentMethod: chosenMethod,
        source: 'counter',
        branchId: activeBranchId,
        terminalId: activeTerminalId,
        customerId: state.activeCustomer?.customerId ?? null,
        customerName: state.activeCustomer?.name ?? null,
        customerPhone: state.activeCustomer?.phone ?? null,
      });

      if (paidInvoice?.id) {
        order.id = String(paidInvoice.id);
        order.invoiceId = String(paidInvoice.id);
      }

      createOrder(order);
      confirmOrder(order.id);
      startPreparing(order.id);
      pendingOrderId.current = order.id;
      saveInvoice(paidInvoice);

      toast({ title: 'Order complete', description: `Token ${order.token} sent to kitchen.` });
      setPreviewInvoice(null);
      onCloseCart();
    } catch (err: unknown) {
      const error = err as { message?: string };
      const message = error?.message ?? 'Failed to save invoice on server.';
      toast({
        title: 'Order not sent to kitchen',
        description: `${message} Please retry.`,
        variant: 'destructive',
      });
    } finally {
      setIsConfirmingInvoice(false);
    }
  };

  const handleDirectCashCheckout = async (
    onOpenTill: () => void,
    onCloseCart?: () => void
  ): Promise<boolean> => {
    if (!tillOpen) {
      toast({
        title: 'Till is closed',
        description: 'Please open the till before processing a sale.',
        variant: 'destructive',
      });
      onOpenTill();
      return false;
    }

    if (state.items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to the order before billing.',
        variant: 'destructive',
      });
      return false;
    }

    const generatedInv = generateInvoice();
    if (!generatedInv || !tillSession?.id) return false;

    const paidInvoice: Invoice = {
      ...generatedInv,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      paidAt: new Date(),
    };

    setIsConfirmingInvoice(true);
    try {
      const serverItems = paidInvoice.items.map((item) => {
        const p = item.product;
        const d = item.deal;
        const unitPrice = p?.price ?? d?.price ?? 0;
        return {
          productId: normalizeBigIntId(p?.id),
          dealId: normalizeBigIntId(d?.id),
          productName: p?.name ?? d?.name ?? 'Unknown',
          productCode: p?.code ?? d?.code ?? '',
          category: p?.category ?? 'deals',
          quantity: item.quantity,
          unitPricePaisa: Math.round(unitPrice * 100),
          discountPercent: item.discountPercent,
          lumpDiscountPaisa: Math.round(item.lumpSumDiscount * 100),
        };
      });

      const savedResponse = await invoiceApi.create({
        tillSessionId: tillSession.id,
        branchId: activeBranchId,
        terminalId: activeTerminalId,
        orderType,
        paymentMethod: 'cash',
        customerId: normalizeBigIntId(paidInvoice.customer?.customerId),
        customerName: paidInvoice.customer?.name ?? undefined,
        customerPhone: paidInvoice.customer?.phone ?? undefined,
        orderNotes: undefined,
        managerApprovalToken: managerApprovalToken ?? undefined,
        covers: undefined,
        items: serverItems,
      });

      if (savedResponse?.id) {
        paidInvoice.id = String(savedResponse.id);
      }

      const order = buildOrderFromCart({
        items: state.items,
        orderType,
        paymentMethod: 'cash',
        source: 'counter',
        branchId: activeBranchId,
        terminalId: activeTerminalId,
        customerId: state.activeCustomer?.customerId ?? null,
        customerName: state.activeCustomer?.name ?? null,
        customerPhone: state.activeCustomer?.phone ?? null,
      });

      if (paidInvoice?.id) {
        order.id = String(paidInvoice.id);
        order.invoiceId = String(paidInvoice.id);
      }

      createOrder(order);
      confirmOrder(order.id);
      startPreparing(order.id);
      pendingOrderId.current = order.id;
      saveInvoice(paidInvoice);

      // Trigger instant receipt print
      setPrintInvoice(paidInvoice);
      setTimeout(() => {
        window.print();
        setPrintInvoice(null);
      }, 100);

      toast({
        title: '⚡ Invoiced & Printed',
        description: `Token ${order.token} · Cash: Rs ${paidInvoice.grandTotal.toLocaleString()}`,
      });

      if (onCloseCart) onCloseCart();
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: 'Direct invoice failed',
        description: error?.message ?? 'Please retry checkout.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsConfirmingInvoice(false);
    }
  };

  const handlePrint = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setTimeout(() => {
      window.print();
      setPrintInvoice(null);
    }, 100);
  };

  const handleViewInvoice = (invoice: Invoice) => setPreviewInvoice(invoice);
  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id);
    toast({ title: 'Invoice deleted', description: 'The invoice has been removed.' });
  };

  const handleShowReceipt = (invoiceId: string) => {
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      setThermalReceiptInvoice(invoice);
    } else {
      toast({
        title: 'Receipt not found',
        description: `Invoice #${invoiceId} is not in session.`,
        variant: 'destructive',
      });
    }
  };

  return {
    previewInvoice,
    setPreviewInvoice,
    printInvoice,
    isConfirmingInvoice,
    showPaymentModal,
    setShowPaymentModal,
    thermalReceiptInvoice,
    setThermalReceiptInvoice,
    pendingCardInvoice,
    printRef,
    handleCheckout,
    handleDirectCashCheckout,
    handleConfirmInvoice,
    handlePaymentConfirmed,
    handlePrint,
    handleViewInvoice,
    handleDeleteInvoice,
    handleShowReceipt,
  };
}
