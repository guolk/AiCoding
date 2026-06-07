import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  registerTrigger: (value: string, element: HTMLElement | null) => void;
  getTriggerRect: (value: string) => DOMRect | undefined;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs");
  }
  return context;
}

interface TabsProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

function Tabs({ children, value: controlledValue, defaultValue, onValueChange, className }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const triggerRefs = React.useRef<Map<string, HTMLElement>>(new Map());

  const setValue = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  const registerTrigger = React.useCallback((val: string, element: HTMLElement | null) => {
    if (element) {
      triggerRefs.current.set(val, element);
    } else {
      triggerRefs.current.delete(val);
    }
  }, []);

  const getTriggerRect = React.useCallback((val: string) => {
    return triggerRefs.current.get(val)?.getBoundingClientRect();
  }, []);

  return (
    <TabsContext.Provider value={{ value, setValue, registerTrigger, getTriggerRect }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { value, getTriggerRect } = useTabsContext();
    const listRef = React.useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({
      width: 0,
      transform: "translateX(0)",
    });

    const updateIndicator = React.useCallback(() => {
      const activeRect = getTriggerRect(value);
      const listRect = listRef.current?.getBoundingClientRect();

      if (activeRect && listRect) {
        setIndicatorStyle({
          width: activeRect.width,
          transform: `translateX(${activeRect.left - listRect.left}px)`,
        });
      }
    }, [value, getTriggerRect]);

    React.useEffect(() => {
      updateIndicator();
      window.addEventListener("resize", updateIndicator);
      return () => window.removeEventListener("resize", updateIndicator);
    }, [updateIndicator, children]);

    return (
      <div
        ref={(node) => {
          listRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="tablist"
        className={cn(
          "relative inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-600",
          className
        )}
        {...props}
      >
        <div
          className="absolute bottom-1 top-1 rounded-md bg-white shadow-sm transition-all duration-300 ease-out"
          style={indicatorStyle}
        />
        {children}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: activeValue, setValue, registerTrigger } = useTabsContext();
    const isActive = activeValue === value;

    React.useEffect(() => {
      return () => registerTrigger(value, null);
    }, [value, registerTrigger]);

    const setRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        registerTrigger(value, node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [value, ref, registerTrigger]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const siblings = Array.from(e.currentTarget.parentElement?.children || []).filter(
        (el) => el.getAttribute("role") === "tab"
      );
      const currentIndex = siblings.indexOf(e.currentTarget);

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % siblings.length;
        const nextSibling = siblings[nextIndex] as HTMLButtonElement;
        nextSibling.click();
        nextSibling.focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + siblings.length) % siblings.length;
        const prevSibling = siblings[prevIndex] as HTMLButtonElement;
        prevSibling.click();
        prevSibling.focus();
      }
    };

    return (
      <button
        ref={setRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onClick={() => setValue(value)}
        className={cn(
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          isActive ? "text-primary-700" : "text-slate-500 hover:text-slate-700",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: activeValue } = useTabsContext();
    const isActive = activeValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn("mt-2 animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
