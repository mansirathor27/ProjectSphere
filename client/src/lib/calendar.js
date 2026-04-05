export const generateICS = (title, description, startDate, endDate) => {
  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const start = formatDate(new Date(startDate));
  // If no endDate provided, set it to 1 hour after start
  const end = endDate ? formatDate(new Date(endDate)) : formatDate(new Date(new Date(startDate).getTime() + 60 * 60 * 1000));

  const icsTemplate = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ProjectSphere//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${new Date().getTime()}@projectsphere.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsTemplate], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
