import { ALL_VALUES } from '../values';

/**
 * Sort a value into a category, removing it from any other category first.
 * Returns the updated category arrays.
 */
export function sortValue(state, valueId, category) {
  const value = ALL_VALUES.find((v) => v.id === valueId);
  if (!value) return null;

  const updates = {
    veryImportant: state.veryImportant.filter((v) => v.id !== valueId),
    important: state.important.filter((v) => v.id !== valueId),
    notImportant: state.notImportant.filter((v) => v.id !== valueId),
  };

  updates[category] = [...updates[category], value];
  return updates;
}

/**
 * Remove a value from all categories (unsort it).
 */
export function unsortValue(state, valueId) {
  return {
    veryImportant: state.veryImportant.filter((v) => v.id !== valueId),
    important: state.important.filter((v) => v.id !== valueId),
    notImportant: state.notImportant.filter((v) => v.id !== valueId),
  };
}

/**
 * Move a card from one category to another (prepends to target).
 * Returns the updated category arrays, or null if card not found.
 */
export function moveCard(state, cardId, fromCategory, toCategory) {
  const card = state[fromCategory].find((v) => v.id === cardId);
  if (!card) return null;

  return {
    [fromCategory]: state[fromCategory].filter((v) => v.id !== cardId),
    [toCategory]: [card, ...state[toCategory]],
  };
}

/**
 * Get remaining (unsorted) values given current state.
 */
export function getRemainingValues(state) {
  const sortedIds = new Set([
    ...state.veryImportant.map((v) => v.id),
    ...state.important.map((v) => v.id),
    ...state.notImportant.map((v) => v.id),
  ]);
  return ALL_VALUES.filter((v) => !sortedIds.has(v.id));
}
