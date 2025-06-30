"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { detectionApi } from "@/lib/api/detection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Camera, Upload, Eye, Trash2, Plus, MessageSquare, AlertTriangle } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Detection, CreateDetectionRequest } from "@/types"
import Link from "next/link"

export default function DetectionsPage() {
  const { hasRole, user } = useAuth()
  const [detections, setDetections] = useState<Detection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const canUpload = hasRole(["FARMER"])
  const canDelete = hasRole(["ADMIN", "AGRONOMIST"])

  useEffect(() => {
    fetchDetections()
  }, [currentPage])

  const fetchDetections = async () => {
    setIsLoading(true)
    try {
      const response = hasRole(["FARMER"])
        ? await detectionApi.getMy(currentPage, 10)
        : await detectionApi.getAll(currentPage, 10)

      setDetections(response.data)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch detections")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && !imageUrl) {
      toast.error("Please select a file or enter an image URL")
      return
    }

    setIsUploading(true)
    try {
      const uploadData: CreateDetectionRequest = {}

      if (selectedFile) {
        uploadData.image = selectedFile
      } else if (imageUrl) {
        uploadData.imageUrl = imageUrl
      }

      await detectionApi.detect(uploadData)
      toast.success("Detection uploaded and analyzed successfully!")
      setIsSheetOpen(false)
      resetForm()
      fetchDetections()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload detection")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedDetection) return

    try {
      await detectionApi.delete(selectedDetection.id)
      toast.success("Detection deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedDetection(null)
      fetchDetections()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete detection")
    }
  }

  const openDeleteDialog = (detection: Detection) => {
    setSelectedDetection(detection)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setImageUrl("")
  }

  const getRoleBasedTitle = () => {
    if (hasRole("FARMER")) return "My Detections"
    if (hasRole("AGRONOMIST")) return "Farmer Detections"
    return "All Detections"
  }

  const getRoleBasedDescription = () => {
    if (hasRole("FARMER")) return "Upload images and view your disease detection history"
    if (hasRole("AGRONOMIST")) return "Review farmer detections and provide expert advice"
    return "Manage all disease detections in the system"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getRoleBasedTitle()}</h1>
          <p className="text-muted-foreground">{getRoleBasedDescription()}</p>
        </div>
        {canUpload && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                New Detection
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Upload New Detection</SheetTitle>
                <SheetDescription>Upload an image for AI-powered disease detection analysis</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleFileUpload} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Image</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={isUploading}
                  />
                  {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
                </div>

                <div className="text-center text-sm text-muted-foreground">or</div>

                <div className="space-y-2">
                  <Label htmlFor="url">Image URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/tomato-image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isUploading || (!selectedFile && !imageUrl)}>
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Detect Disease
                    </>
                  )}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detection History</CardTitle>
          <CardDescription>
            {hasRole("FARMER")
              ? "Your disease detection results and analysis"
              : "Disease detection results from farmers"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detections.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No detections found</h3>
              <p className="text-muted-foreground">
                {canUpload ? "Upload your first image to get started" : "No detections have been uploaded yet"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Disease</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Detected At</TableHead>
                    {!hasRole("FARMER") && <TableHead>Farmer</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detections.map((detection) => (
                    <TableRow key={detection.id}>
                      <TableCell>
                        <img
                          src={detection.image || "/placeholder.svg?height=50&width=50"}
                          alt="Detection"
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{detection.disease?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            detection.confidence > 0.9
                              ? "default"
                              : detection.confidence > 0.7
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {Math.round(detection.confidence * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(detection.detectedAt).toLocaleDateString()}</TableCell>
                      {!hasRole("FARMER") && (
                        <TableCell>
                          <Badge variant="outline">
                            {detection.farmer?.user?.username || detection.farmer?.user?.email || "Unknown"}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={detection.advices?.length > 0 ? "default" : "secondary"}>
                          {detection.advices?.length > 0 ? "Advised" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/detections/${detection.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {hasRole(["AGRONOMIST"]) && (
                            <Button variant="ghost" size="sm" title="Provide Advice" asChild>
                              <Link href={`/dashboard/advices?detectionId=${detection.id}`}>
                                <MessageSquare className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(detection)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Showing {detections.length} detections</p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Confirm Deletion</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this detection? This action cannot be undone and will also remove all
              associated advice and feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Detection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
