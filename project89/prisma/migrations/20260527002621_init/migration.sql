-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "winery" TEXT NOT NULL,
    "vintage" INTEGER NOT NULL,
    "region" TEXT,
    "country" TEXT,
    "grapeVarieties" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "alcoholContent" REAL,
    "agingPotential" INTEGER,
    "vivinoId" TEXT,
    "vivinoRating" REAL,
    "vivinoUrl" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WineBottle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "purchaseChannel" TEXT,
    "storageLocation" TEXT,
    "currentMarketPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'IN_CELLAR',
    "purchaseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WineBottle_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WineBottle_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TastingNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineBottleId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "tastingDate" DATETIME NOT NULL,
    "decantingTime" INTEGER,
    "servingTemp" REAL,
    "pairedFood" TEXT,
    "appearanceScore" INTEGER NOT NULL,
    "appearanceNotes" TEXT,
    "aromaScore" INTEGER NOT NULL,
    "aromaNotes" TEXT,
    "aromaDescriptors" TEXT NOT NULL,
    "tasteScore" INTEGER NOT NULL,
    "tasteNotes" TEXT,
    "tasteDescriptors" TEXT NOT NULL,
    "finishScore" INTEGER NOT NULL,
    "finishNotes" TEXT,
    "overallScore" INTEGER NOT NULL,
    "notes" TEXT,
    "expectationMatch" INTEGER,
    "expectationNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TastingNote_wineBottleId_fkey" FOREIGN KEY ("wineBottleId") REFERENCES "WineBottle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TastingNote_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "budget" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WishlistItem_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "wineName" TEXT NOT NULL,
    "winery" TEXT NOT NULL,
    "vintage" INTEGER,
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "validUntil" DATETIME,
    "url" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FoodPairing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "dishName" TEXT NOT NULL,
    "dishType" TEXT NOT NULL,
    "description" TEXT,
    "rating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FoodPairing_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "favoriteTypes" TEXT NOT NULL,
    "favoriteRegions" TEXT NOT NULL,
    "favoriteGrapes" TEXT NOT NULL,
    "priceRangeMin" REAL,
    "priceRangeMax" REAL,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 2,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
