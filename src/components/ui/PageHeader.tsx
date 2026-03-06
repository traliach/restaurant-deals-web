import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
