import { describe, it, expect } from "vitest";
import { getCompanyStats } from "@/lib/subscription-utils";
import { Company, Subscription } from "@/lib/types";

const companies: Company[] = [
  { id: "c1", org_id: "o1", name: "BM Estate", created_at: "2026-01-01T00:00:00Z" },
  { id: "c2", org_id: "o1", name: "Heritage Dental", created_at: "2026-01-01T00:00:00Z" },
];

const sub = (
  id: string,
  company_id: string | null,
  amount: number,
  status: Subscription["status"] = "active"
): Subscription => ({
  id,
  platform: id,
  amount,
  billing_cycle: "monthly",
  subscription_date: "2026-01-01",
  billing_day: 1,
  status,
  plan_type: "basic",
  payment_source: "card",
  created_at: "2026-01-01T00:00:00Z",
  company_id,
});

describe("getCompanyStats", () => {
  it("groups count and active monthly spend per company, ignoring unassigned and canceled", () => {
    const subs = [
      sub("s1", "c1", 10),
      sub("s2", "c1", 20),
      sub("s3", "c2", 5),
      sub("s4", null, 100), // unassigned must not leak into any company
      sub("s5", "c1", 50, "canceled"), // canceled excluded from spend
    ];

    const stats = getCompanyStats(subs, companies);

    expect(stats.map((s) => s.company.name)).toEqual(["BM Estate", "Heritage Dental"]);
    expect(stats[0]).toMatchObject({ count: 3, monthlySpend: 30 });
    expect(stats[1]).toMatchObject({ count: 1, monthlySpend: 5 });
  });

  it("returns an empty array when there are no companies", () => {
    expect(getCompanyStats([sub("s1", null, 10)], [])).toEqual([]);
  });
});
