// Generates the PWA PNG icons with no image dependencies.
// Design: dark square, left half emerald (Nutrition), right half red (Gym).
// Run: npm run icons
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const GREEN = [0x34, 0xd3, 0x99]
const RED = [0xef, 0x44, 0x44]
const BG = [0x11, 0x11, 0x11]

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

// pad = fraction of the size kept as background around the colored block
function makeIcon(size, pad) {
  const raw = Buffer.alloc(size * (size * 3 + 1))
  const lo = Math.round(size * pad)
  const hi = size - lo
  const r = Math.round((hi - lo) * 0.18)
  const inRounded = (x, y) => {
    if (x < lo || x >= hi || y < lo || y >= hi) return false
    const cx = x < lo + r ? lo + r : x >= hi - r ? hi - r - 1 : x
    const cy = y < lo + r ? lo + r : y >= hi - r ? hi - r - 1 : y
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
  }
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      const c = inRounded(x, y) ? (x < size / 2 ? GREEN : RED) : BG
      raw.set(c, row + 1 + x * 3)
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

writeFileSync('public/icon-192.png', makeIcon(192, 0.12))
writeFileSync('public/icon-512.png', makeIcon(512, 0.12))
// Maskable: keep the colored block inside the central safe zone.
writeFileSync('public/icon-maskable-512.png', makeIcon(512, 0.22))
console.log('icons written to public/')
