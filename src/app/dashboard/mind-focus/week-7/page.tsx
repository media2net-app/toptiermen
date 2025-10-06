"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week7Page() {
  const config = weeksConfig.find(w => w.week === 7)!;
  return <WeekTemplate config={config} />;
}
