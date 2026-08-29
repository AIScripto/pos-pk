import ThemedPromptDialog from '@/components/ui/themed-prompt-dialog';
import { useManagerPanelState } from '@/hooks/useManagerPanelState';
import { ManagerHeader } from '@/components/admin/manager/ManagerHeader';
import { ManagerKpiGrid } from '@/components/admin/manager/ManagerKpiGrid';
import { ManagerTabNavigation } from '@/components/admin/manager/ManagerTabNavigation';
import { OverviewTab } from '@/components/admin/manager/OverviewTab';
import { OperationsControlTab } from '@/components/admin/manager/OperationsControlTab';
import { TillsManagementTab } from '@/components/admin/manager/TillsManagementTab';
import { KitchenPipelineTab } from '@/components/admin/manager/KitchenPipelineTab';

export default function ManagerPanel() {
  const {
    activeTab,
    setActiveTab,
    isBranchFixed,
    branchId,
    setBranchId,
    allowedBranches,
    isMultiBranch,
    activeBranch,
    data,
    isLoading,
    error,
    refetch,
    shiftSummary,
    daySummary,
    openDay,
    closeDay,
    openShift,
    closeShift,
    approveClose,
    rejectClose,
    forceClose,
    modalOpen,
    setModalOpen,
    modalTitle,
    modalDescription,
    modalInputLabel,
    modalInputValue,
    setModalInputValue,
    modalOnConfirm,
    modalTheme,
    openModalPrompt,
    kitchenByState,
    ops,
    hasOpenDay,
    hasOpenShift,
    activeTillsList,
    openTills,
    pendingTills,
    canCloseShift,
    canCloseDay,
    totalKitchenOrders,
  } = useManagerPanelState();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ManagerHeader
        activeBranch={activeBranch}
        businessDate={data?.businessDate}
        shiftSessionName={ops?.shiftSession?.name}
        isLoading={isLoading}
        onRefresh={refetch}
        isBranchFixed={isBranchFixed}
        isMultiBranch={isMultiBranch}
        branchId={branchId}
        setBranchId={setBranchId}
        allowedBranches={allowedBranches}
      />

      {error && (
        <div className="rounded-xl border border-danger-border bg-danger-subtle px-4 py-3 text-sm font-semibold text-danger-text">
          Could not load manager panel — check branch access or server status.
        </div>
      )}

      {/* KPI Summary Bar */}
      <ManagerKpiGrid
        isLoading={isLoading}
        openTills={openTills}
        pendingTills={pendingTills}
        totalOrders={data?.totals.totalOrders ?? 0}
        currentSale={data?.totals.currentSale ?? 0}
      />

      {/* Category Tab Switcher */}
      <ManagerTabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasOpenDay={hasOpenDay}
        hasOpenShift={hasOpenShift}
        openTills={openTills}
        pendingTills={pendingTills}
        totalKitchenOrders={totalKitchenOrders}
      />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <OverviewTab
          pendingTills={pendingTills}
          openTills={openTills}
          totalKitchenOrders={totalKitchenOrders}
          activeTillsList={activeTillsList}
          kitchenByState={kitchenByState}
          ops={ops}
          isLoading={isLoading}
          branchId={branchId}
          openDay={openDay}
          closeDay={closeDay}
          openShift={openShift}
          closeShift={closeShift}
          canCloseDay={canCloseDay}
          canCloseShift={canCloseShift}
          openModalPrompt={openModalPrompt}
          setActiveTab={setActiveTab}
        />
      )}

      {/* TAB 2: OPEN & CLOSING */}
      {activeTab === 'openclosing' && (
        <OperationsControlTab
          ops={ops}
          isLoading={isLoading}
          branchId={branchId}
          openDay={openDay}
          closeDay={closeDay}
          openShift={openShift}
          closeShift={closeShift}
          openTills={openTills}
          pendingTills={pendingTills}
          canCloseDay={canCloseDay}
          canCloseShift={canCloseShift}
          shiftSummary={shiftSummary}
          daySummary={daySummary}
          openModalPrompt={openModalPrompt}
        />
      )}

      {/* TAB 3: TILLS STATUS */}
      {activeTab === 'tills' && (
        <TillsManagementTab
          data={data}
          isLoading={isLoading}
          openTills={openTills}
          pendingTills={pendingTills}
          activeTillsList={activeTillsList}
          forceClose={forceClose}
          approveClose={approveClose}
          rejectClose={rejectClose}
          openModalPrompt={openModalPrompt}
        />
      )}

      {/* TAB 4: KITCHEN PIPELINE */}
      {activeTab === 'kitchen' && (
        <KitchenPipelineTab
          data={data}
          kitchenByState={kitchenByState}
        />
      )}

      {/* Themed Confirmation & Prompt Modal */}
      <ThemedPromptDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalTitle}
        description={modalDescription}
        inputLabel={modalInputLabel}
        value={modalInputValue}
        onChange={setModalInputValue}
        onConfirm={(val) => {
          if (modalOnConfirm) {
            modalOnConfirm(val);
          }
        }}
        theme={modalTheme}
      />
    </div>
  );
}
