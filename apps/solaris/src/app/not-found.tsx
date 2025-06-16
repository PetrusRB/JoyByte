"use client"
import ErrorDisplay from "@/components/ErrorDisplay";
import { getErrorDetails } from "@/libs/errors";

const NotFound = () => {
    return (
        <>
          <ErrorDisplay error={getErrorDetails("NOT_FOUND")} />;
        </>
    )
}
export default NotFound;
