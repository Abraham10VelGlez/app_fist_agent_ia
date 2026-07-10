"use client";
import { useRef, useEffect, useCallback, useState, type JSX } from "react";
import { flushSync } from "react-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Macui2";
import {
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { toCanvas } from "html-to-image";
import { Menu as MenuIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "idle" | "opening" | "open" | "closing";
type Dir = "open" | "minimize";
interface Pt {
  x: number;
  y: number;
}
interface App {
  id: string;
  Icon: React.FC;
  label: string;
  accent: string;
  tb: [string, string];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WIN_W = 1195;
const WIN_H = 700;
const DUR = 500;

const ICON_BASE = 50;
const ICON_PEAK = 74;
const MAG_RANGE = 130;

const BREAKPOINT = 1024;

// ─── Math ─────────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eioC = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eIn2 = (t: number) => t * t;
const eOut2 = (t: number) => 1 - (1 - t) * (1 - t);

// ─── Brand SVG Icons ──────────────────────────────────────────────────────────

const SafariIcon: React.FC = () => (
  <svg viewBox="0 0 187 186" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g opacity="0.53" filter="url(#safari_f0)">
      <path d="M178.789 95.9556C178.789 106.742 176.583 117.422 172.297 127.387C168.011 137.352 161.729 146.407 153.81 154.034C145.89 161.661 136.489 167.711 126.141 171.838C115.794 175.966 104.704 178.091 93.5041 178.091C82.3043 178.091 71.2141 175.966 60.8668 171.838C50.5195 167.711 41.1177 161.661 33.1983 154.034C25.2788 146.407 18.9967 137.352 14.7107 127.387C10.4247 117.422 8.21875 106.742 8.21875 95.9556C8.21875 74.172 17.2041 53.2807 33.1983 37.8773C49.1924 22.474 70.885 13.8206 93.5041 13.8206C104.704 13.8206 115.794 15.945 126.141 20.0727C136.489 24.2004 145.89 30.2504 153.81 37.8773C161.729 45.5043 168.011 54.5588 172.297 64.5239C176.583 74.4889 178.789 85.1695 178.789 95.9556Z" fill="black" />
    </g>
    <path d="M182.033 88.7031C182.033 100.331 179.743 111.845 175.294 122.587C170.845 133.33 164.324 143.091 156.103 151.313C147.882 159.535 138.122 166.057 127.381 170.506C116.64 174.956 105.127 177.246 93.5009 177.246C70.0207 177.246 47.5022 167.918 30.8992 151.313C14.2962 134.708 4.96875 112.186 4.96875 88.7031C4.96875 65.22 14.2962 42.6986 30.8992 26.0935C47.5022 9.48845 70.0207 0.159796 93.5009 0.15979C105.127 0.159789 116.64 2.45004 127.381 6.89976C138.122 11.3495 147.882 17.8715 156.103 26.0935C164.324 34.3155 170.845 44.0765 175.294 54.819C179.743 65.5616 182.033 77.0754 182.033 88.7031Z" fill="url(#safari_p0)" stroke="#CDCDCD" strokeWidth="0.0930123" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M175.094 88.703C175.094 110.346 166.498 131.103 151.196 146.407C135.894 161.71 115.14 170.308 93.4992 170.308C71.8589 170.308 51.1049 161.71 35.8029 146.407C20.5009 131.103 11.9043 110.346 11.9043 88.703C11.9043 67.06 20.5009 46.3034 35.8029 30.9995C51.1049 15.6956 71.8589 7.0979 93.4992 7.0979C115.14 7.0979 135.894 15.6956 151.196 30.9995C166.498 46.3034 175.094 67.06 175.094 88.703Z" fill="url(#safari_p1)" />
    <g opacity="0.409" filter="url(#safari_f1)">
      <path d="M149.255 41.1124L84.1695 78.9323L43.0176 143.725L103.22 99.1287L149.255 41.1124Z" fill="black" />
    </g>
    <path d="M102.828 98.4727L84.1719 78.9333L150.351 34.4089L102.828 98.4727Z" fill="#FF5150" />
    <path d="M102.828 98.4727L84.1719 78.9333L36.6484 142.997L102.828 98.4727Z" fill="#F1F1F1" />
    <path opacity="0.243" d="M36.6484 142.997L102.828 98.4727L150.351 34.4089L36.6484 142.997Z" fill="black" />
    <defs>
      <filter id="safari_f0" x="5.8498" y="11.4516" width="175.308" height="169.008" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="1.18448" />
      </filter>
      <filter id="safari_f1" x="42.3443" y="40.4391" width="107.585" height="103.959" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="0.336661" />
      </filter>
      <linearGradient id="safari_p0" x1="93.4978" y1="177.245" x2="93.4978" y2="0.159326" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BDBDBD" />
        <stop offset="1" stopColor="white" />
      </linearGradient>
      <radialGradient id="safari_p1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(93.8671 76.8039) scale(88.5319 88.543)">
        <stop stopColor="#06C2E7" />
        <stop offset="0.25" stopColor="#0DB8EC" />
        <stop offset="0.5" stopColor="#12AEF1" />
        <stop offset="0.75" stopColor="#1F86F9" />
        <stop offset="1" stopColor="#107DDD" />
      </radialGradient>
    </defs>
  </svg>
);

const ArcIcon: React.FC = () => (
  <svg viewBox="0 0 256 219" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g clipPath="url(#arc_c0)">
      <path d="M123.633 0.012C137.469 0.41 149.965 8.532 155.953 21.101L179.714 71.085L180.096 70.119C181.04 67.6277 181.813 65.0751 182.411 62.479L182.743 60.931C186.747 40.911 206.206 27.954 226.263 31.915C231.027 32.8666 235.556 34.7475 239.593 37.4501C243.63 40.1528 247.095 43.6243 249.789 47.6663C252.484 51.7083 254.356 56.2416 255.298 61.0073C256.241 65.773 256.235 70.6776 255.281 75.441C249.944 102.093 236.186 126.828 216.452 146.424L215.827 147.031L224.157 164.545C233.825 184.875 223.808 209.448 202.757 216.344L201.807 216.641L201.082 216.86C197.861 217.767 194.531 218.229 191.185 218.233C184.189 218.233 177.337 216.251 171.422 212.517C165.507 208.782 160.772 203.447 157.765 197.131L151.335 183.613L149.713 184.015C141.021 186.069 132.205 187.207 123.385 187.382L120.98 187.406C112.492 187.406 103.864 186.419 95.2439 184.506L93.5439 184.11L87.3669 197.097C83.202 205.854 75.7633 212.625 66.6539 215.949L65.5539 216.331C60.8094 217.896 55.797 218.482 50.8195 218.055C45.8419 217.628 41.0026 216.197 36.5939 213.847C19.0339 204.513 12.3379 182.661 20.9059 164.612L28.5759 148.483L27.9059 147.833C17.3909 137.46 9.05486 125.67 3.52486 112.996L2.78786 111.263L2.68186 110.982C-4.92914 92.058 4.21086 70.517 23.1229 62.86C37.9569 56.855 54.4009 61.167 64.5129 72.438L64.7029 72.656L89.1489 21.234C92.047 15.0401 96.6111 9.77459 102.331 6.02637C108.05 2.27815 114.7 0.195033 121.536 0.01L122.571 0L123.633 0.012Z" fill="white" />
      <path d="M87.1188 170.045L109.015 123.977C92.2908 120.425 75.4638 110.08 65.9468 97.495L43.0508 145.63C55.7738 156.423 71.0498 164.907 87.1188 170.045Z" fill="#1A007F" />
      <path d="M178.495 96.115C167.495 109.598 152.22 119.598 135.875 123.494L157.702 169.424C173.633 164.044 188.529 155.355 201.392 144.218L178.495 96.115Z" fill="#4E000A" />
      <path d="M43.0504 145.631L31.6024 169.7C25.7744 181.941 30.1534 197.01 42.1534 203.389C54.8774 210.147 70.5324 204.872 76.6704 192.009L87.1184 170.045C70.9841 164.843 56.0165 156.552 43.0504 145.631Z" fill="#1A007F" />
      <path d="M223.941 43.5649C220.703 42.9166 217.37 42.9126 214.131 43.553C210.891 44.1934 207.81 45.4658 205.063 47.2973C202.315 49.1289 199.956 51.4838 198.119 54.2275C196.282 56.9712 195.003 60.05 194.356 63.2879C191.942 75.3579 186.287 86.5979 178.494 96.1499L201.356 144.287C222.459 125.977 238.044 101.047 243.631 73.1499C246.355 59.4949 237.527 46.2539 223.941 43.5649Z" fill="#FF9396" />
      <path d="M135.874 123.494C130.978 124.666 125.978 125.287 120.978 125.287C117.082 125.287 113.048 124.839 109.013 123.977C92.2893 120.425 75.4623 110.08 65.9453 97.4951C63.5653 94.3571 61.6353 91.0811 60.2903 87.7361C55.0833 74.8741 40.4283 68.6681 27.5663 73.8401C14.7043 79.0471 8.49926 93.7021 13.6703 106.563C19.5663 121.183 29.9803 134.597 43.0493 145.631C56.0027 156.551 70.9588 164.843 87.0823 170.045C98.1513 173.596 109.633 175.562 120.944 175.562C133.495 175.562 145.874 173.389 157.667 169.424L135.874 123.494Z" fill="#002DC8" />
      <path d="M213.425 169.596L201.357 144.218L178.495 96.1151L178.461 96.1501C178.461 96.1501 178.461 96.1151 178.495 96.1151L145.255 26.1851C143.215 21.8948 140.001 18.2704 135.985 15.7318C131.969 13.1932 127.316 11.8442 122.565 11.8411C112.875 11.8411 104.048 17.4271 99.8765 26.1861L65.9805 97.4951C75.4975 110.08 92.3245 120.425 109.048 123.977L120.013 100.943C121.048 98.7701 124.151 98.7701 125.186 100.943L135.91 123.494H135.979H135.909L157.737 169.424L168.461 191.975C170.5 196.274 173.719 199.904 177.742 202.444C181.765 204.984 186.427 206.328 191.184 206.32C193.426 206.32 195.667 206.01 197.874 205.389C213.012 201.216 220.184 183.803 213.425 169.596Z" fill="#FF536A" />
    </g>
    <defs>
      <clipPath id="arc_c0">
        <rect width="256" height="219" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const TrelloIcon: React.FC = () => (
  <svg viewBox="0 0 179 179" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g clipPath="url(#trello_c0)">
      <path d="M157.947 0.198975H22.731C11.0987 0.198975 1.66446 9.62049 1.64861 21.2528V156.27C1.62611 161.876 3.83726 167.26 7.7934 171.232C11.7495 175.205 17.1249 177.437 22.731 177.437H157.947C163.548 177.43 168.916 175.194 172.866 171.222C176.816 167.251 179.024 161.871 179.001 156.27V21.2528C178.985 9.63158 169.568 0.214626 157.947 0.198975ZM78.1358 127.857C78.1283 129.731 77.3748 131.525 76.0418 132.842C74.7089 134.158 72.9063 134.89 71.0326 134.875H41.4834C37.6186 134.86 34.4939 131.722 34.4939 127.857V39.9199C34.4939 36.0551 37.6186 32.9176 41.4834 32.902H71.0326C74.902 32.9176 78.035 36.0505 78.0505 39.9199L78.1358 127.857ZM146.326 87.4828C146.326 89.3589 145.575 91.157 144.241 92.4756C142.906 93.7942 141.099 94.5235 139.223 94.5012H109.674C105.804 94.4852 102.672 91.3522 102.656 87.4828V39.9199C102.672 36.0505 105.804 32.9176 109.674 32.902H139.223C143.088 32.9176 146.213 36.0551 146.213 39.9199L146.326 87.4828Z" fill="url(#trello_p0)" />
    </g>
    <defs>
      <linearGradient id="trello_p0" x1="90.4101" y1="177.437" x2="90.4101" y2="0.198975" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0052CC" />
        <stop offset="1" stopColor="#2684FF" />
      </linearGradient>
      <clipPath id="trello_c0">
        <rect width="179" height="179" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// ─── Apps ─────────────────────────────────────────────────────────────────────
const APPS: App[] = [
  {
    id: "safari",
    Icon: SafariIcon,
    label: "Incorporación al Padrón: Predios",
    accent: "#5affb2",
    tb: ["#0e2238", "#081628"],
  },
  {
    id: "arc",
    Icon: ArcIcon,
    label: "Incorporación al Padron: Histórico",
    accent: "#FF536A",
    tb: ["#3a1620", "#280f18"],
  },
  {
    id: "trello",
    Icon: TrelloIcon,
    label: "Incorporación al Padron: Propietarios",
    accent: "#0052CC",
    tb: ["#0a1838", "#061026"],
  },
];

// ─── Genie scanline renderer ──────────────────────────────────────────────────
function renderGenie(
  ctx: CanvasRenderingContext2D,
  off: HTMLCanvasElement,
  W: number,
  H: number,
  rawT: number,
  dir: Dir,
  dock: Pt,
  win: Pt,
): void {
  ctx.clearRect(0, 0, W, H);
  for (let y = 0; y < WIN_H; y++) {
    const r = y / WIN_H;
    const rowXStart = dir === "minimize" ? (1 - r) * 0.65 : r * 0.65;
    const xP = clamp((rawT - rowXStart) / (1 - rowXStart), 0, 1);
    const xE = eioC(xP);
    const rowYStart = dir === "minimize" ? (1 - r) * 0.2 : r * 0.2;
    const yP = clamp((rawT - rowYStart) / (1 - rowYStart), 0, 1);
    const yE = eIn2(yP);
    let left: number, right: number, destY: number;
    if (dir === "minimize") {
      left = lerp(win.x, dock.x, xE);
      right = lerp(win.x + WIN_W, dock.x, xE);
      destY = lerp(win.y + y, dock.y, yE);
    } else {
      left = lerp(dock.x, win.x, xE);
      right = lerp(dock.x, win.x + WIN_W, xE);
      destY = lerp(dock.y, win.y + y, yE);
    }
    const rowW = right - left;
    if (rowW < 0.8) continue;
    ctx.drawImage(off, 0, y, WIN_W, 1, left, destY, rowW, 1);
  }
  const glowRaw = dir === "minimize" ? rawT : 1 - rawT;
  if (glowRaw > 0.75) {
    const a = eOut2((glowRaw - 0.75) / 0.25) * 0.3;
    const hex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");
    const g = ctx.createRadialGradient(dock.x, dock.y, 0, dock.x, dock.y, 55);
    g.addColorStop(0, "#ffffff" + hex);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

function SafariContent() {
  return <></>;
}

function ArcContent() {
  return <></>;
}

function TrelloContent() {
  return <></>;
}

const WindowContent: Record<string, () => JSX.Element> = {
  safari: SafariContent,
  arc: ArcContent,
  trello: TrelloContent,
};

// ─── Mac window wrapper ───────────────────────────────────────────────────────
const MacWindow = ({
  app,
  winPos,
  onClose,
  domRef,
}: {
  app: App;
  winPos: Pt;
  onClose: () => void;
  domRef: React.RefCallback<HTMLDivElement>;
}) => {
  const Content = WindowContent[app.id];
  return (
    <div
      ref={domRef}
      className="absolute flex flex-col overflow-hidden"
      style={{
        width: WIN_W,
        height: WIN_H,
        left: winPos.x,
        top: winPos.y,
        borderRadius: 13,
        background: "#1e1e1e",
        zIndex: 40,
        boxShadow:
          "0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.07)",
      }}
    >
      <div
        className="flex items-center px-4 shrink-0 relative"
        style={{
          height: 42,
          background: `linear-gradient(180deg,${app.tb[0]},${app.tb[1]})`,
          borderBottom: "1px solid rgba(0,0,0,.45)",
        }}
      >
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={onClose}
            className="w-3.5 h-3.5 rounded-full border-none cursor-pointer hover:brightness-90 transition-all"
            style={{ background: "#ff5f57", boxShadow: "0 0 0 0.5px #e0443e" }}
          />
          <button
            onClick={onClose}
            className="w-3.5 h-3.5 rounded-full border-none cursor-pointer hover:brightness-90 transition-all"
            style={{ background: "#febc2e", boxShadow: "0 0 0 0.5px #d4a017" }}
          />
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{ background: "#28c840", boxShadow: "0 0 0 0.5px #1aab29" }}
          />
        </div>
        <span
          className="absolute inset-x-0 text-center text-xs font-medium pointer-events-none"
          style={{ color: "rgb(255, 255, 255)", fontSize: "18px" }}
        >
          {app.label}
        </span>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "none", background: "rgb(255, 255, 255)" }}
      >
        <Content />
      </div>
    </div>
  );
};

// ─── Magnified Dock Icon ──────────────────────────────────────────────────────
function MagnifiedDockIcon({
  app,
  isActive,
  showDot,
  disabled,
  btnRef,
  onClick,
  mouseX,
}: {
  app: App;
  isActive: boolean;
  showDot: boolean;
  disabled: boolean;
  btnRef: (el: HTMLButtonElement | null) => void;
  onClick: () => void;
  mouseX: MotionValue<number>;
}) {
  const localRef = useRef<HTMLButtonElement>(null);
  const setRefs = useCallback(
    (el: HTMLButtonElement | null) => {
      localRef.current = el;
      btnRef(el);
    },
    [btnRef],
  );

  const distance = useTransform(mouseX, (val) => {
    const bounds = localRef.current?.getBoundingClientRect() ?? {
      x: 0,
      width: 0,
    };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeSync = useTransform(
    distance,
    [-MAG_RANGE, 0, MAG_RANGE],
    [ICON_BASE, ICON_PEAK, ICON_BASE],
  );
  const size = useSpring(sizeSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const innerSize = useTransform(size, (s) => s * 0.86);

  const Icon = app.Icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          ref={setRefs}
          onClick={onClick}
          disabled={disabled}
          style={{
            width: size,
            height: size,
            background: isActive ? `${app.accent}28` : "transparent",
            cursor: disabled ? "default" : "pointer",
          }}
          className="relative flex items-center justify-center rounded-xl border-none"
        >
          <motion.div
            style={{
              width: innerSize,
              height: innerSize,
              filter: isActive
                ? `drop-shadow(0 4px 12px ${app.accent}99)`
                : "drop-shadow(0 2px 4px rgba(0,0,0,.4))",
              pointerEvents: "none",
            }}
            className="block"
          >
            <Icon />
          </motion.div>
          {showDot && (
            <div
              className="absolute -bottom-1 w-1 h-1 rounded-full"
              style={{ background: "rgba(5, 47, 255, 0.75)" }}
            />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent className="py-1 px-3 rounded-md" sideOffset={10}>
        <p className="text-xs text-primary">{app.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Snapshot Stage ───────────────────────────────────────────────────────────
function SnapshotStage({
  onReady,
}: {
  onReady: (canvases: HTMLCanvasElement[]) => void;
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        if (cancelled) return;

        const canvases = await Promise.all(
          refs.current
            .filter((n): n is HTMLDivElement => n !== null)
            .map((node) => toCanvas(node, { pixelRatio: 1, cacheBust: false })),
        );
        if (cancelled) return;
        onReady(canvases);
      } catch (err) {
        console.error("Genie snapshot failed:", err);
        if (!cancelled) onReady([]);
      }
    };

    const ric = (
      window as unknown as { requestIdleCallback?: (cb: () => void) => number }
    ).requestIdleCallback;
    const cic = (
      window as unknown as { cancelIdleCallback?: (h: number) => void }
    ).cancelIdleCallback;
    let handle: number;
    if (typeof ric === "function") {
      handle = ric(run);
    } else {
      handle = window.setTimeout(run, 50);
    }

    return () => {
      cancelled = true;
      if (typeof cic === "function") cic(handle);
      else clearTimeout(handle);
    };
  }, [onReady]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: -10000,
        top: 0,
        pointerEvents: "none",
      }}
    >
      {APPS.map((a, i) => (
        <div
          key={a.id}
          style={{
            position: "relative",
            width: WIN_W,
            height: WIN_H,
            marginBottom: 20,
          }}
        >
          <MacWindow
            app={a}
            winPos={{ x: 0, y: 0 }}
            onClose={() => {}}
            domRef={(el) => {
              refs.current[i] = el;
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Mobile Menu Button ───────────────────────────────────────────────────────
function MobileMenu({
  onAppSelect,
  disabled,
}: {
  onAppSelect: (idx: number) => void;
  disabled: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className="flex items-center justify-center w-12 h-12 rounded-xl border-none cursor-pointer transition-all hover:brightness-110"
          style={{
            background: "rgba(255,255,255,.15)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,.2)",
            boxShadow: "0 4px 16px rgba(0,0,0,.3)",
          }}
        >
          <MenuIcon className="text-white" size={24} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[220px]"
        style={{
          background: "rgba(30,30,30,.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,.15)",
        }}
      >
        {APPS.map((app, i) => (
          <DropdownMenuItem
            key={app.id}
            onClick={() => onAppSelect(i)}
            className="flex items-center gap-3 py-2.5 px-3 text-white/90 hover:text-white focus:text-white cursor-pointer"
            style={{
              background: "transparent",
            }}
          >
            <div className="w-6 h-6 flex-shrink-0">
              <app.Icon />
            </div>
            <span className="text-sm">{app.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Maciu() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [phase, setPhase] = useState<Phase>("idle");
  const [activeApp, setActiveApp] = useState<number | null>(null);
  const [winPos, setWinPos] = useState<Pt>({ x: 0, y: 0 });
  const [snapshotsReady, setSnapshotsReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dockRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const offRef = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<{ phase: Phase; activeApp: number | null }>({
    phase: "idle",
    activeApp: null,
  });

  const mouseX = useMotionValue(Infinity);

  const handleSnapshotsReady = useCallback((canvases: HTMLCanvasElement[]) => {
    offRef.current = canvases;
    setSnapshotsReady(true);
  }, []);

  const getContainerSize = useCallback((): { w: number; h: number } => {
    const el = containerRef.current;
    if (!el) return { w: window.innerWidth, h: window.innerHeight };
    return { w: el.clientWidth, h: el.clientHeight };
  }, []);

  const getWinPos = useCallback((): Pt => {
    const { w, h } = getContainerSize();
    return {
      x: (w - WIN_W) / 2,
      y: (h - WIN_H) / 2 - 20,
    };
  }, [getContainerSize]);

  const getDockCenter = useCallback((idx: number): Pt => {
    const btn = dockRefs.current[idx];
    const cont = containerRef.current;
    if (!btn || !cont) return { x: 0, y: 0 };
    const b = btn.getBoundingClientRect();
    const c = cont.getBoundingClientRect();
    return {
      x: b.left - c.left + b.width / 2,
      y: b.top - c.top + b.height / 2,
    };
  }, []);

  const setupCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const { w, h } = getContainerSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr;
    c.height = h * dpr;
    c.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [getContainerSize]);

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    c.style.zIndex = "30";
  }, []);

  const startAnim = useCallback(
    (dir: Dir, appIdx: number, onDone: () => void) => {
      cancelAnimationFrame(rafRef.current);
      const dock = getDockCenter(appIdx);
      const win = getWinPos();
      const { w: cw, h: ch } = getContainerSize();
      const off = offRef.current[appIdx];
      let start: number | null = null;
      function frame(ts: number) {
        if (!start) start = ts;
        const rawT = clamp((ts - start) / DUR, 0, 1);
        const c = canvasRef.current;
        if (!c) return;
        renderGenie(c.getContext("2d")!, off, cw, ch, rawT, dir, dock, win);
        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          onDone();
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    },
    [getDockCenter, getWinPos, getContainerSize],
  );

  const doOpen = useCallback(
    (idx: number) => {
      if (stateRef.current.phase !== "idle") return;
      const wp = getWinPos();
      setupCanvas();
      stateRef.current = { phase: "opening", activeApp: idx };
      setWinPos(wp);
      setPhase("opening");
      setActiveApp(idx);
      startAnim("open", idx, () => {
        stateRef.current.phase = "open";
        flushSync(() => {
          setPhase("open");
        });
        clearCanvas();
      });
    },
    [getWinPos, setupCanvas, startAnim, clearCanvas],
  );

  const doMinimize = useCallback(() => {
    const { phase: p, activeApp: a } = stateRef.current;
    if (p !== "open" || a === null) return;

    const cvs = canvasRef.current;
    if (cvs) cvs.style.zIndex = "50";

    setupCanvas();
    const dock = getDockCenter(a);
    const win = getWinPos();
    const { w: cw, h: ch } = getContainerSize();
    const ctx = cvs?.getContext("2d");
    if (ctx && cvs) {
      renderGenie(ctx, offRef.current[a], cw, ch, 0, "minimize", dock, win);
    }

    if (windowRef.current) {
      windowRef.current.style.opacity = "0";
      windowRef.current.style.pointerEvents = "none";
    }

    stateRef.current.phase = "closing";
    setPhase("closing");

    startAnim("minimize", a, () => {
      stateRef.current = { phase: "idle", activeApp: null };
      setPhase("idle");
      setActiveApp(null);
      clearCanvas();
    });
  }, [
    setupCanvas,
    getDockCenter,
    getWinPos,
    getContainerSize,
    startAnim,
    clearCanvas,
  ]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (stateRef.current.phase === "open") {
        setWinPos(getWinPos());
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [getWinPos]);

  const isAnimating = phase === "opening" || phase === "closing";
  const app = activeApp !== null ? APPS[activeApp] : null;

  const handleMobileSelect = useCallback(
    (idx: number) => {
      if (!isAnimating && snapshotsReady) {
        doOpen(idx);
      }
    },
    [isAnimating, snapshotsReady, doOpen],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-200 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%", zIndex: 30 }}
      />

      {(phase === "open" || phase === "closing") && app && (
        <MacWindow
          app={app}
          winPos={winPos}
          onClose={doMinimize}
          domRef={(el) => {
            windowRef.current = el;
          }}
        />
      )}

      {mounted && (
        <>
          <SnapshotStage onReady={handleSnapshotsReady} />

          {isMobile ? (
            <div className="absolute bottom-6 left-6 z-50">
              <MobileMenu
                onAppSelect={handleMobileSelect}
                disabled={isAnimating || !snapshotsReady}
              />
            </div>
          ) : (
            <TooltipProvider delayDuration={0}>
              <motion.div
                onMouseMove={(e) => mouseX.set(e.pageY)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="absolute bottom-100 left-5 items-end flex flex-col gap-5 px-4 pb-2"
                style={{
                  paddingTop: 14,
                  borderRadius: 18,
                  zIndex: 50,
                  background: "rgba(255,255,255,.10)",
                  backdropFilter: "blur(28px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,.14)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.10)",
                }}
              >
                {APPS.map((a, i) => (
                  <MagnifiedDockIcon
                    key={a.id}
                    app={a}
                    isActive={activeApp === i}
                    showDot={phase === "open" && activeApp === i}
                    disabled={isAnimating || !snapshotsReady}
                    btnRef={(el) => {
                      dockRefs.current[i] = el;
                    }}
                    onClick={() => doOpen(i)}
                    mouseX={mouseX}
                  />
                ))}
              </motion.div>
            </TooltipProvider>
          )}
        </>
      )}
    </div>
  );
}
