import confetti from 'canvas-confetti'

export function triggerConfetti() {
  // Create a confetti burst from the center
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
  
  // Add some delayed confetti for a more dynamic effect
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    })
  }, 150)
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    })
  }, 300)
}
