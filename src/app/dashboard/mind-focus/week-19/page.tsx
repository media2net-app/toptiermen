"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week19Page() {
  const config = weeksConfig.find(w => w.week === 19)!;
  return <WeekTemplate config={config} />;
}
