import { promises as fs } from "fs"
import { fetchData, TodoistData } from "./data"

const FILENAME = "./data/cache.json"

export async function readData(): Promise<TodoistData | null> {
    const text = await tryReadText()
    if (!text) return null;

    return JSON.parse(text)
}

export async function tryReadText(): Promise<string | null> {
    try {
        return await fs.readFile(FILENAME, "utf8")
    } catch (error) {
        return null
    }
}

export async function writeData(data: TodoistData): Promise<void> {
    const text = JSON.stringify(data, null, 2)
    await fs.mkdir("./data", {recursive: true})
    await fs.writeFile(FILENAME, text, "utf8")
}

export async function getData(useCache: boolean): Promise<TodoistData> {
    if (useCache) {
        let data = await readData()
        if (data) return data;
    }

    let data = await fetchData()
    await writeData(data)
    return data
}
