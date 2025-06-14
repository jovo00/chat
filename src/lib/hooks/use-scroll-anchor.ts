import { useCallback, useEffect, useRef, useState } from "react";

export const useScrollAnchor = () => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibilityRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const { current } = scrollRef;

    if (current) {
      const handleScroll = (event: Event) => {
        const target = event.target as HTMLDivElement;
        const offset = -100;
        const isAtBottom = target.scrollTop > offset;

        setIsAtBottom(isAtBottom);
        setIsScrolling(true);

        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Set a new timeout
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 250);
      };

      current.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      return () => {
        current.removeEventListener("scroll", handleScroll);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (visibilityRef.current) {
      let observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            } else {
              setIsVisible(false);
            }
          });
        },
        {
          rootMargin: "0px 0px -150px 0px",
        }
      );

      observer.observe(visibilityRef.current);

      return () => {
        observer.disconnect();
      };
    }
  });

  return {
    messagesRef,
    scrollRef,
    visibilityRef,
    scrollToBottom,
    isAtBottom,
    isVisible,
    isScrolling,
  };
};
