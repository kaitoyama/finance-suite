export type PaymentLabel = 'PARTIAL' | 'OVERPAY' | null;

export function calcPaymentLabel(
  paymentAmount: number,
  expenseAmount: number,
): PaymentLabel {
  if (paymentAmount < expenseAmount) {
    return 'PARTIAL';
  }
  if (paymentAmount > expenseAmount) {
    return 'OVERPAY';
  }
  return null;
} 