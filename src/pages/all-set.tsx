import { Link } from "react-router-dom";

export function AllSetPage() {
  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-nano-new-white"
      style={{ colorScheme: "light" }}
    >
      {/* Progress bar — step 4 of 4 (complete) */}
      <div className="h-[4px] w-full bg-nano-black" />

      <div className="mx-auto flex min-h-[calc(100%-4px)] max-w-[393px] items-center justify-center">
        <div className="flex w-[345px] flex-col items-center justify-center gap-[8px] py-[36px]">
          {/* Title group */}
          <div className="pt-[80px]">
            <h2 className="text-center font-sf text-[30px] font-semibold leading-[36px] text-nano-black">
              Everything All Set!
            </h2>
            <p className="mt-[8px] w-[294px] text-center font-sf text-[16px] leading-[24px] text-nano-shadow">
              Your adventure is ready to launch! Ready to understand yourself better?
            </p>
          </div>

          {/* Image placeholder */}
          <div className="flex h-[431px] w-full items-center justify-center rounded-[16px] bg-nano-muted shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
            <span className="font-sf text-[16px] text-nano-shadow">Illustration</span>
          </div>

          {/* CTA */}
          <Link
            to="/"
            className="flex h-[60px] w-full items-center justify-center rounded-[14px] bg-nano-teal font-sf text-[18px] font-semibold leading-[28px] text-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]"
          >
            Begin my Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
