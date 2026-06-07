import { useEffect, useState, useCallback } from "react";

export type TaskStatus = "none" | "selected" | "in_progress" | "done";

const KEY = "zadaniomat:task-status:v1";

type Store = Record<string, TaskStatus>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useTaskStatuses() {
  const [store, setStore] = useState<Store>({});

  useEffect(() => {
    setStore(read());
    const update = () => setStore(read());
    listeners.add(update);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) update();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(update);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    const next = { ...read() };
    if (status === "none") delete next[id];
    else next[id] = status;
    localStorage.setItem(KEY, JSON.stringify(next));
    notify();
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    notify();
  }, []);

  return { store, setStatus, reset };
}
