/**
 * Build CSV string from categorized values.
 */
export function buildCSV(state) {
  const rows = ['Rank,Category,Value,Description'];
  const addCategory = (values, category) => {
    values.forEach((v, i) => {
      rows.push(`${i + 1},"${category}","${v.name}","${v.description}"`);
    });
  };
  addCategory(state.veryImportant, 'Very Important');
  addCategory(state.important, 'Important');
  addCategory(state.notImportant, 'Not Important');
  return rows.join('\n');
}

/**
 * Build JSON export object from categorized values.
 */
export function buildJSONExport(state, timestamp) {
  return {
    veryImportant: state.veryImportant,
    important: state.important,
    notImportant: state.notImportant,
    timestamp,
  };
}
