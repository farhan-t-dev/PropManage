import { useMemo } from "react";

/**
 * Procedural floor plan renderer.
 *
 * Every unit gets a deterministic, generated plan drawing instead of a stock
 * photograph. The layout is seeded from the unit's own data, so unit 3 of
 * "Metropolis Heights" always draws the same plan on every page load — and two
 * units never share one.
 */

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashSeed(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Builds a plan as a list of axis-aligned rooms inside a fixed shell.
 * Rooms are carved with alternating splits so the result always tiles the
 * shell exactly — no overlapping walls, no gaps.
 */
function buildPlan(seed, roomTarget) {
  const rand = seededRandom(seed);
  const W = 320;
  const H = 200;
  const pad = 14;
  const shell = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };

  const rooms = [shell];
  let splits = 0;
  const maxSplits = Math.max(2, Math.min(roomTarget, 5)) - 1;

  while (splits < maxSplits && rooms.length < 6) {
    // Pick the largest room to subdivide — keeps proportions sane.
    let idx = 0;
    for (let i = 1; i < rooms.length; i++) {
      if (rooms[i].w * rooms[i].h > rooms[idx].w * rooms[idx].h) idx = i;
    }
    const r = rooms[idx];
    const horizontal = r.w / r.h < 1 ? true : r.h / r.w < 1 ? false : rand() > 0.5;
    const min = 52;
    const cut = horizontal
      ? r.y + min + rand() * Math.max(1, r.h - min * 2)
      : r.x + min + rand() * Math.max(1, r.w - min * 2);

    if (horizontal) {
      if (r.h < min * 2) break;
      rooms.splice(
        idx,
        1,
        { ...r, h: cut - r.y },
        { ...r, y: cut, h: r.y + r.h - cut },
      );
    } else {
      if (r.w < min * 2) break;
      rooms.splice(
        idx,
        1,
        { ...r, w: cut - r.x },
        { ...r, x: cut, w: r.x + r.w - cut },
      );
    }
    splits++;
  }

  return { W, H, shell, rooms, rand };
}

