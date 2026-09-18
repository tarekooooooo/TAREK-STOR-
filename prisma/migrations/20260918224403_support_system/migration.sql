-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupportMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubAdminPermission" (
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
    "manageSupport" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SubAdminPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubAdminPermission" ("id", "manageAnalytics", "manageOrders", "manageProducts", "manageRedeemCodes", "manageSettings", "manageTournaments", "manageUsers", "manageWallets", "userId", "viewRevenue") SELECT "id", "manageAnalytics", "manageOrders", "manageProducts", "manageRedeemCodes", "manageSettings", "manageTournaments", "manageUsers", "manageWallets", "userId", "viewRevenue" FROM "SubAdminPermission";
DROP TABLE "SubAdminPermission";
ALTER TABLE "new_SubAdminPermission" RENAME TO "SubAdminPermission";
CREATE UNIQUE INDEX "SubAdminPermission_userId_key" ON "SubAdminPermission"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
