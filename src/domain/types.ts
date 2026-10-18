export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Unqualified";

export type QuotationStatus = "Pending" | "Accepted" | "Rejected" | "Expired";

export type DealPriority = "High" | "Medium" | "Low";

export type DealStage = "Documentation" | "Filing" | "Government review" | "Delivery" | "Closed";

export type OrderStatus = "Pending" | "In progress" | "On hold" | "Completed";

export type PaymentMethod = "UPI" | "Bank transfer" | "Card" | "Cheque" | "Cash";

export type PaymentStatus = "Received" | "Pending" | "Failed";

export type ServiceCategory =
  | "Company registration"
  | "Tax and compliance"
  | "Licences"
  | "Intellectual property"
  | "Certifications"
  | "Digital services";

export type ServiceItem = {
  name: string;
  category: ServiceCategory;
  minPrice: number;
  maxPrice: number;
};

export type LeadSource =
  | "Google Ads"
  | "Website"
  | "Just Dial"
  | "Referral"
  | "Social media"
  | "Other";

export interface Lead {
  id: string;
  contactName: string;
  company: string;
  city: string;
  source: LeadSource;
  owner: string;
  createdAt: string;
  qualifiedAt: string | null;
  convertedAt: string | null;
  status: LeadStatus;
}

export interface Quotation {
  id: string;
  leadId: string;
  service: string;
  amount: number;
  createdAt: string;
  status: QuotationStatus;
  decidedAt: string | null;
  owner: string;
}

export interface Deal {
  id: string;
  leadId: string;
  quotationId: string;
  service: string;
  category: ServiceCategory;
  value: number;
  priority: DealPriority;
  stage: DealStage;
  createdAt: string;
  owner: string;
}

export interface Order {
  id: string;
  dealId: string;
  service: string;
  assignee: string;
  status: OrderStatus;
  createdAt: string;
  dueAt: string;
  completedAt: string | null;
  stagesTotal: number;
  stagesCompleted: number;
}

export interface Payment {
  id: string;
  dealId: string;
  orderId: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  dueAt: string;
  paidAt: string | null;
  invoiceNo: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  recordReference: {
    type: "lead" | "quotation" | "deal" | "order" | "payment";
    id: string;
    label: string;
  };
}

export interface Dataset {
  leads: Lead[];
  quotations: Quotation[];
  deals: Deal[];
  orders: Order[];
  payments: Payment[];
  activities: Activity[];
}

export interface FilterState {
  timeframe: "today" | "last7" | "last30" | "custom";
  customStart: string | null;
  customEnd: string | null;
  compare: boolean;
  user: string;
  department: "all" | "Sales" | "Operations";
  service: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}
