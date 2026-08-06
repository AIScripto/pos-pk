import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Package, X } from 'lucide-react';
import { ManagerAccessGate } from '@/components/reports/ManagerAccessGate';
import { MANAGER_REPORT_PASSWORD } from '@/data/reportDemo';
import { ProductTable } from './ProductTable';
import { DealTable } from './DealTable';
import { InventoryTable } from './InventoryTable';
import { localDefault } from '@/config/localCredentials';

interface ProductManagementPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductManagementPanel({ open, onOpenChange }: ProductManagementPanelProps) {
  const [password, setPassword] = useState(localDefault(MANAGER_REPORT_PASSWORD));
  const [unlocked, setUnlocked] = useState(false);

  function handleUnlock() {
    if (password === MANAGER_REPORT_PASSWORD) {
      setUnlocked(true);
    } else {
      setPassword(localDefault(MANAGER_REPORT_PASSWORD));
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setUnlocked(false);
      setPassword(localDefault(MANAGER_REPORT_PASSWORD));
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Product Management
            </DialogTitle>
            <DialogDescription>
              Manage products, bundle deals, and track stock levels.
            </DialogDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full shrink-0"
            onClick={() => handleOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {!unlocked ? (
          <div className="flex-1 overflow-auto">
            <ManagerAccessGate
              password={password}
              isSubmitting={false}
              onPasswordChange={setPassword}
              onUnlock={handleUnlock}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="products" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 flex-shrink-0">
                <TabsList className="w-full max-w-sm">
                  <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
                  <TabsTrigger value="deals" className="flex-1">Deals</TabsTrigger>
                  <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="products" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                <ProductTable />
              </TabsContent>

              <TabsContent value="deals" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                <DealTable />
              </TabsContent>

              <TabsContent value="inventory" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                <InventoryTable />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
