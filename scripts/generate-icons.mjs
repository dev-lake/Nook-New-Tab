import { writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

const sizes = [16, 32, 48, 128];

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let result = value;
  for (let bit = 0; bit < 8; bit += 1) {
    result = (result & 1) ? 0xedb88320 ^ (result >>> 1) : result >>> 1;
  }
  return result >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function createIcon(size) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  const radius = size * 0.23;
  const white = [255, 255, 255, 255];
  const indigo = [91, 108, 255, 255];

  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x += 1) {
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;
      const cornerX = x < radius ? radius : x > size - radius ? size - radius : x;
      const cornerY = y < radius ? radius : y > size - radius ? size - radius : y;
      const inside = Math.hypot(x - cornerX, y - cornerY) <= radius;
      const isN = (
        ((nx > 0.27 && nx < 0.37) || (nx > 0.63 && nx < 0.73)) && ny > 0.27 && ny < 0.73
      ) || distanceToSegment(nx, ny, 0.34, 0.3, 0.66, 0.7) < 0.055;
      const color = inside ? (isN ? white : indigo) : [0, 0, 0, 0];
      const offset = y * stride + 1 + x * 4;
      raw.set(color, offset);
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

await Promise.all(sizes.map((size) => writeFile(`public/icon-${size}.png`, createIcon(size))));
