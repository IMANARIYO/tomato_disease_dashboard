"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { feedbackApi } from "@/lib/api/feedback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, Trash2, MessageCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Feedback, CreateFeedbackRequest, FeedbackCategory, FeedbackStatus } from "@/types"
import Link from "next/link"

export default function FeedbackPage() {
  const { user, hasRole } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CreateFeedbackRequest>({
    detectionId: "",
    category: "other" as FeedbackCategory,
    comment: "",
    adviceId: "",
  })

  const canSubmitFeedback = hasRole(["FARMER", "AGRONOMIST", "ADMIN"])
  const canDeleteFeedback = hasRole(["ADMIN"])

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackApi.getAll(1, 50)
      setFeedbacks(response.data)
    } catch (error) {
      toast.error("Failed to fetch feedback")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (formData.adviceId) {
        await feedbackApi.submitOnAdvice(formData)
      } else {
        await feedbackApi.submitOnDetection(formData)
      }
      toast.success("Feedback submitted successfully")
      setIsDialogOpen(false)
      resetForm()
      fetchFeedbacks()
    } catch (error) {
      toast.error("Failed to submit feedback")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      try {
        await feedbackApi.delete(id)
        toast.success("Feedback deleted successfully")
        fetchFeedbacks()
      } catch (error) {
        toast.error("Failed to delete feedback")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      detectionId: "",
      category: "other" as FeedbackCategory,
      comment: "",
      adviceId: "",
    })
  }

  const getStatusBadgeVariant = (status: FeedbackStatus) => {
    switch (status) {
      case "resolved":
        return "default"
      case "addressed":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getCategoryBadgeVariant = (category: FeedbackCategory) => {
    switch (category) {
      case "bug":
        return "destructive"
      case "feature":
        return "default"
      case "accuracy":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleBasedTitle = () => {
    if (hasRole("FARMER")) return "My Feedback"
    if (hasRole("AGRONOMIST")) return "Farmer Feedback"
    return "All Feedback"
  }

  const getRoleBasedDescription = () => {
    if (hasRole("FARMER")) return "Submit and track your feedback on detections and advice"
    if (hasRole("AGRONOMIST")) return "Review feedback from farmers on your advice"
    return "Manage all feedback in the system"
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getRoleBasedTitle()}</h1>
          <p className="text-muted-foreground">{getRoleBasedDescription()}</p>
        </div>
        {canSubmitFeedback && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="detectionId">Detection ID *</Label>
                    <Input
                      id="detectionId"
                      value={formData.detectionId}
                      onChange={(e) => setFormData({ ...formData, detectionId: e.target.value })}
                      placeholder="Enter detection ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adviceId">Advice ID (Optional)</Label>
                    <Input
                      id="adviceId"
                      value={formData.adviceId}
                      onChange={(e) => setFormData({ ...formData, adviceId: e.target.value })}
                      placeholder="Enter advice ID if feedback is about advice"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as FeedbackCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="usability">Usability</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment *</Label>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Describe your feedback in detail"
                    rows={5}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Feedback</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Feedback & Suggestions</span>
          </CardTitle>
          <CardDescription>
            {hasRole("FARMER") ? "Your feedback helps improve the system" : "Community feedback and suggestions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Detection</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(feedback.category)}>{feedback.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{feedback.comment}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {feedback.farmer?.user?.username || feedback.farmer?.user?.email || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{feedback.detection?.disease?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(feedback.status)}>{feedback.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(feedback.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/feedback/${feedback.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canDeleteFeedback && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(feedback.id)}>
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
  )
}
