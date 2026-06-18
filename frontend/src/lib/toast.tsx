import { toast as sonnerToast } from "sonner";
import { Alert } from "../components/ui/Alert";

const wrapper = (el: React.ReactElement) => (
  <div className="min-w-[340px] [&_span]:text-body [&_span]:font-semibold [&>div]:py-3 [&>div]:px-4">{el}</div>
);

export function toastSuccess(msg: string) {
  sonnerToast.custom(() => wrapper(<Alert variant="success">{msg}</Alert>), { duration: 3000 });
}

export function toastError(msg: string) {
  sonnerToast.custom(() => wrapper(<Alert variant="error">{msg}</Alert>), { duration: 4000 });
}

export function toastWarning(msg: string) {
  sonnerToast.custom(() => wrapper(<Alert variant="warning">{msg}</Alert>), { duration: 4000 });
}

export function toastInfo(msg: string) {
  sonnerToast.custom(() => wrapper(<Alert variant="info">{msg}</Alert>), { duration: 3000 });
}
