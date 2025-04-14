import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CustomFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
}

const CustomFormField = ({
  name,
  label,
  placeholder,
  type = "text",
  className,
  disabled = false,
}: CustomFormFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-light-100 font-medium">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className="h-12 rounded-xl border border-light-800/20 bg-dark-200 px-5 text-light-100 shadow-sm transition-all focus-visible:ring-4 focus-visible:ring-primary-200/20 focus-visible:border-primary-200/50"
              {...field}
            />
          </FormControl>
          <FormMessage className="text-sm font-medium text-destructive-100" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
