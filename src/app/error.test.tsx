import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

describe("route error boundary", () => {
  afterEach(cleanup);
  it("focuses safe error copy and invokes retry", () => {
    const reset = vi.fn();
    render(createElement(ErrorPage, { error: new Error("hidden transport detail"), reset }));
    expect(screen.getByRole("heading", { name: "errors.routeTitle" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.queryByText("hidden transport detail")).not.toBeInTheDocument();
  });
});
