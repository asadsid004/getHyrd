import { ProfileContentForm } from "@/components/profile/profile-content-form";
import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default async function ProfilePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.profile.get.queryOptions());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mt-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-xl text-muted-foreground">
            View and update your personal information.
          </p>
        </div>
      </div>
      <HydrateClient client={queryClient}>
        <ProfileContentForm />
      </HydrateClient>
    </div>
  );
}
