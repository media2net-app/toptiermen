"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week21Page() {
  const config = weeksConfig.find(w => w.week === 21)!;
  return <WeekTemplate config={config} />;
}
