import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).isAdmin;

  try {
    const client = await pool.connect();
    try {
      let query = `
        SELECT l.list_id as id, l.name, l.created_at as "createdAt",
               COUNT(i.id) as "contactCount"
        FROM contact_lists l
        LEFT JOIN contact_list_items i ON l.list_id = i.list_id
      `;
      let params: any[] = [];

      if (!isAdmin) {
        query += " WHERE l.user_id = $1";
        params.push(userId);
      }

      query += `
        GROUP BY l.list_id, l.name, l.created_at
        ORDER BY l.created_at DESC
      `;

      const { rows } = await client.query(query, params);
      return NextResponse.json({ lists: rows }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("GET /api/contact-lists error:", error);
    return NextResponse.json({ error: "Unable to load lists." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, contacts } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: "List name is required" }, { status: 400 });
  }

  let listId = name.trim();
  const now = new Date().toISOString();

  try {
    const client = await pool.connect();
    try {
      const { rows: existingRows } = await client.query("SELECT list_id FROM contact_lists WHERE list_id = $1", [listId]);
      if (existingRows.length > 0) {
        listId = `${listId}-${Math.random().toString(36).substring(2, 6)}`;
      }

      await client.query("BEGIN");

      await client.query(
        `INSERT INTO contact_lists (list_id, name, user_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [listId, name.trim(), userId, now, now]
      );

      if (Array.isArray(contacts) && contacts.length > 0) {
        // Filter out empty URLs and build values for batch insert
        const validContacts = contacts.filter(c => ((c.websiteUrl || "") + (c.contactUrl || "")).trim() !== "");
        if (validContacts.length > 0) {
          const values: any[] = [];
          const placeholders: string[] = [];
          let paramIdx = 1;

          for (let i = 0; i < validContacts.length; i++) {
            const c = validContacts[i];
            const websiteUrl = (c.websiteUrl || "").trim();
            const contactUrl = (c.contactUrl || websiteUrl).trim();
            const itemId = `${listId}-item-${i}-${Math.random().toString(36).substring(2, 8)}`;
            
            let urlKey = contactUrl || websiteUrl;
            try {
              const u = new URL(urlKey.startsWith("http") ? urlKey : "https://" + urlKey);
              urlKey = u.hostname.replace("www.", "") + u.pathname + u.search;
            } catch {
              // fallback
            }

            placeholders.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
            values.push(itemId, listId, c.companyName || "Unknown", websiteUrl, contactUrl, urlKey, now);
          }

          const insertQuery = `
            INSERT INTO contact_list_items (id, list_id, company_name, website_url, contact_url, url_key, created_at)
            VALUES ${placeholders.join(", ")}
          `;
          
          await client.query(insertQuery, values);
        }
      }

      await client.query("COMMIT");
      return NextResponse.json({ id: listId, name: name.trim(), createdAt: now }, { status: 201 });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/contact-lists error:", error);
    return NextResponse.json({ error: "Unable to create list." }, { status: 500 });
  }
}
