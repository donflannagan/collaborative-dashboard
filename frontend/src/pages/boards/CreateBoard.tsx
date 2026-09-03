import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AppContext';
import CreateBoardForm from '../../components/boards/createBoard';
import { boardService } from '../../services/boardService';
import type { ICreateBoardInput } from '../../models/board';

export default function CreateBoard() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (boardData: ICreateBoardInput) => {
    setError(null);
    setIsSaving(true);
    try {
      const response = await boardService.createBoard(boardData);
      if (!response.success || !response.board?._id) {
        throw new Error('The board could not be created.');
      }
      navigate('/boards');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create the board.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CreateBoardForm
      ownerId={userId ?? ''}
      isSaving={isSaving}
      error={error}
      onCancel={() => navigate('/boards')}
      onSubmit={handleSubmit}
    />
  );
}
