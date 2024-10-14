// Automatically load environment variables from a `.env` file
import "@std/dotenv/load";
import { TodoistApi } from 'npm:@doist/todoist-api-typescript'


const apiToken = Deno.env.get("API_TOKEN");

if (!apiToken) {
    throw new Error("API_TOKEN is required in .env file")
}

const api = new TodoistApi(apiToken)

api.getTasks()
    .then((tasks) => console.log(tasks))
    .catch((error) => console.log(error))


