"use client";

import { orpc } from "@/lib/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, Building } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

export function ListJobsSection() {
  const { data: jobs } = useSuspenseQuery({
    ...orpc.jobs.get.queryOptions(),
    // Add any additional options if needed
  });

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No jobs available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {job.company}
                </CardDescription>
              </div>
              <Badge variant="secondary">{job.type}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {job.mode}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {job.description?.length > 150
                ? `${job.description.substring(0, 150)}...`
                : job.description}
            </p>

            {job.minSalary && job.maxSalary && (
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="h-4 w-4" />
                <span>
                  {job.salaryCurrency} {job.minSalary.toLocaleString()} -{" "}
                  {job.maxSalary.toLocaleString()}
                </span>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 3).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{job.experienceLevel} level</span>
              <span>
                {job.postedAt
                  ? new Date(job.postedAt).toLocaleDateString("en-GB")
                  : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
