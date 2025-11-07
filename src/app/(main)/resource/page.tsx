"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResourcePage = () => {
  return (
    <div className="mt-25 flex items-center justify-center h-[calc(100vh-25rem)]">
      <div className="max-w-sm">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">Coming Soon</h1>
          <p className="text-sm text-muted-foreground">
            We are currently working on this page. Check back later for valuable
            resources and updates.
          </p>
          <Button variant="outline" className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourcePage;
