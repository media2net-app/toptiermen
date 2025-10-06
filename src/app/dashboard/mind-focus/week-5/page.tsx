"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week5Page() {
  const config = weeksConfig.find(w => w.week === 5)!;
  return <WeekTemplate config={config} />;
}
