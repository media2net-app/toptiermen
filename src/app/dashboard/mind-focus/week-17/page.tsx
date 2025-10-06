"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week17Page() {
  const config = weeksConfig.find(w => w.week === 17)!;
  return <WeekTemplate config={config} />;
}
