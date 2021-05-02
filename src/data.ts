import todoist, { TodoistComment, TodoistProject, TodoistSection, TodoistTask } from 'todoist-rest-api';
import dotenv from 'dotenv'
dotenv.config()

const {API_TOKEN} = process.env

export interface TodoistData {
    projs: TodoistProject[];
    sects: TodoistSection[];
    tasks: TodoistTask[];
    comms: TodoistComment[];
}

export async function fetchData(): Promise<TodoistData> {
    if (!API_TOKEN) throw new Error("Missing API Token");

    const api = todoist(API_TOKEN);

    const projs = await api.v1.project.findAll({});
    const sects = await api.v1.section.findAll({})
    const tasks = await api.v1.task.findAll();

    // get comments for each project
    const commsMap = await Promise.all(tasks.filter(t=> t.comment_count > 0).map(t => {
        return api.v1.comment.findAll({
            id: t.id,
            parent: "task"
        })
    }))

    const comms = commsMap.flatMap(arr => arr)

    return {projs, sects, tasks, comms}
}

