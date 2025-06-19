"use client"

import { useState, useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Smartphone, Wifi, Mail, Phone, MessageSquare, MapPin, CreditCard, Globe } from "lucide-react"

interface QRData {
  text: string
  url: string
  email: {
    to: string
    subject: string
    body: string
  }
  phone: string
  sms: {
    number: string
    message: string
  }
  wifi: {
    ssid: string
    password: string
    security: string
    hidden: boolean
  }
  location: {
    latitude: string
    longitude: string
  }
  vcard: {
    firstName: string
    lastName: string
    organization: string
    phone: string
    email: string
    url: string
  }
}

export default function QRGenerator() {
  const [activeTab, setActiveTab] = useState("text")
  const [qrData, setQRData] = useState<QRData>({
    text: "",
    url: "",
    email: { to: "", subject: "", body: "" },
    phone: "",
    sms: { number: "", message: "" },
    wifi: { ssid: "", password: "", security: "WPA", hidden: false },
    location: { latitude: "", longitude: "" },
    vcard: {
      firstName: "",
      lastName: "",
      organization: "",
      phone: "",
      email: "",
      url: "",
    },
  })
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M")
  const [size, setSize] = useState(256)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQRString = () => {
    switch (activeTab) {
      case "text":
        return qrData.text
      case "url":
        return qrData.url.startsWith("http") ? qrData.url : `https://${qrData.url}`
      case "email":
        return `mailto:${qrData.email.to}?subject=${encodeURIComponent(qrData.email.subject)}&body=${encodeURIComponent(qrData.email.body)}`
      case "phone":
        return qrData.phone.trim() ? `tel:${qrData.phone}` : ""
      case "sms":
        return `sms:${qrData.sms.number}?body=${encodeURIComponent(qrData.sms.message)}`
      case "wifi":
        return `WIFI:T:${qrData.wifi.security};S:${qrData.wifi.ssid};P:${qrData.wifi.password};H:${qrData.wifi.hidden ? "true" : "false"};;`
      case "location":
        return `geo:${qrData.location.latitude},${qrData.location.longitude}`
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
FN:${qrData.vcard.firstName} ${qrData.vcard.lastName}
ORG:${qrData.vcard.organization}
TEL:${qrData.vcard.phone}
EMAIL:${qrData.vcard.email}
URL:${qrData.vcard.url}
END:VCARD`
      default:
        return ""
    }
  }

  const hasValidContent = () => {
    switch (activeTab) {
      case "text":
        return qrData.text.trim().length > 0
      case "url":
        return qrData.url.trim().length > 0
      case "email":
        return qrData.email.to.trim().length > 0
      case "phone":
        return qrData.phone.trim().length > 0
      case "sms":
        return qrData.sms.number.trim().length > 0
      case "wifi":
        return qrData.wifi.ssid.trim().length > 0
      case "location":
        return qrData.location.latitude.trim().length > 0 && qrData.location.longitude.trim().length > 0
      case "vcard":
        return qrData.vcard.firstName.trim().length > 0 || qrData.vcard.lastName.trim().length > 0
      default:
        return false
    }
  }

  const generateQRCode = async () => {
    const qrString = generateQRString()
    if (!qrString.trim()) return

    try {
      const canvas = canvasRef.current
      if (canvas) {
        await QRCode.toCanvas(canvas, qrString, {
          errorCorrectionLevel: errorLevel,
          width: size,
          margin: 2,
          color: {
            dark: "#0f172a", // slate-900
            light: "#ffffff",
          },
        })

        const dataUrl = canvas.toDataURL()
        setQrCodeUrl(dataUrl)
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.download = `qr-code-${activeTab}.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  useEffect(() => {
    generateQRCode()
  }, [qrData, activeTab, errorLevel, size])

  const updateQRData = (field: string, value: any) => {
    setQRData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateNestedQRData = (parent: string, field: string, value: any) => {
    setQRData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof QRData],
        [field]: value,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            QR Code Generator
          </h1>
          <p className="text-slate-300 text-lg">Create stunning QR codes for different types of content</p>
        </div>

        <div className={`grid gap-8 ${hasValidContent() ? "lg:grid-cols-2" : "lg:grid-cols-1 max-w-2xl mx-auto"}`}>
          {/* Input Section */}
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center gap-2 text-white">
                <Smartphone className="h-5 w-5 text-cyan-400" />
                QR Code Content
              </CardTitle>
              <CardDescription className="text-slate-300">
                Choose the type of content and fill in the details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-8 mb-6 bg-slate-900/50 border border-slate-600/50 p-1">
                  <TabsTrigger
                    value="text"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <Globe className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <Mail className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="phone"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <Phone className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="sms"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="wifi"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <Wifi className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="location"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <MapPin className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="vcard"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <CreditCard className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="text">
                      Text Content
                    </Label>
                    <Textarea
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="text"
                      placeholder="Enter your text here..."
                      value={qrData.text}
                      onChange={(e) => updateQRData("text", e.target.value)}
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="url">
                      Website URL
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="url"
                      placeholder="example.com or https://example.com"
                      value={qrData.url}
                      onChange={(e) => updateQRData("url", e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="email-to">
                      Email Address
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="email-to"
                      type="email"
                      placeholder="recipient@example.com"
                      value={qrData.email.to}
                      onChange={(e) => updateNestedQRData("email", "to", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="email-subject">
                      Subject
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="email-subject"
                      placeholder="Email subject"
                      value={qrData.email.subject}
                      onChange={(e) => updateNestedQRData("email", "subject", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="email-body">
                      Message
                    </Label>
                    <Textarea
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="email-body"
                      placeholder="Email message"
                      value={qrData.email.body}
                      onChange={(e) => updateNestedQRData("email", "body", e.target.value)}
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="phone">
                      Phone Number
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="phone"
                      placeholder="+1234567890"
                      value={qrData.phone}
                      onChange={(e) => updateQRData("phone", e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="sms-number">
                      Phone Number
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="sms-number"
                      placeholder="+1234567890"
                      value={qrData.sms.number}
                      onChange={(e) => updateNestedQRData("sms", "number", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="sms-message">
                      Message
                    </Label>
                    <Textarea
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="sms-message"
                      placeholder="SMS message"
                      value={qrData.sms.message}
                      onChange={(e) => updateNestedQRData("sms", "message", e.target.value)}
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="wifi" className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="wifi-ssid">
                      Network Name (SSID)
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="wifi-ssid"
                      placeholder="MyWiFiNetwork"
                      value={qrData.wifi.ssid}
                      onChange={(e) => updateNestedQRData("wifi", "ssid", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="wifi-password">
                      Password
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="wifi-password"
                      type="password"
                      placeholder="WiFi password"
                      value={qrData.wifi.password}
                      onChange={(e) => updateNestedQRData("wifi", "password", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="wifi-security">
                      Security Type
                    </Label>
                    <Select
                      value={qrData.wifi.security}
                      onValueChange={(value) => updateNestedQRData("wifi", "security", value)}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600/50 text-white focus:border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">No Password</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="latitude">
                      Latitude
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="latitude"
                      placeholder="40.7128"
                      value={qrData.location.latitude}
                      onChange={(e) => updateNestedQRData("location", "latitude", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="longitude">
                      Longitude
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="longitude"
                      placeholder="-74.0060"
                      value={qrData.location.longitude}
                      onChange={(e) => updateNestedQRData("location", "longitude", e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="vcard" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-200 font-medium" htmlFor="vcard-firstname">
                        First Name
                      </Label>
                      <Input
                        className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                        id="vcard-firstname"
                        placeholder="John"
                        value={qrData.vcard.firstName}
                        onChange={(e) => updateNestedQRData("vcard", "firstName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200 font-medium" htmlFor="vcard-lastname">
                        Last Name
                      </Label>
                      <Input
                        className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                        id="vcard-lastname"
                        placeholder="Doe"
                        value={qrData.vcard.lastName}
                        onChange={(e) => updateNestedQRData("vcard", "lastName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="vcard-org">
                      Organization
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="vcard-org"
                      placeholder="Company Name"
                      value={qrData.vcard.organization}
                      onChange={(e) => updateNestedQRData("vcard", "organization", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="vcard-phone">
                      Phone
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="vcard-phone"
                      placeholder="+1234567890"
                      value={qrData.vcard.phone}
                      onChange={(e) => updateNestedQRData("vcard", "phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="vcard-email">
                      Email
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="vcard-email"
                      type="email"
                      placeholder="john@example.com"
                      value={qrData.vcard.email}
                      onChange={(e) => updateNestedQRData("vcard", "email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="vcard-url">
                      Website
                    </Label>
                    <Input
                      className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      id="vcard-url"
                      placeholder="https://example.com"
                      value={qrData.vcard.url}
                      onChange={(e) => updateNestedQRData("vcard", "url", e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* QR Code Settings */}
              <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                <h3 className="font-semibold text-white">QR Code Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="error-level">
                      Error Correction
                    </Label>
                    <Select value={errorLevel} onValueChange={(value: "L" | "M" | "Q" | "H") => setErrorLevel(value)}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600/50 text-white focus:border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-200 font-medium" htmlFor="size">
                      Size (pixels)
                    </Label>
                    <Select value={size.toString()} onValueChange={(value) => setSize(Number.parseInt(value))}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600/50 text-white focus:border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128x128</SelectItem>
                        <SelectItem value="256">256x256</SelectItem>
                        <SelectItem value="512">512x512</SelectItem>
                        <SelectItem value="1024">1024x1024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Display Section - Only show when there's content */}
          {hasValidContent() && (
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white">Generated QR Code</CardTitle>
                <CardDescription className="text-slate-300">
                  Scan with your device or download the image
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-br from-white to-slate-100 p-6 rounded-xl shadow-inner border-2 border-slate-600/20">
                  <canvas ref={canvasRef} className="max-w-full h-auto" style={{ imageRendering: "pixelated" }} />
                </div>

                {qrCodeUrl && (
                  <Button
                    onClick={downloadQRCode}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                )}

                <div className="w-full">
                  <Label className="text-slate-200 font-medium">Preview Data:</Label>
                  <div className="mt-2 p-3 bg-slate-900/70 border border-slate-600/50 rounded-md text-sm font-mono break-all max-h-32 overflow-y-auto text-cyan-300">
                    {generateQRString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
