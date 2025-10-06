"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week14Page() {
  const config = weeksConfig.find(w => w.week === 14)!;
  return <WeekTemplate config={config} />;
}
