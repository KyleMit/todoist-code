import type { Comment, Project, Section, Task } from "npm:@doist/todoist-api-typescript";
import { getTodoistData } from './api.ts'
import type { TodoistData, TodoProject, TodoSection, TodoTask } from './types.ts'

const USE_CACHE = true;

const rawData = await getTodoistData(USE_CACHE)
const data = transformData(rawData)

console.log(data)





function transformData({projects, sections, tasks, comments}: TodoistData) {
    const topTasks = tasks.filter(t => !t.parentId)
    const subTasks = tasks.filter(t => t.parentId)

    // attach comments and subtasks to tasks
    const enrichedProjects: Project[] = projects.map(proj => {

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


