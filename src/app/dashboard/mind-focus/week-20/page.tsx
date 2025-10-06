"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week20Page() {
  const config = weeksConfig.find(w => w.week === 20)!;
  return <WeekTemplate config={config} />;
}
