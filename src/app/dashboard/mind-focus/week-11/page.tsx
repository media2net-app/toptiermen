"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week11Page() {
  const config = weeksConfig.find(w => w.week === 11)!;
  return <WeekTemplate config={config} />;
}
