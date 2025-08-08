import { useState } from "react"
import { Header } from "./header"
import { SkillSelector, type SkillType } from "./skill-selector"
import { ConversationAnalysis } from "./conversation-analysis"
import { ImageAnalysis } from "./image-analysis"
import { DocumentSummarization } from "./document-summarization"
import { cn } from "@/lib/utils"

interface PlaygroundContainerProps {
  className?: string
}

export function PlaygroundContainer({ className }: PlaygroundContainerProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillType | undefined>(undefined)

  const renderSkillComponent = () => {
    switch (selectedSkill) {
      case 'conversation':
        return <ConversationAnalysis />
      case 'image':
        return <ImageAnalysis />
      case 'summarization':
        return <DocumentSummarization />
      default:
        return (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold">Choose Your AI Skill</h3>
              <p className="text-sm text-muted-foreground">
                Select a skill from above to start exploring AI capabilities
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Skill Selection */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold gradient-text">Welcome to AI Playground</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore powerful AI capabilities including conversation analysis, image understanding, 
                and document summarization. Choose a skill below to get started.
              </p>
            </div>
            
            <SkillSelector 
              value={selectedSkill} 
              onValueChange={setSelectedSkill}
              className="max-w-md mx-auto"
            />
          </div>

          {/* Skill Interface */}
          <div className="animate-fade-in">
            {renderSkillComponent()}
          </div>
        </div>
      </main>
    </div>
  )
}