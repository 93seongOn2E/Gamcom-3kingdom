export const STREAMER_MODE_EVENT = "gc-streamer-mode-change";

const STREAMER_MODE_STORAGE_KEY = "gc-streamer-mode";

let currentStreamerMode = true;

export function getStreamerMode() {
  if (typeof window === "undefined") {
    return currentStreamerMode;
  }

  const storedValue = window.localStorage.getItem(STREAMER_MODE_STORAGE_KEY);
  if (storedValue === "on") {
    currentStreamerMode = true;
  } else if (storedValue === "off") {
    currentStreamerMode = false;
  }

  return currentStreamerMode;
}

export function setStreamerMode(enabled: boolean) {
  currentStreamerMode = enabled;

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STREAMER_MODE_STORAGE_KEY, enabled ? "on" : "off");
  window.dispatchEvent(new CustomEvent<boolean>(STREAMER_MODE_EVENT, { detail: enabled }));
}
