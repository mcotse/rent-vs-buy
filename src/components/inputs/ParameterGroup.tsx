import { useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface ParameterGroupProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function ParameterGroup({
  title,
  children,
  defaultOpen = true,
}: ParameterGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-t border-white/[0.06]">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {title}
          </span>
          <ChevronRight
            className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${
              open ? 'rotate-90' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 px-4 pb-3">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
