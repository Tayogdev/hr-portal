import React from "react";
import { TabType, ApprovedSubTabType } from "@/types/event/eventDetail";

interface Tab {
  id: string;
  label: string;
}

interface EventTabsProps {
  tabs: Tab[];
  selectedTab: TabType;
  onTabChange: (tabId: TabType) => void;
  onApprovedSubTabChange: (subTab: ApprovedSubTabType) => void;
}

export default function EventTabs({
  tabs,
  selectedTab,
  onTabChange,
  onApprovedSubTabChange,
}: EventTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-4 md:mb-6 overflow-x-auto">
      <div className="flex gap-4 md:gap-8 whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id as TabType);
              // Reset approved sub-tab when switching to a different main tab
              if (tab.id !== "approved") {
                onApprovedSubTabChange("all");
              }
            }}
            className={`py-2 md:py-4 px-1 relative ${
              selectedTab === tab.id
                ? "text-[#6366F1] font-medium"
                : "text-black"
            }`}
          >
            {tab.label}
            {selectedTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
