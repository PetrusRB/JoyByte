"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@mantine/core";
import "@root/public/swagger/swagger.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  loading: () => <Skeleton />,
});

type Props = {
  spec: Record<string, any>;
};

function ReactSwagger({ spec }: Props) {
  return <SwaggerUI spec={spec} />;
}

export default ReactSwagger;
