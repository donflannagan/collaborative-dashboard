import BoardListComponent from "../../components/boards/boardList";
import { useNavigate } from "react-router-dom";

export default function BoardList(BoardListProps: any) {
    const navigate = useNavigate();
    
    const handleBoardSelect = (id: string) => {
        navigate(`/board/${id}`, { state: { boardId: id } });
    };
    return (
        <BoardListComponent {...BoardListProps} onSelectBoard={handleBoardSelect} />
    );
}