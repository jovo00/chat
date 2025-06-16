import { useEffect, useRef, useState, useCallback } from "react";

const FPS = 45;
const MS_PER_FRAME = 1000 / FPS;
const MAX_TIME_JUMP_MS = 250;

/**
 * A hook that smoothly displays text as it is streamed.
 *
 * @param fullText The full text to display. Pass in the full text each time.
 * @param charsPerSec The number of characters to display per second.
 * @returns A tuple of the visible text and the state of the smooth text,
 * including the current cursor position and whether it's still streaming.
 * This allows you to decide if it's too far behind and you want to adjust
 * the charsPerSec or just prefer the full text.
 */
export function useSmoothText(
  fullText: string, // Renamed 'text' to 'fullText' for clarity
  {
    charsPerSec = 1024,
  }: {
    /**
     * The number of characters to display per second.
     */
    charsPerSec?: number;
  } = {},
): [string, { cursor: number; isStreaming: boolean }] {
  // We will build the visible text incrementally
  const [visibleText, setVisibleText] = useState("");

  // Use a ref for mutable state that doesn't trigger re-renders
  const smoothState = useRef({
    cursor: 0, // Current character index being displayed
    lastUpdateTime: Date.now(), // Last time the update function ran
    charsPerMs: charsPerSec / 1000, // Target characters per millisecond
    // We'll track the previously displayed text to append new characters
    // This avoids re-slicing the entire string.
    // This will be updated when `fullText` changes.
    previousFullTextLength: 0,
  });

  // Effect to initialize/reset state when fullText changes significantly
  useEffect(() => {
    // If the new fullText is shorter than the current cursor, reset
    // Or if it's a completely new text (e.g., first render or new conversation)
    if (fullText.length < smoothState.current.cursor || smoothState.current.previousFullTextLength === 0) {
      smoothState.current.cursor = 0;
      setVisibleText(""); // Reset visible text
    }
    smoothState.current.lastUpdateTime = Date.now();
    smoothState.current.charsPerMs = charsPerSec / 1000; // Reset speed
    smoothState.current.previousFullTextLength = fullText.length;
  }, [fullText, charsPerSec]); // Re-run if fullText or charsPerSec changes

  // Use useCallback for the update function to prevent unnecessary re-creations
  const update = useCallback(() => {
    const { current: state } = smoothState;

    // If we've already displayed all characters, stop
    if (state.cursor >= fullText.length) {
      return;
    }

    const now = Date.now();
    // Calculate time elapsed since last update, capped to prevent huge jumps
    const timeElapsed = Math.min(MAX_TIME_JUMP_MS, now - state.lastUpdateTime);

    // Calculate how many characters to add based on time elapsed and speed
    const charsToAdd = Math.floor(timeElapsed * state.charsPerMs);

    // Determine the new cursor position, ensuring it doesn't exceed fullText length
    const newCursor = Math.min(state.cursor + charsToAdd, fullText.length);

    // Only update visibleText if the cursor has actually moved
    if (newCursor > state.cursor) {
      // Append the new characters instead of re-slicing the whole string
      // This is the key optimization.
      setVisibleText((prevVisibleText) => {
        // Ensure we don't append beyond the current fullText length
        const appendEndIndex = Math.min(newCursor, fullText.length);
        // Start appending from the previous cursor position
        const appendStartIndex = Math.min(state.cursor, fullText.length);

        // If prevVisibleText is shorter than state.cursor, it means
        // the fullText might have changed and we reset, so we should
        // re-slice from the beginning up to newCursor.
        // This handles the case where `fullText` shrinks or resets.
        if (prevVisibleText.length > appendStartIndex) {
          return prevVisibleText + fullText.substring(appendStartIndex, appendEndIndex);
        } else {
          // This case should ideally be handled by the initial useEffect,
          // but as a fallback, if prevVisibleText is out of sync,
          // we re-slice from the beginning.
          return fullText.substring(0, appendEndIndex);
        }
      });
      state.cursor = newCursor; // Update cursor in ref
    }

    state.lastUpdateTime = now; // Update last update time
  }, [fullText, charsPerSec]); // Dependencies for useCallback

  // Effect for setting up and tearing down the interval
  useEffect(() => {
    // If we're already at the end, no need for an interval
    if (smoothState.current.cursor >= fullText.length) {
      return;
    }

    // Run update immediately to catch up if needed
    update();

    // Set up the interval
    const interval = setInterval(update, MS_PER_FRAME);

    // Clean up the interval on unmount or dependency change
    return () => clearInterval(interval);
  }, [fullText, update]); // `update` is a dependency because it's a useCallback

  // Determine if streaming is still active
  const isStreaming = smoothState.current.cursor < fullText.length;

  return [visibleText, { cursor: smoothState.current.cursor, isStreaming }];
}
