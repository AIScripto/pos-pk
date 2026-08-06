-- AddIndex: Invoice (core transaction table - no indexes existed)
CREATE INDEX "Invoice_orgId_date_idx" ON "Invoice"("orgId", "date");
CREATE INDEX "Invoice_branchId_date_idx" ON "Invoice"("branchId", "date");
CREATE INDEX "Invoice_terminalId_date_idx" ON "Invoice"("terminalId", "date");
CREATE INDEX "Invoice_tillSessionId_idx" ON "Invoice"("tillSessionId");
CREATE INDEX "Invoice_paymentStatus_branchId_idx" ON "Invoice"("paymentStatus", "branchId");
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE INDEX "Invoice_synced_branchId_idx" ON "Invoice"("synced", "branchId");

-- AddIndex: InvoiceItem
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");
CREATE INDEX "InvoiceItem_productId_idx" ON "InvoiceItem"("productId");

-- AddIndex: Inventory (unique covers productId+branchId but not branchId-only queries)
CREATE INDEX "Inventory_branchId_idx" ON "Inventory"("branchId");

-- AddIndex: TillSession (open-till lookup and branch status checks)
CREATE INDEX "TillSession_terminalId_status_idx" ON "TillSession"("terminalId", "status");
CREATE INDEX "TillSession_branchId_status_idx" ON "TillSession"("branchId", "status");

-- AddIndex: Product
CREATE INDEX "Product_orgId_isActive_idx" ON "Product"("orgId", "isActive");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- AddIndex: Customer
CREATE INDEX "Customer_orgId_idx" ON "Customer"("orgId");
CREATE INDEX "Customer_orgId_lastOrderAt_idx" ON "Customer"("orgId", "lastOrderAt");

-- AddIndex: LoyaltyTransaction
CREATE INDEX "LoyaltyTransaction_customerId_createdAt_idx" ON "LoyaltyTransaction"("customerId", "createdAt");
CREATE INDEX "LoyaltyTransaction_branchId_createdAt_idx" ON "LoyaltyTransaction"("branchId", "createdAt");
CREATE INDEX "LoyaltyTransaction_invoiceId_idx" ON "LoyaltyTransaction"("invoiceId");

-- AddIndex: OtpCode
CREATE INDEX "OtpCode_phone_purpose_idx" ON "OtpCode"("phone", "purpose");
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- AddIndex: CustomerMessage
CREATE INDEX "CustomerMessage_customerId_idx" ON "CustomerMessage"("customerId");
CREATE INDEX "CustomerMessage_orgId_status_idx" ON "CustomerMessage"("orgId", "status");

-- AddIndex: UserRoleAssignment
CREATE INDEX "UserRoleAssignment_userId_idx" ON "UserRoleAssignment"("userId");
CREATE INDEX "UserRoleAssignment_scopeType_scopeId_idx" ON "UserRoleAssignment"("scopeType", "scopeId");

-- AddIndex: Reservation
CREATE INDEX "Reservation_branchId_date_idx" ON "Reservation"("branchId", "date");
CREATE INDEX "Reservation_tableId_idx" ON "Reservation"("tableId");

-- AddIndex: HeldOrder
CREATE INDEX "HeldOrder_branchId_isActive_idx" ON "HeldOrder"("branchId", "isActive");
