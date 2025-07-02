"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"

import type { Disease } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { dynamicCruds } from "@/lib/hooks/dynamicCruds"

export default function DiseaseDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { fetchData } = dynamicCruds<Disease>()
  const { data, isLoading, error } = fetchData(`/diseases/${id}`, `diseases`)
  const disease = Array.isArray(data) ? data[0] : data

  useEffect(() => {
    if (error) toast.error("Failed to fetch disease details")
  }, [error])

  if (isLoading) return <div>Loading...</div>
  if (!disease) return <div>Disease not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/diseases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Diseases
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{disease.name}</CardTitle>
                <CardDescription>{disease.scientificName}</CardDescription>
              </div>
              <Badge variant={disease.severity === "High" ? "destructive" : "secondary"}>
                {disease.severity || "Unknown"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {disease.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{disease.description}</p>
              </div>
            )}
            <Separator />
            {disease.symptoms && (
              <div>
                <h3 className="font-semibold mb-2">Symptoms</h3>
                <p className="text-muted-foreground">{disease.symptoms}</p>
              </div>
            )}
            <Separator />
            {disease.prevention && (
              <div>
                <h3 className="font-semibold mb-2">Prevention</h3>
                <p className="text-muted-foreground">{disease.prevention}</p>
              </div>
            )}
            <Separator />
            {disease.treatment && (
              <div>
                <h3 className="font-semibold mb-2">Treatment</h3>
                <p className="text-muted-foreground">{disease.treatment}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Detections:</span>
                <span className="font-semibold">{disease.detections?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Associated Medicines:</span>
                <span className="font-semibold">{disease.medicines?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Regions Affected:</span>
                <span className="font-semibold">{disease.diseaseStats?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="text-muted-foreground">
                    {new Date(disease.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-muted-foreground">
                    {new Date(disease.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
