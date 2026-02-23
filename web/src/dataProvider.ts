import type { DataProvider } from "@refinedev/core";
import { GraphQLClient } from "graphql-request";
import { GRAPHQL_URL, TOKEN_KEY } from "./utils/constants";

const gqlClient = new GraphQLClient(GRAPHQL_URL, {
  headers: () => {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    return { Authorization: `Bearer ${token}` };
  },
});

export { gqlClient };

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters }) => {
    const { current = 1, pageSize = 20 } = pagination ?? {};
    const params = new URLSearchParams();
    params.set("page", String(current));
    params.set("pageSize", String(pageSize));

    if (sorters && sorters.length > 0) {
      params.set("sortField", sorters[0].field);
      params.set("sortOrder", sorters[0].order);
    }

    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter && filter.value !== undefined && filter.value !== null && filter.value !== "") {
          params.set(`filter[${filter.field}]`, String(filter.value));
        }
      });
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/${resource}?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
      }
    );
    const data = await response.json();

    return {
      data: data.data || data,
      total: data.total || data.length || 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/${resource}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
      }
    );
    const data = await response.json();
    return { data };
  },

  create: async ({ resource, variables }) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/${resource}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
        body: JSON.stringify(variables),
      }
    );
    const data = await response.json();
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/${resource}/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
        body: JSON.stringify(variables),
      }
    );
    const data = await response.json();
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/${resource}/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
      }
    );
    const data = await response.json();
    return { data };
  },

  getApiUrl: () => import.meta.env.VITE_API_URL || "http://localhost:4000",
};
