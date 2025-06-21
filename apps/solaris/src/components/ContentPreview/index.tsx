"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  text: string;
}

export default function ContentPreview({ text }: Props) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Se o usuário rolar até aqui, expande automaticamente
  useEffect(() => {
    if (expanded) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setExpanded(true),
      { rootMargin: "200px" },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [expanded]);

  return (
    <div ref={ref} className="text-sm text-gray-700 dark:text-gray-300 mb-2">
      <p
        className={
          expanded
            ? "leading-relaxed whitespace-pre-wrap"
            : "leading-relaxed line-clamp-2"
        }
      >
        {text}
      </p>
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-orange-500 text-sm mt-1 underline"
        >
          Ver mais
        </button>
      )}
    </div>
  );
}
