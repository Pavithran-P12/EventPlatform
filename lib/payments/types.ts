export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type PaymentStatus =
  | "initiated"
  | "approved"
  | "captured"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type OrderRecord = {
  id: string;
  registration_id: string;
  event_id: string;
  organization_id: string;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  provider: "paypal";
  provider_order_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentRecord = {
  id: string;
  order_id: string;
  provider: "paypal";
  provider_payment_id: string | null;
  provider_capture_id: string | null;
  status: PaymentStatus;
  amount_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type RegistrationWithPayment = {
  registration_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  registration_status: string;
  created_at: string;
  order_status: OrderStatus | null;
  payment_status: PaymentStatus | null;
  amount_cents: number | null;
  currency: string | null;
};
