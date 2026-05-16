import AnimatedGenerateButton from '@/components/ui/animated-generate-button-shadcn-tailwind'

export type IdeateState = 'idle' | 'recording' | 'analyzing'

interface Props {
  state: IdeateState
  onClick: () => void
  disabled?: boolean
}

const LABEL: Record<IdeateState, { idle: string; active: string }> = {
  idle: { idle: 'IDEATE', active: 'SPEAK' },
  recording: { idle: 'LISTENING', active: 'LISTENING' },
  analyzing: { idle: 'IDEATING', active: 'IDEATING' },
}

export function IdeateButton({ state, onClick, disabled }: Props) {
  const generating = state !== 'idle'
  const labels = LABEL[state]
  return (
    <button
      type="button"
      className="contents"
      onClick={onClick}
      disabled={disabled}
    >
      <AnimatedGenerateButton
        labelIdle={labels.idle}
        labelActive={labels.active}
        generating={generating}
        highlightHueDeg={320}
        disabled={disabled}
      />
    </button>
  )
}
