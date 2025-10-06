"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week10Page() {
  const config = weeksConfig.find(w => w.week === 10)!;
  return <WeekTemplate config={config} />;
}
