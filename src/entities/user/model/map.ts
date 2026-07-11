import type { UserDto, UsersResponseDto } from "../api/schema";
import { deriveUserIndexedAt, deriveUserStatus } from "./derive";
import type { User, UserDataset } from "./types";

export function mapUser(dto: UserDto): User {
  const firstName = dto.firstName.trim();
  const lastName = dto.lastName.trim();

  return {
    id: dto.id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email: dto.email,
    phone: dto.phone,
    image: dto.image,
    role: dto.role,
    companyName: dto.company.name,
    department: dto.company.department,
    country: dto.address.country.trim() || "Unknown",
    status: deriveUserStatus(dto.id),
    indexedAt: deriveUserIndexedAt(dto.id),
  };
}

export function mapUsersResponse(dto: UsersResponseDto): UserDataset {
  return {
    items: dto.users.map(mapUser),
    total: dto.total,
  };
}
