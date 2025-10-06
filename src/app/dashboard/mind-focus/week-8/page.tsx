"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week8Page() {
  const config = weeksConfig.find(w => w.week === 8)!;
  return <WeekTemplate config={config} />;
}
