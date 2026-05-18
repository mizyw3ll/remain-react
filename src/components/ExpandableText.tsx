import { useState, useRef, useEffect } from "react";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  mobileMaxLines?: number;
  className?: string;
  fontSize?: "text-sm" | "text-base" | "text-lg" | "text-xl" | "text-2xl";
  fontWeight?: "font-normal" | "font-medium" | "font-semibold" | "font-bold";
  color?: "text-primary" | "text-secondary" | "text-muted";
  expandable?: boolean;
}

export function ExpandableText({
  text,
  maxLines = 3,
  mobileMaxLines = 2,
  className = "",
  fontSize = "text-sm",
  fontWeight = "font-normal",
  color = "text-secondary",
  expandable = true,
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      const element = textRef.current;
      if (element) {
        // Compare scroll height to client height to detect truncation
        const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 20;
        const maxHeightDesktop = lineHeight * maxLines;
        const maxHeightMobile = lineHeight * mobileMaxLines;
        const isMobile = window.innerWidth < 640;
        const maxHeight = isMobile ? maxHeightMobile : maxHeightDesktop;

        setIsTruncated(element.scrollHeight > maxHeight + 2); // +2px tolerance
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [text, maxLines, mobileMaxLines]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <p
        ref={textRef}
        className={`overflow-hidden ${fontSize} ${fontWeight} leading-relaxed break-words ${!isExpanded ? "line-clamp-2 sm:line-clamp-3" : ""
          }`}
        style={{
          color: `var(--${color})`,
        }}
      >
        {text}
      </p>
      {expandable && isTruncated && (
        <button
          type="button"
          onClick={toggleExpand}
          className="mt-1 text-xs transition-colors hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          {isExpanded ? "Свернуть" : "Читать полностью"}
        </button>
      )}
    </div>
  );
}
