import { TaskAdapter, TodoistComment, TodoistProject, TodoistSection, TodoistTask } from 'todoist-rest-api';
import { fetchData, TodoistData } from './data'
import { getData } from './io';

const USE_CACHE = true;

main()


async function main() {

    try {
        let rawData = await getData(USE_CACHE)

        let data = transformData(rawData)


    } catch (error) {
        console.log(error)
    }

}

function transformData(data: TodoistData): TodoProjects {
    const topTasks = data.tasks.filter(t => !t.parent)
    const subTasks = data.tasks.filter(t => t.parent)

    // attach comments and subtasks to tasks
    let projects: TodoProject[] = data.projs.map(proj => {

        let getCurProj = (t: {project_id: number}) => t.project_id == proj.id
        let sortByOrder = (a: TodoTask, b: TodoTask) => a.order - b.order

        let curSubTasks = subTasks.filter(getCurProj)
        let curTasks = topTasks.filter(getCurProj)
        let curSects = data.sects.filter(getCurProj)

        let enrichedTasks: TodoTask[] = curTasks.map(task => {
            let curChildren = curSubTasks.filter(t => t.parent == task.id)
            let curComms = data.comms.filter(c => c.task_id = task.id)

            let curTask: TodoTask = {
                ...task,
                subtasks: curChildren,
                comments: curComms
            }
            return curTask
        })

        let enrichedSects: TodoSection[] = curSects.map(sect => {
            let sectTasks = enrichedTasks.filter(t => t.section_id = sect.id)
            let curSect: TodoSection = {
                ...sect,
                tasks: sectTasks.sort(sortByOrder)
            }
            return curSect
        })

        let baseTasks = enrichedTasks.filter(t => t.section_id == 0)

        let curProj: TodoProject = {
            ...proj,
            tasks: baseTasks.sort(sortByOrder),
            sects: enrichedSects
        }

        return curProj
    })

    // filter out inbox

    return projects
}


type RemoveIndex<T> = {
    [ P in keyof T as string extends P ? never : number extends P ? never : P ] : T[P]
};

type TodoProjects = TodoProject[]

export interface TodoProject extends RemoveIndex<TodoistProject> {
    tasks?: TodoTask[];
    sects?: TodoSection[];
}
export interface TodoSection extends RemoveIndex<TodoistSection> {
    tasks?: TodoTask[];
}
export interface TodoTask extends RemoveIndex<TodoistTask> {
    subtasks?: TodoTask[];
    comments?: TodoistComment[];
}


