import type { AppointmentStatus, WaitlistStatus, ShopStatus } from "./constants";

export interface Shop {
  id: string;
  name: string;
  slug: string;
  contactName: string;
  email: string;
  phone: string | null;
  street: string | null;
  houseNumber: string | null;
  city: string | null;
  postalCode: string | null;
  instagram: string | null;
  status: ShopStatus;
}

export interface Barber {
  id: string;
  name: string;
  shopId: string;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  shopId: string;
  active: boolean;
  sortOrder: number;
}

export interface BusinessHours {
  id: string;
  shopId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export interface Appointment {
  id: string;
  shopId: string;
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: AppointmentStatus;
  notes: string | null;
  cancelToken: string | null;
}

export interface Review {
  id: string;
  shopId: string;
  appointmentId: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string | null;
  approved: boolean;
}

export interface WaitlistEntry {
  id: string;
  shopId: string;
  barberId: string;
  serviceId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: WaitlistStatus;
  notifiedAt: string | null;
}

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
}
