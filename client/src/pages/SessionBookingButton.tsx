import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

export default function SessionBookingButton() {
  return (
    <Link href="/book-sessions">
      <Button className="w-full sm:w-auto">
        <Calendar className="w-4 h-4 mr-2" />
        Book Sessions
      </Button>
    </Link>
  );
}