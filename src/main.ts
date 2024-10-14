import type { Comment, Project, Section, Task } from "npm:@doist/todoist-api-typescript";
import { getTodoistData } from './api.ts'
import type { TodoistData, TodoProject, TodoSection, TodoTask } from './types.ts'

const USE_CACHE = true;
const MD_FILENAME = "./data/todo.md"

const rawData = await getTodoistData(USE_CACHE)
const data = transformTodos(rawData)
const output = formatTodos(data)

await Deno.writeTextFile(MD_FILENAME, output)


function transformTodos({projects, sections, tasks, comments}: TodoistData): TodoProject[] {
    const topTasks = tasks.filter(t => !t.parentId)
    const subTasks = tasks.filter(t => t.parentId)

    // attach comments and subtasks to tasks
    const enrichedProjects: TodoProject[] = projects.map(proj => {

        const getCurProj = (t: {projectId: string}) => t.projectId == proj.id
        const sortByOrder = (a: Task, b: Task) => a.order - b.order

        const curSubTasks = subTasks.filter(getCurProj)
        const curTasks = topTasks.filter(getCurProj)
        const curSects = sections.filter(getCurProj)

        const enrichedTasks: TodoTask[] = curTasks.map(task => {
            const curChildren = curSubTasks.filter(t => t.parentId == task.id)
            const curComms = comments.filter(c => c.taskId == task.id)

            const curTask: TodoTask = {
                ...task,
                subtasks: curChildren ?? [],
                comments: curComms ?? []
            }
            return curTask
        })

        const enrichedSects: TodoSection[] = curSects.map(sect => {
            const sectTasks = enrichedTasks.filter(t => t.sectionId == sect.id)
            const curSect: TodoSection = {
                ...sect,
                tasks: sectTasks.sort(sortByOrder) ?? []
            }
            return curSect
        })

        const baseTasks = enrichedTasks.filter(t => t.sectionId == "0")

        const curProj: TodoProject = {
            ...proj,
            tasks: baseTasks.sort(sortByOrder) ?? [],
            sects: enrichedSects ?? []
        }

        return curProj
    })

    // filter out inbox

    return enrichedProjects
}



function formatTodos(data: TodoProject[]): string {
    const title = "# My Todo List\r\n\r\n"

    const projs = data.filter(p => !p.isInboxProject).map(proj => {

        const subTitle = `\r\n## ${proj.name}\r\n\r\n`

        const tasks = proj.tasks?.map(printTask)

        const sections = proj.sects?.map(sect => {
            const sectTitle = `\r\n\r\n### ${sect.name}\r\n\r\n`
            const sectTasks = sect.tasks?.map(printTask)
            return sectTitle + sectTasks?.join("\r\n")
        })

        return subTitle + tasks?.join("\r\n") + sections
    })


    return title + projs.join("\r\n") + "\r\n"
}

function printTask(task: TodoTask): string {
    const line =  `* [ ] ${task.content}`
    const subs = task.subtasks?.map(sub => `  * [ ] ${sub.content}`).join("\r\n")
    const coms = task.comments?.map(com => `      ${com.content}`).join("\r\n")
    return `${line}${prefixIfExists(subs)}${prefixIfExists(coms)}`

}

function prefixIfExists(input:string | undefined): string {
    return input ? `\r\n${input}` : ""
}
