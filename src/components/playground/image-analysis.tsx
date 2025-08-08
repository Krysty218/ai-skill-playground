import { useState, useRef } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image as ImageIcon, Loader2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ImageAnalysisProps {
  className?: string
}

interface AnalysisResult {
  description: string
  confidence: number
  details: {
    objects: string[]
    colors: string[]
    mood: string
    composition: string
  }
}

export function ImageAnalysis({ className }: ImageAnalysisProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile)
        setResult(null)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(selectedFile)
        
        toast.success("Image selected successfully")
      } else {
        toast.error("Please select a valid image file")
      }
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select an image first")
      return
    }

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/image-analysis', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setResult(result)
      toast.success("Image analysis completed!")
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Section */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>Image Upload</span>
          </CardTitle>
          <CardDescription>
            Upload an image to generate detailed AI-powered descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="space-y-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
                <div className="space-y-1">
                  <p className="font-medium">{file?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {file && (file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="font-medium">Click to upload image</p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, WebP, and other image formats
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="w-full"
            variant="glow"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Analyze Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              AI-generated description and detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Description */}
            <div className="bg-surface-elevated rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Image Description</h4>
                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.description}
              </p>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-elevated rounded-lg p-4">
                <h5 className="font-medium mb-2 text-primary">Detected Objects</h5>
                <div className="flex flex-wrap gap-2">
                  {result.details.objects.map((object, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
                    >
                      {object}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg p-4">
                <h5 className="font-medium mb-2 text-primary">Color Palette</h5>
                <div className="flex flex-wrap gap-2">
                  {result.details.colors.map((color, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg p-4">
                <h5 className="font-medium mb-2 text-primary">Mood & Atmosphere</h5>
                <p className="text-sm text-muted-foreground">{result.details.mood}</p>
              </div>

              <div className="bg-surface-elevated rounded-lg p-4">
                <h5 className="font-medium mb-2 text-primary">Composition</h5>
                <p className="text-sm text-muted-foreground">{result.details.composition}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}