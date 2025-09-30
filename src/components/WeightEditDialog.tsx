import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWeightStore, WeightEntry } from '@/hooks/use-weight-store';
import { cn } from '@/lib/utils';
const editSchema = z.object({
  weight: z.string()
    .min(1, "Please enter a weight.")
    .pipe(
      z.coerce.number({ invalid_type_error: "Please enter a valid number." })
        .positive("Weight must be a positive number.")
    ),
  date: z.date({
    required_error: "A date is required.",
  }),
});
type EditFormValues = z.infer<typeof editSchema>;
interface WeightEditDialogProps {
  entry: WeightEntry;
}
export function WeightEditDialog({ entry }: WeightEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateEntry = useWeightStore((state) => state.updateEntry);
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      weight: entry.weight.toFixed(1),
      date: parseISO(entry.date),
    },
  });
  useEffect(() => {
    if (isOpen) {
      form.reset({
        weight: entry.weight.toFixed(1),
        date: parseISO(entry.date),
      });
    }
  }, [isOpen, entry, form]);
  function onSubmit(values: EditFormValues) {
    try {
      updateEntry(entry.id, format(values.date, 'yyyy-MM-dd'), values.weight);
      toast.success("Entry updated successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update weight entry:', error);
      toast.error('Something went wrong', {
        description: 'Could not update your entry. Please try again.',
      });
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Weight Entry</DialogTitle>
          <DialogDescription>
            Update the weight and date for this entry. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 75.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}