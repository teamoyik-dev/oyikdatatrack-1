import { supabase } from "./supabase";
import { Company } from "./types";

export async function fetchCompanies(orgId: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    throw new Error(error.message || "Failed to fetch companies");
  }

  return (data ?? []) as Company[];
}

export async function createCompany(name: string, orgId: string): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .insert({ name, org_id: orgId })
    .select()
    .single();

  if (error) {
    console.error("Error creating company:", error);
    throw new Error(error.message || "Failed to create company");
  }

  return data as Company;
}

export async function updateCompany(
  id: string,
  data: { name: string },
  orgId: string
): Promise<Company> {
  const { data: result, error } = await supabase
    .from("companies")
    .update(data)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) {
    console.error("Error updating company:", error);
    throw new Error(error.message || "Failed to update company");
  }

  return result as Company;
}

export async function deleteCompany(id: string, orgId: string): Promise<void> {
  // Subscriptions are set to company_id = null (Unassigned) by the FK, not deleted
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    console.error("Error deleting company:", error);
    throw new Error(error.message || "Failed to delete company");
  }
}
