import { activeCampaign } from "@/features/campaigns/campaigns";

const on = (iso: string) => activeCampaign(new Date(`${iso}T10:00:00Z`))?.id ?? null;

describe("seasonal campaigns", () => {
  it("runs the arrival campaign around INKOM and the start of the year", () => {
    expect(on("2027-08-17")).toBe("arrival");
    expect(on("2027-09-20")).toBe("arrival");
    expect(on("2027-09-25")).toBeNull();
  });

  it("covers the exam weeks", () => {
    expect(on("2026-12-14")).toBe("exams");
    expect(on("2027-01-20")).toBe("exams");
    expect(on("2027-06-10")).toBe("exams");
    expect(on("2026-10-20")).toBe("exams");
  });

  it("switches to the new semester at the end of January", () => {
    expect(on("2027-01-26")).toBe("new-semester");
    expect(on("2027-02-14")).toBe("new-semester");
  });

  it("stays quiet the rest of the year", () => {
    expect(on("2026-11-17")).toBeNull();
    expect(on("2027-04-15")).toBeNull();
  });

  it("uses Amsterdam time at the edges", () => {
    // 31 July 23:30 UTC is already 1 August in Maastricht.
    expect(activeCampaign(new Date("2027-07-31T23:30:00Z"))?.id).toBe("arrival");
  });
});
