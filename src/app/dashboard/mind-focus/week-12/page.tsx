"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week12Page() {
  const config = weeksConfig.find(w => w.week === 12)!;
  return <WeekTemplate config={config} />;
}
