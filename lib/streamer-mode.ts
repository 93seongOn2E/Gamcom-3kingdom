export const STREAMER_MODE_EVENT = "gc-streamer-mode-change";

let currentStreamerMode = true;

export function getStreamerMode() {
  return currentStreamerMode;
}

export function setStreamerMode(enabled: boolean) {
  currentStreamerMode = enabled;
  window.dispatchEvent(new CustomEvent<boolean>(STREAMER_MODE_EVENT, { detail: enabled }));
}
