import { Link } from "react-router-dom";

export function WelcomePage() {
  return (
    <div
      className="absolute inset-0 overflow-y-auto bg-nano-bg"
      style={{ colorScheme: "light" }}
    >
      <div className="flex min-h-full flex-col items-center justify-center px-6">
        {/* Logo placeholder */}
        <div className="size-[116px] rounded-full bg-[#d9d9d9]" />

        <h1 className="mt-8 font-sf text-[28px] leading-[34px] tracking-[0.38px] text-nano-text">
          welcome
        </h1>

        <p className="mt-4 text-center font-sf text-[17px] leading-[22px] tracking-[-0.43px] text-nano-text">
          How can we help you today?
        </p>

        <div className="mt-16 flex w-[228px] flex-col gap-[15px]">
          <Link
            to="/sign-in"
            state={{ mode: "sign-up" }}
            className="flex h-[38px] items-center justify-center bg-[#d9d9d9] font-sf text-[17px] leading-[22px] tracking-[-0.43px] text-nano-text"
          >
            first time user
          </Link>
          <Link
            to="/sign-in"
            state={{ mode: "sign-in" }}
            className="flex h-[38px] items-center justify-center bg-[#d9d9d9] font-sf text-[17px] leading-[22px] tracking-[-0.43px] text-nano-text"
          >
            existing user
          </Link>
        </div>

        <p className="mt-4 font-sf text-[17px] leading-[22px] tracking-[-0.43px] text-nano-text">
          not an user yet?{" "}
          <a href="#" className="text-[#0088ff]">
            visit us
          </a>
        </p>
      </div>
    </div>
  );
}
