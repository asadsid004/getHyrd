"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { XIcon, PlusIcon, Box } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { normalizeString, PreferencesSchema } from "@/router/onboarding/schema";
import { JOB_TYPES, POPULAR_ROLES, WORK_MODES } from "@/lib/constants";
import { Preferences } from "@/router/onboarding/schema";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";

export function PreferencesForm() {
  const [roleInputValue, setRoleInputValue] = useState("");
  const [locationInputValue, setLocationInputValue] = useState("");
  const router = useRouter();

  const savePreferencesMutation = useMutation(
    orpc.onboarding.save.mutationOptions({
      onSuccess: () => {
        toast.success("Preferences saved successfully!");
        router.push("/onboarding/resume");
      },
      onError: (error) => {
        toast.error(`Error saving preferences: ${error.message}`);
        console.log("Error details:", error);
      },
    })
  );
  const form = useForm({
    defaultValues: {
      roles: [] as string[],
      type: ["full-time"] as Preferences["type"],
      mode: ["remote"] as Preferences["mode"],
      location: [] as string[],
    },
    validators: {
      onSubmit: PreferencesSchema,
    },
    onSubmit: ({ value }) => {
      savePreferencesMutation.mutate(value);
    },
  });

  const roleExists = (roleName: string, roles: string[]) => {
    const normalized = normalizeString(roleName);
    return roles.some(
      (role) => role.trim() && normalizeString(role) === normalized
    );
  };

  type RolesArrayField = {
    state: {
      value: Array<string>;
      meta?: { isTouched?: boolean; isValid?: boolean; errors?: unknown };
    };
    handleChange: (v: Array<string>) => void;
  };

  const addRoleFromInput = (field: RolesArrayField) => {
    const trimmed = roleInputValue.trim();
    const currentRoles = field.state.value;

    if (!trimmed) {
      toast.error("Role cannot be empty");
      return;
    }

    if (roleExists(trimmed, currentRoles)) {
      toast.error("This role already exists");
      return;
    }

    if (currentRoles.length >= 10) {
      toast.error("Maximum 10 roles allowed");
      return;
    }

    field.handleChange([...currentRoles, trimmed]);
    setRoleInputValue("");
  };

  const addPopularRole = (roleName: string, field: RolesArrayField) => {
    const currentRoles = field.state.value;

    if (roleExists(roleName, currentRoles)) {
      toast.error("This role already exists");
      return;
    }
    if (currentRoles.length >= 10) {
      toast.error("Maximum 10 roles allowed");
      return;
    }

    field.handleChange([...currentRoles, roleName]);
  };

  const removeRole = (index: number, field: RolesArrayField) => {
    const currentRoles = field.state.value;
    field.handleChange(currentRoles.filter((_, i: number) => i !== index));
  };

  const addLocationFromInput = (field: RolesArrayField) => {
    const trimmed = locationInputValue.trim();
    const current = field.state.value;

    if (!trimmed) {
      toast.error("Location cannot be empty");
      return;
    }

    if (current.includes(trimmed)) {
      toast.error("This location already exists");
      return;
    }

    if (current.length >= 5) {
      toast.error("Maximum 5 locations allowed");
      return;
    }

    field.handleChange([...current, trimmed]);
    setLocationInputValue("");
  };

  const removeLocation = (index: number, field: RolesArrayField) => {
    const current = field.state.value;
    field.handleChange(current.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full sm:max-w-2xl m-4">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-x-2 text-xl font-bold tracking-tight">
          <Box className="w-5 h-5" />
          Set Your Job Preferences
        </CardTitle>
        <CardDescription>
          Please select your preferred job roles, types, and modes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="job-preferences-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="roles">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const currentRoles = field.state.value;

                const availablePopularRoles = POPULAR_ROLES.filter(
                  (role) => !roleExists(role, currentRoles)
                );

                return (
                  <FieldSet className="gap-4">
                    <FieldLegend className="font-semibold">
                      Job Roles
                    </FieldLegend>
                    <FieldDescription>
                      Type a role and press Enter or click Add. You can also
                      select from popular roles below.
                    </FieldDescription>

                    <FieldGroup className="gap-4">
                      <div className="flex gap-2">
                        <InputGroup>
                          <InputGroupInput
                            placeholder="e.g. Software Engineer"
                            value={roleInputValue}
                            onChange={(e) => setRoleInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addRoleFromInput(field);
                              }
                            }}
                          />
                          <InputGroupButton
                            onClick={() => addRoleFromInput(field)}
                            variant="default"
                            className="mr-1"
                            disabled={
                              !roleInputValue.trim() ||
                              currentRoles.length >= 10
                            }
                          >
                            Add
                            <PlusIcon />
                          </InputGroupButton>
                        </InputGroup>
                      </div>

                      {availablePopularRoles.length > 0 &&
                        currentRoles.length < 10 && (
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Popular Roles ({availablePopularRoles.length}{" "}
                              available)
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {availablePopularRoles.map((role) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => addPopularRole(role, field)}
                                >
                                  <PlusIcon className="w-3 h-3 mr-1" />
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Selected Roles ({currentRoles.length}/10)
                        </Label>

                        {currentRoles.length === 0 ? (
                          <div className="text-center border-2 border-dashed rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              No roles added yet. Start typing or select from
                              popular roles.
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted">
                            {currentRoles.map((role, index) => (
                              <Badge key={index} variant="default" className="">
                                {role}
                                <button
                                  type="button"
                                  onClick={() => removeRole(index, field)}
                                  className="ml-2 hover:text-destructive transition-colors"
                                  aria-label={`Remove ${role}`}
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FieldGroup>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldSet>
                );
              }}
            </form.Field>
            <form.Field name="type" mode="array">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <FieldSet>
                    <FieldLegend className="font-semibold">
                      Job Type
                    </FieldLegend>
                    <FieldDescription>
                      Select one or more job types you are interested in.
                    </FieldDescription>
                    <FieldGroup
                      data-slot="checkbox-group"
                      className="grid md:grid-cols-4 grid-cols-2"
                    >
                      {JOB_TYPES.map((type) => (
                        <Field
                          key={type.value}
                          orientation="horizontal"
                          data-invalid={isInvalid}
                        >
                          <Checkbox
                            id={`form-tanstack-checkbox-${type.value}`}
                            name={field.name}
                            aria-invalid={isInvalid}
                            checked={field.state.value.includes(type.value)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                field.pushValue(type.value);
                              } else {
                                const index = field.state.value.indexOf(
                                  type.value
                                );
                                if (index > -1) {
                                  field.removeValue(index);
                                }
                              }
                            }}
                          />
                          <FieldLabel
                            htmlFor={`form-tanstack-checkbox-${type.value}`}
                            className="font-normal"
                          >
                            {type.label}
                          </FieldLabel>
                        </Field>
                      ))}
                    </FieldGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldSet>
                );
              }}
            </form.Field>
            <form.Field name="mode" mode="array">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <FieldSet>
                    <FieldLegend className="font-semibold">
                      Work Mode
                    </FieldLegend>
                    <FieldDescription>
                      Select one or more work modes you are interested in.
                    </FieldDescription>
                    <FieldGroup
                      data-slot="checkbox-group"
                      className="grid md:grid-cols-4 grid-cols-2"
                    >
                      {WORK_MODES.map((mode) => (
                        <Field
                          key={mode.value}
                          orientation="horizontal"
                          data-invalid={isInvalid}
                        >
                          <Checkbox
                            id={`form-tanstack-checkbox-${mode.value}`}
                            name={field.name}
                            aria-invalid={isInvalid}
                            checked={field.state.value.includes(mode.value)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                field.pushValue(mode.value);
                              } else {
                                const index = field.state.value.indexOf(
                                  mode.value
                                );
                                if (index > -1) {
                                  field.removeValue(index);
                                }
                              }

                              // Clear locations if neither on-site nor hybrid is selected
                              const updatedModes = checked
                                ? [...field.state.value, mode.value]
                                : field.state.value.filter(
                                    (m) => m !== mode.value
                                  );

                              const needsLocation =
                                updatedModes.includes("on-site") ||
                                updatedModes.includes("hybrid");

                              if (!needsLocation) {
                                form.setFieldValue("location", []);
                              }
                            }}
                          />
                          <FieldLabel
                            htmlFor={`form-tanstack-checkbox-${mode.value}`}
                            className="font-normal"
                          >
                            {mode.label}
                          </FieldLabel>
                        </Field>
                      ))}
                    </FieldGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldSet>
                );
              }}
            </form.Field>

            <form.Subscribe selector={(state) => [state.values.mode]}>
              {([selectedModes]) => {
                const shouldShow =
                  selectedModes.includes("on-site") ||
                  selectedModes.includes("hybrid");

                if (!shouldShow) return null;

                return (
                  <form.Field name="location">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <FieldSet>
                          <FieldLegend className="font-semibold">
                            Preferred Locations
                          </FieldLegend>
                          <FieldDescription>
                            Add one or more preferred cities or locations.
                          </FieldDescription>

                          <FieldGroup className="gap-3">
                            <div className="flex gap-2">
                              <InputGroup>
                                <InputGroupInput
                                  placeholder="e.g. Mumbai, Maharashtra, India"
                                  value={locationInputValue}
                                  onChange={(e) =>
                                    setLocationInputValue(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addLocationFromInput(field);
                                    }
                                  }}
                                />
                                <InputGroupButton
                                  onClick={() => addLocationFromInput(field)}
                                  variant="default"
                                  className="mr-1"
                                  disabled={!locationInputValue.trim()}
                                >
                                  Add
                                  <PlusIcon />
                                </InputGroupButton>
                              </InputGroup>
                            </div>

                            {field.state.value.length > 0 ? (
                              <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted">
                                {field.state.value.map((loc, index) => (
                                  <Badge key={index} variant="default">
                                    {loc}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeLocation(index, field)
                                      }
                                      className="ml-2 hover:text-destructive transition-colors"
                                    >
                                      <XIcon className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center border-2 border-dashed rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  No locations added yet.
                                </p>
                              </div>
                            )}
                          </FieldGroup>

                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </FieldSet>
                      );
                    }}
                  </form.Field>
                );
              }}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t">
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setRoleInputValue("");
              setLocationInputValue("");
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="job-preferences-form"
            disabled={savePreferencesMutation.isPending}
          >
            {savePreferencesMutation.isPending ? (
              <div className="flex gap-2">
                <Spinner />
                Saving...
              </div>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
