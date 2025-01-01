export interface CustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

export interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string | null;
  receiver_bank_account_number: string | null;
  receiver_bank: string | null;
}

export interface Customer {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  customer_code: string;
  phone: string | null;
  metadata: any; // You can define a more specific type for metadata if needed
  risk_action: string;
  international_format_phone: string | null;
}

export interface Source {
  type: string;
  source: string;
  entry_point: string;
  identifier: string | null;
}

export interface PaystackPaymentEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      custom_fields: CustomField[];
    };
    fees_breakdown: any | null; // Define a specific type for fees_breakdown if needed
    log: any | null; // Define a specific type for log if needed
    fees: number;
    fees_split: any | null; // Define a specific type for fees_split if needed
    authorization: Authorization;
    customer: Customer;
    plan: any; // Define a specific type for plan if needed
    subaccount: any; // Define a specific type for subaccount if needed
    split: any; // Define a specific type for split if needed
    order_id: string | null;
    paidAt: string;
    requested_amount: number;
    pos_transaction_data: any | null; // Define a specific type for pos_transaction_data if needed
    source: Source;
  };
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
}

export interface InitiateTransactionArgs {
  amount: number;
  email: string;
  reference: string;
  callback_url?: string;
  metadata?: {
    custom_fields?: CustomField[];
  };
}
