"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExploreSearchFormProps {
  initialQuery: string;
}

export function ExploreSearchForm({ initialQuery }: ExploreSearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = value.trim();
    router.push(term ? `/explore?q=${encodeURIComponent(term)}` : "/explore");
  };

  return (
    <form role="search" onSubmit={submit} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-md shadow-brand-600/5 sm:p-5">
      <label htmlFor="explore-query" className="text-sm font-semibold text-brand-900">
        Tìm theo họ tên hoặc tên đăng nhập
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brand-500" aria-hidden="true" />
          <input
            id="explore-query"
            value={value}
            placeholder="Nhập họ tên hoặc tên đăng nhập"
            onChange={(event) => setValue(event.target.value)}
            className="h-11 w-full rounded-full border border-brand-100 bg-brand-50/60 pr-4 pl-11 text-sm text-brand-900 outline-none placeholder:text-zinc-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-linear-to-r from-brand-600 to-brand-500 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:from-brand-700 hover:to-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          Tìm
        </button>
      </div>
    </form>
  );
}
