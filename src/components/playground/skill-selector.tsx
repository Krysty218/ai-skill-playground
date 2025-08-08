import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type SkillType = 'conversation' | 'image' | 'summarization'

interface SkillSelectorProps {
  value: SkillType | undefined
  onValueChange: (value: SkillType) => void
  className?: string
}

const skills = [
  {
    value: 'conversation' as const,
    label: 'Conversation Analysis',
    description: 'Speech-to-text, diarization & summarization',
    icon: '🎙️'
  },
  {
    value: 'image' as const,
    label: 'Image Analysis',
    description: 'Upload images and generate descriptions',
    icon: '🖼️'
  },
  {
    value: 'summarization' as const,
    label: 'Document Summarization',
    description: 'Summarize PDFs, URLs, and documents',
    icon: '📄'
  }
]

export function SkillSelector({ value, onValueChange, className }: SkillSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold gradient-text">Choose Your AI Skill</h3>
        <p className="text-sm text-muted-foreground">
          Select an AI capability to get started
        </p>
      </div>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-14 bg-surface border-border hover:bg-surface-hover transition-colors">
          <SelectValue placeholder="Select a skill to begin..." />
        </SelectTrigger>
        <SelectContent className="bg-surface border-border">
          {skills.map((skill) => (
            <SelectItem 
              key={skill.value} 
              value={skill.value}
              className="hover:bg-surface-hover focus:bg-surface-hover cursor-pointer py-3"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{skill.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground">{skill.label}</div>
                  <div className="text-xs text-muted-foreground">{skill.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}