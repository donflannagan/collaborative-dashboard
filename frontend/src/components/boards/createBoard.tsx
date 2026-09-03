import type { FormEvent } from 'react';
import { useState } from 'react';
import type { ICreateBoardInput } from '../../models/board';

interface CreateBoardProps {
  ownerId: string;
  isSaving?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (board: ICreateBoardInput) => void;
}

const templates = {
  Simple: ['To Do', 'In Progress', 'Done'],
  Software: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
  Content: ['Ideas', 'Drafting', 'Review', 'Scheduled', 'Published'],
} as const;

type TemplateName = keyof typeof templates;

export default function CreateBoard({ ownerId, isSaving = false, error, onCancel, onSubmit }: CreateBoardProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<string[]>([...templates.Simple]);
  const [customColumn, setCustomColumn] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const addColumn = (column: string) => {
    const trimmedColumn = column.trim();
    if (!trimmedColumn || columns.includes(trimmedColumn)) return;
    setColumns((current) => [...current, trimmedColumn]);
  };

  const removeColumn = (column: string) => setColumns((current) => current.filter((item) => item !== column));

  const applyTemplate = (templateName: TemplateName) => setColumns([...templates[templateName]]);

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setColumns((current) => {
      const nextColumns = [...current];
      const [movedColumn] = nextColumns.splice(draggedIndex, 1);
      nextColumns.splice(targetIndex, 0, movedColumn);
      return nextColumns;
    });
    setDraggedIndex(null);
  };

  const handleCustomColumnSubmit = () => {
    addColumn(customColumn);
    setCustomColumn('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);
    if (!ownerId) return setValidationError('Please log in before creating a board.');
    if (!title.trim()) return setValidationError('A board title is required.');
    if (!columns.length) return setValidationError('Add at least one column before creating the board.');

    onSubmit({ title: title.trim(), description: description.trim() || undefined, owner: ownerId, members: [], columns });
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Board setup</p><h1 className="mt-1 text-3xl font-semibold text-slate-900">Create a board</h1><p className="mt-2 max-w-2xl text-slate-600">Start with a workflow template, then shape the columns around how your team works.</p></div>
        <button type="button" onClick={onCancel} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Back to boards</button>
      </div>
      {(validationError || error) && <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{validationError || error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Board title<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Product launch" className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /></label>
          <label className="block text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this board for?" className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /></label>
        </div></section>

        <section className="grid gap-6 lg:grid-cols-[15rem_1fr]">
          <div className="space-y-4"><div><h2 className="text-sm font-semibold text-slate-900">Start with a template</h2><div className="mt-3 space-y-2">{(Object.keys(templates) as TemplateName[]).map((templateName) => <button key={templateName} type="button" onClick={() => applyTemplate(templateName)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-sm hover:border-cyan-500 hover:text-cyan-800"><span className="block">{templateName}</span><span className="mt-1 block text-xs font-normal text-slate-500">{templates[templateName].join(' / ')}</span></button>)}</div></div>
            <div><h2 className="text-sm font-semibold text-slate-900">Available columns</h2><div className="mt-3 flex flex-wrap gap-2 lg:block lg:space-y-2">{['Backlog', 'To Do', 'In Progress', 'Review', 'Blocked', 'Done'].map((column) => <button key={column} type="button" disabled={columns.includes(column)} onClick={() => addColumn(column)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:border-cyan-500 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-40 lg:block lg:w-full lg:text-left">+ {column}</button>)}</div></div>
          </div>
          <div className="rounded-lg border border-dashed border-cyan-300 bg-cyan-50/50 p-4"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-900">Your board flow</h2><p className="mt-1 text-sm text-slate-600">Drag columns to set their order.</p></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-cyan-800">{columns.length} columns</span></div>
            <div className="mt-5 grid min-h-32 gap-3 sm:grid-cols-2 xl:grid-cols-3">{columns.map((column, index) => <div key={column} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(index)} className="flex min-h-24 cursor-grab items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"><div><span className="text-xs font-semibold text-cyan-700">{String(index + 1).padStart(2, '0')}</span><p className="mt-2 font-medium text-slate-900">{column}</p></div><button type="button" onClick={() => removeColumn(column)} className="text-lg leading-none text-slate-400 hover:text-red-600" aria-label={`Remove ${column} column`}>x</button></div>)}{!columns.length && <div className="col-span-full flex min-h-24 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-sm text-slate-500">Drop or add a column to begin</div>}</div>
            <div className="mt-5 flex max-w-md gap-2"><input value={customColumn} onChange={(event) => setCustomColumn(event.target.value)} placeholder="Custom column name" className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /><button type="button" onClick={handleCustomColumnSubmit} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-500 hover:text-cyan-800">Add column</button></div>
          </div>
        </section>
        <div className="flex justify-end border-t border-slate-200 pt-5"><button type="submit" disabled={isSaving || !ownerId} className="rounded-md bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400">{isSaving ? 'Creating board...' : 'Create board'}</button></div>
      </form>
    </main>
  );
}