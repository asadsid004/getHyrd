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
import { ChipsInput } from "@/components/ui/chips-input";
import { Save, Loader2, Plus, Trash2, FlameKindling } from "lucide-react";
import { toast } from "sonner";

type ProfileData = {
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

export function ProfileContentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: initialData } = useSuspenseQuery(
    orpc.profile.get.queryOptions()
  );

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

  const transformedInitialData: ProfileData = initialData
    ? {
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
    orpc.profile.update.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated successfully!");
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

      await updateMutation.mutateAsync(transformedValue);
    },
  });

  return (
    <div className="flex flex-col gap-6 mb-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="flex justify-between gap-x-4">
            <div className="p-2 rounded-md border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <strong>
                  <FlameKindling />
                </strong>
                Keep your profile up to date to get better matches and results.
              </p>
            </div>

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
                                  (field.state.value?.[index]).position || ""
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
                                (field.state.value?.[index]).description || ""
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
                  const currentProjects = form.getFieldValue("projects") || [];
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
                        No projects added yet. Click &quot;Add Project&quot; to
                        get started.
                      </p>
                    ) : (
                      (field.state.value || []).map((_, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Project {index + 1}</h4>
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
                              value={(field.state.value?.[index]).title || ""}
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
                                (field.state.value?.[index]).description || ""
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
                            <Label className="mb-2">Technologies Used</Label>
                            <ChipsInput
                              value={
                                (field.state.value?.[index]).technologiesUsed ||
                                []
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
                                (field.state.value?.[index]).highlights || []
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
                              value={(field.state.value?.[index]).link || ""}
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
                        No education added yet. Click &quot;Add Education&quot;
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
                                (field.state.value?.[index]).cgpaOrPercentage ||
                                ""
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
      </form>
    </div>
  );
}
