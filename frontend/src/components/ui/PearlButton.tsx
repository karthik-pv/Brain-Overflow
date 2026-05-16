import type { ReactNode } from 'react'

const CSS = `
.pearl-btn {
  outline: none;
  cursor: pointer;
  border: 0;
  position: relative;
  border-radius: 100px;
  background: #0a0c12;
  transition: all 0.2s ease;
  box-shadow:
    inset 0 0.2rem 0.55rem rgba(255,255,255,0.13),
    inset 0 -0.05rem 0.2rem rgba(0,0,0,0.7),
    inset 0 -0.25rem 0.55rem rgba(255,255,255,0.2),
    0 0.8rem 0.8rem rgba(0,0,0,0.22),
    0 0.4rem 0.4rem -0.35rem rgba(0,0,0,0.8);
}
.pearl-btn-wrap {
  font-size: 12px;
  font-weight: 500;
  color: rgba(228, 230, 235, 0.82);
  padding: 9px 20px;
  border-radius: inherit;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pearl-btn-wrap::before {
  content: "";
  position: absolute;
  left: -15%;
  right: -15%;
  bottom: 25%;
  top: -100%;
  border-radius: 50%;
  background: rgba(220, 224, 230, 0.06);
  transition: all 0.3s ease;
}
.pearl-btn-wrap::after {
  content: "";
  position: absolute;
  left: 6%;
  right: 6%;
  top: 10%;
  bottom: 40%;
  border-radius: 22px 22px 0 0;
  box-shadow: inset 0 6px 5px -6px rgba(228, 230, 235, 0.35);
  background: linear-gradient(180deg, rgba(220,224,230,0.1) 0%, transparent 60%);
  transition: all 0.3s ease;
}
.pearl-btn:hover {
  box-shadow:
    inset 0 0.2rem 0.4rem rgba(228,230,235,0.22),
    inset 0 -0.05rem 0.2rem rgba(0,0,0,0.7),
    inset 0 -0.25rem 0.55rem rgba(228,230,235,0.3),
    0 0.8rem 0.8rem rgba(0,0,0,0.22),
    0 0.4rem 0.4rem -0.35rem rgba(0,0,0,0.8);
}
.pearl-btn:hover .pearl-btn-wrap::before { transform: translateY(-5%); }
.pearl-btn:hover .pearl-btn-wrap::after  { opacity: 0.4; transform: translateY(5%); }
.pearl-btn:active { transform: translateY(2px); }
`

interface Props {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function PearlButton({ children, onClick, className = '' }: Props) {
  return (
    <>
      <style>{CSS}</style>
      <button className={`pearl-btn ${className}`} onClick={onClick} type="button">
        <div className="pearl-btn-wrap">{children}</div>
      </button>
    </>
  )
}
