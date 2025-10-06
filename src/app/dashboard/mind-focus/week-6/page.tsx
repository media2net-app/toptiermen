"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week6Page() {
  const config = weeksConfig.find(w => w.week === 6)!;
  return <WeekTemplate config={config} />;
}
