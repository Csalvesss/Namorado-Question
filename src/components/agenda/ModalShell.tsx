import { useEffect } from 'react';

export interface ModalShellProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  /** Conteúdo extra acima dos campos (ex.: toggle de tipo no EventEditor) */
  topSlot?: React.ReactNode;
}

/**
 * Shell de modal usado pelo EventEditor e pelo SubjectEditor. Lê tema editorial
 * do projeto (paper / wine / line). Sticky bottom em telas pequenas, centralizado
 * em sm+. Fecha com ESC e bloqueia o scroll do body enquanto aberto.
 */
export function ModalShell({
  title,
  onClose,
  onSubmit,
  onDelete,
  children,
  submitLabel = 'salvar',
  topSlot,
}: ModalShellProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 px-3 pt-6 pb-safe sm:items-center sm:py-6">
      <form
        onSubmit={onSubmit}
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-card sm:max-w-lg"
      >
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-serif text-xl italic text-wine-deep">{title}</h3>
        </div>
        {topSlot && <div className="border-b border-line px-5 py-3">{topSlot}</div>}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-soft px-5 py-3">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-[11px] uppercase tracking-wider text-red transition hover:underline"
            >
              remover
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-soft transition hover:bg-paper-soft"
            >
              cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] italic text-ink-soft">{hint}</span>}
    </label>
  );
}

export default ModalShell;
