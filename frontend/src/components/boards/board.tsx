import { useEffect, useState } from 'react';
import { useAuth } from '../../AppContext';
import { IBoard } from '../../models/board';
import { ICreateTaskInput, ITask } from '../../models/task';
import { boardService } from '../../services/boardService';
import { taskService } from '../../services/taskService';
import TaskBoard from '../tasks/task';
import { useParams, useLocation } from 'react-router-dom';

export default function BoardComponent() {
    const { id } = useParams();
    const location = useLocation();
    const { userId } = useAuth();
    const boardId = location.state?.boardId || id;
    const [board, setBoard] = useState<IBoard | null>(null);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!boardId) {
            setError('A board ID is required.');
            setIsLoading(false);
            return;
        }

        const loadBoard = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [boardResponse, tasksResponse] = await Promise.all([
                    boardService.getBoardById(boardId),
                    taskService.getTasksByBoard(boardId),
                ]);
                setBoard(boardResponse.board);
                setTasks(tasksResponse.tasks);
            } catch {
                setError('Unable to load this board. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        void loadBoard();
    }, [boardId]);

    const refreshTasks = async () => {
        if (!boardId) return;
        const response = await taskService.getTasksByBoard(boardId);
        setTasks(response.tasks);
    };

    const handleCreateTask = async (task: ICreateTaskInput) => {
        try {
            await taskService.addTask(task);
            await refreshTasks();
        } catch {
            setError('Unable to create the task. Please try again.');
            throw new Error('Unable to create task');
        }
    };

    const handleMoveTask = async (task: ITask, columnId: string) => {
        const position = tasks.filter((candidate) => candidate.columnId === columnId).length;
        try {
            await taskService.updateTask({ ...task, columnId, position });
            await refreshTasks();
        } catch {
            setError('Unable to move the task. Please try again.');
        }
    };

    if (isLoading) return <div className="p-8 text-sm text-slate-600">Loading board...</div>;
    if (error) return <div className="m-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
    if (!board) return <div className="p-8 text-sm text-slate-600">Board not found.</div>;

    return <main className="mx-auto max-w-7xl p-6"><TaskBoard board={board} tasks={tasks} createdBy={userId ?? ''} onCreateTask={handleCreateTask} onMoveTask={handleMoveTask} /></main>;
}