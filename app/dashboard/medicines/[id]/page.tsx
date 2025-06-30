"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { medicineApi } from "@/lib/api/medicine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "react-hot-toast"
import type { Medicine } from "@/types"

export default function MedicineDetailPage() {
  const params = useParams()
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchMedicine(params.id as string)
    }
  }, [params.id])

  const fetchMedicine = async (id: string) => {
    try {
      const data = await medicineApi.getById(id)
      setMedicine(data)
    } catch (error) {
      toast.error("Failed to fetch medicine details")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!medicine) {
    return <div>Medicine not found</div>
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
            <CardTitle className="text-2xl">{medicine.name}</CardTitle>
            <CardDescription>Medicine details and usage information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {medicine.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{medicine.description}</p>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Usage Instructions</h3>
              <ol className="list-decimal list-inside space-y-1">
                {medicine.usageInstructions.map((instruction, index) => (
                  <li key={index} className="text-muted-foreground">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Associated Diseases:</span>
                  <span className="font-semibold">{medicine.diseases?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Advices:</span>
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
                  <span className="text-muted-foreground">{new Date(medicine.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-muted-foreground">{new Date(medicine.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
