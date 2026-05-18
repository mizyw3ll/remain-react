type SidebarItemProps = {
  icon: string;
  label: string;
  expanded: boolean;
  onClick?: () => void;
};

export function SidebarItem({ icon, label, expanded, onClick }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-11 w-full items-center rounded-xl px-3 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
    >
      <span className="mr-3 inline-flex min-w-6 justify-center text-lg">{icon}</span>
      <span
        className={`origin-left whitespace-nowrap transition-all duration-200 ${
          expanded ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
