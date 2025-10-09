'use client';

import WeekTemplate from '../WeekTemplate';
import { weeksConfig } from '../weeks.config';

export default function Week24Page() {
  const weekConfig = weeksConfig.find(w => w.week === 24);
  
  if (!weekConfig) {
    return <div>Week configuratie niet gevonden</div>;
  }

  return <WeekTemplate config={weekConfig} />;
}
