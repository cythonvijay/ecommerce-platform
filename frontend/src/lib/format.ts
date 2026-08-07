export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateString));
}

export function getApiErrorMessage(error: unknown): string {
  const anyErr = error as { response?: { data?: { message?: string; detail?: unknown } } };
  const msg = anyErr?.response?.data?.message;
  if (msg) return msg;
  return "Something went wrong. Please try again.";
}
