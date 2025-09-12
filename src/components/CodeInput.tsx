import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface CodeInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({
  onComplete,
  disabled = false,
  error,
}) => {
  const [values, setValues] = useState<string[]>(Array(7).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear inputs when there's an error
  useEffect(() => {
    if (error) {
      setValues(Array(7).fill(""));
      setIsSubmitting(false);
      inputRefs.current[0]?.focus();
    }
  }, [error]);

  useEffect(() => {
    // Auto-submit when all 7 characters are entered
    const code = values.join("");
    if (code.length === 7 && code.match(/^[A-Z0-9]{7}$/) && !isSubmitting) {
      setIsSubmitting(true);
      setTimeout(() => {
        onComplete(code);
        setIsSubmitting(false);
      }, 300); // Small delay for better UX
    }
  }, [values, onComplete, isSubmitting]);

  const handleChange = (index: number, value: string) => {
    // Only allow alphanumeric characters
    const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (cleanValue.length <= 1) {
      const newValues = [...values];
      newValues[index] = cleanValue;
      setValues(newValues);

      // Auto-advance to next input
      if (cleanValue && index < 6) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (pastedData.length <= 7) {
      const newValues = Array(7).fill("");
      for (let i = 0; i < Math.min(pastedData.length, 7); i++) {
        newValues[i] = pastedData[i];
      }
      setValues(newValues);

      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, 6);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 justify-center">
        {values.map((value, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-12 h-12 text-center text-xl font-bold text-foreground bg-white/10 backdrop-blur-sm border-2 rounded-xl focus:ring-0 transition-all duration-200 ${
              error
                ? "border-red-400 focus:border-red-500"
                : isSubmitting
                ? "border-green-400 bg-green-50/10"
                : "border-white/20 focus:border-primary"
            }`}
            maxLength={1}
            disabled={disabled || isSubmitting}
            autoComplete="off"
            autoCapitalize="characters"
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center font-medium">{error}</p>
      )}

      {isSubmitting && (
        <p className="text-sm text-green-400 text-center font-medium animate-pulse">
          Joining session...
        </p>
      )}
    </div>
  );
};

export default CodeInput;
