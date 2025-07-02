"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import apiClient from "@/lib/api/axios"
import { adviceApi } from "@/lib/api/advice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Pill, MessageSquare, Eye, WormIcon as Virus } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import type { Medicine, Advice, CreateAdviceRequest } from "@/types"

export default function MedicineDetailPage() {
  const params = useParams()
  const { hasRole } = useAuth()
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdviceSheetOpen, setIsAdviceSheetOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adviceFormData, setAdviceFormData] = useState<CreateAdviceRequest>({
    prescription: "",
    medicineId: "",
  })

  const canCreateAdvice = hasRole(["AGRONOMIST"])

  useEffect(() => {
    if (params.id) {
      fetchMedicine(params.id as string)
    }
  }, [params.id])

  const fetchMedicine = async (id: string) => {
    try {
      const response = await apiClient.get(`/medecines/${id}`)
      const data = response.data.data || response.data
      setMedicine(data)
      setAdviceFormData({ ...adviceFormData, medicineId: id })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch medicine details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdvice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicine) return

    setIsSubmitting(true)
    try {
      await adviceApi.createOnMedicine(adviceFormData)
      toast.success("Advice created successfully")
      setIsAdviceSheetOpen(false)
      setAdviceFormData({ prescription: "", medicineId: medicine.id })
      // Refresh medicine data to show new advice
      fetchMedicine(medicine.id)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create advice")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading medicine details...</p>
        </div>
      </div>
    )
  }

  if (!medicine) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Medicine not found</h3>
          <p className="text-muted-foreground">The requested medicine could not be found</p>
          <Button variant="outline" asChild className="mt-4 bg-transparent">
            <Link href="/dashboard/medicines">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Medicines
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/medicines">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medicines
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{medicine.name}</CardTitle>
                  <CardDescription>Medicine details and usage information</CardDescription>
                </div>
              </div>
              {canCreateAdvice && (
                <Sheet open={isAdviceSheetOpen} onOpenChange={setIsAdviceSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Create Advice
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[600px] sm:max-w-[600px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Create Advice for {medicine.name}</span>
                      </SheetTitle>
                      <SheetDescription>Provide expert advice and recommendations for this medicine</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleCreateAdvice} className="space-y-6 mt-6">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Pill className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-600">Medicine Information</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Creating advice for: <strong>{medicine.name}</strong>
                        </p>
                        {medicine.description && (
                          <p className="text-xs text-muted-foreground mt-1">{medicine.description}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prescription">Advice & Prescription *</Label>
                        <Textarea
                          id="prescription"
                          value={adviceFormData.prescription}
                          onChange={(e) => setAdviceFormData({ ...adviceFormData, prescription: e.target.value })}
                          placeholder="Provide detailed advice for using this medicine..."
                          rows={6}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAdviceSheetOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Creating..." : "Create Advice"}
                        </Button>
                      </div>
                    </form>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="diseases">Diseases ({medicine.diseases?.length || 0})</TabsTrigger>
                <TabsTrigger value="advice">Advice</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {medicine.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{medicine.description}</p>
                  </div>
                )}

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Instructions:</span>
                          <span className="font-semibold">{medicine.usageInstructions?.length || 0} steps</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Linked Diseases:</span>
                          <span className="font-semibold">{medicine.diseases?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expert Advice:</span>
                          <span className="font-semibold">{medicine.advices?.length || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span className="text-muted-foreground">
                            {new Date(medicine.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span className="text-muted-foreground">
                            {new Date(medicine.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="space-y-4 mt-6">
                {medicine.usageInstructions && medicine.usageInstructions.length > 0 ? (
                  <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-green-600" />
                      <span>Usage Instructions</span>
                    </h3>
                    <ol className="list-decimal list-inside space-y-3">
                      {medicine.usageInstructions.map((instruction, index) => (
                        <li key={index} className="text-foreground leading-relaxed">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No instructions available</h3>
                    <p className="text-muted-foreground">
                      Usage instructions have not been provided for this medicine.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="diseases" className="space-y-4 mt-6">
                {medicine.diseases && medicine.diseases.length > 0 ? (
                  <div className="grid gap-4">
                    {medicine.diseases.map((disease) => (
                      <Card key={disease.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <Virus className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{disease.name}</CardTitle>
                                {disease.scientificName && (
                                  <CardDescription className="italic">{disease.scientificName}</CardDescription>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  disease.severity?.toLowerCase() === "critical" ||
                                  disease.severity?.toLowerCase() === "high"
                                    ? "destructive"
                                    : disease.severity?.toLowerCase() === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {disease.severity || "Unknown"}
                              </Badge>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/diseases/${disease.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {disease.description && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{disease.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Virus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No diseases linked</h3>
                    <p className="text-muted-foreground">This medicine is not currently linked to any diseases.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advice" className="space-y-4 mt-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Expert Advice</h3>
                  <p className="text-muted-foreground">
                    {canCreateAdvice ? "Create expert advice for this medicine" : "Expert advice will appear here"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
