export type OrganizationRole = "owner" | "admin" | "member";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type EventModuleKey = "registration" | "payments" | "schedule" | "checkin";
export type RegistrationStatus =
  | "confirmed"
  | "pending_payment"
  | "cancelled"
  | "waitlisted";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationMembership = {
  organization: Organization;
  role: OrganizationRole;
};

export type EventRecord = {
  id: string;
  organization_id: string;
  created_by: string;
  title: string;
  slug: string;
  description: string | null;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location: string | null;
  is_online: boolean;
  capacity: number | null;
  is_free: boolean;
  price_cents: number;
  currency: string;
  is_public: boolean;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicEvent = EventRecord & {
  organization_name: string;
  registered_count: number;
};

export type RegistrationRecord = {
  id: string;
  event_id: string;
  form_id: string | null;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
};

export type RegistrationFieldRecord = {
  id: string;
  form_id: string;
  field_key: string;
  label: string;
  field_type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox";
  is_required: boolean;
  options: unknown;
  sort_order: number;
};
