"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week9Page() {
  const config = weeksConfig.find(w => w.week === 9)!;
  return <WeekTemplate config={config} />;
}
