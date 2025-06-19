import { Event } from '../EventsContext';

export function generateICSFile(event: Event): string {
  const startDate = new Date(`${event.date}T${event.time.split('-')[0]}`);
  const endDate = new Date(`${event.date}T${event.time.split('-')[1]}`);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Top Tier Men//Events//NL',
    'BEGIN:VEVENT',
    `UID:${event.id}@toptiermen.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    `ORGANIZER;CN=${event.host}:mailto:${event.host.toLowerCase().replace(' ', '.')}@toptiermen.com`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function downloadICSFile(event: Event) {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateGoogleCalendarUrl(event: Event): string {
  const startDate = new Date(`${event.date}T${event.time.split('-')[0]}`);
  const endDate = new Date(`${event.date}T${event.time.split('-')[1]}`);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description,
    location: event.location,
    ctz: 'Europe/Amsterdam'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookUrl(event: Event): string {
  const startDate = new Date(`${event.date}T${event.time.split('-')[0]}`);
  const endDate = new Date(`${event.date}T${event.time.split('-')[1]}`);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: formatDate(startDate),
    enddt: formatDate(endDate),
    body: event.description,
    location: event.location
  });

  return `https://outlook.live.com/calendar/0/${params.toString()}`;
}

export function generateAppleCalendarUrl(event: Event): string {
  // Apple Calendar uses .ics files, so we'll use the download function
  return '#';
} 