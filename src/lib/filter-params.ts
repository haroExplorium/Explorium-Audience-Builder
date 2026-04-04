import { parseAsArrayOf, parseAsBoolean, parseAsString } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const filterParamsParsers = {
  country: parseAsArrayOf(parseAsString).withDefault([]),
  industry: parseAsArrayOf(parseAsString).withDefault([]),
  revenue: parseAsArrayOf(parseAsString).withDefault([]),
  employees: parseAsArrayOf(parseAsString).withDefault([]),
  companyName: parseAsArrayOf(parseAsString).withDefault([]),
  managementLevel: parseAsArrayOf(parseAsString).withDefault([]),
  jobTitle: parseAsArrayOf(parseAsString).withDefault([]),
  includeRelatedTitles: parseAsBoolean.withDefault(true),
  department: parseAsArrayOf(parseAsString).withDefault([]),
  hasEmail: parseAsBoolean.withDefault(false),
  hasPhone: parseAsBoolean.withDefault(false),
};

export const filterParamsCache = createSearchParamsCache(filterParamsParsers);
