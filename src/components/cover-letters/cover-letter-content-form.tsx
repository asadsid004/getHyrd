"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateCoverLetterPDF } from "@/lib/pdf-generator";
import { UserProfile } from "@/db/schema/profile-schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getQueryClient } from "@/lib/query/hydration";

type CoverLetterData = {
  id: string;
  title: string;
  content: string;
  recipientCompany: string | null;
  recipientPosition: string | null;
  recipientName: string | null;
  jobDescription: string | null;
  subject: string | null;
  salutation: string | null;
  closingStatement: string | null;
  senderName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface CoverLetterContentFormProps {
  coverLetterId: string;
  initialData: Omit<
    CoverLetterData,
    "id" | "createdAt" | "updatedAt" | "jobDescription"
  > | null;
  user: Omit<
    UserProfile,
    "userId" | "primaryResumeId" | "createdAt" | "updatedAt"
  > & {
    name: string;
    email: string;
  };
}

export function CoverLetterContentForm({
  coverLetterId,
  initialData,
  user,
}: CoverLetterContentFormProps) {
  const queryClient = getQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: analyses } = useSuspenseQuery(
    orpc.coverLetters.getAnalyses.queryOptions({ input: { id: coverLetterId } })
  );

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateCoverLetterPDF(
        "cover-letter-preview-content",
        `${form.getFieldValue("title") || "cover-letter"}.pdf`
      );
      toast.success("Cover letter downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const updateMutation = useMutation(
    orpc.coverLetters.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.coverLetters.getOne.queryKey({
            input: { id: coverLetterId },
          }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.coverLetters.getAnalyses.queryKey({
            input: { id: coverLetterId },
          }),
        });
        toast.success("Cover letter updated successfully!");
        setIsSubmitting(false);
      },
      onError: (error) => {
        toast.error("Failed to update cover letter. Please try again.");
        console.error("Update error:", error);
        setIsSubmitting(false);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      recipientCompany: initialData?.recipientCompany || "",
      recipientPosition: initialData?.recipientPosition || "",
      recipientName: initialData?.recipientName || "",
      subject: initialData?.subject || "",
      salutation: initialData?.salutation || "",
      closingStatement: initialData?.closingStatement || "",
      senderName: initialData?.senderName || user.name,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      const transformedValue = {
        title: value.title || undefined,
        content: value.content || undefined,
        recipientCompany: value.recipientCompany || undefined,
        recipientPosition: value.recipientPosition || undefined,
        recipientName: value.recipientName || undefined,
        subject: value.subject || undefined,
        salutation: value.salutation || undefined,
        closingStatement: value.closingStatement || undefined,
        senderName: value.senderName || undefined,
      };

      await updateMutation.mutateAsync({
        id: coverLetterId,
        ...transformedValue,
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <div className="flex justify-end gap-x-4 mb-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.Field name="title">
                    {(field) => (
                      <div>
                        <Label htmlFor={field.name} className="mb-2">
                          Title
                        </Label>
                        <Input
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter cover letter title"
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Recipient Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Recipient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <form.Field name="recipientName">
                      {(field) => (
                        <div>
                          <Label htmlFor={field.name} className="mb-2">
                            Recipient Name
                          </Label>
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="recipientPosition">
                      {(field) => (
                        <div>
                          <Label htmlFor={field.name} className="mb-2">
                            Position
                          </Label>
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Software Engineer"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                  <form.Field name="recipientCompany">
                    {(field) => (
                      <div>
                        <Label htmlFor={field.name} className="mb-2">
                          Company
                        </Label>
                        <Input
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Subject */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="subject">
                    {(field) => (
                      <div>
                        <Input
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter subject line..."
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Salutation */}
              <Card>
                <CardHeader>
                  <CardTitle>Salutation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="salutation">
                    {(field) => (
                      <div>
                        <Input
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Dear Hiring Manager, Respected Sir/Madam..."
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="content">
                    {(field) => (
                      <div>
                        <Textarea
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter your content..."
                          rows={3}
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Closing Statement */}
              <Card>
                <CardHeader>
                  <CardTitle>Closing Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="closingStatement">
                    {(field) => (
                      <div>
                        <Textarea
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter your closing statement..."
                          rows={3}
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Sender Name */}
              <Card>
                <CardHeader>
                  <CardTitle>Sender Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="senderName">
                    {(field) => (
                      <div>
                        <Input
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Your full name for signature..."
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div className="flex justify-end gap-x-4 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>

            {/* Preview Section */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cover Letter Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12" id="cover-letter-preview-content">
                <form.Subscribe selector={(state) => [state.values]}>
                  {([values]) => (
                    <div
                      className="space-y-4 text-[11pt] font-serif"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        lineHeight: "1.5",
                        maxWidth: "210mm",
                        margin: "0 auto",
                      }}
                    >
                      {/* Header: Sender's Information */}
                      <div className="space-y-0">
                        <div className="font-bold">
                          {(user.name as string) || "Your Full Name"}
                        </div>
                        {user.phone && (
                          <div className="text-[10pt]">
                            <span className="font-semibold">H</span>{" "}
                            {user.phone}
                          </div>
                        )}
                        {user.email && <div>{user.email}</div>}
                      </div>

                      {/* Recipient Section */}
                      <div className="mt-8 space-y-0">
                        <div className="font-semibold">To</div>
                        <div>
                          {values.recipientName || "The Hiring Manager"}
                        </div>
                        {values.recipientPosition && (
                          <div>{values.recipientPosition}</div>
                        )}
                        {values.recipientCompany && (
                          <div>{values.recipientCompany}</div>
                        )}
                      </div>

                      {/* Date */}
                      <div className="mt-6">
                        {new Date().toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>

                      {/* Subject */}
                      {values.subject && (
                        <div className="mt-4">
                          <span className="font-semibold">Sub: </span>
                          <span>{values.subject}</span>
                        </div>
                      )}

                      {/* Salutation */}
                      <div className="mt-6 font-semibold">
                        {values.salutation || "Respected Sir/Madam"},
                      </div>

                      {/* Body Content */}
                      <div className="mt-4 space-y-4 text-justify">
                        {values.content ? (
                          values.content
                            .split(/\n\n+/)
                            .filter(Boolean)
                            .map((paragraph, idx) => (
                              <p
                                key={idx}
                                className="text-[11pt] leading-relaxed"
                              >
                                {paragraph.trim()}
                              </p>
                            ))
                        ) : (
                          <p className="text-muted-foreground italic">
                            Your cover letter content will appear here. Start
                            typing in the editor...
                          </p>
                        )}
                      </div>

                      {/* Closing Statement */}
                      <div className="mt-6 space-y-3">
                        <p className="text-justify">
                          {values.closingStatement ||
                            "I look forward to the opportunity to discuss how my skills and experiences align with your requirements."}
                        </p>
                      </div>

                      {/* Sign-off */}
                      <div className="mt-6 space-y-1">
                        <div>{"Yours Sincerely,"}</div>
                        <div className="mt-2 font-bold">
                          {values.senderName || "Your Full Name"}
                        </div>
                      </div>
                    </div>
                  )}
                </form.Subscribe>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analysis" className="w-full">
            {/* Cover Letter Analysis */}
            <div className="space-y-6">
              {/* New Analysis Form */}
              {!analyses && (
                <Card className="text-center mt-10 font-semibold text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl">
                      <FileText className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">No Analysis Yet</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Get AI-powered feedback on your cover letter by
                        analyzing it against job descriptions. Click the
                        &quot;Analyze&quot; button in the header to get started.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              {/* Existing Analyses */}
              {/* Existing Analyses */}
              {analyses && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Analysis Overview
                  </h3>

                  <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/50 pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-primary">
                          Analysis for {analyses.role}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {analyses.createdAt
                            ? new Date(analyses.createdAt).toLocaleDateString(
                                "en-GB"
                              )
                            : "Unknown"}
                        </span>
                      </CardTitle>
                      <p className="text-sm font-medium text-muted-foreground">
                        Overall Score:{" "}
                        <span className="text-foreground font-semibold">
                          {analyses.analysis.overallScore}/10
                        </span>
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-5">
                      {/* Top Scores Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          {
                            label: "Relevance",
                            score: analyses.analysis.relevance.score,
                            color: "text-blue-600",
                          },
                          {
                            label: "Tone & Language",
                            score: analyses.analysis.toneAndLanguage.score,
                            color: "text-green-600",
                          },
                          {
                            label: "Structure",
                            score: analyses.analysis.structureAndFlow.score,
                            color: "text-purple-600",
                          },
                          {
                            label: "Personalization",
                            score: analyses.analysis.personalization.score,
                            color: "text-orange-600",
                          },
                        ].map(({ label, score, color }, i) => (
                          <div key={i} className="text-center">
                            <div className={`text-3xl font-bold ${color}`}>
                              {score}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                              {label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Feedback Sections */}
                      <div className="space-y-6">
                        {[
                          {
                            key: "relevance",
                            title: "Relevance",
                            color: "border-blue-500",
                          },
                          {
                            key: "toneAndLanguage",
                            title: "Tone & Language",
                            color: "border-green-500",
                          },
                          {
                            key: "structureAndFlow",
                            title: "Structure & Flow",
                            color: "border-purple-500",
                          },
                          {
                            key: "personalization",
                            title: "Personalization",
                            color: "border-orange-500",
                          },
                          {
                            key: "other",
                            title: "Other Feedback",
                            color: "border-gray-400",
                            optional: true,
                          },
                        ].map(({ key, title, color, optional }) => {
                          const section =
                            analyses.analysis[
                              key as keyof typeof analyses.analysis
                            ];
                          if (
                            optional &&
                            (!section || typeof section !== "object")
                          )
                            return null;
                          if (!optional && typeof section !== "object")
                            return null;
                          const sectionObj = section as {
                            score: number;
                            summary: string;
                            feedback: {
                              type: string;
                              name: string;
                              message: string;
                            }[];
                          };
                          return (
                            <div
                              key={key}
                              className={`border-l-4 ${color} pl-4 space-y-2`}
                            >
                              <h4 className="text-base font-semibold text-foreground">
                                {title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {sectionObj.summary}
                              </p>
                              <ul className="space-y-1.5">
                                {sectionObj.feedback.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm flex items-start gap-2"
                                  >
                                    <span
                                      className={`mt-1 inline-block flex-shrink-0 rounded-full w-2.5 h-2.5 ${
                                        item.type === "strength"
                                          ? "bg-green-500"
                                          : item.type === "minor-improvement"
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                    <div>
                                      <span className="font-medium">
                                        {item.name}:
                                      </span>{" "}
                                      {item.message}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
