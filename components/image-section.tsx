import { Card, CardContent } from "@/components/ui/card"

interface ImageSectionProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  reverse?: boolean
}

export function ImageSection({ title, description, imageSrc, imageAlt, reverse = false }: ImageSectionProps) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:grid-flow-col-dense" : ""}`}>
          <div className={`space-y-6 ${reverse ? "lg:col-start-2" : ""}`}>
            <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
          </div>
          <div className={`${reverse ? "lg:col-start-1" : ""}`}>
            <Card className="overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                <img src={imageSrc || "/placeholder.svg"} alt={imageAlt} className="w-full h-96 object-cover" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
