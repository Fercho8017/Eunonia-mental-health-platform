import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ImageSectionProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  reverse?: boolean
  children?: React.ReactNode
}

export function ImageSection({ title, description, imageSrc, imageAlt, reverse = false, children }: ImageSectionProps) {
  return (
    <div className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 lg:gap-12`}>
      <div className="flex-1 space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
        {children}
      </div>
      <div className="flex-1">
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-0">
            <img src={imageSrc || "/placeholder.svg"} alt={imageAlt} className="w-full h-64 lg:h-80 object-cover" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
