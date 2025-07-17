"use client";
import SettingsComp from "@/components/Settings";
import { withPrivate } from "@/hocs/withPrivate";

function SettingsPage() {
  return (
    <div>
      <SettingsComp />
    </div>
  );
}
export default withPrivate(SettingsPage);
