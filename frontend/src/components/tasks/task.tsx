import { FormEvent, useState } from 'react';
import type { IBoard } from '../../models/board';
import type { ICreateTaskInput, ITask } from '../../models/task';

interface TaskBoardProps {
  board: IBoard;
  tasks: ITask[];
  createdBy: string;
  onCreateTask: (task: ICreateTaskInput) => Promise<void>;
  onMoveTask: (task: ITask, columnId: string) => Promise<void>;
}

interface CreateTaskModalProps {
  board: IBoard;
  createdBy: string;
  onClose: () => void;
  onCreateTask: (task: ICreateTaskInput) => Promise<void>;
}

export function CreateTaskModal({ board, createdBy, onClose, onCreateTask }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState(board.columns[0] ?? '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !columnId) return;

    setIsSubmitting(true);
    try {
      await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        boardId: board._id,
        columnId,
        position: 0,
        priority,
        createdBy,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="create-task-title">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-5 rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="create-task-title" className="text-xl font-semibold text-slate-900">Create task</h2>
            <p className="mt-1 text-sm text-slate-500">Add work to {board.title}.</p>
          </div>
          <button type="button" onClick={onClose} className="text-xl leading-none text-slate-500 hover:text-slate-900" aria-label="Close create task dialog">x</button>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Title
          <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1.5 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-slate-700">
            Column
            <select value={columnId} onChange={(event) => setColumnId(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100">
              {board.columns.map((column) => <option key={column} value={column}>{column}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Priority
            <select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={isSubmitting || !board.columns.length} className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? 'Creating...' : 'Create task'}</button>
        </div>
      </form>
    </div>
  );
}

export default function TaskBoard({ board, tasks, createdBy, onCreateTask, onMoveTask }: TaskBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDrop = async (columnId: string) => {
    const task = tasks.find((candidate) => candidate._id === draggedTaskId);
    setDraggedTaskId(null);
    if (!task || task.columnId === columnId) return;
    await onMoveTask(task, columnId);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-slate-900">{board.title}</h1>{board.description && <p className="mt-1 text-sm text-slate-600">{board.description}</p>}</div>
        <button onClick={() => setIsCreateOpen(true)} disabled={!createdBy || !board.columns.length} className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400">Create task</button>
      </div>
      <div className="grid auto-cols-[minmax(17rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-5">
        {board.columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.columnId === column).sort((first, second) => first.position - second.position);
          return <section key={column} onDragOver={(event) => event.preventDefault()} onDrop={() => void handleDrop(column)} className="min-h-[28rem] rounded-lg bg-slate-100 p-3">
            <header className="mb-3 flex items-center justify-between px-1"><h2 className="text-sm font-semibold text-slate-800">{column}</h2><span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">{columnTasks.length}</span></header>
            <div className="space-y-3">
              {columnTasks.map((task) => <article key={task._id} draggable onDragStart={() => setDraggedTaskId(task._id)} className="cursor-grab rounded-md border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing">
                <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>{task.priority && <span className="text-xs font-medium capitalize text-cyan-800">{task.priority}</span>}</div>
                {task.description && <p className="mt-2 text-sm text-slate-600">{task.description}</p>}
              </article>)}
              {!columnTasks.length && <p className="rounded-md border border-dashed border-slate-300 px-3 py-5 text-center text-xs text-slate-500">Drop a task here</p>}
            </div>
          </section>;
        })}
      </div>
      {isCreateOpen && <CreateTaskModal board={board} createdBy={createdBy} onClose={() => setIsCreateOpen(false)} onCreateTask={onCreateTask} />}
    </>
  );
}