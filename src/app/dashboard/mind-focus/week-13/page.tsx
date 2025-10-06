"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week13Page() {
  const config = weeksConfig.find(w => w.week === 13)!;
  return <WeekTemplate config={config} />;
}
