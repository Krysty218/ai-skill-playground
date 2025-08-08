import { useState, useRef } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Play, Square, Loader2, FileAudio } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ConversationAnalysisProps {
  className?: string
}

interface AnalysisResult {
  transcript: string
  diarization: Array<{
    speaker: string
    text: string
    timestamp?: string
  }>
  summary?: string
}

export function ConversationAnalysis({ className }: ConversationAnalysisProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile)
        setResult(null)
        toast.success("Audio file selected successfully")
      } else {
        toast.error("Please select a valid audio file")
      }
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select an audio file first")
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock results for demonstration
      const mockResult: AnalysisResult = {
        transcript: "Welcome to our meeting today. We'll be discussing the quarterly results and future plans for the company. Thank you all for joining us. Let's start with the financial overview for this quarter.",
        diarization: [
          { speaker: "Speaker 1", text: "Welcome to our meeting today. We'll be discussing the quarterly results and future plans for the company.", timestamp: "00:00" },
          { speaker: "Speaker 2", text: "Thank you all for joining us. Let's start with the financial overview for this quarter.", timestamp: "00:15" }
        ],
        summary: "Meeting discussion about quarterly results and future company plans, with financial overview as the starting topic."
      }
      
      setResult(mockResult)
      toast.success("Analysis completed successfully!")
    } catch (error) {
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
            <FileAudio className="h-5 w-5 text-primary" />
            <span>Audio Upload</span>
          </CardTitle>
          <CardDescription>
            Upload an audio file for speech-to-text conversion and speaker analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="space-y-2">
                <FileAudio className="h-12 w-12 text-primary mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="font-medium">Click to upload audio file</p>
                <p className="text-sm text-muted-foreground">
                  Supports MP3, WAV, M4A, and other audio formats
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
                Analyzing Audio...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Analysis
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
              Transcript, speaker diarization, and summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-surface-elevated">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="diarization">Diarization</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transcript" className="mt-4">
                <div className="bg-surface-elevated rounded-lg p-4">
                  <h4 className="font-medium mb-2">Full Transcript</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.transcript}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="diarization" className="mt-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Speaker Breakdown</h4>
                  {result.diarization.map((segment, index) => (
                    <div key={index} className="bg-surface-elevated rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary">{segment.speaker}</span>
                        {segment.timestamp && (
                          <span className="text-xs text-muted-foreground">{segment.timestamp}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{segment.text}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="summary" className="mt-4">
                <div className="bg-surface-elevated rounded-lg p-4">
                  <h4 className="font-medium mb-2">Conversation Summary</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.summary}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}