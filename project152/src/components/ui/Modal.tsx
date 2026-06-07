import * as React from "react";
import * as ReactDOM from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = React.createContext<ModalContextValue | undefined>(undefined);

function useModalContext() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within a Modal");
  }
  return context;
}

interface ModalProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Modal({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: ModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

interface ModalTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const ModalTrigger = React.forwardRef<HTMLButtonElement, ModalTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useModalContext();

    return (
      <button
        ref={ref}
        onClick={(e) => {
          onClick?.(e);
          setOpen(true);
        }}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ModalTrigger.displayName = "ModalTrigger";

const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return ReactDOM.createPortal(children, document.body);
};

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, closeOnOverlayClick = true, closeOnEscape = true, ...props }, ref) => {
    const { open, setOpen } = useModalContext();
    const overlayRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }, [open, closeOnEscape, setOpen]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === overlayRef.current) {
        setOpen(false);
      }
    };

    if (!open) return null;

    return (
      <ModalPortal>
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4",
            "bg-slate-900/50 backdrop-blur-sm",
            "animate-fade-in"
          )}
        >
          <div
            ref={contentRef}
            className={cn(
              "relative w-full max-w-lg bg-white rounded-xl shadow-2xl",
              "animate-scale-in animate-slide-up",
              className
            )}
            {...props}
          >
            {children}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </ModalPortal>
    );
  }
);
ModalContent.displayName = "ModalContent";

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-xl font-bold text-slate-900 font-display", className)}
    {...props}
  />
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
));
ModalDescription.displayName = "ModalDescription";

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6", className)}
    {...props}
  />
));
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0 gap-2", className)}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

const ModalClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { setOpen } = useModalContext();

  return (
    <button
      ref={ref}
      onClick={(e) => {
        props.onClick?.(e);
        setOpen(false);
      }}
      className={cn("btn-secondary", className)}
      {...props}
    >
      {children}
    </button>
  );
});
ModalClose.displayName = "ModalClose";

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
};
