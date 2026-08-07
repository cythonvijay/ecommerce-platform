export interface CheckoutPayload {
  address_id: number;
  payment_method: "cod" | "card" | "upi";
}
