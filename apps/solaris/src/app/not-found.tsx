"use client"
import ErrorDisplay from "@/components/ErrorDisplay";

const NotFound = () => {
    return (
        <>
          <ErrorDisplay error={"not_found"} />;
        </>
    )
}
export default NotFound;
