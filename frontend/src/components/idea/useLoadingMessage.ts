import { useEffect, useState } from 'react'

const STANDARD_MESSAGES = [
  'consulting the oracle…',
  'summoning the brain cells…',
  'thinking so hard the GPU is sweating…',
  'untangling your idea like last year\'s christmas lights…',
  'running it through the idea blender…',
  'asking the magic conch shell…',
  'performing a seance with silicon…',
  'the neurons are firing. mostly in the right direction.',
  'crunching numbers like they\'re potato chips…',
  'one moment. the AI is having an existential crisis.',
  'polishing this thought until it shines…',
  'the hamsters are running. give them a sec.',
  'extracting brilliance from the void…',
  'this idea is marinating. chef\'s kiss pending.',
  'loading. please enjoy this awkward silence.',
  'the machines are thinking. this is fine.',
  'buffering… just like the 90s internet.',
  'your idea is in the oven. timer\'s ticking.',
  'contemplating the meaning of your idea. and life.',
  'the AI is nodding thoughtfully at your screen.',
]

const FREE_MODEL_MESSAGES = [
  'free model energy. we\'re on gemini\'s good graces here.',
  'rate limited again. we\'re politely knocking on google\'s door.',
  'gemini said "slow down." we said "please?" — retrying…',
  'free tier problems: waiting in line like it\'s a soup kitchen for tokens.',
  'google\'s rate limiter is giving us the side-eye. retrying…',
  'the free model is thinking. it\'s not paid enough to think faster.',
  'budget AI takes its time. quality over speed, right? …right?',
  'we\'re on the free plan. patience is the price we pay.',
  'gemini is processing your idea… at a leisurely, unpaid pace.',
  'rate limit hit. we\'re in google\'s timeout corner. brb.',
  'free model loading… good things come to those who don\'t pay.',
  'the tokens are free but the waiting isn\'t. hang tight.',
]

export function useLoadingMessage(isFreeModel: boolean) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const pool = isFreeModel ? FREE_MODEL_MESSAGES : STANDARD_MESSAGES
    const pick = () => pool[Math.floor(Math.random() * pool.length)]
    setMessage(pick())
    const id = setInterval(() => setMessage(pick()), 4000)
    return () => clearInterval(id)
  }, [isFreeModel])

  return message
}
