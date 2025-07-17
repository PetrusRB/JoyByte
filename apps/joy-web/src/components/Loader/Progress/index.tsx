"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import type { FC } from "react";

const ProgressLoader: FC = () => {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      nprogress.start();

      const timeout = setTimeout(() => {
        nprogress.complete();
      }, 300);

      previousPath.current = pathname;

      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [pathname]);

  return <NavigationProgress color="orange" size={3} />;
};

export { ProgressLoader };
