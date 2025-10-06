"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week18Page() {
  const config = weeksConfig.find(w => w.week === 18)!;
  return <WeekTemplate config={config} />;
}
