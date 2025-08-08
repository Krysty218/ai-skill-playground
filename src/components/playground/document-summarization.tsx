import { useState, useRef } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Link, Loader2, FileX, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DocumentSummarizationProps {
  className?: string
}

interface SummaryResult {
  title: string
  summary: string
  keyPoints: string[]
  wordCount: number
  source: string
  metadata?: {
    pages?: number
    format?: string
    language?: string
  }
}

type InputType = 'file' | 'url'

export function DocumentSummarization({ className }: DocumentSummarizationProps) {
  const [inputType, setInputType] = useState<InputType>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setResult(null)
        toast.success("Document selected successfully")
      } else {
        toast.error("Please select a valid document (PDF, DOC, DOCX, TXT)")
      }
    }
  }

  const handleSummarize = async () => {
    if (inputType === 'file' && !file) {
      toast.error("Please select a document first")
      return
    }
    
    if (inputType === 'url' && !url.trim()) {
      toast.error("Please enter a valid URL")
      return
    }

    setIsSummarizing(true)
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock results for demonstration
      const mockResult: SummaryResult = {
        title: inputType === 'file' ? file?.name.replace(/\.[^/.]+$/, "") || "Document" : "Web Article",
        summary: "This document discusses the fundamentals of artificial intelligence and machine learning technologies. It covers key concepts including neural networks, deep learning algorithms, and practical applications in various industries. The content explores both the opportunities and challenges presented by AI implementation, with particular focus on ethical considerations and future development trends.",
        keyPoints: [
          "Introduction to AI and ML fundamentals",
          "Neural networks and deep learning explained",
          "Real-world applications across industries",
          "Ethical considerations in AI development",
          "Future trends and technological advancement",
          "Implementation challenges and solutions"
        ],
        wordCount: 2847,
        source: inputType === 'file' ? 'Document Upload' : url,
        metadata: {
          pages: inputType === 'file' ? 12 : undefined,
          format: inputType === 'file' ? file?.type : 'web',
          language: 'English'
        }
      }
      
      setResult(mockResult)
      toast.success("Summarization completed successfully!")
    } catch (error) {
      toast.error("Summarization failed. Please try again.")
    } finally {
      setIsSummarizing(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄'
    if (file.type.includes('word')) return '📝'
    if (file.type.includes('text')) return '📃'
    return '📄'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Selection */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Document Input</span>
          </CardTitle>
          <CardDescription>
            Upload documents or provide URLs for AI-powered summarization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputType} onValueChange={(value) => setInputType(value as InputType)}>
            <TabsList className="grid w-full grid-cols-2 bg-surface-elevated">
              <TabsTrigger value="file" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload File</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Web URL</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="text-4xl">{getFileIcon(file)}</div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="font-medium">Click to upload document</p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, DOC, DOCX, and TXT files
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">Website URL</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-surface border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to summarize web content
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleSummarize}
            disabled={(inputType === 'file' && !file) || (inputType === 'url' && !url.trim()) || isSummarizing}
            className="w-full"
            variant="glow"
            size="lg"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Summary Results</CardTitle>
            <CardDescription>
              AI-generated summary and key insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title and Metadata */}
            <div className="bg-surface-elevated rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>📊 {result.wordCount.toLocaleString()} words</span>
                {result.metadata?.pages && <span>📄 {result.metadata.pages} pages</span>}
                <span>🌐 {result.metadata?.language}</span>
                <span>📱 {result.source}</span>
              </div>
            </div>

            {/* Main Summary */}
            <div className="bg-surface-elevated rounded-lg p-4">
              <h4 className="font-medium mb-3 text-primary">Executive Summary</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.summary}
              </p>
            </div>

            {/* Key Points */}
            <div className="bg-surface-elevated rounded-lg p-4">
              <h4 className="font-medium mb-3 text-primary">Key Points</h4>
              <ul className="space-y-2">
                {result.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}