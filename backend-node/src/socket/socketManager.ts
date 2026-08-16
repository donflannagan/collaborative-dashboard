
import { Server, Socket } from 'socket.io';

interface TaskMoveData {
  boardId: string;
  taskId: string;
  sourceColumn: string;
  destColumn: string;
  newPosition: number;
}

export function registerSocketEvents(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_board', (boardId: string) => {
      socket.join(`board_${boardId}`);
      console.log(`Socket ${socket.id} joined board_${boardId}`);
    });

    socket.on('leave_board', (boardId: string) => {
      socket.leave(`board_${boardId}`);
      console.log(`Socket ${socket.id} left board_${boardId}`);
    });

    socket.on('task_moved', (data: TaskMoveData) => {
      const { boardId, taskId, sourceColumn, destColumn, newPosition } = data;
      socket.to(`board_${boardId}`).emit('task_updated', {
        taskId,
        sourceColumn,
        destColumn,
        newPosition,
        updatedBy: socket.id,
        updatedAt: new Date(),
      });
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
}