import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postcode, systemType } = body;

    console.log("Incoming Request →", {
      postcode,
      systemType,
    });

    const result = await pool.query(
      `
      SELECT grant_amount 
      FROM veu_grants 
      WHERE TRIM(postcode) = TRIM($1)
      AND TRIM(system_type) = TRIM($2)
      `,
      [postcode, systemType]
    );

    console.log("Database Result →", result.rows);

    if (result.rows.length === 0) {
      return NextResponse.json({
        eligible: false,
        amount: 0,
      });
    }

    return NextResponse.json({
      eligible: true,
      amount: result.rows[0].grant_amount,
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        eligible: false,
        amount: 0,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
