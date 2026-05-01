# KS Brand Store Supabase Setup

Run these SQL files in the Supabase SQL editor for project `mefjbzuksuxqybwnjsff`:

1. `supabase/sql/create_products_table.sql`
2. `supabase/sql/create_categories_table.sql`
3. `supabase/sql/create_sizes_table.sql`
4. `supabase/sql/create_product_images_bucket.sql`

The product SQL creates:

- `public.products`
- RLS policies for public active-product reads
- admin-only insert/update/delete based on `raw_app_meta_data.role = "admin"`
- starter product rows

The category SQL creates:

- `public.categories`
- RLS policies for public active-category reads
- admin-only insert/update/delete based on `raw_app_meta_data.role = "admin"`
- starter category names for New Arrivals, Sneakers, Court Shoes, and Limited Drops

The size SQL creates:

- `public.sizes`
- RLS policies for public active-size reads
- admin-only insert/update/delete based on `raw_app_meta_data.role = "admin"`
- flat starter size rows with name and active status

The product image SQL creates:

- `product-images` public Storage bucket
- public read access through Storage public object URLs
- admin-only upload/update/delete policies based on `raw_app_meta_data.role = "admin"`

After creating an admin user in Supabase Auth, run the commented `update auth.users ...` statement at the bottom of the SQL file with that user's email.