export default function FloorPlan({ unit, className = "", compact = false }) {
  const drawing = useMemo(() => {
    const seed = hashSeed(
      `${unit?.id ?? 0}-${unit?.unit_number ?? "x"}-${unit?.title ?? ""}`,
    );
    const features = unit?.features || {};
    const beds = Number(features.bedrooms) || 1;
    const plan = buildPlan(seed, beds + 2);
    const { W, H, shell, rooms, rand } = plan;

    // Walls: draw every shared edge once, leave a doorway gap in interior walls.
    const walls = rooms.map((room, i) => {
      const isBedroom = i > 0 && i <= beds;
      return { ...room, isBedroom, index: i };
    });

    // Doorways — one per interior room, on a random edge.
    const doors = walls.slice(1).map((room) => {
      const side = rand() > 0.5;
      if (side) {
        const y = room.y + room.h * (0.3 + rand() * 0.4);
        return { x1: room.x, y1: y, x2: room.x, y2: y + 22, vertical: true };
      }
      const x = room.x + room.w * (0.3 + rand() * 0.4);
      return { x1: x, y1: room.y, x2: x + 22, y2: room.y, vertical: false };
    });

    // Furniture glyphs, drawn inside bedrooms and the largest room.
    const largest = walls.reduce((a, b) =>
      a.w * a.h > b.w * a.h ? a : b,
    );
    const furniture = [];
    walls.forEach((room) => {
      const cx = room.x + room.w / 2;
      const cy = room.y + room.h / 2;
      if (room.isBedroom && room.w > 46 && room.h > 46) {
        const bw = Math.min(30, room.w * 0.45);
        const bh = Math.min(42, room.h * 0.6);
        furniture.push({
          type: "bed",
          x: room.x + room.w - bw - 10,
          y: cy - bh / 2,
          w: bw,
          h: bh,
        });
      }
      if (room === largest && room.w > 70 && room.h > 56) {
        furniture.push({
          type: "table",
          x: cx - 22,
          y: cy - 14,
          w: 44,
          h: 28,
        });
      }
    });

    return { W, H, shell, walls, doors, furniture };
  }, [unit?.id, unit?.unit_number, unit?.title, unit?.features]);

  const { W, H, shell, walls, doors, furniture } = drawing;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`Generated floor plan for ${unit?.title || "unit"}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width={W} height={H} fill="var(--color-crete-50)" />
      {/* Blueprint grid */}
      <g stroke="var(--color-crete-200)" strokeWidth="1">
        {Array.from({ length: Math.floor(W / 20) }, (_, i) => (
          <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2={H} />
        ))}
        {Array.from({ length: Math.floor(H / 20) }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 20} x2={W} y2={i * 20} />
        ))}
      </g>

      {/* Rooms */}
      {walls.map((room) => (
        <rect
          key={room.index}
          x={room.x}
          y={room.y}
          width={room.w}
          height={room.h}
          fill={room.isBedroom ? "var(--color-brass-50)" : "transparent"}
          stroke="none"
        />
      ))}

      {/* Shell */}
      <rect
        x={shell.x}
        y={shell.y}
        width={shell.w}
        height={shell.h}
        fill="none"
        stroke="var(--color-ink-800)"
        strokeWidth="2.5"
      />

      {/* Interior walls */}
      {walls.slice(1).map((room) => (
        <rect
          key={`w${room.index}`}
          x={room.x}
          y={room.y}
          width={room.w}
          height={room.h}
          fill="none"
          stroke="var(--color-ink-700)"
          strokeWidth="1.5"
        />
      ))}

      {/* Doorway gaps — knock out a segment of each interior wall */}
      {doors.map((door, i) => (
        <line
          key={`d${i}`}
          x1={door.x1}
          y1={door.y1}
          x2={door.x2}
          y2={door.y2}
          stroke="var(--color-crete-50)"
          strokeWidth={door.vertical ? 3.5 : 3.5}
        />
      ))}
      {doors.map((door, i) => (
        <path
          key={`da${i}`}
          d={
            door.vertical
              ? `M ${door.x1} ${door.y1} a 22 22 0 0 0 22 22`
              : `M ${door.x1} ${door.y1} a 22 22 0 0 1 22 22`
          }
          fill="none"
          stroke="var(--color-brass-500)"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.75"
        />
      ))}

      {/* Furniture */}
      {furniture.map((f, i) => {
        if (f.type === "bed") {
          return (
            <g key={`f${i}`}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                fill="none"
                stroke="var(--color-ink-400)"
                strokeWidth="1.2"
                rx="1.5"
              />
              <rect
                x={f.x + 3}
                y={f.y + 3}
                width={f.w - 6}
                height={9}
                fill="var(--color-crete-200)"
                stroke="var(--color-ink-300)"
                strokeWidth="0.8"
                rx="1"
              />
            </g>
          );
        }
        return (
          <rect
            key={`f${i}`}
            x={f.x}
            y={f.y}
            width={f.w}
            height={f.h}
            fill="none"
            stroke="var(--color-ink-400)"
            strokeWidth="1.2"
            rx="2"
          />
        );
      })}

      {/* North arrow — the plan-set tell */}
      <g transform={`translate(${shell.x + shell.w - 16} ${shell.y + 16})`}>
        <circle r="9" fill="var(--color-crete-50)" stroke="var(--color-ink-300)" strokeWidth="0.8" />
        <path d="M 0 -5.5 L 3 3 L 0 1 L -3 3 Z" fill="var(--color-ink-700)" />
      </g>

      {!compact && (
        <g>
          <line
            x1={shell.x}
            y1={H - 6}
            x2={shell.x + 60}
            y2={H - 6}
            stroke="var(--color-ink-400)"
            strokeWidth="1"
          />
          <line x1={shell.x} y1={H - 9} x2={shell.x} y2={H - 3} stroke="var(--color-ink-400)" strokeWidth="1" />
          <line x1={shell.x + 60} y1={H - 9} x2={shell.x + 60} y2={H - 3} stroke="var(--color-ink-400)" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}
