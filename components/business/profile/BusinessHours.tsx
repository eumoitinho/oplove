"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Edit3, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface BusinessHoursProps {
  businessHours: {
    [key: string]: {
      open: string
      close: string
      isOpen: boolean
    }
  }
  isOwner?: boolean
  onUpdate?: (hours: any) => void
}

const dayNames = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

export function BusinessHours({ businessHours, isOwner = false, onUpdate }: BusinessHoursProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedHours, setEditedHours] = useState(businessHours)
  const [loading, setLoading] = useState(false)

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getCurrentStatus = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const todayHours = businessHours[today]

    if (!todayHours || !todayHours.isOpen) {
      return { status: "Closed", color: "bg-red-500" }
    }

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    if (currentTime >= todayHours.open && currentTime <= todayHours.close) {
      return { status: "Open Now", color: "bg-green-500" }
    }

    return { status: "Closed", color: "bg-red-500" }
  }

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setEditedHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen,
      },
    }))
  }

  const handleTimeChange = (day: string, field: "open" | "close", value: string) => {
    setEditedHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onUpdate?.(editedHours)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update hours:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedHours(businessHours)
    setIsEditing(false)
  }

  const currentStatus = getCurrentStatus()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Business Hours
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${currentStatus.color} text-white`}>{currentStatus.status}</Badge>
            {isOwner && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={loading}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(isEditing ? editedHours : businessHours).map(([day, hours]) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {isEditing && (
                  <Switch checked={hours.isOpen} onCheckedChange={(checked) => handleDayToggle(day, checked)} />
                )}
                <span className="font-medium capitalize min-w-[80px]">{dayNames[day as keyof typeof dayNames]}</span>
              </div>

              <div className="flex items-center gap-2">
                {hours.isOpen ? (
                  isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor={`${day}-open`} className="text-sm">
                          Open:
                        </Label>
                        <Input
                          id={`${day}-open`}
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleTimeChange(day, "open", e.target.value)}
                          className="w-24"
                        />
                      </div>
                      <span className="text-gray-500">-</span>
                      <div className="flex items-center gap-1">
                        <Label htmlFor={`${day}-close`} className="text-sm">
                          Close:
                        </Label>
                        <Input
                          id={`${day}-close`}
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleTimeChange(day, "close", e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-600">
                      {formatTime(hours.open)} - {formatTime(hours.close)}
                    </span>
                  )
                ) : (
                  <span className="text-red-500 font-medium">Closed</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        {isEditing && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const allOpen = Object.keys(editedHours).reduce(
                  (acc, day) => ({
                    ...acc,
                    [day]: { ...editedHours[day], isOpen: true },
                  }),
                  {},
                )
                setEditedHours(allOpen)
              }}
            >
              Open All Days
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const weekdaysOpen = Object.keys(editedHours).reduce(
                  (acc, day) => ({
                    ...acc,
                    [day]: {
                      ...editedHours[day],
                      isOpen: !["saturday", "sunday"].includes(day),
                    },
                  }),
                  {},
                )
                setEditedHours(weekdaysOpen)
              }}
            >
              Weekdays Only
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const standardHours = Object.keys(editedHours).reduce(
                  (acc, day) => ({
                    ...acc,
                    [day]: {
                      ...editedHours[day],
                      open: "09:00",
                      close: "17:00",
                    },
                  }),
                  {},
                )
                setEditedHours(standardHours)
              }}
            >
              Set 9-5 Hours
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
