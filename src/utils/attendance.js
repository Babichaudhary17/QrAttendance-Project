export function getDefaultAttendanceDate(records) {
  if (!records.length) {
    return "";
  }

  return records.reduce((latest, record) => {
    if (!latest || record.date > latest) {
      return record.date;
    }

    return latest;
  }, "");
}
