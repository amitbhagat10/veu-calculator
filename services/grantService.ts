import pool from "../lib/db";

export async function checkGrantEligibility(postcode: string, systemType: string) {
  const result = await pool.query(
    `SELECT grant_amount
     FROM veu_grants
     WHERE postcode = $1
     AND system_type = $2`,
    [postcode, systemType]
  );

  if (result.rows.length === 0) {
    return {
      eligible: false,
      amount: 0,
    };
  }

  return {
    eligible: true,
    amount: result.rows[0].grant_amount,
  };
}
