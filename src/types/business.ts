export interface Business {
  business_id: string;
  name?: string;
  domain?: string;
  logo?: string;
  website?: string;
  country_name?: string;
  region?: string;
  city_name?: string;
  google_category?: string;
  naics?: number;
  naics_description?: string;
  linkedin_category?: string;
  number_of_employees_range?: string;
  yearly_revenue_range?: string;
  business_description?: string;
  linkedin_profile?: string;
  sic_code?: string;
  sic_code_description?: string;
}

export interface BusinessFilterState {
  country?: string[];
  googleCategory?: string[];
  naicsCategory?: string[];
}

export interface BusinessApiResponse {
  data: Business[];
  total_results: number;
  page?: number;
  total_pages?: number;
}
