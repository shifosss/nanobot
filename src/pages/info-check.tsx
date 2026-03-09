import { Link } from "react-router-dom";

const INFO_ROWS: { label: string; value: string }[] = [
  { label: "Biological Sex", value: "Female" },
  { label: "Age", value: "20" },
  { label: "Height", value: "5 ft 3 in" },
  { label: "Weight", value: "116.4 lbs" },
  { label: "Subscription ends in", value: "12 months" },
];

const HEALTH_FOCUS = ["Standard", "Menstrual hormone"];

export function InfoCheckPage() {
  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-nano-new-white"
      style={{ colorScheme: "light" }}
    >
      {/* Progress bar — step 2 of 4 */}
      <div className="h-[4px] w-full bg-nano-muted">
        <div className="h-full w-1/2 bg-nano-black" />
      </div>

      <div className="mx-auto flex min-h-[calc(100%-4px)] max-w-[393px] items-center justify-center">
        <div className="flex w-[345px] flex-col items-center justify-center gap-[36px]">
          {/* Header */}
          <div className="flex w-full flex-col gap-[8px]">
            <h2 className="text-center font-sf text-[30px] font-semibold leading-[36px] text-nano-black">
              Is this you?
            </h2>
            <p className="text-center font-sf text-[16px] leading-[24px] text-nano-shadow">
              Check if the information matches
            </p>
          </div>

          {/* Info card */}
          <div className="flex w-full flex-col gap-[24px] rounded-[16px] border border-nano-muted bg-white px-[33px] pt-[33px] pb-px shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
            {/* Name */}
            <div className="border-b border-nano-muted pb-px">
              <h3 className="font-sf text-[24px] font-semibold leading-[32px] text-nano-black">
                Julia L
              </h3>
            </div>

            {/* Info rows */}
            <div className="flex flex-col gap-[16px]">
              {INFO_ROWS.slice(0, 2).map((row) => (
                <div key={row.label} className="flex items-start justify-between pt-[8px]">
                  <span className="font-sf text-[14px] leading-[20px] text-nano-shadow">
                    {row.label}
                  </span>
                  <span className="font-sf text-[14px] font-medium leading-[20px] text-nano-black">
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Health focus */}
              <div className="pt-[8px]">
                <p className="font-sf text-[14px] leading-[20px] text-nano-shadow">
                  Health focus
                </p>
                <div className="mt-[8px] ml-[16px] flex flex-col gap-[4px]">
                  {HEALTH_FOCUS.map((item) => (
                    <div key={item} className="flex items-center gap-[8px]">
                      <div className="size-[6px] shrink-0 rounded-full bg-nano-black" />
                      <span className="font-sf text-[14px] leading-[20px] text-nano-black">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {INFO_ROWS.slice(2).map((row) => (
                <div key={row.label} className="flex items-start justify-between pt-[8px]">
                  <span className="font-sf text-[14px] leading-[20px] text-nano-shadow">
                    {row.label}
                  </span>
                  <span className="font-sf text-[14px] font-medium leading-[20px] text-nano-black">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-[16px]">
            <Link
              to="/link-account"
              className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-nano-teal font-sf text-[16px] font-medium leading-[24px] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
            >
              Yes, continue
            </Link>
            <div className="flex items-center justify-center gap-[8px]">
              <span className="font-sf text-[12px] leading-[16px] text-nano-shadow">
                Something wrong?
              </span>
              <a href="#" className="font-sf text-[12px] font-bold leading-[16px] text-nano-teal">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
