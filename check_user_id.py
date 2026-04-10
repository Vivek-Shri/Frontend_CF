import psycopg2

conn = psycopg2.connect(
    "postgresql://postgres.rhmqhrjbknazyflmbwbv:6%3F9H%23%40Dv5W%2BVTEZ@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"
)
cur = conn.cursor()

cur.execute("SELECT data_type FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'user_id'")
print("campaigns.user_id column type:", cur.fetchone())

cur.execute("SELECT campaign_id, user_id, pg_typeof(user_id) FROM campaigns WHERE campaign_id = 'cmp-e92a60f68e'")
print("campaign row:", cur.fetchone())

# Test: does string '1' match integer 1?
cur.execute("SELECT campaign_id FROM campaigns WHERE campaign_id = 'cmp-e92a60f68e' AND user_id = %s", ("1",))
print("match with string '1':", cur.fetchone())

cur.execute("SELECT campaign_id FROM campaigns WHERE campaign_id = 'cmp-e92a60f68e' AND user_id = %s", (1,))
print("match with int 1:", cur.fetchone())

cur.close()
conn.close()
