"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { adviceApi } from "@/lib/api/advice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, User, Calendar, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "react-hot-toast"
import type { Advice } from "@/types"

export default function AdviceDetailPage() {
  const params = useParams()
  const { hasRole } = useAuth()
  const [advice, setAdvice] = useState<Advice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAdvice(params.id as string)
    }
  }, [params.id])

  const fetchAdvice = async (id: string) => {
    try {
      const data = await adviceApi.getById(id)
      setAdvice(data)
    } catch (error) {
      toast.error("Failed to fetch advice details")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!advice) {
    return <div>Advice not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/advices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Advice
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle className="text-2xl">Expert Advice</CardTitle>
            </div>
            <CardDescription>Professional recommendation and treatment guidance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Prescription & Advice</span>
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">{advice.prescription}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Agronomist</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{advice.agronomist?.name || "Unknown"}</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created</span>
                </h3>
                <p className="text-muted-foreground">{new Date(advice.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {advice.medicine && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 flex items-center space-x-2">
                    <Pill className="h-4 w-4" />
                    <span>Recommended Medicine</span>
                  </h3>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default">{advice.medicine.name}</Badge>
                    </div>
                    {advice.medicine.description && (
                      <p className="text-sm text-muted-foreground mb-2">{advice.medicine.description}</p>
                    )}
                    {advice.medicine.usageInstructions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Usage Instructions:</h4>
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          {advice.medicine.usageInstructions.map((instruction, index) => (
                            <li key={index} className="text-muted-foreground">
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {advice.detection && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Related Detection</h3>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{advice.detection.disease?.name || "Unknown Disease"}</Badge>
                      <Badge variant="secondary">{Math.round(advice.detection.confidence * 100)}% confidence</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detected on {new Date(advice.detection.detectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Feedback:</span>
                  <span className="font-semibold">{advice.feedbacks?.length || 0}</span>
                </div>
                {hasRole(["FARMER"]) && (
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Submit Feedback
                  </Button>
                )}
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
                  <span>Last Updated:</span>
                  <span className="text-muted-foreground">{new Date(advice.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-muted-foreground">{advice.detection ? "Detection-specific" : "General"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
