"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@mantine/core";
import { useEffect } from "react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  loading: () => (
    <Skeleton
      height={50}
      mt={6}
      animate
      color="gray"
      radius="xl"
      width="100%"
    />
  ),
});

type Props = {
  spec: Record<string, any>;
};

function ReactSwagger({ spec }: Props) {
  useEffect(() => {
    const styleId = "swagger-ui-css";
    if (document.getElementById(styleId)) {
      return;
    }
    const link = document.createElement("link");
    link.id = styleId;
    link.rel = "stylesheet";
    link.href = "/swagger/swagger.css";

    document.head.appendChild(link);

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  return (
    <>
      <SwaggerUI spec={spec} />
    </>
  );
}

export default ReactSwagger;
