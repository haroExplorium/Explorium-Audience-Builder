export interface FilterState {
  country?: string[];
  region?: string[];
  industry?: string[];
  revenue?: string[];
  employees?: string[];
  companyName?: string[];
  businessId?: string[];
  managementLevel?: string[];
  jobTitle?: string[];
  includeRelatedTitles?: boolean;
  department?: string[];
  hasEmail?: boolean;
  hasPhone?: boolean;
}

export const MANAGEMENT_LEVELS = [
  { value: "cxo", label: "C-Suite" },
  { value: "vp", label: "VP" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "individual_contributor", label: "Individual Contributor" },
] as const;

export const REVENUE_RANGES = [
  { value: "0-500K", label: "< $500K" },
  { value: "500K-1M", label: "$500K–$1M" },
  { value: "1M-5M", label: "$1M–$5M" },
  { value: "5M-10M", label: "$5M–$10M" },
  { value: "10M-25M", label: "$10M–$25M" },
  { value: "25M-75M", label: "$25M–$75M" },
  { value: "75M-200M", label: "$75M–$200M" },
  { value: "200M-500M", label: "$200M–$500M" },
  { value: "500M-1B", label: "$500M–$1B" },
  { value: "1B-10B", label: "$1B–$10B" },
  { value: "10B-100B", label: "$10B+" },
] as const;

export const EMPLOYEE_RANGES = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "501-1000", label: "501–1000" },
  { value: "1001-5000", label: "1,001–5,000" },
  { value: "5001+", label: "5,001+" },
] as const;
