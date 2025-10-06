"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week24Page() {
  const config = weeksConfig.find(w => w.week === 24)!;
  return <WeekTemplate config={config} />;
}
