"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Dashboard = () => {
  const user = {
    name: "Asad Siddiqui",
  };

  const stats = [
    { title: "Jobs Applied", value: 5, subtitle: "3 interviews scheduled" },
    { title: "Shortlisted", value: 2, subtitle: "33% success rate" },
    { title: "Interviews Attended", value: 3, subtitle: "1 result pending" },
    {
      title: "Saved Jobs",
      value: 5,
      subtitle: "Keep an eye on opportunities",
    },
  ];

  const recentApplications = [
    {
      role: "Frontend Developer",
      company: "TechNova",
      status: "Under Review",
      date: "Nov 2, 2025",
    },
    {
      role: "Full Stack Engineer",
      company: "Cloudify",
      status: "Interview Scheduled",
      date: "Oct 29, 2025",
    },
    {
      role: "Software Intern",
      company: "DevPilot",
      status: "Rejected",
      date: "Oct 21, 2025",
    },
  ];

  const suggestedJobs = [
    { role: "AI Engineer", company: "NeuraTech", location: "Remote" },
    { role: "Backend Developer", company: "CodeMatrix", location: "Bangalore" },
    { role: "React Developer", company: "PixelCraft", location: "Mumbai" },
  ];

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-medium tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          Here’s a quick look at your job search progress.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Applications</CardTitle>
          <CardDescription>
            Track the progress of your recent job applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentApplications.map((job, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition"
            >
              <div>
                <p className="font-medium">{job.role}</p>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{job.status}</p>
                <p className="text-xs text-muted-foreground">{job.date}</p>
              </div>
            </div>
          ))}
          <Button asChild variant="outline" className="w-full mt-3">
            <Link href="#">View All Applications</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Suggested Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suggested Jobs for You</CardTitle>
          <CardDescription>Based on your recent applications</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {suggestedJobs.map((job, idx) => (
            <div
              key={idx}
              className="rounded-md border p-4 hover:bg-muted/50 transition"
            >
              <h3 className="font-semibold">{job.role}</h3>
              <p className="text-sm text-muted-foreground">
                {job.company} • {job.location}
              </p>
              <Button size="sm" variant="secondary" className="mt-2 w-full">
                Apply Now
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Career Insights</CardTitle>
          <CardDescription>
            Track your activity trends and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <p>
              Applications this month:{" "}
              <span className="font-semibold text-foreground">12</span>
            </p>
            <p>
              Interview conversion rate:{" "}
              <span className="font-semibold text-foreground">25%</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
