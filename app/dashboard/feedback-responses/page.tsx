"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { feedbackResponseApi } from "@/lib/api/feedback-response";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Eye, Trash2, Reply } from "lucide-react";
import { toast } from "react-hot-toast";
import type { FeedbackResponse, CreateFeedbackResponseRequest } from "@/types";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function FeedbackResponsesPage() {
  const { user, hasRole } = useAuth();
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateFeedbackResponseRequest>({
    feedbackId: "",
    message: "",
  });

  const canCreateResponse = hasRole(["AGRONOMIST", "ADMIN"]);
  const canDeleteResponse = hasRole(["ADMIN"]);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await feedbackResponseApi.getAll(1, 50);
      setResponses(response.data);
    } catch (error) {
      toast.error("Failed to fetch feedback responses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbackResponseApi.create(formData);
      toast.success("Response submitted successfully");
      setIsDialogOpen(false);
      resetForm();
      fetchResponses();
    } catch (error) {
      toast.error("Failed to submit response");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this response?")) {
      try {
        await feedbackResponseApi.delete(id);
        toast.success("Response deleted successfully");
        fetchResponses();
      } catch (error) {
        toast.error("Failed to delete response");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      feedbackId: "",
      message: "",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthGuard requiredRoles={["AGRONOMIST", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Feedback Responses
            </h1>
            <p className="text-muted-foreground">
              {hasRole("AGRONOMIST")
                ? "Respond to farmer feedback and questions"
                : "Manage all feedback responses"}
            </p>
          </div>
          {canCreateResponse && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Response
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Feedback Response</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedbackId">Feedback ID *</Label>
                    <Input
                      id="feedbackId"
                      value={formData.feedbackId}
                      onChange={(e) =>
                        setFormData({ ...formData, feedbackId: e.target.value })
                      }
                      placeholder="Enter feedback ID to respond to"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Response Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Write your response to the feedback"
                      rows={5}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Submit Response</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Reply className="h-5 w-5" />
              <span>Expert Responses</span>
            </CardTitle>
            <CardDescription>
              Professional responses to farmer feedback and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Response</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Original Feedback</TableHead>
                  <TableHead>Feedback Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses?.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="max-w-xs">
                      <div className="truncate font-medium">
                        {response.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {response.author?.username ||
                            response.author?.email ||
                            "Unknown"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {response.author?.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-muted-foreground">
                        {response.feedback?.comment || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {response.feedback?.category && (
                        <Badge variant="outline">
                          {response.feedback.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(response.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/feedback-responses/${response.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canDeleteResponse && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(response.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
