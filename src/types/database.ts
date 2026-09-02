// Hand-written types matching supabase/migrations/0001_init.sql.
// Once the project is linked to a real Supabase project, replace this file by running:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
// (see SETUP.md). Keeping it hand-written for now means the app is fully typed even
// before a live Supabase project exists.

export type UserRole = "super_admin" | "church_staff" | "content_manager";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface MassSchedule {
  id: string;
  day_type: "sunday" | "weekday" | "special";
  time: string;
  label: string | null;
  special_date: string | null;
  special_name: string | null;
  created_at: string;
}

export interface ParishHistory {
  id: string;
  content: string;
  founding_date: string | null;
  founding_priest: string | null;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  meeting_schedule: string | null;
  leadership_contacts: string | null;
  how_to_join: string | null;
  created_at: string;
}

export interface MassBooking {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  intention_type: string;
  preferred_date: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface BaptismRecord {
  id: string;
  child_name: string;
  parents_names: string;
  date_of_birth: string | null;
  baptism_date: string;
  officiating_priest: string | null;
  godparents: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BaptismRecordAmendment {
  id: string;
  baptism_record_id: string;
  amendment_text: string;
  amended_by: string | null;
  created_at: string;
}

export interface BaptismInquiry {
  id: string;
  parent_name: string;
  email: string;
  phone: string | null;
  child_name: string;
  child_date_of_birth: string | null;
  preferred_date: string | null;
  message: string | null;
  status: "pending" | "contacted" | "closed";
  created_at: string;
}

export interface Homily {
  id: string;
  title: string;
  date: string;
  priest_name: string | null;
  bible_reference: string | null;
  audio_url: string;
  created_at: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  image_slot: string | null;
  created_at: string;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  image_url: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  budget_details: string | null;
  progress_update: string | null;
  created_at: string;
}

export interface HarvestPledge {
  id: string;
  pledger_name: string;
  category: "family" | "group" | "society";
  pledge_details: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  active_from: string;
  active_to: string | null;
  created_at: string;
}

export interface PriestMessage {
  id: string;
  heading: string | null;
  message: string | null;
  updated_at: string;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  heading: string | null;
  subheading: string | null;
  sort_order: number;
  created_at: string;
}

export interface HarvestPhoto {
  id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

// Placeholder so `import type { Database } from "@/types/database"` in the
// Supabase client helpers type-checks. Replace with the generated type (see
// the note at the top of this file) once a real Supabase project exists.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
