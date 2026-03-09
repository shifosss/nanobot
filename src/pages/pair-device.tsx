import { Link } from "react-router-dom";

export function PairDevicePage() {
  return (
    <div
      className="absolute inset-0 overflow-y-auto bg-nano-bg"
      style={{ colorScheme: "light" }}
    >
      <div className="flex min-h-full flex-col items-center justify-center px-6">
        <h1 className="font-sf text-[28px] leading-[34px] tracking-[0.38px] text-nano-text">
          Scan your bot QR code
        </h1>
        <p className="font-sf text-[17px] leading-[22px] tracking-[-0.43px] text-nano-text">
          align to the code on the label
        </p>

        {/* QR scanner placeholder */}
        <div className="mt-11 size-[213px] bg-[#d9d9d9]" />

        <button
          type="button"
          className="mt-11 font-sf text-[17px] leading-[22px] tracking-[-0.43px] text-[#0088ff]"
        >
          couldn&rsquo;t find the code?
        </button>
      </div>
    </div>
  );
}
