ALTER TABLE "productLocations" ADD COLUMN "inGallery" BOOLEAN;
ALTER TABLE "productLocations" ADD COLUMN "spotlightOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "productLocations" ADD COLUMN "galleryOrder" INTEGER NOT NULL DEFAULT 0;
