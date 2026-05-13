type Listener = (payload: any) => void;

const _listeners: Map<string, Listener[]> = new Map();

export const AppEvents = {
  emit(event: string, payload: any) {
    (_listeners.get(event) ?? []).forEach((l) => {
      try {
        l(payload);
      } catch {}
    });
  },
  on(event: string, listener: Listener): () => void {
    const current = _listeners.get(event) ?? [];
    _listeners.set(event, [...current, listener]);
    return () => {
      const now = _listeners.get(event) ?? [];
      _listeners.set(event, now.filter((l) => l !== listener));
    };
  },
};

export type OrderStatusEvent = {
  orderId: string;
  status: string;
  produceName: string;
  riderName?: string;
};
