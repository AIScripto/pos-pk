/*
  Warnings:

  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `Branch` table. All the data in the column will be lost.
  - The `id` column on the `Branch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `taxConfigId` column on the `Branch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Campaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `City` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `province` on the `City` table. All the data in the column will be lost.
  - The `id` column on the `City` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `CustomerMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CustomerMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Deal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `imageUrl` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `originalPricePaisa` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `pricePaisa` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Deal` table. All the data in the column will be lost.
  - The `id` column on the `Deal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `DiscountPreset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `DiscountPreset` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Invoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tableId` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `InvoiceItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `InvoiceItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productId` column on the `InvoiceItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dealId` column on the `InvoiceItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `LoyaltyConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `LoyaltyConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `LoyaltyTier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `LoyaltyTier` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `LoyaltyTransaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `LoyaltyTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `invoiceId` column on the `LoyaltyTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MessageTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MessageTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OrgConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `OrgConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Organisation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Organisation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OtpCode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `OtpCode` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `OtpCode` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - The `id` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProductBranchConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProductBranchConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Reservation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tableId` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Table` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sectionId` column on the `Table` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TableSection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TableSection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TaxConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TaxConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `branchId` column on the `TaxConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Terminal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Terminal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TillSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TillSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserRoleAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `UserRoleAssignment` table. All the data in the column will be lost.
  - The `id` column on the `UserRoleAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `DealProduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orgId,label]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,code]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,tag]` on the table `Deal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,roleId,scopeId]` on the table `UserRoleAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brandId` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `orgId` on the `Branch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `cityId` on the `Branch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `Campaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `code` to the `City` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `orgId` on the `City` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `Customer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `customerId` on the `CustomerMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `CustomerMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `basePricePaisa` to the `Deal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `Deal` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `orgId` on the `Deal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `DiscountPreset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `Inventory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `Inventory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `Invoice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `cityId` on the `Invoice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `Invoice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `terminalId` on the `Invoice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tillSessionId` on the `Invoice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `invoiceId` on the `InvoiceItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `LoyaltyConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `configId` on the `LoyaltyTier` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `customerId` on the `LoyaltyTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `LoyaltyTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `LoyaltyTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `MessageTemplate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `OrgConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `ProductBranchConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `ProductBranchConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `Reservation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `Table` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `TableSection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `TaxConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `Terminal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orgId` on the `TillSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `cityId` on the `TillSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `TillSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `terminalId` on the `TillSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `orgId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `roleId` to the `UserRoleAssignment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userId` on the `UserRoleAssignment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_orgId_fkey";

-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_orgId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerMessage" DROP CONSTRAINT "CustomerMessage_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_orgId_fkey";

-- DropForeignKey
ALTER TABLE "DealProduct" DROP CONSTRAINT "DealProduct_dealId_fkey";

-- DropForeignKey
ALTER TABLE "DealProduct" DROP CONSTRAINT "DealProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "DiscountPreset" DROP CONSTRAINT "DiscountPreset_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_tableId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_tillSessionId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "LoyaltyConfig" DROP CONSTRAINT "LoyaltyConfig_orgId_fkey";

-- DropForeignKey
ALTER TABLE "LoyaltyTier" DROP CONSTRAINT "LoyaltyTier_configId_fkey";

-- DropForeignKey
ALTER TABLE "LoyaltyTransaction" DROP CONSTRAINT "LoyaltyTransaction_branchId_fkey";

-- DropForeignKey
ALTER TABLE "LoyaltyTransaction" DROP CONSTRAINT "LoyaltyTransaction_customerId_fkey";

-- DropForeignKey
ALTER TABLE "LoyaltyTransaction" DROP CONSTRAINT "LoyaltyTransaction_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "MessageTemplate" DROP CONSTRAINT "MessageTemplate_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrgConfig" DROP CONSTRAINT "OrgConfig_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OtpCode" DROP CONSTRAINT "OtpCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_orgId_fkey";

-- DropForeignKey
ALTER TABLE "ProductBranchConfig" DROP CONSTRAINT "ProductBranchConfig_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ProductBranchConfig" DROP CONSTRAINT "ProductBranchConfig_productId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_tableId_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "TableSection" DROP CONSTRAINT "TableSection_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TaxConfig" DROP CONSTRAINT "TaxConfig_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Terminal" DROP CONSTRAINT "Terminal_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TillSession" DROP CONSTRAINT "TillSession_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TillSession" DROP CONSTRAINT "TillSession_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgId_fkey";

-- DropForeignKey
ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT "UserRoleAssignment_userId_fkey";

-- DropIndex
DROP INDEX "Branch_orgId_code_key";

-- DropIndex
DROP INDEX "Deal_orgId_sku_key";

-- DropIndex
DROP INDEX "UserRoleAssignment_userId_role_scopeId_key";

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
DROP COLUMN "code",
ADD COLUMN     "addrArea" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "areaId" BIGINT,
ADD COLUMN     "brandId" BIGINT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
DROP COLUMN "cityId",
ADD COLUMN     "cityId" BIGINT NOT NULL,
DROP COLUMN "taxConfigId",
ADD COLUMN     "taxConfigId" BIGINT,
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "City" DROP CONSTRAINT "City_pkey",
DROP COLUMN "province",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "longitude" DECIMAL(11,8),
ADD COLUMN     "stateId" BIGINT,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "City_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CustomerMessage" DROP CONSTRAINT "CustomerMessage_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "customerId",
ADD COLUMN     "customerId" BIGINT NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "CustomerMessage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_pkey",
DROP COLUMN "imageUrl",
DROP COLUMN "originalPricePaisa",
DROP COLUMN "pricePaisa",
DROP COLUMN "sku",
ADD COLUMN     "basePricePaisa" INTEGER NOT NULL,
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "salePricePaisa" INTEGER,
ADD COLUMN     "tag" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" DROP DEFAULT,
ADD CONSTRAINT "Deal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "DiscountPreset" DROP CONSTRAINT "DiscountPreset_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "DiscountPreset_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" BIGINT NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
DROP COLUMN "cityId",
ADD COLUMN     "cityId" BIGINT NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
DROP COLUMN "terminalId",
ADD COLUMN     "terminalId" BIGINT NOT NULL,
DROP COLUMN "tillSessionId",
ADD COLUMN     "tillSessionId" BIGINT NOT NULL,
DROP COLUMN "tableId",
ADD COLUMN     "tableId" BIGINT,
ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "invoiceId",
ADD COLUMN     "invoiceId" BIGINT NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" BIGINT,
DROP COLUMN "dealId",
ADD COLUMN     "dealId" BIGINT,
ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LoyaltyConfig" DROP CONSTRAINT "LoyaltyConfig_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "LoyaltyConfig_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LoyaltyTier" DROP CONSTRAINT "LoyaltyTier_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "configId",
ADD COLUMN     "configId" BIGINT NOT NULL,
ADD CONSTRAINT "LoyaltyTier_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LoyaltyTransaction" DROP CONSTRAINT "LoyaltyTransaction_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "customerId",
ADD COLUMN     "customerId" BIGINT NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
DROP COLUMN "invoiceId",
ADD COLUMN     "invoiceId" BIGINT,
ADD CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MessageTemplate" DROP CONSTRAINT "MessageTemplate_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgConfig" DROP CONSTRAINT "OrgConfig_pkey",
ADD COLUMN     "businessName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "defaultBranchId" BIGINT,
ADD COLUMN     "logoUrl" TEXT NOT NULL DEFAULT '',
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "OrgConfig_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Organisation" DROP CONSTRAINT "Organisation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OtpCode" DROP CONSTRAINT "OtpCode_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" BIGINT,
ADD CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "category",
ADD COLUMN     "categoryId" BIGINT,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductBranchConfig" DROP CONSTRAINT "ProductBranchConfig_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" BIGINT NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
ADD CONSTRAINT "ProductBranchConfig_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
DROP COLUMN "tableId",
ADD COLUMN     "tableId" BIGINT,
ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Table" DROP CONSTRAINT "Table_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
DROP COLUMN "sectionId",
ADD COLUMN     "sectionId" BIGINT,
ADD CONSTRAINT "Table_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TableSection" DROP CONSTRAINT "TableSection_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
ADD CONSTRAINT "TableSection_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TaxConfig" DROP CONSTRAINT "TaxConfig_pkey",
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'all',
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT,
ADD CONSTRAINT "TaxConfig_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Terminal" DROP CONSTRAINT "Terminal_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
ADD CONSTRAINT "Terminal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TillSession" DROP CONSTRAINT "TillSession_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
DROP COLUMN "cityId",
ADD COLUMN     "cityId" BIGINT NOT NULL,
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
DROP COLUMN "terminalId",
ADD COLUMN     "terminalId" BIGINT NOT NULL,
ADD CONSTRAINT "TillSession_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "roleId" BIGINT,
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "orgId",
ADD COLUMN     "orgId" BIGINT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT "UserRoleAssignment_pkey",
DROP COLUMN "role",
ADD COLUMN     "roleId" BIGINT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" BIGINT NOT NULL,
ADD CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "DealProduct";

-- CreateTable
CREATE TABLE "Brand" (
    "id" BIGSERIAL NOT NULL,
    "orgId" BIGINT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "tagline" TEXT,
    "primaryColor" TEXT DEFAULT '#F97316',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" BIGSERIAL NOT NULL,
    "orgId" BIGINT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'PK',
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" BIGSERIAL NOT NULL,
    "cityId" BIGINT NOT NULL,
    "orgId" BIGINT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" BIGSERIAL NOT NULL,
    "orgId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRolePermission" (
    "id" BIGSERIAL NOT NULL,
    "orgId" BIGINT NOT NULL,
    "roleId" BIGINT NOT NULL,
    "permission" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "OrgRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodType" (
    "id" BIGSERIAL NOT NULL,
    "orgId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "FoodType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" BIGSERIAL NOT NULL,
    "orgId" BIGINT NOT NULL,
    "foodTypeId" BIGINT,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeldOrder" (
    "id" BIGSERIAL NOT NULL,
    "orgId" BIGINT NOT NULL,
    "cityId" BIGINT NOT NULL,
    "branchId" BIGINT NOT NULL,
    "terminalId" BIGINT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Held Order',
    "itemsJson" JSONB NOT NULL DEFAULT '[]',
    "activeCustomerJson" JSONB,
    "orderType" TEXT NOT NULL DEFAULT 'dine-in',
    "tableId" BIGINT,
    "tableName" TEXT,
    "covers" INTEGER,
    "customerId" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "orderNotes" TEXT,
    "heldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "HeldOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenOrder" (
    "id" BIGSERIAL NOT NULL,
    "invoiceId" BIGINT NOT NULL,
    "orgId" BIGINT NOT NULL,
    "branchId" BIGINT NOT NULL,
    "terminalId" BIGINT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "tableId" BIGINT,
    "tableName" TEXT,
    "covers" INTEGER,
    "cashierName" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "servedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KitchenOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenOrderItem" (
    "id" BIGSERIAL NOT NULL,
    "kitchenOrderId" BIGINT NOT NULL,
    "productId" BIGINT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KitchenOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_orgId_tag_key" ON "Brand"("orgId", "tag");

-- CreateIndex
CREATE INDEX "State_orgId_idx" ON "State"("orgId");

-- CreateIndex
CREATE INDEX "State_country_idx" ON "State"("country");

-- CreateIndex
CREATE UNIQUE INDEX "State_orgId_tag_key" ON "State"("orgId", "tag");

-- CreateIndex
CREATE INDEX "Area_cityId_idx" ON "Area"("cityId");

-- CreateIndex
CREATE INDEX "Area_orgId_idx" ON "Area"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_cityId_tag_key" ON "Area"("cityId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "Role_orgId_tag_key" ON "Role"("orgId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "OrgRolePermission_roleId_permission_key" ON "OrgRolePermission"("roleId", "permission");

-- CreateIndex
CREATE INDEX "FoodType_orgId_idx" ON "FoodType"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodType_orgId_name_key" ON "FoodType"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FoodType_orgId_slug_key" ON "FoodType"("orgId", "slug");

-- CreateIndex
CREATE INDEX "Category_orgId_idx" ON "Category"("orgId");

-- CreateIndex
CREATE INDEX "Category_foodTypeId_idx" ON "Category"("foodTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_orgId_name_key" ON "Category"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_orgId_tag_key" ON "Category"("orgId", "tag");

-- CreateIndex
CREATE INDEX "HeldOrder_branchId_idx" ON "HeldOrder"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenOrder_invoiceId_key" ON "KitchenOrder"("invoiceId");

-- CreateIndex
CREATE INDEX "KitchenOrder_branchId_idx" ON "KitchenOrder"("branchId");

-- CreateIndex
CREATE INDEX "KitchenOrder_status_idx" ON "KitchenOrder"("status");

-- CreateIndex
CREATE INDEX "KitchenOrder_branchId_status_idx" ON "KitchenOrder"("branchId", "status");

-- CreateIndex
CREATE INDEX "KitchenOrderItem_kitchenOrderId_idx" ON "KitchenOrderItem"("kitchenOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_orgId_label_key" ON "Branch"("orgId", "label");

-- CreateIndex
CREATE INDEX "City_orgId_idx" ON "City"("orgId");

-- CreateIndex
CREATE INDEX "City_stateId_idx" ON "City"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "City_orgId_name_key" ON "City"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "City_orgId_code_key" ON "City"("orgId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_orgId_phone_key" ON "Customer"("orgId", "phone");

-- CreateIndex
CREATE INDEX "Deal_orgId_idx" ON "Deal"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_orgId_tag_key" ON "Deal"("orgId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountPreset_orgId_name_key" ON "DiscountPreset"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_branchId_key" ON "Inventory"("productId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyConfig_orgId_key" ON "LoyaltyConfig"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgConfig_orgId_key" ON "OrgConfig"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_orgId_sku_key" ON "Product"("orgId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBranchConfig_productId_branchId_key" ON "ProductBranchConfig"("productId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_sectionId_number_key" ON "Table"("sectionId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "TableSection_branchId_name_key" ON "TableSection"("branchId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Terminal_branchId_name_key" ON "Terminal"("branchId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_orgId_username_key" ON "User"("orgId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "User_orgId_email_key" ON "User"("orgId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_roleId_scopeId_key" ON "UserRoleAssignment"("userId", "roleId", "scopeId");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Terminal" ADD CONSTRAINT "Terminal_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgConfig" ADD CONSTRAINT "OrgConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgConfig" ADD CONSTRAINT "OrgConfig_defaultBranchId_fkey" FOREIGN KEY ("defaultBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxConfig" ADD CONSTRAINT "TaxConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountPreset" ADD CONSTRAINT "DiscountPreset_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRolePermission" ADD CONSTRAINT "OrgRolePermission_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRolePermission" ADD CONSTRAINT "OrgRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBranchConfig" ADD CONSTRAINT "ProductBranchConfig_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBranchConfig" ADD CONSTRAINT "ProductBranchConfig_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodType" ADD CONSTRAINT "FoodType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_foodTypeId_fkey" FOREIGN KEY ("foodTypeId") REFERENCES "FoodType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableSection" ADD CONSTRAINT "TableSection_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TableSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TillSession" ADD CONSTRAINT "TillSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TillSession" ADD CONSTRAINT "TillSession_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tillSessionId_fkey" FOREIGN KEY ("tillSessionId") REFERENCES "TillSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyConfig" ADD CONSTRAINT "LoyaltyConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTier" ADD CONSTRAINT "LoyaltyTier_configId_fkey" FOREIGN KEY ("configId") REFERENCES "LoyaltyConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMessage" ADD CONSTRAINT "CustomerMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeldOrder" ADD CONSTRAINT "HeldOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenOrderItem" ADD CONSTRAINT "KitchenOrderItem_kitchenOrderId_fkey" FOREIGN KEY ("kitchenOrderId") REFERENCES "KitchenOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
