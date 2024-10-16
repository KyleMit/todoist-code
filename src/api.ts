// Automatically load environment variables from a `.env` file
import "@std/dotenv/load";
import { Task, TodoistApi } from 'npm:@doist/todoist-api-typescript'
import { type TodoistData } from './types.ts'

const CACHE_FILENAME = "./data/cache.json"

export async function getTodoistData(useCache: boolean): Promise<TodoistData> {
    // try cache first
    if (useCache) {
        const cachedFile = await Deno.readTextFile(CACHE_FILENAME)
        const cachedData = JSON.parse(cachedFile) as TodoistData
        if (cachedData) return cachedData;
    }

    // if we fetch data, write it to cache and return
    const data = await fetchTodoistData()
    await Deno.writeTextFile(CACHE_FILENAME, JSON.stringify(data, null, 2))
    return data
}


async function fetchTodoistData(): Promise<TodoistData> {
    const apiToken = Deno.env.get("API_TOKEN");

    if (!apiToken) {
        throw new Error("API_TOKEN is required in .env file")
    }

    const api = new TodoistApi(apiToken)

    const projects = await api.getProjects()
    const sections = await api.getSections()
    const tasks = await api.getTasks()
    const comments = await getAllComments(api, tasks);
    
    const todoistData = {projects, sections, tasks, comments}

    return todoistData;
}

async function getAllComments(api: TodoistApi, tasks: Task[]) {
    // get comments for each task that has comments
    const tasksWithComments = tasks.filter(t => t.commentCount > 0)
    const commentsMapPromises = tasksWithComments.map(t => {
        return api.getComments({taskId: t.id})
    })
    const commentsMap = await Promise.all(commentsMapPromises)
   
    return commentsMap.flatMap(arr => arr)
} 
