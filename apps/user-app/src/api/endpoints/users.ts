import type { UpdateUserRequest, UserResponse } from "@chapelle/shared/types";
import { apiClient } from "../client";

/** U4 (`UserManagementModule`) étendra ce fichier avec listUsers/createUser/deleteUser/validerUser/rejeterUser. */
export function updateUser(id: string, dto: UpdateUserRequest): Promise<UserResponse> {
  return apiClient.put<UserResponse>(`/users/${id}`, dto);
}
