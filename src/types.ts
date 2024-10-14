import {
    Comment as TodoistComment,
    Project as TodoistProject,
    Section as TodoistSection,
    Task as TodoistTask
} from 'npm:@doist/todoist-api-typescript';

export interface TodoistData {
    projects: TodoistProject[];
    sections: TodoistSection[];
    tasks: TodoistTask[];
    comments: TodoistComment[];
}
export type { TodoistComment, TodoistProject, TodoistSection, TodoistTask };
