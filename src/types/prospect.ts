export interface Prospect {
  prospect_id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  company_name?: string;
  job_department_main?: string;
  job_level_main?: string;
  country_name?: string;
  region_name?: string;
  city?: string;
  linkedin?: string;
  linkedin_url_array?: string[];
  skills?: string[] | null;
  experience?: string[];
  company_website?: string;
  business_id?: string;
  // Enriched contact fields (from bulk_enrich)
  email?: string;
  phone?: string;
}

export interface ProspectsApiResponse {
  data: Prospect[];
  total_results: number;
  page?: number;
  total_pages?: number;
}

export interface SampleResult {
  prospects: Prospect[];
  totalCount: number;
  responseTimeMs: number;
}
