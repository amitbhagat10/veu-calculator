import pool from "../lib/db";

// ─────────────────────────────────────────────────────────────
// VEU Part 6 - Space Heating & Cooling
// Replaces ducted gas heater with reverse-cycle AC (Scenario vii)
// Source: VEU Specifications 2018 v21.0
// ─────────────────────────────────────────────────────────────

export interface VEUCalculationResult {
  veec_count: number;
  rebate_value: number;
  ghg_reduction: number;
  heating_savings: number;
  cooling_savings: number;
  gsf_heat: number;
  gsf_cool: number;
  category: string;
  climate_region: string;
  metro_regional: string;
  gems_zone: string;
  error?: string;
}

/**
 * Server-side VEU rebate calculation via direct DB connection.
 * Mirrors the Supabase RPC calculate_rebate() function.
 * Use this in API routes (/app/api/...) where you need server-side logic.
 */
export async function calculateVEURebate(
  productId: string,
  postcode: number,
  jobDate: string,
  activityId: string,
  scenarioId: string
): Promise<VEUCalculationResult> {
  const client = await pool.connect();

  try {
    // Fetch product
    const productRes = await client.query(
      `SELECT cooling_capacity_kw, heating_capacity_kw, hspf, tcspf, acop, aeer
       FROM products WHERE id = $1`,
      [productId]
    );

    if (productRes.rows.length === 0) {
      return { veec_count: 0, rebate_value: 0, ghg_reduction: 0,
               heating_savings: 0, cooling_savings: 0, gsf_heat: 0, gsf_cool: 0,
               category: "", climate_region: "", metro_regional: "", gems_zone: "",
               error: "Product not found" };
    }

    const product = productRes.rows[0];

    // Fetch postcode zone
    const zoneRes = await client.query(
      `SELECT metro_regional, climatic_region, gems_zone
       FROM veu_postcode_zones WHERE postcode = $1`,
      [postcode]
    );

    const zone = zoneRes.rows[0] || {
      metro_regional: "Metropolitan",
      climatic_region: "Mild",
      gems_zone: "COLD",
    };

    // Fetch BTL
    const btlRes = await client.query(
      `SELECT btl_heat, btl_cool FROM veu_btl
       WHERE metro_regional = $1 AND climatic_region = $2 AND customer_type = 'residential'`,
      [zone.metro_regional, zone.climatic_region]
    );

    if (btlRes.rows.length === 0) {
      return { veec_count: 0, rebate_value: 0, ghg_reduction: 0,
               heating_savings: 0, cooling_savings: 0, gsf_heat: 0, gsf_cool: 0,
               category: "", climate_region: zone.climatic_region,
               metro_regional: zone.metro_regional, gems_zone: zone.gems_zone,
               error: "BTL values not found" };
    }

    const btl = btlRes.rows[0];

    // Fetch EEF params
    const paramsRes = await client.query(
      `SELECT param_name, param_value FROM veu_global_params
       WHERE param_name IN ('EEF', 'EEFm', 'VEEC_PRICE')`
    );

    const params: Record<string, number> = {};
    paramsRes.rows.forEach((r) => { params[r.param_name] = Number(r.param_value); });

    const EEF  = params["EEF"]  || 0.393;
    const EEFm = params["EEFm"] || 0.393;
    const veecPrice = params["VEEC_PRICE"] || 83.6;

    // Scenario (vii) baseline - Gas ducted heater
    // Source: VEU Specs 2018 v21.0 - Table 6.11
    const GIH_BASE      = 0.198;
    const HSPF_BASE_GAS = 0.551;
    const LIFETIME      = 12;

    // Determine category from cooling capacity
    const coolingCap = Number(product.cooling_capacity_kw) || 0;
    let category: string;
    if (coolingCap < 10)      category = "6A";
    else if (coolingCap < 25) category = "6B(i)";
    else                      category = "6B(ii)";

    // Fetch baseline factors
    const baselineRes = await client.query(
      `SELECT hspf_base_cold, hspf_base_mixed, tcspf_base_cold, tcspf_base_mixed,
              loss_factor, cf_heat_cold_mild, cf_cool_cold_mild
       FROM veu_part6_baselines
       WHERE category = $1 AND customer_type = 'residential'`,
      [category]
    );

    if (baselineRes.rows.length === 0) {
      return { veec_count: 0, rebate_value: 0, ghg_reduction: 0,
               heating_savings: 0, cooling_savings: 0, gsf_heat: 0, gsf_cool: 0,
               category, climate_region: zone.climatic_region,
               metro_regional: zone.metro_regional, gems_zone: zone.gems_zone,
               error: "Baseline factors not found" };
    }

    const baseline = baselineRes.rows[0];
    const LF = Number(baseline.loss_factor);
    const isGemsCold = zone.gems_zone === "COLD";
    const hspfBase  = isGemsCold ? Number(baseline.hspf_base_cold)  : Number(baseline.hspf_base_mixed);
    const tcspfBase = isGemsCold ? Number(baseline.tcspf_base_cold) : Number(baseline.tcspf_base_mixed);

    // Resolve upgrade performance values
    const hspfUpgrade  = product.hspf  || (product.acop  * Number(baseline.cf_heat_cold_mild));
    const tcspfUpgrade = product.tcspf || (product.aeer  * Number(baseline.cf_cool_cold_mild));

    if (!hspfUpgrade || !tcspfUpgrade) {
      return { veec_count: 0, rebate_value: 0, ghg_reduction: 0,
               heating_savings: 0, cooling_savings: 0, gsf_heat: 0, gsf_cool: 0,
               category, climate_region: zone.climatic_region,
               metro_regional: zone.metro_regional, gems_zone: zone.gems_zone,
               error: "HSPF/TCSPF not available for this product" };
    }

    // ── VEU Part 6 Formulas ─────────────────────────────────

    // Equation 6.3: GSFheat = (GIHbase / HSPFbase_gas) - (EEF × LF / HSPFupgrade)
    const gsfHeat = (GIH_BASE / HSPF_BASE_GAS) - (EEF * LF / hspfUpgrade);

    // Equation 6.5: GSFcool = (EEFm / TCSPFbase) - (EEF × LF / TCSPFupgrade)
    const gsfCool = (EEFm / tcspfBase) - (EEF * LF / tcspfUpgrade);

    // Equation 6.2: Heating Savings = GSFheat × BTLheat × HeatingCapacity
    const heatingSavings = gsfHeat * Number(btl.btl_heat) * Number(product.heating_capacity_kw);

    // Equation 6.4: Cooling Savings = GSFcool × BTLcool × CoolingCapacity
    const coolingSavings = gsfCool * Number(btl.btl_cool) * coolingCap;

    // Equation 6.1: GHG Eq. Reduction = (Heating + Cooling Savings) × Lifetime
    const ghgReduction = (heatingSavings + coolingSavings) * LIFETIME;

    const veecCount   = Math.floor(Math.max(ghgReduction, 0));
    const rebateValue = veecCount * veecPrice;

    return {
      veec_count:      veecCount,
      rebate_value:    Math.round(rebateValue * 100) / 100,
      ghg_reduction:   Math.round(ghgReduction * 10000) / 10000,
      heating_savings: Math.round(heatingSavings * 10000) / 10000,
      cooling_savings: Math.round(coolingSavings * 10000) / 10000,
      gsf_heat:        Math.round(gsfHeat * 10000) / 10000,
      gsf_cool:        Math.round(gsfCool * 10000) / 10000,
      category,
      climate_region:  zone.climatic_region,
      metro_regional:  zone.metro_regional,
      gems_zone:       zone.gems_zone,
    };

  } finally {
    client.release();
  }
}

/**
 * Legacy postcode + system_type grant lookup.
 * Kept for backward compatibility with existing veu_grants table.
 */
export async function checkGrantEligibility(postcode: string, systemType: string) {
  const result = await pool.query(
    `SELECT grant_amount FROM veu_grants
     WHERE postcode = $1 AND system_type = $2`,
    [postcode, systemType]
  );

  if (result.rows.length === 0) return { eligible: false, amount: 0 };
  return { eligible: true, amount: result.rows[0].grant_amount };
}
