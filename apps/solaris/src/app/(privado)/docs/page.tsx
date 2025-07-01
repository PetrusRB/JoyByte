import { getApiDocs } from "@/libs/swagger";
import { Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";
const ReactSwagger = dynamic(() => import("@/components/Swagger"), {
  loading: () => <Skeleton />,
});

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  );
}
