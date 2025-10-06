"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week23Page() {
  const config = weeksConfig.find(w => w.week === 23)!;
  return <WeekTemplate config={config} />;
}
