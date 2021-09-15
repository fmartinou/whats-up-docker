import Vue from "vue";

/**
 * Truncate an id to x chars.
 * @param fullId
 * @param length
 * @returns {string}
 */
function short(fullId, length) {
  if (!fullId) {
    return "";
  }
  return fullId.substring(0, length);
}

/**
 * Formate a date for display.
 * @param dateStr
 * @returns {string}
 */
function date(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat().format(date);
}

/**
 * Register all filters.
 */
function registerFilters() {
  Vue.filter("short", short);
  Vue.filter("date", date);
}

export { registerFilters };
