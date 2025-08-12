// Cookie utility functions
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const setUserCookies = (userId, role, userIdDB = "") => {
  setCookie("userId", userId, 7); // 7 days expiry
  setCookie("role", role, 7);
  setCookie("userIdDB", userIdDB, 7);
  console.log("User cookies set:", { userId, role });
};

export const clearUserCookies = () => {
  deleteCookie("userId");
  deleteCookie("role");
  console.log("User cookies cleared");
};
