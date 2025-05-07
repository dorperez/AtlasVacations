function formatDateToInput(date: Date | string): string {
    const targetTimeZone = "Asia/Jerusalem";
    const d = new Date(date);
  
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: targetTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  
    const parts = formatter.formatToParts(d);
  
    const dateParts: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        dateParts[part.type] = part.value;
      }
    }
  
    const { year, month, day, hour, minute } = dateParts;
  
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  export default formatDateToInput