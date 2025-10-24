import { notFound } from "next/navigation";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";
import { CoverLetterContentForm } from "@/components/cover-letters/cover-letter-content-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoverLetterContentPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Get user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    notFound();
  }

  const userProfile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id));

  const userData = {
    ...userProfile[0],
    name: session.user.name,
    email: session.user.email,
  };

  const queryClient = getQueryClient();

  // Prefetch cover letter data
  await queryClient.prefetchQuery(
    orpc.coverLetters.getOne.queryOptions({ input: { id } })
  );

  const coverLetter = queryClient.getQueryData(
    orpc.coverLetters.getOne.queryOptions({ input: { id } }).queryKey
  );

  if (!coverLetter) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Cover Letter
          </h1>
          <p className="text-muted-foreground">
            Update your cover letter information and content
          </p>
        </div>
      </div>

      <HydrateClient client={queryClient}>
        <CoverLetterContentForm
          coverLetterId={id}
          initialData={coverLetter}
          user={userData}
        />
      </HydrateClient>
    </div>
  );
}
