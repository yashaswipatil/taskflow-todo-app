import axios from "axios";

const client = axios.create({ baseURL: "/api" });

export const fetchTasks = () => client.get("/tasks").then((r) => r.data);
export const createTask = (title) =>
  client.post("/tasks", { title }).then((r) => r.data);
export const toggleTask = (id, completed) =>
  client.patch(`/tasks/${id}`, { completed }).then((r) => r.data);
export const deleteTask = (id) =>
  client.delete(`/tasks/${id}`).then((r) => r.data);
export const fetchQueue = () => client.get("/queue").then((r) => r.data);
