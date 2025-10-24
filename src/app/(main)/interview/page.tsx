import { CreateInterviewForm } from "@/components/interview/create-interview-form";
export default function InterviewPage() {
  return (
    <div className="flex items-center justify-between mt-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Interview Readiness
        </h1>
        <p className="text-xl text-muted-foreground">
          Prepare for your next interview with our AI-powered interview
          simulator.
        </p>
      </div>
      <div>
        <CreateInterviewForm />
      </div>
    </div>
  );
}
