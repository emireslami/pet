import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import type { SelectChangeEvent, TextFieldProps } from "@mui/material";
import { useId } from "react";
import type { ReactNode } from "react";

export function AppTextField(props: TextFieldProps) {
  return <TextField fullWidth variant="outlined" size="small" {...props} />;
}

type SelectOption = { value: string; label: ReactNode };

export function AppSelectField({
  label,
  value,
  onChange,
  options,
  helperText,
  required,
}: {
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  options: SelectOption[];
  helperText?: ReactNode;
  required?: boolean;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const fieldId = `${id}-field`;
  return <FormControl fullWidth size="small" variant="outlined" required={required}>
    <InputLabel id={labelId}>{label}</InputLabel>
    <Select labelId={labelId} id={fieldId} label={label} value={value} onChange={onChange}>
      {options.map(option => <MenuItem key={option.value || String(option.label)} value={option.value}>{option.label}</MenuItem>)}
    </Select>
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>;
}

export function FormSection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return <Paper variant="outlined" className="form-section">
    <Box className="form-section-head">
      <Typography variant="h6">{title}</Typography>
      {description && <Typography color="text.secondary" variant="body2">{description}</Typography>}
    </Box>
    <Box className="form-section-body">{children}</Box>
  </Paper>;
}

export function FormActions({ onCancel, cancelLabel = "انصراف", submitLabel, busy, disabled }: { onCancel?: () => void; cancelLabel?: string; submitLabel: ReactNode; busy?: boolean; disabled?: boolean }) {
  return <Stack className="form-actions" direction="row" spacing={1}>
    {onCancel && <Button type="button" variant="text" onClick={onCancel}>{cancelLabel}</Button>}
    <Button type="submit" variant="contained" disabled={busy || disabled}>{submitLabel}</Button>
  </Stack>;
}

export function PersianDateFields({
  label,
  helperText,
  year,
  month,
  day,
  years,
  months,
  days,
  onChange,
  required,
  emptyYearLabel = "ثبت نشده",
  emptyMonthLabel = "فروردین پیش‌فرض",
  emptyDayLabel = "روز ۱ پیش‌فرض",
  footer,
}: {
  label: string;
  helperText?: ReactNode;
  year: string;
  month: string;
  day: string;
  years: number[];
  months: string[];
  days: number[];
  onChange: (part: "year" | "month" | "day", value: string) => void;
  required?: boolean;
  emptyYearLabel?: string;
  emptyMonthLabel?: string;
  emptyDayLabel?: string;
  footer?: ReactNode;
}) {
  return <FormSection title={label} description={helperText}>
    <Box className="responsive-form-grid date-grid">
      <AppSelectField label="سال" required={required} value={year} onChange={event => onChange("year", String(event.target.value))} options={[
        ...(required ? [] : [{ value: "", label: emptyYearLabel }]),
        ...years.map(value => ({ value: String(value), label: value })),
      ]} />
      <AppSelectField label="ماه" value={month} onChange={event => onChange("month", String(event.target.value))} options={[
        { value: "", label: emptyMonthLabel },
        ...months.map((value, index) => ({ value: String(index + 1), label: value })),
      ]} />
      <AppSelectField label="روز" value={day} onChange={event => onChange("day", String(event.target.value))} options={[
        { value: "", label: emptyDayLabel },
        ...days.map(value => ({ value: String(value), label: value })),
      ]} />
    </Box>
    {footer}
  </FormSection>;
}
