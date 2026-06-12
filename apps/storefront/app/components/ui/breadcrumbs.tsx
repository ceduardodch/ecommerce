type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      className="hidden lg:block mb-4"
      aria-label="Breadcrumbs"
    >
      <ol className="flex items-center gap-2 text-[12px] text-[#6B6B66]">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-[#1A1A18] hover:underline transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-[#1A1A18]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
