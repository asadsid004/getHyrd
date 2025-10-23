import { ResumesList } from "@/components/resumes/resumes-list";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { ResumeAnalyseForm } from "@/components/resumes/resume-analyse-form";

export default async function ResumesPage() {
  const queryClient = getQueryClient();

  // Prefetch resumes data
  await queryClient.prefetchQuery(orpc.resumes.get.queryOptions());

  //   const resumes = queryClient.getQueryData(orpc.resumes.get.queryOptions().queryKey);

  // Calculate stats
  //   const totalResumes = resumes?.length || 0;
  //   const primaryResumes = resumes?.filter(r => r.isPrimary).length || 0;
  //   const recentUploads = resumes?.filter(r =>
  //     r.uploadDate && new Date(r.uploadDate).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  //   ).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mt-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Resumes</h1>
          <p className="text-xl text-muted-foreground">Manage your resumes</p>
        </div>
        <ButtonGroup aria-label="Resume actions">
          <ResumeAnalyseForm />
          <Button variant="outline">Create</Button>
        </ButtonGroup>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResumes}</div>
            <p className="text-xs text-muted-foreground">
              {totalResumes === 1 ? "resume" : "resumes"} uploaded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Resume</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primaryResumes}</div>
            <p className="text-xs text-muted-foreground">
              {primaryResumes === 1 ? "resume" : "resumes"} set as primary
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentUploads}</div>
            <p className="text-xs text-muted-foreground">
              in the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalResumes > 0 ? Math.round((resumes?.filter(r => r.resumeData).length || 0) / totalResumes * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              parsed successfully
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* Resumes List */}
      <HydrateClient client={queryClient}>
        <ResumesList />
      </HydrateClient>
    </div>
  );
}
