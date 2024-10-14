import { Comment, Project, Section, Task } from 'npm:@doist/todoist-api-typescript';

export type TodoistData = {
    projects: Project[];
    sections: Section[];
    tasks: Task[];
    comments: Comment[];
};

export type TodoTask = Task & {
    subtasks: Task[];
    comments: Comment[];
}

export type TodoSection = Section & {
    tasks: TodoTask[];
}

export type TodoProject = Project & {
    tasks: TodoTask[];
    sects: TodoSection[];
}
