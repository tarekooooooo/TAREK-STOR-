-- AlterTable
ALTER TABLE "RedeemCode" ADD COLUMN "usedIp" TEXT;

-- CreateTable
CREATE TABLE "ProductKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "keyValue" TEXT NOT NULL,
    "isSold" BOOLEAN NOT NULL DEFAULT false,
    "soldAt" DATETIME,
    "soldTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductKey_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT 'true',
    "label" TEXT,
    "group" TEXT
);

-- CreateTable
CREATE TABLE "SubAdminPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "manageProducts" BOOLEAN NOT NULL DEFAULT false,
    "manageOrders" BOOLEAN NOT NULL DEFAULT false,
    "manageUsers" BOOLEAN NOT NULL DEFAULT false,
    "manageRedeemCodes" BOOLEAN NOT NULL DEFAULT false,
    "manageAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "manageTournaments" BOOLEAN NOT NULL DEFAULT false,
    "manageSettings" BOOLEAN NOT NULL DEFAULT false,
    "viewRevenue" BOOLEAN NOT NULL DEFAULT false,
    "manageWallets" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SubAdminPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameFr" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "type" TEXT NOT NULL,
    "participationType" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 100,
    "entryFee" REAL NOT NULL DEFAULT 0,
    "prize" REAL NOT NULL DEFAULT 0,
    "hasReward" BOOLEAN NOT NULL DEFAULT false,
    "rewardDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "rules" TEXT,
    "roomId" TEXT,
    "roomPassword" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "image" TEXT,
    "city" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TournamentParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamCode" TEXT,
    "teamName" TEXT,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "gameId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TournamentParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TournamentResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "playerName" TEXT,
    "playerUid" TEXT,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "prize" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SmtpConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "host" TEXT NOT NULL DEFAULT '',
    "port" INTEGER NOT NULL DEFAULT 587,
    "username" TEXT NOT NULL DEFAULT '',
    "apiKey" TEXT NOT NULL DEFAULT '',
    "fromName" TEXT NOT NULL DEFAULT 'Tarek Store',
    "fromEmail" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "userUid" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameFr" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "price" REAL NOT NULL,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'product',
    "deliveryContent" TEXT,
    "countries" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT -1,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "countries", "createdAt", "deliveryContent", "description", "descriptionEn", "descriptionFr", "id", "image", "isActive", "name", "nameEn", "nameFr", "price", "stock", "type", "updatedAt") SELECT "category", "countries", "createdAt", "deliveryContent", "description", "descriptionEn", "descriptionFr", "id", "image", "isActive", "name", "nameEn", "nameFr", "price", "stock", "type", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "orderId" TEXT,
    "redeemCodeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WalletTransaction" ("amount", "createdAt", "description", "id", "orderId", "redeemCodeId", "type", "walletId") SELECT "amount", "createdAt", "description", "id", "orderId", "redeemCodeId", "type", "walletId" FROM "WalletTransaction";
DROP TABLE "WalletTransaction";
ALTER TABLE "new_WalletTransaction" RENAME TO "WalletTransaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SubAdminPermission_userId_key" ON "SubAdminPermission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentParticipant_tournamentId_userId_key" ON "TournamentParticipant"("tournamentId", "userId");
