/**
 * usePriceUpdates — subscribe to live price-update broadcasts.
 *
 * Opens a WebSocket to the backend and invokes the provided callback whenever
 * a "price_updated" message arrives for the given menuItemId. Automatically
 * connects on mount and cleans up (closes the socket) on unmount, so there
 * are no leaked connections when the modal closes.
 *
 * Encapsulating this in a hook keeps the raw WebSocket lifecycle out of the
 * component and makes the behaviour reusable.
 */

import { useEffect, useRef } from "react";

export function usePriceUpdates(menuItemId, onPriceUpdate) {
  // Keep the latest callback in a ref so the effect doesn't need to re-run
  // (and reconnect the socket) every time the callback identity changes.
  const callbackRef = useRef(onPriceUpdate);
  useEffect(() => {
    callbackRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  useEffect(() => {
    if (!menuItemId) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (
          message.type === "price_updated" &&
          message.menu_item_id === menuItemId
        ) {
          callbackRef.current();
        }
      } catch {
        // Ignore malformed messages.
      }
    };

    // Clean up: close the socket when the component unmounts or the
    // menuItemId changes, preventing leaked connections.
    return () => {
      ws.close();
    };
  }, [menuItemId]);
}
