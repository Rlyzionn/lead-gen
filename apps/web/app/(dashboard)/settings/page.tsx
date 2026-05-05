import DynamicsSettings from "@/components/settings/DynamicsSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import FieldMappingSettings from "@/components/settings/FieldMappingSettings";
import AISettings from "@/components/settings/AISettings";
import DefaultSearchConfig from "@/components/settings/DefaultSearchConfig";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <AISettings />
      <DefaultSearchConfig />
      <DynamicsSettings />
      <FieldMappingSettings />
      <NotificationSettings />
    </div>
  );
}
