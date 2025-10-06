"use client";
import WeekTemplate from "../WeekTemplate";
import { weeksConfig } from "../weeks.config";

export default function Week16Page() {
  const config = weeksConfig.find(w => w.week === 16)!;
  return <WeekTemplate config={config} />;
}
