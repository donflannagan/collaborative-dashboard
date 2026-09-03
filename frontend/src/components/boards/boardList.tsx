import { useEffect, useState } from 'react';
import { useAuth } from '../../AppContext';
import { IBoard, IBoardListResponse } from '../../models/board';
import { boardService } from '../../services/boardService';

interface BoardListProps {
  onSelectBoard?: (id: string) => void;
  onCreateBoard?: () => void;
}

const BoardListComponent = ({ onSelectBoard, onCreateBoard }: BoardListProps) => {
  const { userId } = useAuth();
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBoards([]);
      setIsLoading(false);
      return;
    }

    const loadBoards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response: IBoardListResponse = await boardService.getAllBoardsByUser(userId);
        setBoards(response.boards);
      } catch {
        setError('Unable to load your boards. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBoards();
  }, [userId]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Your Boards</h2>
        <div className="flex items-center gap-3">
          {!isLoading && userId && boards.length > 0 && (
            <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full font-medium">
              Total: {boards.length}
            </span>
          )}
          {userId && onCreateBoard && (
            <button onClick={onCreateBoard} className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
              Create board
            </button>
          )}
        </div>
      </div>

      {/* Red Gradient Error Alert Banner */}
      {error && (
        <div 
          role="alert" 
          className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-lg shadow-sm flex items-center justify-between transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 flex-shrink-0 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-100 hover:text-white p-1 rounded transition-colors text-sm font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative min-h-[200px]">
        {/* Loading Spinner Overlaid or Centered */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center space-y-2 z-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Loading boards...</p>
          </div>
        )}

        {/* Not Logged In State */}
        {!userId && !isLoading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-600 font-medium">Please log in to view your boards.</p>
          </div>
        )}

        {/* Empty Boards State */}
        {userId && boards.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">You do not have any boards yet.</p>
          </div>
        )}

        {/* Table View */}
        {userId && boards.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {boards.map((board) => (
                  <tr
                    key={board._id}
                    data-board-id={board._id}
                    onClick={() => onSelectBoard?.(board._id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {board.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 line-clamp-2 max-w-xl">
                        {board.description || <span className="text-gray-400 italic">No description provided</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase">
                          {board.owner?.username ?? ''}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardListComponent;