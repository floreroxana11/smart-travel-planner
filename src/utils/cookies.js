const DEFAULT_EXPIRY_DAYS = 30;

export function setCookie(name, value, days = DEFAULT_EXPIRY_DAYS) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getCookie(name) {
  const prefix = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(prefix)) {
      return decodeURIComponent(c.substring(prefix.length));
    }
  }
  return null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export const COOKIE_KEYS = {
  LAST_VIEW: "stp_last_view",
  PREFERRED_CATEGORY: "stp_preferred_category",
  ANALYTICS_VIEW_MODE: "stp_analytics_view_mode", // "graphical" | "table"
  WELCOME_DISMISSED: "stp_welcome_dismissed",
  LOGGED_IN_USER: "stp_logged_in_user",
};