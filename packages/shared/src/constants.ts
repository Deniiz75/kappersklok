export const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
export const shortDayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
export const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type WaitlistStatus = "WAITING" | "NOTIFIED" | "EXPIRED" | "CANCELLED";
export type ShopStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type Role = "ADMIN" | "BARBER";
