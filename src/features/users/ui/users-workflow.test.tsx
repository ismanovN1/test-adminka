import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usersResponseSchema } from "@/entities/user/api/schema";
import { mapUsersResponse } from "@/entities/user/model/map";
import { makeUserDto, makeUsersResponse } from "@/test/fixtures/dummyjson";

import { UsersWorkflow } from "./users-workflow";

const replace = vi.fn();
let currentSearch = "";

const users = mapUsersResponse(
  usersResponseSchema.parse(
    makeUsersResponse([
      makeUserDto({ id: 4 }),
      makeUserDto({
        id: 2,
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
        company: { name: "Navy", department: "Research" },
        address: { country: "United States" },
      }),
    ]),
  ),
).items;

vi.mock("next/navigation", () => ({
  usePathname: () => "/users",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement>) =>
    createElement("img", { alt, ...props }),
}));

vi.mock("next-intl", () => ({
  useTranslations:
    (namespace?: string) =>
    (key: string, values?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;

      if (!values) {
        return fullKey;
      }

      return `${fullKey} ${Object.values(values).join(" ")}`;
    },
}));

vi.mock("@/entities/user", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/user")>();

  return {
    ...actual,
    useUsersQuery: () => ({
      data: { items: users, total: users.length },
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    }),
  };
});

describe("UsersWorkflow", () => {
  beforeEach(() => {
    currentSearch = "";
    replace.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("debounces search into URL state with page reset", async () => {
    render(createElement(UsersWorkflow));

    fireEvent.change(screen.getByLabelText("users.toolbar.search"), {
      target: { value: "Grace" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replace).toHaveBeenCalledWith("/users?q=Grace", { scroll: false });
  });

  it("opens and closes the accessible details dialog", () => {
    render(createElement(UsersWorkflow));

    fireEvent.click(screen.getAllByLabelText("users.table.openDetails Grace Hopper")[0]);

    expect(screen.getByRole("dialog")).toHaveTextContent("Grace Hopper");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
