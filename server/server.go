package main

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type Todo struct {
	ID        int    `json:"id" form:"id"`
	Title     string `json:"title" form:"title"`
	Completed bool   `json:"completed" form:"completed"`
}

var todos []Todo

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Get("/getAll", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"todos": todos,
		})
	})

	app.Post("/create", func(c *fiber.Ctx) error {
		t := new(Todo)

		if err := c.BodyParser(t); err != nil {
			return err
		}

		todos = append(todos, *t)

		return c.JSON(fiber.Map{
			"message": "Added new Todo",
		})
	})

	app.Post("/completed/:id", func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))

		if err != nil {
			return c.JSON(fiber.Map{
				"error": "There was an error converting the id",
			})
		}

		for i, v := range todos {
			if v.ID == id {
				todos[i].Completed = true
			}
		}

		return c.JSON(fiber.Map{
			"message": "Completed update!",
		})
	})

	app.Listen(":8080")
}
