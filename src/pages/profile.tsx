import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth-context";

/* ---- Icons ---- */

function BackChevron() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
      <path d="M9 1L1 9l8 8" stroke="#403834" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3AABD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3AABD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3AABD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3AABD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function HelpCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3AABD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ---- Menu Row ---- */

function MenuRow({
  icon,
  label,
  height = 46,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  height?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-[16px]"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center gap-[12px]">
        <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full">
          {icon}
        </div>
        <span className="text-[17px] leading-[22px] tracking-[-0.43px] text-nano-black">
          {label}
        </span>
      </div>
      <div className="shrink-0">
        <ChevronRightIcon />
      </div>
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px w-full bg-nano-divider" />;
}

/* ---- Main Page ---- */

export function ProfilePage() {
  const navigate = useNavigate();
  const { session, signOut, activeProfile } = useAuth();
  const [pending, setPending] = useState(false);

  const displayName = activeProfile?.display_name
    ?? (session?.user?.email ? session.user.email.split("@")[0] : "User");

  async function handleSignOut() {
    setPending(true);
    try {
      await signOut();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-nano-new-white"
      style={{ colorScheme: "light" }}
    >
      <div className="relative mx-auto max-w-[393px] font-sf">
        {/* Absolute grey background layer */}
        <div className="absolute left-0 top-0 h-[284px] w-full bg-nano-muted" />

        {/* Body — single flex column matching Figma auto layout */}
        <div className="relative flex flex-col gap-[16px] items-start pt-[24px] px-[24px]">
          {/* Status bar spacer */}
          <div className="h-[27px] w-[345px] shrink-0" />

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[22px] w-[24px] items-center justify-center shrink-0"
          >
            <BackChevron />
          </button>

          {/* Avatar + Name */}
          <div className="flex flex-col gap-[9px] items-center w-full shrink-0">
            <div className="flex size-[77px] items-center justify-center rounded-full bg-nano-blue-light">
              <UserIcon />
            </div>
            <p className="w-full text-center text-[34px] font-bold leading-[41px] tracking-[0.4px] text-nano-black">
              {displayName}
            </p>
          </div>

          {/* Menu Group 1 */}
          <div className="flex w-full flex-col gap-[4px] rounded-[16px] bg-white py-[8px] shrink-0">
            <MenuRow icon={<GearIcon />} label="Health Detail" onClick={() => navigate("/detail")} />
            <MenuDivider />
            <MenuRow icon={<BellIcon />} label="Supervise Member" />
            <MenuDivider />
            <MenuRow icon={<ShieldIcon />} label="Doctor" />
          </div>

          {/* Menu Group 2 */}
          <div className="flex w-full flex-col gap-[4px] rounded-[16px] bg-white py-[8px] shrink-0">
            <MenuRow icon={<GearIcon />} label="Subscription Plan" />
            <MenuDivider />
            <MenuRow icon={<BellIcon />} label="Export Data Report" />
          </div>

          {/* Menu Group 3 */}
          <div className="flex w-full flex-col gap-[4px] rounded-[16px] bg-white py-[8px] shrink-0">
            <MenuRow icon={<GearIcon />} label="Settings" />
            <MenuDivider />
            <MenuRow icon={<BellIcon />} label="Notifications" />
            <MenuDivider />
            <MenuRow icon={<ShieldIcon />} label="Privacy & Security" />
            <MenuDivider />
            <MenuRow icon={<HelpCircleIcon />} label="Help & Support" height={41} />
          </div>

          {/* Thin divider spacer */}
          <div className="h-[2px] w-[345px] shrink-0" />

          {/* Version */}
          <p className="w-full shrink-0 text-center font-inter text-[14px] leading-[20px] tracking-[-0.15px] text-nano-shadow">
            Version Alpha 0.0.1
          </p>

          {/* Sign Out (functional addition) */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={pending}
            className="mb-[24px] flex w-full shrink-0 items-center justify-center rounded-[16px] bg-white py-3 text-[17px] leading-[22px] tracking-[-0.43px] text-nano-error disabled:opacity-50"
          >
            {pending ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
