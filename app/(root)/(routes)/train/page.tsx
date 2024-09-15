"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Database, LucideLoader2, MoveUp, RefreshCcw } from "lucide-react";
import React, { useState } from "react";

const Page = () => {
  const [indexname, setIndexname] = useState("");
  const [namespace, setNamespace] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onStartUpload = async () => {
    const reponse = await axios.post("/api/updatedatabase", {
      indexname,
      namespace,
    });
    console.log(reponse);
  };
  
  return (
    <main className="flex flex-col items-center justify-center h-full p-24">
      <Card>
        <CardHeader>
          <CardTitle>Update Knowledge Base</CardTitle>
          <CardDescription>Train the model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="relative grid col-span-2 gap-2 border rounded-lg p-6">
              <div className="gap-4 relative">
                <Button
                  variant={"ghost"}
                  className="absolute -right-4 -top-4"
                  size={"icon"}
                >
                  <RefreshCcw />
                </Button>
                <Label>Files list:</Label>
                <Textarea
                  className="min-h-24 border p-3 shadow-none focus-visible:ring-0 resize-none disabled:cursor-default text-sm text-muted-foreground"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Index Name</Label>
                  <Input
                    value={indexname}
                    onChange={(e) => setIndexname(e.target.value)}
                    placeholder="index name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Namespace</Label>
                  <Input
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="namespace"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={onStartUpload}
              className="w-full h-full"
              variant={"secondary"}
              disabled={isUploading}
            >
              <span className="flex justify-center">
                <Database size={50} className="stroke-red-700" />
                <MoveUp className="stroke-red-700" />
              </span>
            </Button>
          </div>
          {isUploading && (
            <div className="mt-4">
              <Label>File name:</Label>
              <div className="flex flex-row items-center gap-4">
                <Progress value={80} />
                <LucideLoader2 className="stroke-red-700 animate-spin" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Page;
