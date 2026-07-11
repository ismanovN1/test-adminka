import { QueryClient } from "@tanstack/react-query";
import { AxiosHeaders, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchOrders, orderQueryKeys, orderQueryOptions } from "@/entities/order";
import { fetchProducts, productQueryKeys } from "@/entities/product";
import {
  fetchUsers,
  userQueryKeys,
  userQueryOptions,
} from "@/entities/user";
import { apiClient } from "@/shared/api/client";
import {
  makeCartsResponse,
  makeUserDto,
  makeProductsResponse,
  makeUsersResponse,
} from "@/test/fixtures/dummyjson";

function response(data: unknown): AxiosResponse<unknown> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

describe("full-dataset query functions", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses stable, resource-specific full query keys", () => {
    expect(userQueryKeys.full()).toEqual(["users", "full"]);
    expect(productQueryKeys.full()).toEqual(["products", "full"]);
    expect(orderQueryKeys.full()).toEqual(["orders", "full"]);
  });

  it("requests complete user and product datasets with the caller signal", async () => {
    const signal = new AbortController().signal;
    const get = vi
      .spyOn(apiClient, "get")
      .mockImplementation((path) =>
        Promise.resolve(
          response(
            path === "/users?limit=0"
              ? makeUsersResponse()
              : makeProductsResponse(),
          ),
        ),
      );

    const [users, products] = await Promise.all([
      fetchUsers(signal),
      fetchProducts(signal),
    ]);

    expect(users.items[0]?.fullName).toBe("Ada Lovelace");
    expect(products.items[0]?.title).toBe("Precision Keyboard");
    expect(get).toHaveBeenCalledWith("/users?limit=0", { signal });
    expect(get).toHaveBeenCalledWith("/products?limit=0", { signal });
  });

  it("loads carts and users in parallel and maps the complete joined order dataset", async () => {
    const signal = new AbortController().signal;
    const get = vi
      .spyOn(apiClient, "get")
      .mockImplementation((path) =>
        Promise.resolve(
          response(
            path === "/carts?limit=0"
              ? makeCartsResponse()
              : makeUsersResponse(),
          ),
        ),
      );

    const orders = await fetchOrders(signal);

    expect(orders).toMatchObject({ total: 1 });
    expect(orders.items[0]?.customer?.id).toBe(4);
    expect(get).toHaveBeenCalledWith("/carts?limit=0", { signal });
    expect(get).toHaveBeenCalledWith("/users?limit=0", { signal });
  });

  it("reuses the full users query cache when resolving order joins", async () => {
    const get = vi
      .spyOn(apiClient, "get")
      .mockImplementation((path) =>
        Promise.resolve(
          response(
            path === "/carts?limit=0"
              ? makeCartsResponse()
              : makeUsersResponse(),
          ),
        ),
      );
    const client = new QueryClient();

    await client.fetchQuery(userQueryOptions());
    const orders = await client.fetchQuery(orderQueryOptions());

    expect(orders.items[0]?.customer?.id).toBe(4);
    expect(
      get.mock.calls.filter(([path]) => path === "/users?limit=0"),
    ).toHaveLength(1);
    expect(
      get.mock.calls.filter(([path]) => path === "/carts?limit=0"),
    ).toHaveLength(1);
  });

  it("turns malformed critical resource data into a normalized validation error", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(
      response(
        makeUsersResponse([makeUserDto({ firstName: "   " })]),
      ),
    );

    await expect(fetchUsers()).rejects.toMatchObject({
      kind: "validation",
      retryable: false,
    });
  });
});
