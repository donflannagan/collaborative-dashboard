import AddUserForm from "../../components/user/addUserForm";
import type { AddUserRequest } from "../../models/user";

export default function AddUser() {
  const handleUserCreated = (user: AddUserRequest) => {
    console.log('User created:', user);
    // navigate away, show a toast, refresh a user list, etc.
  };

  return (
    <AddUserForm onSubmit={handleUserCreated} />
  );
}