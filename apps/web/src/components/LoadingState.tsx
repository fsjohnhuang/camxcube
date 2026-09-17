import { Spinner } from "@heroui/react";

export default function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <Spinner size="lg" color="primary" />
    </div>
  );
}
