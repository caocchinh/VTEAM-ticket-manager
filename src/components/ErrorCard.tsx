import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { RefreshButton } from "@/components/RefreshButton";
import { TriangleAlert } from "lucide-react";

interface ErrorCardProps {
  message: string;
}

export function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <Card className="w-[90%] max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <TriangleAlert size={100} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <RefreshButton />
        </CardContent>
      </Card>
    </div>
  );
}
