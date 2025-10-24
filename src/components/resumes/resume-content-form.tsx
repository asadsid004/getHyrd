"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChipsInput } from "@/components/ui/chips-input";
import { Save, Loader2, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { Resume } from "@/router/onboarding/schema";
import { generateResumePDF } from "@/lib/pdf-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ResumeOptimisedAnalysisBased } from "./resume-optimised-analysis-based";

type ResumeFullData = {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  summary: string | null;
  skills: string[] | null;
  experience:
    | {
        company: string | null;
        position: string | null;
        startDate: string | null;
        endDate: string | null;
        description: string | null;
        achievements: string[] | null;
      }[]
    | null;
  projects:
    | {
        title: string | null;
        description: string | null;
        technologiesUsed: string[] | null;
        highlights: string[] | null;
        link: string | null;
      }[]
    | null;
  education:
    | {
        school: string | null;
        degree: string | null;
        startDate: string | null;
        endDate: string | null;
        cgpaOrPercentage: string | null;
      }[]
    | null;
  certifications: string[] | null;
  achievements: string[] | null;
  languages: string[] | null;
};

interface ResumeContentFormProps {
  resumeId: string;
  initialData: Resume | null;
}

export function ResumeContentForm({
  resumeId,
  initialData,
}: ResumeContentFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: analyses } = useSuspenseQuery(
    orpc.resumes.getAnalyses.queryOptions({ input: { id: resumeId } })
  );

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateResumePDF(
        "resume-preview-content",
        `${form.getFieldValue("name") || "resume"}.pdf`
      );
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Normalize various date strings to YYYY-MM for <input type="month" />
  const normalizeMonthString = (s?: string | null): string => {
    if (!s) return "";
    // Already YYYY-MM
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    // YYYY-MM-DD -> YYYY-MM
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(0, 7);
    // MM/YYYY or M/YYYY -> YYYY-MM
    const mmYYYY = s.match(/^(\d{1,2})\/(\d{4})$/);
    if (mmYYYY) {
      const mm = mmYYYY[1].padStart(2, "0");
      return `${mmYYYY[2]}-${mm}`;
    }
    // Fallback to Date parsing
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    }
    return "";
  };

  // Format YYYY-MM (or similar) to Mon YYYY for preview (e.g., Sep 2024)
  const formatMonthYear = (s?: string | null): string | null => {
    const norm = normalizeMonthString(s);
    if (!norm) return null;
    const [y, m] = norm.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  const transformedInitialData: ResumeFullData = initialData
    ? {
        name: initialData.name ?? null,
        email: initialData.email ?? null,
        phone: initialData.phone ?? null,
        address: initialData.address ?? null,
        linkedin: initialData.linkedin ?? null,
        github: initialData.github ?? null,
        portfolio: initialData.portfolio ?? null,
        summary: initialData.summary ?? null,
        skills: initialData.skills ?? null,
        experience: initialData.experience
          ? initialData.experience.map((exp) => ({
              company: exp.company ?? null,
              position: exp.position ?? null,
              startDate: exp.startDate ?? null,
              endDate: exp.endDate ?? null,
              description: exp.description ?? null,
              achievements: exp.achievements ?? null,
            }))
          : null,
        projects: initialData.projects
          ? initialData.projects.map((proj) => ({
              title: proj.title ?? null,
              description: proj.description ?? null,
              technologiesUsed: proj.technologiesUsed ?? null,
              highlights: proj.highlights ?? null,
              link: proj.link ?? null,
            }))
          : null,
        education: initialData.education
          ? initialData.education.map((edu) => ({
              school: edu.school ?? null,
              degree: edu.degree ?? null,
              startDate: edu.startDate ?? null,
              endDate: edu.endDate ?? null,
              cgpaOrPercentage: edu.cgpaOrPercentage ?? null,
            }))
          : null,
        certifications: initialData.certifications ?? null,
        achievements: initialData.achievements ?? null,
        languages: initialData.languages ?? null,
      }
    : {
        name: null,
        email: null,
        phone: null,
        address: null,
        linkedin: null,
        github: null,
        portfolio: null,
        summary: null,
        skills: null,
        experience: null,
        projects: null,
        education: null,
        certifications: null,
        achievements: null,
        languages: null,
      };

  const updateMutation = useMutation(
    orpc.resumes.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.resumes.getOne.queryOptions({
            input: { id: resumeId },
          }).queryKey,
        });
        toast.success("Resume updated successfully!");
        setIsSubmitting(false);
      },
      onError: (error) => {
        toast.error("Failed to update resume. Please try again.");
        console.error("Update error:", error);
        setIsSubmitting(false);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      name: transformedInitialData.name || "",
      email: transformedInitialData.email || "",
      phone: transformedInitialData.phone || "",
      address: transformedInitialData.address || "",
      linkedin: transformedInitialData.linkedin || "",
      github: transformedInitialData.github || "",
      portfolio: transformedInitialData.portfolio || "",
      summary: transformedInitialData.summary || "",
      skills: transformedInitialData.skills || [],
      experience: transformedInitialData.experience || [],
      projects: transformedInitialData.projects || [],
      education: transformedInitialData.education || [],
      certifications: transformedInitialData.certifications || [],
      achievements: transformedInitialData.achievements || [],
      languages: transformedInitialData.languages || [],
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      // Transform value to convert empty strings to null
      const transformedValue = {
        name: value.name || null,
        email: value.email || null,
        phone: value.phone || null,
        address: value.address || null,
        linkedin: value.linkedin || null,
        github: value.github || null,
        portfolio: value.portfolio || null,
        summary: value.summary || null,
        skills: value.skills.length > 0 ? value.skills : null,
        experience:
          value.experience.length > 0
            ? value.experience.map((exp) => ({
                company: exp.company || null,
                position: exp.position || null,
                startDate: exp.startDate || null,
                endDate: exp.endDate || null,
                description: exp.description || null,
                achievements:
                  exp.achievements && exp.achievements.length > 0
                    ? exp.achievements
                    : null,
              }))
            : null,
        projects:
          value.projects.length > 0
            ? value.projects.map((proj) => ({
                title: proj.title || null,
                description: proj.description || null,
                technologiesUsed:
                  proj.technologiesUsed && proj.technologiesUsed.length > 0
                    ? proj.technologiesUsed
                    : null,
                highlights:
                  proj.highlights && proj.highlights.length > 0
                    ? proj.highlights
                    : null,
                link: proj.link || null,
              }))
            : null,
        education:
          value.education.length > 0
            ? value.education.map((edu) => ({
                school: edu.school || null,
                degree: edu.degree || null,
                startDate: edu.startDate || null,
                endDate: edu.endDate || null,
                cgpaOrPercentage: edu.cgpaOrPercentage || null,
              }))
            : null,
        certifications:
          value.certifications.length > 0 ? value.certifications : null,
        achievements: value.achievements.length > 0 ? value.achievements : null,
        languages: value.languages.length > 0 ? value.languages : null,
      };

      await updateMutation.mutateAsync({
        resumeId,
        resumeData: transformedValue,
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {analyses.length > 0 && (
        <ResumeOptimisedAnalysisBased
          resumeId={resumeId}
          resumeData={initialData}
          AnalysisData={analyses[0].analysis}
        />
      )}
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
          <TabsContent value="content" className="w-full ">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="flex justify-end gap-x-4">
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
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.Field name="name">
                    {(field) => (
                      <div>
                        <Label htmlFor={field.name} className="mb-2">
                          Full Name
                        </Label>
                        <Input
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                    )}
                  </form.Field>
                  <div className="grid grid-cols-2 gap-4">
                    <form.Field name="email">
                      {(field) => (
                        <div>
                          <Label htmlFor={field.name} className="mb-2">
                            Email
                          </Label>
                          <Input
                            id={field.name}
                            type="email"
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="your.email@example.com"
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="phone">
                      {(field) => (
                        <div>
                          <Label htmlFor={field.name} className="mb-2">
                            Phone
                          </Label>
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                  <form.Field name="address">
                    {(field) => (
                      <div>
                        <Label htmlFor={field.name} className="mb-2">
                          Address
                        </Label>
                        <Input
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="City, State, Country"
                        />
                      </div>
                    )}
                  </form.Field>
                  <div className="grid grid-cols-3 gap-4">
                    <form.Field name="linkedin">
                      {(field) => (
                        <div>
                          <Label htmlFor={field.name} className="mb-2">
                            LinkedIn
                          </Label>
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="github">
                      {(field) => (
                        <div>
                          <Label htmlFor={field.name} className="mb-2">
                            GitHub
                          </Label>
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="github.com/username"
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="portfolio">
                      {(field) => (
                        <div>
                          <Label htmlFor={field.name} className="mb-2">
                            Portfolio
                          </Label>
                          <Input
                            id={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="yourwebsite.com"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="summary">
                    {(field) => (
                      <div>
                        <Textarea
                          id={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Write a brief summary about yourself..."
                          rows={4}
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="skills">
                    {(field) => (
                      <div>
                        <ChipsInput
                          value={field.state.value || []}
                          onChange={field.handleChange}
                          placeholder="Add a skill..."
                        />
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Work Experience</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentExperience =
                        form.getFieldValue("experience") || [];
                      form.setFieldValue("experience", [
                        ...currentExperience,
                        {
                          company: "",
                          position: "",
                          startDate: "",
                          endDate: "",
                          description: "",
                          achievements: [],
                        },
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.Field name="experience">
                    {(field) => (
                      <>
                        {(field.state.value || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No work experience added yet. Click &quot;Add
                            Experience&quot; to get started.
                          </p>
                        ) : (
                          (field.state.value || []).map((_, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  Experience {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const current =
                                      form.getFieldValue("experience") || [];
                                    form.setFieldValue(
                                      "experience",
                                      current.filter((_, i) => i !== index)
                                    );
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">Company</Label>
                                  <Input
                                    value={
                                      (field.state.value?.[index]).company || ""
                                    }
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("experience") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        company: e.target.value,
                                      };
                                      form.setFieldValue("experience", updated);
                                    }}
                                    placeholder="Company name"
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">Position</Label>
                                  <Input
                                    value={
                                      (field.state.value?.[index]).position ||
                                      ""
                                    }
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("experience") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        position: e.target.value,
                                      };
                                      form.setFieldValue("experience", updated);
                                    }}
                                    placeholder="Job title"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">Start Date</Label>
                                  <Input
                                    type="month"
                                    value={normalizeMonthString(
                                      (field.state.value?.[index]).startDate
                                    )}
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("experience") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        startDate: e.target.value,
                                      };
                                      form.setFieldValue("experience", updated);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">End Date</Label>
                                  <Input
                                    type="month"
                                    value={normalizeMonthString(
                                      (field.state.value?.[index]).endDate
                                    )}
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("experience") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        endDate: e.target.value,
                                      };
                                      form.setFieldValue("experience", updated);
                                    }}
                                    placeholder="Leave empty if current"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="mb-2">Description</Label>
                                <Textarea
                                  value={
                                    (field.state.value?.[index]).description ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const current =
                                      form.getFieldValue("experience") || [];
                                    const updated = [...current];
                                    updated[index] = {
                                      ...updated[index],
                                      description: e.target.value,
                                    };
                                    form.setFieldValue("experience", updated);
                                  }}
                                  placeholder="Describe your role and responsibilities..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentProjects =
                        form.getFieldValue("projects") || [];
                      form.setFieldValue("projects", [
                        ...currentProjects,
                        {
                          title: "",
                          description: "",
                          technologiesUsed: [],
                          highlights: [],
                          link: "",
                        },
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.Field name="projects">
                    {(field) => (
                      <>
                        {(field.state.value || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No projects added yet. Click &quot;Add Project&quot;
                            to get started.
                          </p>
                        ) : (
                          (field.state.value || []).map((_, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  Project {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const current =
                                      form.getFieldValue("projects") || [];
                                    form.setFieldValue(
                                      "projects",
                                      current.filter((_, i) => i !== index)
                                    );
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div>
                                <Label className="mb-2">Title</Label>
                                <Input
                                  value={
                                    (field.state.value?.[index]).title || ""
                                  }
                                  onChange={(e) => {
                                    const current =
                                      form.getFieldValue("projects") || [];
                                    const updated = [...current];
                                    updated[index] = {
                                      ...updated[index],
                                      title: e.target.value,
                                    };
                                    form.setFieldValue("projects", updated);
                                  }}
                                  placeholder="Project title"
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Description</Label>
                                <Textarea
                                  value={
                                    (field.state.value?.[index]).description ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const current =
                                      form.getFieldValue("projects") || [];
                                    const updated = [...current];
                                    updated[index] = {
                                      ...updated[index],
                                      description: e.target.value,
                                    };
                                    form.setFieldValue("projects", updated);
                                  }}
                                  placeholder="Describe the project..."
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label className="mb-2">
                                  Technologies Used
                                </Label>
                                <ChipsInput
                                  value={
                                    (field.state.value?.[index])
                                      .technologiesUsed || []
                                  }
                                  onChange={(value) => {
                                    const current =
                                      form.getFieldValue("projects") || [];
                                    const updated = [...current];
                                    updated[index] = {
                                      ...updated[index],
                                      technologiesUsed: value,
                                    };
                                    form.setFieldValue("projects", updated);
                                  }}
                                  placeholder="Add a technology..."
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Highlights</Label>
                                <ChipsInput
                                  value={
                                    (field.state.value?.[index]).highlights ||
                                    []
                                  }
                                  onChange={(value) => {
                                    const current =
                                      form.getFieldValue("projects") || [];
                                    const updated = [...current];
                                    updated[index] = {
                                      ...updated[index],
                                      highlights: value,
                                    };
                                    form.setFieldValue("projects", updated);
                                  }}
                                  placeholder="Add a highlight..."
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Link</Label>
                                <Input
                                  value={
                                    (field.state.value?.[index]).link || ""
                                  }
                                  onChange={(e) => {
                                    const current =
                                      form.getFieldValue("projects") || [];
                                    const updated = [...current];
                                    updated[index] = {
                                      ...updated[index],
                                      link: e.target.value,
                                    };
                                    form.setFieldValue("projects", updated);
                                  }}
                                  placeholder="https://github.com/username/project"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Education</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentEducation =
                        form.getFieldValue("education") || [];
                      form.setFieldValue("education", [
                        ...currentEducation,
                        {
                          school: "",
                          degree: "",
                          startDate: "",
                          endDate: "",
                          cgpaOrPercentage: "",
                        },
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.Field name="education">
                    {(field) => (
                      <>
                        {(field.state.value || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No education added yet. Click &quot;Add
                            Education&quot; to get started.
                          </p>
                        ) : (
                          (field.state.value || []).map((_, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  Education {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const current =
                                      form.getFieldValue("education") || [];
                                    form.setFieldValue(
                                      "education",
                                      current.filter((_, i) => i !== index)
                                    );
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">School</Label>
                                  <Input
                                    value={
                                      (field.state.value?.[index]).school || ""
                                    }
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("education") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        school: e.target.value,
                                      };
                                      form.setFieldValue("education", updated);
                                    }}
                                    placeholder="School/University name"
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">Degree</Label>
                                  <Input
                                    value={
                                      (field.state.value?.[index]).degree || ""
                                    }
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("education") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        degree: e.target.value,
                                      };
                                      form.setFieldValue("education", updated);
                                    }}
                                    placeholder="Degree/Program"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">Start Date</Label>
                                  <Input
                                    type="month"
                                    value={normalizeMonthString(
                                      (field.state.value?.[index]).startDate
                                    )}
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("education") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        startDate: e.target.value,
                                      };
                                      form.setFieldValue("education", updated);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">End Date</Label>
                                  <Input
                                    type="month"
                                    value={normalizeMonthString(
                                      (field.state.value?.[index]).endDate
                                    )}
                                    onChange={(e) => {
                                      const current =
                                        form.getFieldValue("education") || [];
                                      const updated = [...current];
                                      updated[index] = {
                                        ...updated[index],
                                        endDate: e.target.value,
                                      };
                                      form.setFieldValue("education", updated);
                                    }}
                                    placeholder="Leave empty if current"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="mb-2">CGPA/Percentage</Label>
                                <Input
                                  value={
                                    (field.state.value?.[index])
                                      .cgpaOrPercentage || ""
                                  }
                                  onChange={(e) => {
                                    const current =
                                      form.getFieldValue("education") || [];
                                    const updated = [...current];
                                    updated[index] = {
                                      ...updated[index],
                                      cgpaOrPercentage: e.target.value,
                                    };
                                    form.setFieldValue("education", updated);
                                  }}
                                  placeholder="e.g., 3.8/4.0 or 85%"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="certifications">
                    {(field) => (
                      <ChipsInput
                        value={field.state.value || []}
                        onChange={field.handleChange}
                        placeholder="Add a certification..."
                      />
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="achievements">
                    {(field) => (
                      <ChipsInput
                        value={field.state.value || []}
                        onChange={field.handleChange}
                        placeholder="Add an achievement..."
                      />
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <form.Field name="languages">
                    {(field) => (
                      <ChipsInput
                        value={field.state.value || []}
                        onChange={field.handleChange}
                        placeholder="Add a language..."
                      />
                    )}
                  </form.Field>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="preview" className="w-full ">
            {/* MAIN PREVIEW */}
            {/* Preview Section */}
            <div className="flex justify-end gap-4 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                size="lg"
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
            <div className="mx-auto lg:col-span-1 max-w-4xl">
              {/* <Card className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto"> */}
              <Card className="sticky">
                <CardContent className="p-8" id="resume-preview-content">
                  <form.Subscribe selector={(state) => [state.values]}>
                    {([values]) => (
                      // <div className="space-y-4 text-xs leading-tight font-serif">
                      <div className="space-y-4 text-sm tracking-wider font-serif">
                        {/* Header */}
                        <div className="text-center border-b-2 border-muted-foreground pb-2">
                          <h1 className="text-3xl font-bold mb-1">
                            {values.name || "Your Name"}
                          </h1>
                          <div className="text-sm text-muted-foreground">
                            {[
                              values.address,
                              values.email,
                              values.phone,
                              values.portfolio,
                            ]
                              .filter(Boolean)
                              .join(" | ")}
                          </div>
                          {(values.linkedin || values.github) && (
                            <div className="text-sm text-muted-foreground">
                              {[values.linkedin, values.github]
                                .filter(Boolean)
                                .join(" | ")}
                            </div>
                          )}
                        </div>

                        {/* Summary */}
                        {values.summary && (
                          <div>
                            <h2 className="text-base font-bold mb-1.5">
                              PROFESSIONAL SUMMARY
                            </h2>
                            <p className="text-sm text-justify">
                              {values.summary}
                            </p>
                          </div>
                        )}

                        {/* Education */}
                        {values.education && values.education.length > 0 && (
                          <div>
                            <h2 className="text-base font-bold border-b border-muted-foreground mb-1.5 pb-0.5">
                              EDUCATION
                            </h2>
                            <div className="space-y-2">
                              {values.education.map((edu, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between items-baseline">
                                    <div className="font-bold text-xs">
                                      {edu.school || "University Name"}
                                      {edu.degree && `, ${edu.degree}`}
                                    </div>
                                    {(edu.startDate || edu.endDate) &&
                                      (() => {
                                        const s = formatMonthYear(
                                          edu.startDate
                                        );
                                        const e = formatMonthYear(edu.endDate);
                                        let text: string | null = null;
                                        if (s && e) text = `${s} – ${e}`;
                                        else if (s && !e)
                                          text = `${s} – Present`;
                                        else if (!s && e) text = e;
                                        return text ? (
                                          <div className="text-xs italic">
                                            {text}
                                          </div>
                                        ) : null;
                                      })()}
                                  </div>
                                  {edu.cgpaOrPercentage && (
                                    <div className="text-sm mt-0.5">
                                      •{" "}
                                      {edu.cgpaOrPercentage.includes("%")
                                        ? "Percentage"
                                        : "GPA"}
                                      : {edu.cgpaOrPercentage}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Experience */}
                        {values.experience && values.experience.length > 0 && (
                          <div>
                            <h2 className="text-base font-bold border-b border-muted-foreground mb-1.5 pb-0.5">
                              EXPERIENCE
                            </h2>
                            <div className="space-y-2.5">
                              {values.experience.map((exp, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between items-baseline">
                                    <div className="font-bold">
                                      {exp.position || "Position"}
                                      {exp.company && `, ${exp.company}`}
                                    </div>
                                    {(exp.startDate || exp.endDate) && (
                                      <div className="text-xs italic">
                                        {formatMonthYear(exp.startDate) ||
                                          "Start"}{" "}
                                        –{" "}
                                        {formatMonthYear(exp.endDate) ||
                                          "Present"}
                                      </div>
                                    )}
                                  </div>
                                  {exp.description && (
                                    <ul className="list-none mt-1 space-y-0.5">
                                      {exp.description
                                        .split(/\n+/)
                                        .filter(Boolean)
                                        .map((line, i) => (
                                          <li key={i} className="pl-2">
                                            <span className="inline-block w-2">
                                              •
                                            </span>
                                            <span className="inline">
                                              {line}
                                            </span>
                                          </li>
                                        ))}
                                    </ul>
                                  )}
                                  {exp.achievements &&
                                    exp.achievements.length > 0 && (
                                      <ul className="list-none mt-1 space-y-0.5">
                                        {exp.achievements.map((a, i) => (
                                          <li key={i} className="pl-2">
                                            <span className="inline-block w-2">
                                              •
                                            </span>
                                            <span className="inline">{a}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {values.projects && values.projects.length > 0 && (
                          <div>
                            <h2 className="text-base font-bold border-b border-muted-foreground mb-1.5 pb-0.5">
                              PROJECTS
                            </h2>
                            <div className="space-y-2.5">
                              {values.projects.map((proj, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between items-baseline">
                                    <div className="font-bold">
                                      {proj.title || "Project Title"}
                                    </div>
                                    {proj.link && (
                                      <div className="text-xs text-blue-600 underline truncate max-w-[150px]">
                                        {proj.link.replace(/https?:\/\//, "")}
                                      </div>
                                    )}
                                  </div>
                                  {proj.description && (
                                    <ul className="list-none mt-1 space-y-0.5">
                                      {proj.description
                                        .split(/\n+/)
                                        .filter(Boolean)
                                        .map((line, i) => (
                                          <li key={i} className="pl-2">
                                            <span className="inline-block w-2">
                                              •
                                            </span>
                                            <span className="inline">
                                              {line}
                                            </span>
                                          </li>
                                        ))}
                                    </ul>
                                  )}
                                  {proj.highlights &&
                                    proj.highlights.length > 0 && (
                                      <ul className="list-none mt-1 space-y-0.5">
                                        {proj.highlights.map(
                                          (highlight, hIdx) => (
                                            <li key={hIdx} className="pl-2">
                                              <span className="inline-block w-2">
                                                •
                                              </span>
                                              <span className="inline">
                                                {highlight}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                  {proj.technologiesUsed &&
                                    proj.technologiesUsed.length > 0 && (
                                      <div className="mt-1 pl-2">
                                        <span className="inline-block w-2">
                                          •
                                        </span>
                                        <span className="inline">
                                          <span className="font-semibold">
                                            Tools Used:
                                          </span>{" "}
                                          {proj.technologiesUsed.join(", ")}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technologies/Skills */}
                        {values.skills && values.skills.length > 0 && (
                          <div>
                            <h2 className="text-base font-bold border-b border-muted-foreground mb-1.5 pb-0.5">
                              TECHNOLOGIES
                            </h2>
                            <div className="pl-2">
                              <span className="inline-block w-2">•</span>
                              <span className="inline">
                                <span className="font-semibold">Skills:</span>{" "}
                                {values.skills.join(", ")}
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Certifications */}
                        {values.certifications &&
                          values.certifications.length > 0 && (
                            <div>
                              <h2 className="text-base font-bold border-b border-muted-foreground mb-1.5 pb-0.5">
                                CERTIFICATIONS
                              </h2>
                              <ul className="list-none space-y-0.5">
                                {values.certifications.map((cert, idx) => (
                                  <li key={idx} className="pl-2">
                                    <span className="inline-block w-2">•</span>
                                    <span className="inline">{cert}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {/* Languages */}
                        {values.languages && values.languages.length > 0 && (
                          <div className="pl-2">
                            <span className="inline-block w-2">•</span>
                            <span className="inline">
                              <span className="font-semibold">Languages:</span>{" "}
                              {values.languages.join(", ")}
                            </span>
                          </div>
                        )}

                        {/* Achievements */}
                        {values.achievements &&
                          values.achievements.length > 0 && (
                            <div>
                              <h2 className="text-base font-bold border-b border-black mb-1.5 pb-0.5">
                                ACHIEVEMENTS
                              </h2>
                              <ul className="list-none space-y-0.5">
                                {values.achievements.map((achievement, idx) => (
                                  <li key={idx} className="pl-2">
                                    <span className="inline-block w-2">•</span>
                                    <span className="inline">
                                      {achievement}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </form.Subscribe>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analysis" className="w-full">
            {/* Resume Analysis */}
            <div className="space-y-6">
              {/* New Analysis Form */}
              {!analyses.length && (
                <div className="text-center mt-10 font-semibold text-muted-foreground">
                  No analysis found for this resume
                </div>
              )}
              {/* Existing Analyses */}
              {analyses && analyses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Analysis</h3>
                  {analyses.map((analysis) => (
                    <Card
                      key={analysis.id}
                      className="shadow-sm border border-border/50 hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-foreground">
                            Analysis for {analysis.role}
                          </span>
                          <span className="text-sm font-normal text-muted-foreground">
                            {analysis.createdAt
                              ? new Date(analysis.createdAt).toLocaleDateString(
                                  "en-GB"
                                )
                              : "Unknown"}
                          </span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Overall Score:</span>{" "}
                          <span className="text-blue-600 font-semibold">
                            {analysis.analysis.overallScore}/10
                          </span>
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Score Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {analysis.analysis.ats.score}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              ATS
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {analysis.analysis.jobMatch.score}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              Job Match
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {analysis.analysis.writingAndFormatting.score}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              Writing
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {analysis.analysis.keywordCoverage.score}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              Keywords
                            </div>
                          </div>
                        </div>

                        {/* Detailed Feedback Sections */}
                        <div className="space-y-6">
                          {[
                            {
                              title: "ATS Compatibility",
                              data: analysis.analysis.ats,
                            },
                            {
                              title: "Job Match",
                              data: analysis.analysis.jobMatch,
                            },
                            {
                              title: "Writing & Formatting",
                              data: analysis.analysis.writingAndFormatting,
                            },
                            {
                              title: "Keyword Coverage",
                              data: analysis.analysis.keywordCoverage,
                            },
                            ...(analysis.analysis.other
                              ? [
                                  {
                                    title: "Other Feedback",
                                    data: analysis.analysis.other,
                                  },
                                ]
                              : []),
                          ].map(({ title, data }, index) => (
                            <div key={index}>
                              <h4 className="font-semibold text-base mb-2 text-foreground">
                                {title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {data.summary}
                              </p>
                              <ul className="space-y-1.5">
                                {data.feedback.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm flex items-start gap-2 leading-relaxed"
                                  >
                                    <span
                                      className={`inline-block flex-shrink-0 w-[10px] h-[10px] rounded-full mt-[6px] ${
                                        item.type === "strength"
                                          ? "bg-green-500"
                                          : item.type === "minor-improvement"
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                    ></span>
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
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
