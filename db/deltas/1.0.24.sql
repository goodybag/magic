-- 1.0.21.sql
insert into deltas (version, date) values ('1.0.24', 'now()');

#498 - Some businesses have fubar productLocations

-- Hey, I just met you, and this is crazy
-- So here's my sql, call me AL;SDJFLK;ASDFJLASD

-- This adds product location records for products that don't have them
DO $$
declare product record;
declare location record;

begin

for product in select
    products.id       as "id"
  , businesses.id     as "businessId"
  , businesses.name   as "businessName"
  from products

    left join "productLocations" on
      products.id = "productLocations"."productId"

    left join businesses on
      products."businessId" = businesses.id

  where "productLocations".id is null
  and businesses.id in (
    select "businessId" from locations
  )

loop

  for location in select * from locations where locations."businessId" = product."businessId"
  loop

    insert into "productLocations" (
      "productId"
    , "businessId"
    , "locationId"
    , "lat"
    , "lon"
    , "position"
    , "inSpotlight"
    , "createdAt"
    ) values (
      product.id
    , product."businessId"
    , location.id
    , location.lat
    , location.lon
    , ll_to_earth(location.lat, location.lon)
    , true
    , 'now()'
    );

  end loop;
end loop;
end$$;