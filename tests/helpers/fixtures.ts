// Realistic rows for each table, with overridable fields. Dates are relative
// to the pinned test clock (see tests/setup.ts: 2026-06-15).
import type {
  BaptismInquiry,
  BaptismRecord,
  ChurchEvent,
  HarvestPhoto,
  HeroSlide,
  Homily,
  MassBooking,
  Organization,
} from "@/types/database";

export const TODAY = "2026-06-15";

export function event(overrides: Partial<ChurchEvent> = {}): ChurchEvent {
  return {
    id: "evt-1",
    title: "Parish Feast Day",
    description: "Mass followed by a reception.",
    event_date: "2026-07-01",
    event_time: "10:00 AM",
    location: "Main Church",
    image_slot: null,
    cover_image_url: null,
    recap: null,
    created_at: "2026-05-01T09:00:00Z",
    ...overrides,
  } as ChurchEvent;
}

export function inquiry(overrides: Partial<BaptismInquiry> = {}): BaptismInquiry {
  return {
    id: "inq-1",
    child_name: "Mary Ada Okafor",
    child_date_of_birth: "2026-03-01",
    parent_name: "John Okafor & Grace Okafor",
    email: "family@example.com",
    phone: "+234 800 000 0000",
    preferred_date: "2026-08-02",
    message: null,
    status: "pending",
    created_at: "2026-06-01T10:00:00Z",
    family_name: "Okafor",
    baptismal_name: "Mary",
    other_names: "Ada",
    town_of_origin: "Onitsha",
    address: "12 Basorun Road, Ibadan",
    place_of_birth: "Adeoyo Hospital",
    father_name: "John Okafor",
    mother_name: "Grace Okafor",
    godfather_name: "Peter Eze",
    godmother_name: "Ruth Eze",
    baptism_date: null,
    baptism_time: null,
    baptism_place: null,
    practice_date: null,
    practice_time: null,
    practice_place: null,
    scheduled_at: null,
    ...overrides,
  } as BaptismInquiry;
}

export function scheduledInquiry(overrides: Partial<BaptismInquiry> = {}) {
  return inquiry({
    status: "scheduled",
    baptism_date: "2026-08-02",
    baptism_time: "10:00:00",
    baptism_place: "St. Patrick's Catholic Church, Basorun",
    practice_date: "2026-07-30",
    practice_time: "17:30:00",
    practice_place: "Parish Hall",
    scheduled_at: "2026-06-10T08:00:00Z",
    ...overrides,
  });
}

export function booking(overrides: Partial<MassBooking> = {}): MassBooking {
  return {
    id: "bk-1",
    full_name: "Ada Obi",
    email: "ada@example.com",
    phone: null,
    intention_type: "Thanksgiving",
    preferred_date: "2026-07-05",
    message: null,
    status: "pending",
    created_at: "2026-06-01T10:00:00Z",
    ...overrides,
  } as MassBooking;
}

export function record(overrides: Partial<BaptismRecord> = {}): BaptismRecord {
  return {
    id: "rec-1",
    child_name: "Mary Ada Okafor",
    parents_names: "John Okafor & Grace Okafor",
    date_of_birth: "2026-03-01",
    baptism_date: "2026-05-03",
    officiating_priest: "Rev. Fr. John",
    godparents: "Peter Eze & Ruth Eze",
    created_by: "user-1",
    created_at: "2026-05-03T12:00:00Z",
    ...overrides,
  } as BaptismRecord;
}

export function homily(overrides: Partial<Homily> = {}): Homily {
  return {
    id: "hom-1",
    title: "The Good Shepherd",
    date: "2026-05-10",
    priest_name: "Rev. Fr. John",
    bible_reference: "John 10:1-10",
    audio_url: "https://example.com/a.mp3",
    created_at: "2026-05-10T12:00:00Z",
    ...overrides,
  } as Homily;
}

export function organization(overrides: Partial<Organization> = {}): Organization {
  return {
    id: "org-1",
    name: "Catholic Women Organization",
    description: "Women of the parish.",
    mission: "Serve the parish.",
    meeting_schedule: "First Sunday after 9am Mass",
    leadership_contacts: "Mrs. Obi",
    how_to_join: "Come to a meeting.",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function heroSlide(overrides: Partial<HeroSlide> = {}): HeroSlide {
  return {
    id: "slide-1",
    image_url: "https://example.com/hero.jpg",
    heading: null,
    subheading: null,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as HeroSlide;
}

export function harvestPhoto(overrides: Partial<HarvestPhoto> = {}): HarvestPhoto {
  return {
    id: "hp-1",
    image_url: "https://example.com/harvest.jpg",
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as HarvestPhoto;
}
