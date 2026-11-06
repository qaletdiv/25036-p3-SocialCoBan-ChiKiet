"use client";

import { useRef, useState } from "react";

const HOVER_OPEN_DELAY = 400;
const HOVER_CLOSE_DELAY = 180;
const LONG_PRESS_DELAY = 450;

export const useReactionPicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const openedByPressRef = useRef(false);

  const clearTimer = (timerRef: { current: number | null }) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearAll = () => {
    clearTimer(openTimerRef);
    clearTimer(closeTimerRef);
    clearTimer(pressTimerRef);
  };

  const open = () => {
    clearAll();
    setIsOpen(true);
  };

  const close = () => {
    clearAll();
    openedByPressRef.current = false;
    setIsOpen(false);
  };

  return {
    isOpen,
    open,
    close,
    consumePressOpen: () => {
      if (!openedByPressRef.current) return false;
      openedByPressRef.current = false;
      return true;
    },
    onPointerEnter: () => {
      clearTimer(closeTimerRef);
      openTimerRef.current = window.setTimeout(() => setIsOpen(true), HOVER_OPEN_DELAY);
    },
    onPointerLeave: () => {
      clearTimer(openTimerRef);
      clearTimer(pressTimerRef);
      closeTimerRef.current = window.setTimeout(() => {
        openedByPressRef.current = false;
        setIsOpen(false);
      }, HOVER_CLOSE_DELAY);
    },
    onPointerDown: (event: { pointerType: string }) => {
      if (event.pointerType !== "touch") return;
      clearTimer(pressTimerRef);
      pressTimerRef.current = window.setTimeout(() => {
        openedByPressRef.current = true;
        setIsOpen(true);
      }, LONG_PRESS_DELAY);
    },
    onPointerUp: () => clearTimer(pressTimerRef),
    onPointerCancel: () => clearTimer(pressTimerRef),
  };
};
