import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface getAllTodos {
  todos: Todo[];
}

interface createCompleteTodo {
  message: string;
}

function App() {
  const queryClient = useQueryClient();

  const [numberOfTodos, setNumberOfTodos] = useState(0);
  const [todoTitle, setTodoTitle] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["todos", "getAll"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/getAll");
      const data = await response.json();
      if (data == null) {
        return;
      } else {
        return data as getAllTodos;
      }
    },
  });

  const completeTodo = useMutation({
    mutationKey: ["todos", "completeTodo"],
    mutationFn: async (id: number) => {
      console.log(id);
      const response = await fetch(`http://localhost:8080/completed/${id}`, {
        method: "post",
      });
      const data = await response.json();
      return data as createCompleteTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["todos", "getAll"]);
    },
  });

  const createTodo = useMutation({
    mutationKey: ["todos", "createTodos"],
    mutationFn: async (newTodo: Todo) => {
      console.log(newTodo);
      console.log(JSON.stringify(newTodo));
      const response = await fetch("http://localhost:8080/create", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      });
      const data = await response.json();
      setNumberOfTodos(numberOfTodos + 1);
      setTodoTitle("");
      return data as createCompleteTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["todos", "getAll"]);
    },
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (data == undefined) {
    return <p>There are no todos</p>;
  } else {
    return (
      <>
        <div className="flex flex-col items-center mt-10">
          <h1 className="text-3xl underline">Todos</h1>
          <div className="flex flex-row mt-2">
            <input
              placeholder="Todo Title"
              className="border-2 border-gray-200 rounded"
              type="text"
              value={todoTitle}
              onChange={(e) => {
                setTodoTitle(e.target.value);
              }}
            />

            <button
              onClick={() => {
                createTodo.mutate({
                  completed: false,
                  id: numberOfTodos,
                  title: todoTitle,
                });
              }}
              className="ml-2 bg-blue-500 text-white rounded px-4 py-2"
            >
              Create New Todo
            </button>
          </div>
          {data.todos &&
            data.todos.map((todo, index) => (
              <div key={index} className="flex flex-row">
                <button
                  onClick={() => {
                    completeTodo.mutate(todo.id);
                  }}
                  className="bg-blue-500 text-white rounded px-4 py-2 mr-5"
                >
                  Complete
                </button>
                {todo.title} - Completed:
                {todo.completed == true ? "Completed" : "Not Completed"}
              </div>
            ))}
        </div>
      </>
    );
  }
}

export default App;
