export { createSupabaseClient } from "./client";

// Queries
export { getActiveShops, getActiveShopsWithBarbers, getShopBySlug, getShopByUserId } from "./queries/shops";
export { getAppointmentsForShop, getBookedSlots, getCustomerAppointments } from "./queries/appointments";
export { getShopServices, getShopBarbers, getShopBusinessHours } from "./queries/services";
export { getCustomerProfile, getFavorites, isFavorite, getWaitlistEntries } from "./queries/customers";

// Mutations
export { createAppointment, cancelAppointment, rescheduleAppointment, getAppointmentForReschedule } from "./mutations/appointments";
export { joinWaitlist, cancelWaitlistEntry, notifyWaitlistForCancellation } from "./mutations/waitlist";
export { updateCustomerProfile, toggleFavorite } from "./mutations/customers";
