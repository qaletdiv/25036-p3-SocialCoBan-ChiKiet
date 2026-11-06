"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderSearchProps {
  defaultQuery?: string;
}

export function HeaderSearch({ defaultQuery = "" }: HeaderSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultQuery);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = value.trim();
    router.push(term ? `/explore?q=${encodeURIComponent(term)}` : "/explore");
  };

  return (
    <>
      <form role="search" onSubmit={submit} className="hidden w-full max-w-md md:block">
        <label className="relative block">
          <span className="sr-only">Tìm theo họ tên hoặc tên đăng nhập</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brand-500" aria-hidden="true" />
          <input
            value={value}
            placeholder="Tìm theo họ tên hoặc tên đăng nhập"
            onChange={(event) => setValue(event.target.value)}
            className="h-11 w-full rounded-full border border-brand-100 bg-brand-50/60 pr-4 pl-11 text-sm text-brand-900 outline-none placeholder:text-zinc-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </label>
      </form>
      <Link
        href="/explore"
        aria-label="Tìm kiếm"
        className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 md:hidden"
      >
        <Search className="size-5" aria-hidden="true" />
      </Link>
    </>
  );
}
