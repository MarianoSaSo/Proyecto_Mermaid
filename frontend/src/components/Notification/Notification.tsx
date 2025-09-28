// components/Notification.jsx
import { useEffect } from "react";

type FileListProps = {
  type: string;
  message?: string;
  onClose: () => void;
};

export default function Notification({
  type,
  message,
  onClose,
}: FileListProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Oculta a los 5 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const imageSrc =
    type === "success"
      ? "/uwaga2.jpg" // Imagen cuando se crea correctamente
      : "/uwaga1.jpg"; // Imagen cuando falla

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";

  return (
    <div
      className={`fixed top-5 right-5 p-5 rounded-md shadow-lg flex items-center space-x-5 ${bgColor} ${textColor} z-50`}
    >
      <img src={imageSrc} alt={type} className="w-12 h-12 rounded" />
      <span className="text-base font-medium">{message}</span>
    </div>
  );
}
