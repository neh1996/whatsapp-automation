import StatsCards from "@/components/stats-cards";
import QuickActions from "@/components/quick-actions";
import RecentActivity from "@/components/recent-activity";
import MessageComposer from "@/components/message-composer";
import PerformanceChart from "@/components/performance-chart";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <StatsCards />
      
      <QuickActions
        onQuickSend={() => {
          // Scroll to message composer
          document.querySelector('.message-composer')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onImportContacts={() => {
          // Navigate to contacts page
          window.location.href = '/contacts';
        }}
        onNewCampaign={() => {
          // Navigate to campaigns page
          window.location.href = '/campaigns';
        }}
        onSearchGroups={() => {
          // Navigate to groups page
          window.location.href = '/groups';
        }}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity />
        <div className="message-composer">
          <MessageComposer />
        </div>
      </div>
      
      <PerformanceChart />
    </div>
  );
}
