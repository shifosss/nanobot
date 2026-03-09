import { Link } from "react-router-dom";

export function WelcomePage() {
  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-nano-new-white"
      style={{ colorScheme: "light" }}
    >
      {/* Progress bar — step 1 of 4 */}
      <div className="h-[4px] w-full bg-nano-muted">
        <div className="h-full w-1/4 bg-nano-black" />
      </div>

      <div className="mx-auto flex min-h-[calc(100%-4px)] max-w-[393px] items-center justify-center py-[36px]">
        <div className="flex w-[345px] flex-col items-center justify-center gap-[36px]">
          {/* Title group */}
          <div className="flex w-full flex-col gap-[16px]">
            <h1 className="text-center font-sf text-[48px] font-bold leading-[48px] tracking-[-1.2px] text-nano-black">
              Welcome
            </h1>
            <h2 className="text-center font-sf text-[30px] font-semibold leading-[36px] text-nano-black">
              Find your device
            </h2>
            <p className="text-center font-sf text-[16px] leading-[24px] text-nano-shadow">
              Scan the code on the product label
            </p>
          </div>

          {/* Image placeholder */}
          <div className="flex size-[221px] items-center justify-center rounded-[16px] border border-nano-muted bg-nano-muted shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
            <span className="font-sf text-[16px] text-nano-shadow">Scan</span>
          </div>

          {/* Action group 1 */}
          <div className="flex w-full flex-col gap-[16px]">
            <Link
              to="/info-check"
              className="flex h-[53px] w-full items-center justify-center rounded-[14px] border border-nano-muted bg-white font-sf text-[16px] font-medium leading-[24px] text-nano-black"
            >
              Scan from image
            </Link>
            <button
              type="button"
              className="w-full text-center font-sf text-[14px] font-medium leading-[20px] text-nano-teal"
            >
              Couldn't find the code?
            </button>
          </div>

          {/* Divider + Action group 2 */}
          <div className="flex w-full flex-col gap-[16px] border-t border-nano-muted pt-[33px]">
            <Link
              to="/link-account"
              className="flex h-[53px] w-full items-center justify-center rounded-[14px] border border-nano-muted bg-white font-sf text-[16px] font-medium leading-[24px] text-nano-black"
            >
              I've already linked my device
            </Link>
            <div className="flex items-center justify-center gap-[8px]">
              <span className="font-sf text-[14px] leading-[20px] text-nano-shadow">
                Not a user yet?
              </span>
              <a href="#" className="font-sf text-[16px] font-medium leading-[24px] text-nano-teal">
                Visit us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
