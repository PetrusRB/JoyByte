"use client";

import { useState, useRef } from "react";
import { Typography } from "antd";

interface Props {
  text: string;
}

export default function ContentPreview({ text }: Props) {
  const [expanded, setExpanded] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="text-sm text-gray-700 dark:text-gray-300 mb-2">
      <Typography.Paragraph
        className="dark:text-white text-orange-400"
        ellipsis={{
          expandable: "collapsible",
          expanded,
          onExpand: (_, info) => setExpanded(info.expanded),
        }}
      >
        {text}
      </Typography.Paragraph>
    </div>
  );
}
