import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";

const reportSchema = z.object({
  contentType: z.string().min(1, "Content type is required"),
  contentId: z.number().min(1, "Content ID is required"),
  reason: z.string().min(1, "Please select a reason"),
  description: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportDialogProps {
  contentType: string;
  contentId: number;
  contentTitle?: string;
  trigger?: React.ReactNode;
}

const reportReasons = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "spam", label: "Spam" },
  { value: "misleading", label: "Misleading Information" },
  { value: "offensive", label: "Offensive Language" },
  { value: "other", label: "Other" },
];

export function ReportDialog({ 
  contentType, 
  contentId, 
  contentTitle,
  trigger 
}: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      contentType,
      contentId,
      reason: "",
      description: "",
    },
  });

  const reportMutation = useMutation({
    mutationFn: (data: ReportFormValues) => {
      return apiRequest("POST", "/api/content-reports", data);
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this content. We'll review it shortly.",
      });
      setIsOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-reports'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReportFormValues) => {
    reportMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-sm text-neutral-600">
            You're reporting: <span className="font-medium">{contentTitle || "this content"}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for reporting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional details (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide more details about the issue..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={reportMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={reportMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}