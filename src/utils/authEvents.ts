type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export const subscribeToSessionExpired = (listener: SessionExpiredListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitSessionExpired = () => {
  listeners.forEach((listener) => listener());
};
