'use client';

import WeekTemplate from '../WeekTemplate';
import { weeksConfig } from '../weeks.config';

export default function Week8Page() {
  const weekConfig = weeksConfig.find(w => w.week === 8);
  
  if (!weekConfig) {
    return <div>Week configuratie niet gevonden</div>;
  }

  return <WeekTemplate config={weekConfig} />;
}
