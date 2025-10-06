"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week22Page() {
  const config = weeksConfig.find(w => w.week === 22)!;
  return <WeekTemplate config={config} />;
}
